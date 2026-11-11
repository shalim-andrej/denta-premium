// src/app/admin/page.tsx
// Дашборд: статистика, ближайшие записи с действиями, недельная сетка по врачам.
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateBookingStatus, updatePaymentStatus } from "../actions";
import { format, startOfWeek, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { connection } from "next/server";

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

async function AdminData() {
  await connection(); // динамические данные — только на запросе

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [doctors, todayCount, monthPaid, upcoming, weekBookings] = await Promise.all([
    prisma.doctor.findMany({ orderBy: { name: "asc" } }),
    prisma.booking.count({
      where: { startTime: { gte: todayStart, lt: todayEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.booking.findMany({
      where: { paymentStatus: "PAID", startTime: { gte: monthStart } },
      include: { service: { select: { price: true } } },
    }),
    prisma.booking.findMany({
      where: { status: { not: "CANCELLED" }, startTime: { gte: now } },
      orderBy: { startTime: "asc" },
      take: 8,
      include: { user: true, service: true, doctor: true },
    }),
    prisma.booking.findMany({
      where: { startTime: { gte: weekStart, lt: weekEnd }, status: { not: "CANCELLED" } },
      include: { user: true, service: true },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const revenue = monthPaid.reduce((sum, b) => sum + b.service.price, 0);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      {/* Стат-карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Записей сегодня</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{todayCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Оплачено за месяц</div>
          <div className="text-3xl font-bold text-teal-600 mt-1">
            {revenue.toLocaleString("ru-RU")} ₽
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="text-sm text-gray-500">Быстрые действия</div>
          <div className="flex gap-2 flex-wrap mt-2">
            <Link
              href="/admin/book"
              className="text-sm bg-teal-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Записать пациента
            </Link>
            <a
              href="/api/admin/bookings.csv"
              className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Экспорт CSV
            </a>
          </div>
        </div>
      </div>

      {/* Ближайшие записи */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Ближайшие записи</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">Ближайших записей нет.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b: any) => (
              <div
                key={b.id}
                className="p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start gap-3 hover:border-teal-200 transition-colors"
              >
                <div>
                  <div className="font-bold text-gray-900">
                    {format(b.startTime, "d MMMM, HH:mm", { locale: ru })}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">{b.user.name}</span> • {b.user.phone}
                  </div>
                  <div className="text-xs text-teal-600 font-medium mt-1">
                    {b.doctor.name} — {b.service.title} ({b.service.price} ₽)
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
                  <div className="flex gap-1">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                        b.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {b.status}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                        b.paymentStatus === "PAID"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.paymentStatus === "PAID" ? "оплачено" : "не оплачено"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {b.status === "PENDING" && (
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <input type="hidden" name="status" value="CONFIRMED" />
                        <button className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded transition-colors">
                          Принять
                        </button>
                      </form>
                    )}
                    <form action={updatePaymentStatus}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <input
                        type="hidden"
                        name="paymentStatus"
                        value={b.paymentStatus === "PAID" ? "UNPAID" : "PAID"}
                      />
                      <button className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded transition-colors">
                        {b.paymentStatus === "PAID" ? "Снять оплату" : "Оплачено в клинике"}
                      </button>
                    </form>
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <input type="hidden" name="status" value="CANCELLED" />
                      <button className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded transition-colors">
                        Отменить
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Недельная сетка */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-1">Календарь недели</h2>
        <p className="text-xs text-gray-500 mb-4">
          {format(weekStart, "d MMMM", { locale: ru })} — {format(addDays(weekStart, 6), "d MMMM", { locale: ru })}.
          Нажмите «+» в клетке, чтобы записать пациента.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[720px]">
            <thead>
              <tr>
                <th className="text-left text-gray-500 font-medium pb-2 pr-3">Врач</th>
                {days.map((d) => (
                  <th key={d.toISOString()} className="text-left text-gray-500 font-medium pb-2 px-2">
                    {format(d, "EEEEEE, d MMM", { locale: ru })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-100">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{doc.name}</span>
                    <span className="block text-xs text-gray-500">{doc.specialty}</span>
                  </td>
                  {days.map((day) => {
                    const cell = weekBookings.filter(
                      (b: any) => b.doctorId === doc.id && sameDay(b.startTime, day)
                    );
                    return (
                      <td key={day.toISOString()} className="align-top py-2 px-2">
                        {cell.map((b: any) => (
                          <div
                            key={b.id}
                            className="text-xs bg-teal-50 text-teal-800 border border-teal-100 rounded-lg p-1.5 mb-1"
                            title={b.service.title}
                          >
                            <span className="font-bold">{format(b.startTime, "HH:mm")}</span>{" "}
                            {b.user.name}
                          </div>
                        ))}
                        <Link
                          href={`/admin/book?doctor=${doc.id}&date=${format(day, "yyyy-MM-dd")}`}
                          className="inline-block text-gray-300 hover:text-teal-500 font-bold leading-none px-1"
                          title="Записать пациента"
                        >
                          +
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Загрузка данных...</div>}>
      <AdminData />
    </Suspense>
  );
}

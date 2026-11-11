// src/app/admin/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { createService, updateBookingStatus, createDoctor, logoutAction } from "../actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { connection } from "next/server";

// Компонент, который загружает данные. Он динамический.
async function AdminData() {
  await connection(); // Говорим: "Выполняй только при запросе"

  const [services, doctors, bookings] = await Promise.all([
    prisma.service.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.doctor.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({ orderBy: { startTime: "asc" }, include: { user: true, service: true, doctor: true } }),
  ]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Врачи и Услуги */}
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">👨‍⚕️ Врачи</h2>
          <form action={createDoctor} className="space-y-2 mb-4">
            <input name="name" placeholder="ФИО" required className="w-full p-2 border rounded-lg text-sm" />
            <input name="specialty" placeholder="Специальность" required className="w-full p-2 border rounded-lg text-sm" />
            <input name="experience" type="number" placeholder="Стаж (лет)" className="w-full p-2 border rounded-lg text-sm" />
            <button className="w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">Добавить врача</button>
          </form>
          <ul className="space-y-2 text-sm">
            {doctors.map((d: any) => (
              <li key={d.id} className="flex justify-between border-b pb-2">
                <div><span className="font-medium">{d.name}</span> <br/><span className="text-xs text-gray-500">{d.specialty}</span></div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded h-fit">{d.experience} лет</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🦷 Услуги</h2>
          <form action={createService} className="space-y-2 mb-4">
            <input name="title" placeholder="Название" required className="w-full p-2 border rounded-lg text-sm" />
            <input name="category" placeholder="Категория (Терапия, Хирургия...)" required className="w-full p-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <input name="price" type="number" placeholder="Цена (₽)" required className="w-1/2 p-2 border rounded-lg text-sm" />
              <input name="duration" type="number" placeholder="Мин." required className="w-1/2 p-2 border rounded-lg text-sm" />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Добавить услугу</button>
          </form>
          <ul className="space-y-2 text-sm">
            {services.map((s: any) => (
              <li key={s.id} className="border-b pb-2">
                <div className="font-medium">{s.title} <span className="text-xs text-gray-400 font-normal">({s.category})</span></div>
                <div className="text-xs text-gray-500">{s.price} ₽ / {s.duration} мин.</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Записи */}
      <div className="xl:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">📅 Записи на прием</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">Пока нет записей.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: any) => (
              <div key={b.id} className="p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-teal-200 transition-colors">
                <div>
                  <div className="font-bold text-gray-900">{format(b.startTime, "d MMMM, HH:mm", { locale: ru })}</div>
                  <div className="text-sm text-gray-700 mt-1"><span className="font-medium">{b.user.name}</span> • {b.user.phone}</div>
                  <div className="text-xs text-teal-600 font-medium mt-1">{b.doctor.name} — {b.service.title}</div>
                </div>
                <div className="flex flex-row sm:flex-col items-end gap-2 w-full sm:w-auto">
                  <div className="flex gap-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                  </div>
                  {b.status === "PENDING" && (
                    <div className="flex gap-1 mt-auto">
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <input type="hidden" name="status" value="CONFIRMED" />
                        <button className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded transition-colors">Принять</button>
                      </form>
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded transition-colors">Отклонить</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Сама страница — статическая оболочка + Suspense вокруг данных
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DentaPremium CRM</h1>
            <p className="text-sm text-gray-500">Управление клиникой</p>
          </div>
          <form action={logoutAction}>
            <button className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Выйти</button>
          </form>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-gray-500">Загрузка данных...</div>}>
          <AdminData />
        </Suspense>
      </div>
    </div>
  );
}
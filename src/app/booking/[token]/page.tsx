// src/app/booking/[token]/page.tsx
// Управление записью по защищённой ссылке: детали, отмена, перенос, .ics.
// Ссылку знает только пациент (токен 256 бит) — авторизация не нужна.
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarX2, CalendarClock, Download, Stethoscope } from "lucide-react";
import { bookingByToken } from "@/lib/tokens";
import { cancelBookingByToken, rescheduleBookingByToken } from "../../actions";

async function ManageCard({ token }: { token: string }) {
  await connection();
  const booking = await bookingByToken(token);
  if (!booking) notFound();

  const cancelled = booking.status === "CANCELLED";
  const paid = booking.paymentStatus === "PAID";

  const statusLabel =
    booking.status === "CONFIRMED"
      ? { text: "Подтверждена", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" }
      : cancelled
        ? { text: "Отменена", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" }
        : { text: "Ожидает подтверждения клиники", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };

  return (
    <div className="relative z-10">
      <h1 className="text-2xl font-bold text-white mb-1">Ваша запись</h1>
      <p className="text-slate-500 text-sm mb-6">Управление записью без звонка в клинику</p>

      <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border mb-6 ${statusLabel.cls}`}>
        {statusLabel.text}
      </span>

      <dl className="space-y-3 text-sm mb-8">
        <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
          <dt className="text-slate-500">Дата и время</dt>
          <dd className="text-white font-medium text-right">
            {format(booking.startTime, "d MMMM yyyy, HH:mm", { locale: ru })}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
          <dt className="text-slate-500">Услуга</dt>
          <dd className="text-white font-medium text-right">{booking.service.title}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
          <dt className="text-slate-500">Врач</dt>
          <dd className="text-white font-medium text-right">
            {booking.doctor.name}
            <span className="block text-xs text-slate-500">{booking.doctor.specialty}</span>
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
          <dt className="text-slate-500">Пациент</dt>
          <dd className="text-white font-medium text-right">
            {booking.user.name}
            <span className="block text-xs text-slate-500">{booking.user.phone}</span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Оплата</dt>
          <dd className={paid ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
            {paid ? `Оплачено · ${booking.service.price} ₽` : `Не оплачено · ${booking.service.price} ₽`}
          </dd>
        </div>
      </dl>

      {!cancelled && (
        <div className="space-y-3 mb-6">
          <a
            href={`/api/bookings/${token}/ics`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10"
          >
            <Download className="w-5 h-5" />
            Добавить в календарь
          </a>
          <form action={rescheduleBookingByToken}>
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 font-medium rounded-xl transition-colors border border-teal-500/30"
            >
              <CalendarClock className="w-5 h-5" />
              Перенести запись
            </button>
          </form>
          <form action={cancelBookingByToken}>
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium rounded-xl transition-colors border border-rose-500/30"
            >
              <CalendarX2 className="w-5 h-5" />
              Отменить запись
            </button>
          </form>
          {paid && (
            <p className="text-xs text-slate-500 text-center">
              При отмене оплаченной записи возврат средств выполняет администратор — свяжемся с вами по телефону.
            </p>
          )}
        </div>
      )}

      {cancelled && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-slate-400 mb-6">
          <p className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 mt-0.5 shrink-0 text-teal-400" />
            Запись отменена, время освобождено. Хотите записаться снова —{" "}
            <a href="/book" className="text-teal-400 underline underline-offset-2">
              форма онлайн-записи
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

export default function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16">
      <div className="max-w-lg mx-auto bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />
        <Suspense fallback={<div className="text-slate-500 text-center py-8">Загрузка...</div>}>
          <ManageTokenData params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function ManageTokenData({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ManageCard token={token} />;
}

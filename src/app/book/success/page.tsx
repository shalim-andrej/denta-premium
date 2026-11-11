// src/app/book/success/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, Calendar, Phone, Download } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { bookingByToken } from "@/lib/tokens";
import { connection } from "next/server";

// Данные записи зависят от searchParams — доступны только внутри <Suspense>
async function BookingDetails({ token }: { token?: string }) {
  await connection();
  const booking = token ? await bookingByToken(token) : null;
  if (!booking) return null;

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left text-sm mb-6 space-y-2">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Когда</span>
          <span className="text-white font-medium">
            {format(booking.startTime, "d MMMM, HH:mm", { locale: ru })}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Врач</span>
          <span className="text-white font-medium">{booking.doctor.name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Услуга</span>
          <span className="text-white font-medium text-right">{booking.service.title}</span>
        </div>
        <p className="text-xs text-slate-500 pt-2">
          Сохраните ссылку на управление записью — по ней можно отменить или
          перенести приём, а также добавить встречу в календарь.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href={`/booking/${token}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 font-medium rounded-xl transition-colors border border-teal-500/30"
        >
          <Calendar className="w-5 h-5" />
          Управление записью
        </Link>
        <a
          href={`/api/bookings/${token}/ics`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10"
        >
          <Download className="w-5 h-5" />
          Добавить в календарь (.ics)
        </a>
      </div>
    </>
  );
}

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-teal-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Оплата прошла успешно!</h1>
          <p className="text-slate-400 mb-8">
            Ваша запись подтверждена. Ждем вас в клинике!
          </p>

          <Suspense fallback={null}>
            <BookingDetailsPromise searchParams={searchParams} />
          </Suspense>

          <div className="space-y-3 mt-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10"
            >
              Вернуться на главную
            </Link>
            <a
              href="tel:+79990000000"
              className="flex items-center justify-center gap-2 w-full py-3 text-slate-400 hover:text-white font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              Связаться с клиникой
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

async function BookingDetailsPromise({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  return <BookingDetails token={t} />;
}

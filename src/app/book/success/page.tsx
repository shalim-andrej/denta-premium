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
      <div className="card p-6 text-left text-sm mb-7 space-y-0">
        <div className="flex justify-between gap-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-fog">Когда</span>
          <span className="text-ink font-medium">
            {format(booking.startTime, "d MMMM, HH:mm", { locale: ru })}
          </span>
        </div>
        <div className="flex justify-between gap-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-fog">Врач</span>
          <span className="text-ink font-medium">{booking.doctor.name}</span>
        </div>
        <div className="flex justify-between gap-4 py-2.5">
          <span className="text-fog">Услуга</span>
          <span className="text-ink font-medium text-right">{booking.service.title}</span>
        </div>
        <p className="text-xs text-fog pt-3 leading-relaxed">
          Сохраните ссылку на управление записью — по ней можно отменить или
          перенести приём, а также добавить встречу в календарь.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href={`/booking/${token}`}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-mint bg-mint/[0.1] border border-mint/30 hover:bg-mint/[0.18] transition-all duration-300 inline-flex items-center justify-center gap-2"
        >
          <Calendar className="w-4.5 h-4.5" />
          Управление записью
        </Link>
        <a
          href={`/api/bookings/${token}/ics`}
          className="btn-ghost w-full py-3.5 text-sm"
        >
          <Download className="w-4.5 h-4.5" />
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
    <main className="flex items-center justify-center px-4 sm:px-6 py-16 relative overflow-hidden">
      <div className="glow w-[480px] h-[340px] bg-mint/[0.08] top-[16%] left-1/2 -translate-x-1/2" aria-hidden="true" />

      <div className="max-w-md w-full card p-8 md:p-10 text-center relative overflow-hidden animate-fade-up" style={{ boxShadow: "0 40px 90px -30px rgba(0,0,0,.75)" }}>
        <div className="glow w-64 h-64 bg-mint/[0.1] -top-24 left-1/2 -translate-x-1/2" aria-hidden="true" />

        <div className="relative z-10">
          <div
            className="w-20 h-20 rounded-full border border-mint/30 bg-mint/[0.1] flex items-center justify-center mx-auto mb-7"
            style={{ boxShadow: "0 0 60px -12px rgba(60,230,189,.4)" }}
          >
            <CheckCircle2 className="w-9 h-9 text-mint" />
          </div>

          <h1 className="font-display text-[1.55rem] leading-snug text-ink mb-2.5">
            Оплата прошла <span className="accent-word">успешно</span>
          </h1>
          <p className="text-fog mb-8 leading-relaxed">
            Ваша запись подтверждена. Ждём вас в клинике!
          </p>

          <Suspense fallback={null}>
            <BookingDetailsPromise searchParams={searchParams} />
          </Suspense>

          <div className="space-y-2 mt-7">
            <Link
              href="/"
              className="btn-ghost w-full py-3.5 text-sm"
            >
              Вернуться на главную
            </Link>
            <a
              href="tel:+79990000000"
              className="w-full py-3 text-sm text-fog hover:text-mint font-medium transition-colors inline-flex items-center justify-center gap-2"
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

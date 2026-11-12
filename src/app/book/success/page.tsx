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
      <div className="text-left text-sm mb-7 border-t border-ink/10">
        <div className="flex justify-between gap-4 py-3.5 border-b border-ink/10">
          <span className="text-ink-soft">Когда</span>
          <span className="text-ink font-medium">
            {format(booking.startTime, "d MMMM, HH:mm", { locale: ru })}
          </span>
        </div>
        <div className="flex justify-between gap-4 py-3.5 border-b border-ink/10">
          <span className="text-ink-soft">Врач</span>
          <span className="text-ink font-medium">{booking.doctor.name}</span>
        </div>
        <div className="flex justify-between gap-4 py-3.5 border-b border-ink/10">
          <span className="text-ink-soft">Услуга</span>
          <span className="text-ink font-medium text-right">{booking.service.title}</span>
        </div>
        <p className="text-xs text-ink-soft pt-4 leading-relaxed">
          Сохраните ссылку на управление записью — по ней можно отменить или
          перенести приём, а также добавить встречу в календарь.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href={`/booking/${token}`}
          className="btn-primary w-full py-3.5 text-sm"
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
    <main className="flex items-center justify-center px-5 sm:px-8 py-24 md:py-32">
      <div className="max-w-md w-full bg-white border border-ink/10 rounded-3xl p-8 md:p-10 text-center animate-fade-up">
        <div
          className="w-20 h-20 rounded-full border border-terra/30 bg-terra/[0.06] flex items-center justify-center mx-auto mb-7"
        >
          <CheckCircle2 className="w-9 h-9 text-terra" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-[1.7rem] leading-snug text-ink mb-2.5">
          Оплата прошла <span className="serif-italic text-terra">успешно</span>
        </h1>
        <p className="text-ink-soft mb-8 leading-relaxed">
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
            className="w-full py-3 text-sm text-ink-soft hover:text-terra font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Связаться с клиникой
          </a>
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

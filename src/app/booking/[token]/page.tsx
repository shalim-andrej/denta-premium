// src/app/booking/[token]/page.tsx
// Управление записью по защищённой ссылке: детали, отмена, перенос, .ics.
// Ссылку знает только пациент (токен 256 бит) — авторизация не нужна.
// Страница блокирующая (instant = false): битый токен честно отдаёт HTTP 404.
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarX2, CalendarClock, Download, Stethoscope } from "lucide-react";
import { bookingByToken } from "@/lib/tokens";
import { cancelBookingByToken, rescheduleBookingByToken } from "../../actions";

export const instant = false;

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  await connection(); // рендер в момент запроса: в токене есть Date.now()
  const booking = await bookingByToken(token);
  if (!booking) notFound();

  const cancelled = booking.status === "CANCELLED";
  const paid = booking.paymentStatus === "PAID";

  const statusLabel =
    booking.status === "CONFIRMED"
      ? { text: "Подтверждена", cls: "bg-emerald-500/12 text-emerald-300 border-emerald-500/30" }
      : cancelled
        ? { text: "Отменена", cls: "bg-rose-500/12 text-rose-300 border-rose-500/30" }
        : { text: "Ожидает подтверждения клиники", cls: "bg-amber-500/12 text-amber-300 border-amber-500/30" };

  return (
    <main className="px-4 sm:px-6 py-14 md:py-20 relative overflow-hidden">
      <div className="glow w-[480px] h-[320px] bg-mint/[0.07] -top-20 left-1/2 -translate-x-1/2" aria-hidden="true" />

      <div className="max-w-lg mx-auto relative z-10 animate-fade-up">
        <div className="card p-8 md:p-10 relative overflow-hidden" style={{ boxShadow: "0 40px 90px -30px rgba(0,0,0,.75)" }}>
          <div className="glow w-64 h-64 bg-mint/[0.07] -top-24 left-1/2 -translate-x-1/2" aria-hidden="true" />

          <div className="relative z-10">
            <h1 className="font-display text-2xl text-ink mb-1.5">
              Ваша <span className="accent-word">запись</span>
            </h1>
            <p className="text-fog text-sm mb-7">Управление записью без звонка в клинику</p>

            <span className={`inline-flex text-xs font-semibold px-3.5 py-1.5 rounded-full border mb-7 ${statusLabel.cls}`}>
              {statusLabel.text}
            </span>

            <dl className="space-y-0 text-sm mb-8">
              {[
                {
                  dt: "Дата и время",
                  dd: format(booking.startTime, "d MMMM yyyy, HH:mm", { locale: ru }),
                },
                { dt: "Услуга", dd: booking.service.title },
                {
                  dt: "Врач",
                  dd: booking.doctor.name,
                  sub: booking.doctor.specialty,
                },
                {
                  dt: "Пациент",
                  dd: booking.user.name,
                  sub: booking.user.phone,
                },
              ].map((row) => (
                <div
                  key={row.dt}
                  className="flex justify-between gap-4 py-3.5 border-b border-white/[0.06]"
                >
                  <dt className="text-fog shrink-0">{row.dt}</dt>
                  <dd className="text-ink font-medium text-right">
                    {row.dd}
                    {row.sub && <span className="block text-xs text-fog mt-0.5">{row.sub}</span>}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 py-3.5">
                <dt className="text-fog">Оплата</dt>
                <dd className={paid ? "text-emerald-300 font-semibold" : "text-amber-300 font-semibold"}>
                  {paid ? `Оплачено · ${booking.service.price.toLocaleString("ru-RU")} ₽` : `Не оплачено · ${booking.service.price.toLocaleString("ru-RU")} ₽`}
                </dd>
              </div>
            </dl>

            {!cancelled && (
              <div className="space-y-3">
                <a
                  href={`/api/bookings/${token}/ics`}
                  className="btn-ghost w-full py-3.5 text-sm"
                >
                  <Download className="w-4.5 h-4.5" />
                  Добавить в календарь
                </a>
                <form action={rescheduleBookingByToken}>
                  <input type="hidden" name="token" value={token} />
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full text-sm font-semibold text-mint bg-mint/[0.1] border border-mint/30 hover:bg-mint/[0.18] transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    <CalendarClock className="w-4.5 h-4.5" />
                    Перенести запись
                  </button>
                </form>
                <form action={cancelBookingByToken}>
                  <input type="hidden" name="token" value={token} />
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full text-sm font-semibold text-rose-300 bg-rose-500/[0.08] border border-rose-500/25 hover:bg-rose-500/[0.16] transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    <CalendarX2 className="w-4.5 h-4.5" />
                    Отменить запись
                  </button>
                </form>
                {paid && (
                  <p className="text-xs text-fog text-center pt-1">
                    При отмене оплаченной записи возврат средств выполняет администратор — свяжемся с вами по телефону.
                  </p>
                )}
              </div>
            )}

            {cancelled && (
              <div className="card p-5 text-sm">
                <p className="text-fog flex items-start gap-2.5 leading-relaxed">
                  <Stethoscope className="w-4 h-4 mt-0.5 shrink-0 text-mint" />
                  <span>
                    Запись отменена, время освобождено. Хотите записаться снова —{" "}
                    <a href="/book" className="text-mint underline underline-offset-2 hover:text-ink transition-colors">
                      форма онлайн-записи
                    </a>
                    .
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

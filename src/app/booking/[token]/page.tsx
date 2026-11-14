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
      ? { text: "Подтверждена", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : cancelled
        ? { text: "Отменена", cls: "bg-rose-50 text-rose-700 border-rose-200" }
        : { text: "Ожидает подтверждения клиники", cls: "bg-amber-50 text-amber-700 border-amber-200" };

  return (
    <main className="px-5 sm:px-8 pt-[110px] md:pt-[150px] pb-24 md:pb-32">
      <div className="max-w-lg mx-auto animate-fade-up">
        <div className="bg-white border border-ink/10 rounded-3xl p-8 md:p-10">
          <h1 className="font-display text-3xl text-ink mb-1.5">
            Ваша <span className="serif-italic text-fern">запись</span>
          </h1>
          <p className="text-ink-soft text-sm mb-7">Управление записью без звонка в клинику</p>

          <span className={`inline-flex text-xs font-semibold px-3.5 py-1.5 rounded-[2px] border mb-8 ${statusLabel.cls}`}>
            {statusLabel.text}
          </span>

          <dl className="text-sm mb-8 border-t border-ink/10">
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
                className="flex justify-between gap-4 py-3.5 border-b border-ink/10"
              >
                <dt className="text-ink-soft shrink-0">{row.dt}</dt>
                <dd className="text-ink font-medium text-right">
                  {row.dd}
                  {row.sub && <span className="block text-xs text-ink-soft mt-0.5">{row.sub}</span>}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-3.5">
              <dt className="text-ink-soft">Оплата</dt>
              <dd className={paid ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                {paid ? `Оплачено · ${booking.service.price.toLocaleString("ru-RU")} ₽` : `Не оплачено · ${booking.service.price.toLocaleString("ru-RU")} ₽`}
              </dd>
            </div>
          </dl>

          {!cancelled && (
            <div className="space-y-3">
              <a
                href={`/api/bookings/${token}/ics`}
                className="link-quiet w-full justify-center text-[13px]"
              >
                <Download className="w-4.5 h-4.5" />
                Добавить в календарь
              </a>
              <form action={rescheduleBookingByToken}>
                <input type="hidden" name="token" value={token} />
                <button
                  type="submit"
                  className="link-action w-full justify-center text-[13px]"
                >
                  <CalendarClock className="w-4.5 h-4.5" />
                  Перенести запись
                </button>
              </form>
              <form action={cancelBookingByToken}>
                <input type="hidden" name="token" value={token} />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-[2px] text-sm font-semibold text-rose-700 border border-rose-300 hover:bg-rose-50 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <CalendarX2 className="w-4.5 h-4.5" />
                  Отменить запись
                </button>
              </form>
              {paid && (
                <p className="text-xs text-ink-soft text-center pt-1">
                  При отмене оплаченной записи возврат средств выполняет администратор — свяжемся с вами по телефону.
                </p>
              )}
            </div>
          )}

          {cancelled && (
            <div className="bg-paper border border-ink/10 rounded-2xl p-5 text-sm">
              <p className="text-ink-soft flex items-start gap-2.5 leading-relaxed">
                <Stethoscope className="w-4 h-4 mt-0.5 shrink-0 text-fern" />
                <span>
                  Запись отменена, время освобождено. Хотите записаться снова —{" "}
                  <a href="/book" className="text-fern underline underline-offset-2 hover:text-ink transition-colors">
                    форма онлайн-записи
                  </a>
                  .
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

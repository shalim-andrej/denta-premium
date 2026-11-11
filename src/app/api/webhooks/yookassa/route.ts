// src/app/api/webhooks/yookassa/route.ts
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { notifyAdminTelegram, sendEmail, emailShell, siteUrl, isRealEmail } from "@/lib/notify";

// Официальные сети и адреса уведомлений ЮKassa
// https://yookassa.ru/developers/using-api/webhooks
const YOOKASSA_IPS = new Set(["77.75.156.11", "77.75.156.35"]);
const YOOKASSA_NETS: Array<[number, number]> = [
  // [base, mask] в виде чисел: 185.71.76.0/27, 185.71.77.0/27, 77.75.153.0/25, 77.75.154.128/25
  [ipToInt("185.71.76.0"), 27],
  [ipToInt("185.71.77.0"), 27],
  [ipToInt("77.75.153.0"), 25],
  [ipToInt("77.75.154.128"), 25],
];
const YOOKASSA_V6_PREFIX = "2a02:5180:";

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isYooKassaIp(ip: string): boolean {
  if (ip.includes(":")) return ip.startsWith(YOOKASSA_V6_PREFIX); // IPv6-сеть 2a02:5180::/32
  const num = ipToInt(ip);
  for (const [base, mask] of YOOKASSA_NETS) {
    const size = 2 ** (32 - mask);
    const start = base >>> 0;
    if (num >= start && num < start + size) return true;
  }
  return YOOKASSA_IPS.has(ip);
}

function clientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const isDev = process.env.NODE_ENV !== "production";

  // В продакшене запросы принимаем только от сетей ЮKassa.
  // В dev пустой IP разрешён — чтобы можно было тестировать вебхук локально.
  if (ip && !isYooKassaIp(ip)) {
    console.warn("YooKassa webhook rejected: untrusted IP", ip);
    return NextResponse.json({ error: "Untrusted source" }, { status: 403 });
  }
  if (!ip && !isDev) {
    return NextResponse.json({ error: "Untrusted source" }, { status: 403 });
  }

  try {
    const event = await request.json();

    // Идемпотентность: ЮKassa повторяет доставку, пока не получит 200.
    // Ключ — событие + id платежа. Повтор того же события не обрабатываем.
    const eventId = `${event.event ?? "unknown"}:${event.object?.id ?? ""}`;
    try {
      await prisma.processedEvent.create({ data: { id: eventId } });
    } catch {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.event === "payment.succeeded") {
      const bookingId = event.object?.metadata?.bookingId;
      const paymentId = event.object?.id;
      if (bookingId) {
        // paymentId сохраняем — он понадобится для возврата через API ЮKassa
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: "PAID", status: "CONFIRMED", paymentId: paymentId ?? null },
        });

        const b = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: true,
            service: true,
            doctor: true,
            manageTokens: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        });
        if (b) {
          const when = format(b.startTime, "d MMMM, HH:mm", { locale: ru });
          await notifyAdminTelegram(
            `<b>Оплата получена</b>\n` +
              `👤 ${b.user.name}, ${b.user.phone ?? ""}\n` +
              `🕐 ${when} — ${b.service.title} (${b.service.price} ₽)\n` +
              `💳 ${paymentId ?? "—"}`
          );
          if (isRealEmail(b.user.email)) {
            const base = await siteUrl();
            const manageToken = b.manageTokens[0]?.token;
            await sendEmail(
              b.user.email,
              `Оплата прошла успешно — ждём вас ${when}`,
              emailShell(
                "Оплата прошла успешно",
                `<p>Здравствуйте, ${b.user.name}!</p>` +
                  `<p>Приём <b>${b.service.title}</b> оплачен (${b.service.price} руб.).</p>` +
                  `<p><b>Когда:</b> ${when}<br/><b>Врач:</b> ${b.doctor.name}</p>` +
                  (manageToken
                    ? `<p>Управление записью (отмена/перенос, календарь): ` +
                      `<a href="${base}/booking/${manageToken}">ссылка на запись</a></p>`
                    : "") +
                  `<p style="color:#64748b;font-size:12px;">Возьмите с собой паспорт и приходите за 10 минут до приёма.</p>`
              )
            );
          }
        }
      }
    }

    if (event.event === "payment.canceled") {
      const bookingId = event.object?.metadata?.bookingId;
      if (bookingId) {
        // Платёж не прошёл — запись остаётся без оплаты (админ решает, что делать)
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: "UNPAID", status: "PENDING" },
        });
        const b = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { user: true, service: true },
        });
        if (b) {
          const when = format(b.startTime, "d MMMM, HH:mm", { locale: ru });
          await notifyAdminTelegram(
            `<b>Платёж отменён</b>\n` +
              `👤 ${b.user.name}, ${b.user.phone ?? ""}\n` +
              `🕐 ${when} — ${b.service.title}. Запись не оплачена.`
          );
        }
      }
    }
  } catch (e) {
    console.error("Webhook processing error:", e);
  }

  return NextResponse.json({ received: true });
}

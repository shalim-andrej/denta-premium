// src/app/api/webhooks/yookassa/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (event.event === "payment.succeeded") {
      const bookingId = event.object?.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        });
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
      }
    }
  } catch (e) {
    console.error("Webhook processing error:", e);
  }

  return NextResponse.json({ received: true });
}

// src/app/api/webhooks/yookassa/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  // В продакшене здесь ОБЯЗАТЕЛЬНО нужно проверять IP-адрес ЮKassa или подпись
  const event = await request.json();

  if (event.event === "payment.succeeded") {
    const bookingId = event.object.metadata?.bookingId;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          paymentStatus: "PAID", 
          status: "CONFIRMED" 
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
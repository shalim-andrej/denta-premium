// src/app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createYookassaPaymentSession } from "@light-stack/yookassa-payments/server";
import { prisma } from "@/lib/prisma";

// ВАЖНО: сумму клиент не присылает — она берётся из БД по bookingId,
// иначе злоумышленник мог бы записаться на услугу за 5000 ₽ и заплатить 1 ₽.
const paymentSchema = z.object({
  bookingId: z.string().min(1),
  returnUrl: z.string().url(),
  method: z.enum(["card", "sbp"]).default("card"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = paymentSchema.parse(body);

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      console.error("YOOKASSA credentials missing in .env");
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
    }

    // Находим запись вместе с услугой — единственный источник цены
    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Booking already paid" }, { status: 409 });
    }

    const amount = booking.service.price;

    // Формируем данные для сессии
    const sessionData: any = {
      integration: "smart", // Умный платеж (редирект)
      amount: amount.toFixed(2),
      returnUrl: validated.returnUrl,
      description: `Оплата услуги: ${booking.service.title} (запись ${booking.id.slice(-6)})`,
      metadata: { bookingId: validated.bookingId },
      capture: true,
    };

    // Если выбран СБП, указываем это
    if (validated.method === "sbp") {
      sessionData.integration = "direct";
      sessionData.paymentMethod = "sbp";
    }

    // Создаем сессию через библиотеку
    const session = await createYookassaPaymentSession(
      { shopId, secretKey },
      sessionData
    );

    // Библиотека возвращает confirmationUrl и paymentId
    return NextResponse.json({
      confirmationUrl: session.confirmationUrl,
      paymentId: session.paymentId,
      amount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.issues);
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("Payment creation failed:", error);
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }
}

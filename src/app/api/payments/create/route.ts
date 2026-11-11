// src/app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createYookassaPaymentSession } from "@light-stack/yookassa-payments/server";

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string(),
  bookingId: z.string(),
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

    // Формируем данные для сессии
    const sessionData: any = {
      integration: "smart", // Умный платеж (редирект)
      amount: validated.amount.toFixed(2),
      returnUrl: validated.returnUrl,
      description: validated.description,
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
      paymentId: session.paymentId 
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
// src/app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { createYookassaPaymentSession } from "@light-stack/yookassa-payments/server";
import { z } from "zod";

// Схема валидации: что мы ожидаем получить от клиента
const paymentSchema = z.object({
  amount: z.number().positive(),               // Сумма (например, 1500)
  description: z.string(),                     // Описание (например, "Оплата услуги: Лечение кариеса")
  bookingId: z.string(),                       // ID записи, чтобы потом связать оплату с записью
  returnUrl: z.string().url(),                 // Куда вернуть пациента после оплаты
  method: z.enum(["card", "sbp"]).default("card"), // Способ оплаты: карта или СБП
});

export async function POST(request: Request) {
  try {
    // 1. Читаем тело запроса и валидируем через Zod
    const body = await request.json();
    const validated = paymentSchema.parse(body);

    // 2. Базовые параметры платежа (общие для карты и СБП)
    //    - integration: "smart" — это "Умный платёж", он сам показывает доступные способы
    //    - capture: true — для СБП обязательна одностадийная оплата (сразу списание)
    const paymentData: any = {
      integration: "smart",
      amount: validated.amount.toFixed(2),      // ЮKassa ждёт строку с копейками: "1500.00"
      returnUrl: validated.returnUrl,
      description: validated.description,
      metadata: { bookingId: validated.bookingId }, // Сохраняем ID записи в метаданных платежа
      capture: true,
    };

    // 3. Если пациент выбрал СБП — явно указываем это
    if (validated.method === "sbp") {
      paymentData.payment_method_data = { type: "sbp" };
    }

    // 4. Создаём платёж через ЮKassa
    const session = await createYookassaPaymentSession(
      {
        shopId: process.env.YOOKASSA_SHOP_ID!,
        secretKey: process.env.YOOKASSA_SECRET_KEY!,
      },
      paymentData
    );

    // 5. Возвращаем клиенту ссылку на оплату
    return NextResponse.json({
      confirmationUrl: session.confirmationUrl,
      paymentId: session.paymentId,
    });
  } catch (error) {
    // Если ошибка валидации — возвращаем 400
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    // Если ошибка ЮKassa или сети — возвращаем 500
    console.error("Payment creation failed:", error);
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }
}
// src/app/api/admin/bookings.csv/route.ts
// Экспорт записей в CSV (разделитель «;», BOM — открывается в Excel без танцев).
// proxy.ts не защищает /api — проверяем админ-сессию здесь.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isAdminRequest } from "@/lib/auth";

function csvCell(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const c = await cookies();
  const authorized = await isAdminRequest(c.get(ADMIN_COOKIE)?.value);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "desc" },
    include: { user: true, service: true, doctor: true },
  });

  const header = [
    "Дата",
    "Время",
    "Пациент",
    "Телефон",
    "Email",
    "Услуга",
    "Врач",
    "Цена, руб",
    "Статус",
    "Оплата",
  ].join(";");

  const rows = bookings.map((b) =>
    [
      b.startTime.toLocaleDateString("ru-RU"),
      b.startTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      b.user.name,
      b.user.phone ?? "",
      b.user.email,
      b.service.title,
      b.doctor.name,
      b.service.price,
      b.status,
      b.paymentStatus,
    ]
      .map(csvCell)
      .join(";")
  );

  const csv = "\uFEFF" + [header, ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

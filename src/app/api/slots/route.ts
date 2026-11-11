// src/app/api/slots/route.ts
// Слоты считает СЕРВЕР. Врач опционален: без doctorId возвращаем объединение
// слотов всех врачей — «подберите за меня» (для каждого времени подставляем
// врача, у которого оно свободно; при создании записи назначение перепроверяется).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { doctorFreeSlots } from "@/lib/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const serviceId = searchParams.get("serviceId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!serviceId || !dateStr) {
    return NextResponse.json(
      { error: "serviceId и date обязательны" },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }

  // Полночь выбранного дня в часовом поясе сервера
  const date = new Date(`${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Некорректная дата" }, { status: 400 });
  }

  if (doctorId) {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json({ error: "Врач не найден" }, { status: 404 });
    }
    const slots = (await doctorFreeSlots(doctorId, date, service.duration)).map((t) => ({
      time: t.toISOString(),
      doctorId,
    }));
    return NextResponse.json({ slots });
  }

  // «Подберите за меня»: объединение свободных слотов всех врачей.
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" }, select: { id: true } });
  const perDoctor = await Promise.all(
    doctors.map(async (d) => ({
      doctorId: d.id,
      slots: await doctorFreeSlots(d.id, date, service.duration),
    }))
  );

  // Одно и то же время может быть свободно у нескольких врачей — берём первого.
  const byTime = new Map<string, string>();
  for (const { doctorId: id, slots } of perDoctor) {
    for (const t of slots) {
      const key = t.toISOString();
      if (!byTime.has(key)) byTime.set(key, id);
    }
  }

  const slots = [...byTime.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, id]) => ({ time, doctorId: id }));

  return NextResponse.json({ slots });
}

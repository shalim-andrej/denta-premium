// src/app/api/slots/route.ts
// Слоты считаются НА СЕРВЕРЕ: расписание врача (Schedule), длительность услуги,
// уже занятые записи и прошедшее время. Клиент больше ничего не придумывает сам.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STEP_MIN = 30;
const DEFAULT_START = 9; // дефолтный график, если расписание не заполнено
const DEFAULT_END = 18;

interface Interval {
  start: number; // минуты от полуночи
  end: number;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const serviceId = searchParams.get("serviceId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!doctorId || !serviceId || !dateStr) {
    return NextResponse.json(
      { error: "doctorId, serviceId и date обязательны" },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }

  // Полночь выбранного дня в часовом поясе сервера
  const date = new Date(`${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Некорректная дата" }, { status: 400 });
  }

  const dayOfWeek = date.getDay(); // 0 = воскресенье

  // 1. График работы врача из Schedule; если не заполнен — дефолт (пн–сб 9:00–18:00, вс — выходной)
  const schedules = await prisma.schedule.findMany({ where: { doctorId, dayOfWeek } });
  let intervals: Interval[];
  if (schedules.length > 0) {
    intervals = schedules
      .map((s) => ({ start: toMinutes(s.startTime), end: toMinutes(s.endTime) }))
      .filter((iv) => iv.end > iv.start);
  } else if (dayOfWeek === 0) {
    intervals = [];
  } else {
    intervals = [{ start: DEFAULT_START * 60, end: DEFAULT_END * 60 }];
  }

  // 2. Занятые записи этого врача на день (кроме отменённых)
  const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const bookings = await prisma.booking.findMany({
    where: {
      doctorId,
      status: { not: "CANCELLED" },
      startTime: { lt: dayEnd },
      endTime: { gte: date },
    },
    select: { startTime: true, endTime: true },
  });

  // 3. Перебор слотов с шагом 30 минут
  const now = Date.now();
  const slots: string[] = [];

  for (const iv of intervals) {
    for (let m = iv.start; m + service.duration <= iv.end; m += STEP_MIN) {
      const slotStart = new Date(date.getTime() + m * 60000);
      if (slotStart.getTime() <= now) continue; // уже прошло

      const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);
      const busy = bookings.some((b) => slotStart < b.endTime && slotEnd > b.startTime);
      if (busy) continue;

      slots.push(slotStart.toISOString());
    }
  }

  return NextResponse.json({ slots });
}

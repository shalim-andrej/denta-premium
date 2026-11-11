// src/lib/slots.ts
// Единая логика свободных слотов: расписание врача (Schedule), дефолтный график,
// занятые записи и прошедшее время. Используется и в API /api/slots,
// и в серверных экшенах (автоназначение врача, ручная запись в админке).
import { prisma } from "@/lib/prisma";

export const STEP_MIN = 30;
const DEFAULT_START = 9; // дефолтный график: пн–сб 9:00–18:00, вс — выходной
const DEFAULT_END = 18;

export interface Interval {
  start: number; // минуты от полуночи
  end: number;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Интервалы работы врача на день недели. Пустой массив = нерабочий день. */
export function dayIntervals(
  schedules: Array<{ startTime: string; endTime: string }>,
  dayOfWeek: number
): Interval[] {
  if (schedules.length > 0) {
    return schedules
      .map((s) => ({ start: toMinutes(s.startTime), end: toMinutes(s.endTime) }))
      .filter((iv) => iv.end > iv.start);
  }
  if (dayOfWeek === 0) return [];
  return [{ start: DEFAULT_START * 60, end: DEFAULT_END * 60 }];
}

/** Полностью ли интервал [startMin, endMin) попадает в рабочие интервалы. */
export function coversInterval(intervals: Interval[], startMin: number, endMin: number): boolean {
  return intervals.some((iv) => startMin >= iv.start && endMin <= iv.end);
}

/** Занято ли у врача время [start, end) активной записью (кроме отменённых). */
export async function hasOverlap(doctorId: string, start: Date, end: Date): Promise<boolean> {
  const existing = await prisma.booking.findFirst({
    where: {
      doctorId,
      status: { not: "CANCELLED" },
      OR: [
        { startTime: { lte: start }, endTime: { gt: start } },
        { startTime: { lt: end }, endTime: { gte: end } },
        { startTime: { gte: start }, endTime: { lte: end } },
      ],
    },
    select: { id: true },
  });
  return !!existing;
}

/**
 * Свободные слоты ОДНОГО врача на дату под услугу длительностью durationMin.
 */
export async function doctorFreeSlots(
  doctorId: string,
  date: Date,
  durationMin: number
): Promise<Date[]> {
  const dayOfWeek = date.getDay();
  const schedules = await prisma.schedule.findMany({ where: { doctorId, dayOfWeek } });
  const intervals = dayIntervals(schedules, dayOfWeek);

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

  const now = Date.now();
  const out: Date[] = [];
  for (const iv of intervals) {
    for (let m = iv.start; m + durationMin <= iv.end; m += STEP_MIN) {
      const slotStart = new Date(date.getTime() + m * 60000);
      if (slotStart.getTime() <= now) continue; // уже прошло
      const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);
      const busy = bookings.some((b) => slotStart < b.endTime && slotEnd > b.startTime);
      if (busy) continue;
      out.push(slotStart);
    }
  }
  return out;
}

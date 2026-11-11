// src/app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { timingSafeEqual, randomBytes } from "crypto";
import { ADMIN_COOKIE, adminSessionValue } from "@/lib/auth";
import { dayIntervals, coversInterval } from "@/lib/slots";
import { bookingByToken } from "@/lib/tokens";

/** Сравнение строк за постоянное время — защита от timing-атак. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

const doctorSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().min(2),
  experience: z.coerce.number().int().positive().optional().default(5),
});

export async function createDoctor(formData: FormData) {
  const parsed = doctorSchema.safeParse({
    name: formData.get("name"),
    specialty: formData.get("specialty"),
    experience: formData.get("experience"),
  });

  if (!parsed.success) {
    console.error(parsed.error.issues);
    return;
  }

  try {
    await prisma.doctor.create({ data: parsed.data });
    revalidatePath("/admin");
    revalidatePath("/book");
    revalidatePath("/doctors");
  } catch (e) {
    console.error("Ошибка сохранения врача", e);
  }
}

const serviceSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().int().positive(),
  duration: z.coerce.number().int().positive(),
});

export async function createService(formData: FormData) {
  const parsed = serviceSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    price: formData.get("price"),
    duration: formData.get("duration"),
  });

  if (!parsed.success) {
    console.error(parsed.error.issues);
    return;
  }

  try {
    await prisma.service.create({ data: parsed.data });
    revalidatePath("/admin");
    revalidatePath("/book");
    revalidatePath("/services");
  } catch (e) {
    console.error("Ошибка сохранения услуги", e);
  }
}

const bookingSchema = z.object({
  serviceId: z.string(),
  doctorId: z.string().optional(), // опционален: режим «подберите за меня»
  startTime: z.string(),
  clientName: z.string().min(2),
  clientPhone: z.string().min(10),
  clientEmail: z.string().email().optional(),
});

const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

export async function createBooking(formData: FormData) {
  const parsed = bookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    doctorId: formData.get("doctorId") || undefined,
    startTime: formData.get("startTime"),
    clientName: formData.get("clientName"),
    clientPhone: formData.get("clientPhone"),
    clientEmail: formData.get("clientEmail"),
  });

  if (!parsed.success) {
    console.error("Zod validation failed:", parsed.error.issues);
    return { error: "Проверьте правильность введенных данных" };
  }

  const data = parsed.data;
  const startTime = new Date(data.startTime);
  if (isNaN(startTime.getTime())) return { error: "Некорректное время записи" };

  try {
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service || !service.isActive) return { error: "Услуга не найдена" };

    const endTime = new Date(startTime.getTime() + service.duration * 60000);
    const dayOfWeek = startTime.getDay();

    // Автоназначение врача, проверка графика и защита от двойной брони —
    // в одной транзакции. better-sqlite3 сериализует запись: у двух
    // конкурирующих запросов второй получит ошибку БД, а не создаст дубль.
    const assigned = await prisma.$transaction(async (tx) => {
      let candidates: Array<{ id: string }>;
      if (data.doctorId) {
        const doc = await tx.doctor.findUnique({
          where: { id: data.doctorId },
          select: { id: true },
        });
        candidates = doc ? [doc] : [];
      } else {
        candidates = await tx.doctor.findMany({
          orderBy: { name: "asc" },
          select: { id: true },
        });
      }

      for (const candidate of candidates) {
        // 1. Врач работает в этот день и успевает до конца смены
        const schedules = await tx.schedule.findMany({
          where: { doctorId: candidate.id, dayOfWeek },
        });
        const intervals = dayIntervals(schedules, dayOfWeek);
        if (intervals.length === 0) continue; // нерабочий день
        if (!coversInterval(intervals, minutesOf(startTime), minutesOf(endTime))) continue;

        // 2. Время не пересекается с активными записями
        const existing = await tx.booking.findFirst({
          where: {
            doctorId: candidate.id,
            status: { not: "CANCELLED" },
            OR: [
              { startTime: { lte: startTime }, endTime: { gt: startTime } },
              { startTime: { lt: endTime }, endTime: { gte: endTime } },
              { startTime: { gte: startTime }, endTime: { lte: endTime } },
            ],
          },
          select: { id: true },
        });
        if (existing) continue;

        // 3. Пользователь: email или уникальный временный из телефона
        const emailToUse = data.clientEmail || `${data.clientPhone}@temp.dentapremium.ru`;
        const user = await tx.user.upsert({
          where: { email: emailToUse },
          update: { name: data.clientName, phone: data.clientPhone },
          create: { name: data.clientName, phone: data.clientPhone, email: emailToUse },
        });

        // 4. Запись + токен «управления записью» (отмена/перенос без звонка)
        const booking = await tx.booking.create({
          data: {
            startTime,
            endTime,
            userId: user.id,
            serviceId: data.serviceId,
            doctorId: candidate.id,
          },
        });
        const manageToken = randomBytes(32).toString("base64url");
        await tx.bookingToken.create({
          data: {
            token: manageToken,
            bookingId: booking.id,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });

        return { booking, doctorId: candidate.id, manageToken };
      }
      return null;
    });

    if (!assigned) {
      return {
        error: "Это время уже занято или не подходит под график врача. Выберите другое.",
      };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: assigned.doctorId },
      select: { name: true },
    });

    revalidatePath("/admin");
    return {
      success: true,
      bookingId: assigned.booking.id,
      doctorName: doctor?.name,
      manageToken: assigned.manageToken,
    };
  } catch (e: any) {
    console.error("PRISMA ERROR IN createBooking:", e);
    return { error: "Ошибка базы данных при бронировании." };
  }
}

export async function updateBookingStatus(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const newStatus = formData.get("status") as string;
  if (!bookingId || !newStatus) return;
  // Белый список статусов: значение приходит из формы, нельзя доверять вслепую
  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(newStatus)) return;

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });
    revalidatePath("/admin");
  } catch (e) {
    console.error(e);
  }
}

/** Отмена записи пациентом по токену из ссылки. */
export async function cancelBookingByToken(formData: FormData) {
  const token = String(formData.get("token") || "");
  const booking = await bookingByToken(token);
  if (!booking) redirect("/book");

  if (booking.status !== "CANCELLED") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/admin");
  }
  redirect(`/booking/${token}`);
}

/** Перенос: отменяем текущую запись и открываем форму записи с теми же врачом и услугой. */
export async function rescheduleBookingByToken(formData: FormData) {
  const token = String(formData.get("token") || "");
  const booking = await bookingByToken(token);
  if (!booking) redirect("/book");

  if (booking.status !== "CANCELLED") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/admin");
  }
  redirect(`/book?service=${booking.serviceId}&doctor=${booking.doctorId}`);
}

export async function loginAction(formData: FormData): Promise<{ error: string } | void> {
  const password = formData.get("password") as string;
  const expected = process.env.ADMIN_PASSWORD;

  if (expected && safeEqual(password, expected)) {
    const sessionValue = await adminSessionValue();
    (await cookies()).set(ADMIN_COOKIE, sessionValue ?? "invalid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800,
      path: "/",
    });
    redirect("/admin");
  }

  return { error: "Неверный пароль" };
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/login");
}
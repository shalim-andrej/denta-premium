// src/app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { timingSafeEqual, randomBytes } from "crypto";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ADMIN_COOKIE, adminSessionValue, isAdminRequest } from "@/lib/auth";
import { dayIntervals, coversInterval, hasOverlap } from "@/lib/slots";
import { bookingByToken } from "@/lib/tokens";
import { notifyAdminTelegram, sendEmail, emailShell, siteUrl, isRealEmail } from "@/lib/notify";
import { rateLimit } from "@/lib/ratelimit";
import bcrypt from "bcryptjs";

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
  await requireAdmin();
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
  await requireAdmin();
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

    // Уведомления: админу в Telegram, пациенту на email (если указан настоящая почта).
    const when = format(startTime, "d MMMM, HH:mm", { locale: ru });
    await notifyAdminTelegram(
      `<b>Новая запись</b>\n` +
        `👤 ${data.clientName}, +${data.clientPhone}\n` +
        `🕐 ${when}\n` +
        `${doctor?.name}: ${service.title} — ${service.price} ₽` +
        (data.clientEmail ? `\n✉️ ${data.clientEmail}` : "")
    );
    if (data.clientEmail && isRealEmail(data.clientEmail)) {
      const base = await siteUrl();
      await sendEmail(
        data.clientEmail,
        `Вы записаны в клинику — ${when}`,
        emailShell(
          "Вы записаны в DentaPremium",
          `<p>Здравствуйте, ${data.clientName}!</p>` +
            `<p>Вы записаны на <b>${service.title}</b> (${service.price} руб.).</p>` +
            `<p><b>Когда:</b> ${when}<br/><b>Врач:</b> ${doctor?.name}</p>` +
            `<p>Управлять записью (отмена/перенос, добавить в календарь): ` +
            `<a href="${base}/booking/${assigned.manageToken}">ссылка на запись</a></p>`
        )
      );
    }

    return {
      success: true,
      bookingId: assigned.booking.id,
      doctorName: doctor?.name,
      manageToken: assigned.manageToken,
    };
  } catch (e) {
    console.error("PRISMA ERROR IN createBooking:", e);
    return { error: "Ошибка базы данных при бронировании." };
  }
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
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
  if (!password) return { error: "Введите пароль" };

  // Rate-limit по IP: 5 попыток за 15 минут — брутфорс не имеет смысла
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  if (!rateLimit(`login:${ip}`)) {
    return { error: "Слишком много попыток входа. Попробуйте через 15 минут." };
  }

  // Поддерживаем оба варианта: открытый пароль и bcrypt-хеш (надёжнее).
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const expected = process.env.ADMIN_PASSWORD;
  let ok = false;
  if (hash) ok = await bcrypt.compare(password, hash);
  else if (expected) ok = safeEqual(password, expected);

  if (ok) {
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
/* ============ Защита админских экшенов ============ */

// Серверные экшены вызываются POST-запросами — проверяем админ-сессию
// ВНУТРИ каждого экшена, а не только в proxy.ts.
export async function requireAdmin(): Promise<void> {
  const c = await cookies();
  const ok = await isAdminRequest(c.get(ADMIN_COOKIE)?.value);
  if (!ok) throw new Error("Unauthorized: только для администратора");
}

/* ============ Расписание врачей ============ */

const scheduleSchema = z.object({
  doctorId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function createSchedule(formData: FormData) {
  await requireAdmin();
  const parsed = scheduleSchema.safeParse({
    doctorId: formData.get("doctorId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (!parsed.success) return;

  const { doctorId, dayOfWeek, startTime, endTime } = parsed.data;
  // Интервал должен быть корректным: конец после начала
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  if (eh * 60 + em <= sh * 60 + sm) return;

  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return;
    await prisma.schedule.create({ data: { doctorId, dayOfWeek, startTime, endTime } });
    revalidatePath("/admin/schedule");
  } catch (e) {
    console.error("createSchedule failed:", e);
  }
}

export async function deleteSchedule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    await prisma.schedule.delete({ where: { id } });
    revalidatePath("/admin/schedule");
  } catch (e) {
    console.error("deleteSchedule failed:", e);
  }
}

/* ============ Услуги: редактирование и вкл/выкл ============ */

export async function updateService(formData: FormData) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    price: formData.get("price"),
    duration: formData.get("duration"),
  });
  const id = String(formData.get("id") || "");
  if (!parsed.success || !id) return;

  try {
    await prisma.service.update({ where: { id }, data: parsed.data });
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/book");
  } catch (e) {
    console.error("updateService failed:", e);
  }
}

export async function toggleServiceActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    const service = await prisma.service.findUnique({ where: { id }, select: { isActive: true } });
    if (!service) return;
    await prisma.service.update({ where: { id }, data: { isActive: !service.isActive } });
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/book");
  } catch (e) {
    console.error("toggleServiceActive failed:", e);
  }
}

/* ============ Ручная запись пациента администратором ============ */

const adminBookingSchema = z.object({
  serviceId: z.string(),
  doctorId: z.string(),
  startTime: z.string(),
  clientName: z.string().min(2),
  clientPhone: z.string().min(10),
  clientEmail: z.string().email().optional(),
});

export async function adminCreateBooking(formData: FormData) {
  await requireAdmin();
  const parsed = adminBookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    doctorId: formData.get("doctorId"),
    startTime: formData.get("startTime"),
    clientName: formData.get("clientName"),
    clientPhone: formData.get("clientPhone"),
    clientEmail: formData.get("clientEmail"),
  });
  if (!parsed.success) return { error: "Проверьте данные пациента" };

  const data = parsed.data;
  const startTime = new Date(data.startTime);
  if (isNaN(startTime.getTime())) return { error: "Некорректное время" };

  try {
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId } });
    if (!service || !doctor) return { error: "Услуга или врач не найдены" };

    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Админ знает контекст (пациент на телефоне) — график не проверяем,
    // но пересечение с существующими записями всё равно не допускаем.
    const overlap = await hasOverlap(data.doctorId, startTime, endTime);
    if (overlap) return { error: "Это время у врача уже занято" };

    const emailToUse = data.clientEmail || `${data.clientPhone}@temp.dentapremium.ru`;
    const user = await prisma.user.upsert({
      where: { email: emailToUse },
      update: { name: data.clientName, phone: data.clientPhone },
      create: { name: data.clientName, phone: data.clientPhone, email: emailToUse },
    });

    const booking = await prisma.booking.create({
      data: {
        startTime,
        endTime,
        userId: user.id,
        serviceId: service.id,
        doctorId: doctor.id,
        status: "CONFIRMED", // админ подтверждает сразу
      },
    });

    const manageToken = randomBytes(32).toString("base64url");
    await prisma.bookingToken.create({
      data: {
        token: manageToken,
        bookingId: booking.id,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    revalidatePath("/admin");

    const when = format(startTime, "d MMMM, HH:mm", { locale: ru });
    await notifyAdminTelegram(
      `<b>Запись создана админом</b>\n👤 ${data.clientName}, +${data.clientPhone}\n🕐 ${when}\n${doctor.name}: ${service.title}`
    );
    if (data.clientEmail && isRealEmail(data.clientEmail)) {
      const base = await siteUrl();
      await sendEmail(
        data.clientEmail,
        `Вы записаны в клинику — ${when}`,
        emailShell(
          "Вы записаны в DentaPremium",
          `<p>Здравствуйте, ${data.clientName}!</p>` +
            `<p>Вас записали на <b>${service.title}</b> (${service.price} руб.).</p>` +
            `<p><b>Когда:</b> ${when}<br/><b>Врач:</b> ${doctor.name}</p>` +
            `<p>Управление записью: <a href="${base}/booking/${manageToken}">ссылка на запись</a></p>`
        )
      );
    }

    return { success: true, manageToken };
  } catch (e) {
    console.error("adminCreateBooking failed:", e);
    return { error: "Ошибка базы данных" };
  }
}

/** Отметка оплаты в клинике (наличные/терминал). */
export async function updatePaymentStatus(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") || "");
  const paymentStatus = String(formData.get("paymentStatus") || "");
  if (!bookingId || !["PAID", "UNPAID"].includes(paymentStatus)) return;
  try {
    await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus } });
    revalidatePath("/admin");
  } catch (e) {
    console.error(e);
  }
}

/* ============ Отзывы ============ */

const reviewSchema = z.object({
  name: z.string().min(2).max(60),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(10).max(1000),
});

/** Публичная форма отзыва: попадает на сайт только после модерации. */
export async function submitReview(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    name: formData.get("name"),
    rating: formData.get("rating"),
    text: formData.get("text"),
  });
  if (!parsed.success) return { error: "Заполните имя, оценку и отзыв (от 10 символов)" };

  try {
    await prisma.review.create({ data: parsed.data });
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (e) {
    console.error("submitReview failed:", e);
    return { error: "Не удалось сохранить отзыв" };
  }
}

export async function approveReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    const review = await prisma.review.findUnique({ where: { id }, select: { approved: true } });
    if (!review) return;
    await prisma.review.update({ where: { id }, data: { approved: !review.approved } });
    revalidatePath("/admin/reviews");
    revalidatePath("/");
  } catch (e) {
    console.error("approveReview failed:", e);
  }
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    await prisma.review.delete({ where: { id } });
    revalidatePath("/admin/reviews");
    revalidatePath("/");
  } catch (e) {
    console.error("deleteReview failed:", e);
  }
}

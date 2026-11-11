// src/app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

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
  doctorId: z.string(),
  startTime: z.string(),
  clientName: z.string().min(2),
  clientPhone: z.string().min(5),
  clientEmail: z.string().email().optional(),
});

export async function createBooking(formData: FormData) {
  const parsed = bookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    doctorId: formData.get("doctorId"),
    startTime: formData.get("startTime"),
    clientName: formData.get("clientName"),
    clientPhone: formData.get("clientPhone"),
    clientEmail: formData.get("clientEmail"),
  });

  if (!parsed.success) {
    console.error(parsed.error.issues);
    return { error: "Неверные данные" }; 
  }

  const data = parsed.data;
  const startTime = new Date(data.startTime);

  try {
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) return { error: "Услуга не найдена" };

    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    const existing = await prisma.booking.findFirst({
      where: {
        doctorId: data.doctorId,
        status: { not: "CANCELLED" },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    if (existing) return { error: "Время занято" };

    let user = await prisma.user.findFirst({ where: { phone: data.clientPhone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.clientName,
          phone: data.clientPhone,
          email: data.clientEmail || `${Date.now()}@temp.ru`,
        },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        startTime,
        endTime,
        userId: user.id,
        serviceId: data.serviceId,
        doctorId: data.doctorId,
      },
    });

    revalidatePath("/admin");
    return { success: true, bookingId: booking.id }; 
  } catch (e) {
    console.error(e);
    return { error: "Ошибка бронирования" };
  }
}

export async function updateBookingStatus(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const newStatus = formData.get("status") as string;
  if (!bookingId || !newStatus) return;

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

// ИСПРАВЛЕНА ТИПИЗАЦИЯ
export async function loginAction(formData: FormData): Promise<{ error: string } | void> {
  const password = formData.get("password") as string;
  
  if (password === process.env.ADMIN_PASSWORD) {
    (await cookies()).set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800, // 7 дней
      path: "/",
    });
    redirect("/admin");
  }
  
  return { error: "Неверный пароль" };
}

export async function logoutAction() {
  (await cookies()).delete("admin_session");
  redirect("/login");
}
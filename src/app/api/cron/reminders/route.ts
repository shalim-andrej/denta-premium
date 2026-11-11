// src/app/api/cron/reminders/route.ts
// Напоминания о приёме за 24 часа. Роут дергается внешним планировщиком
// (cron-job.org, Vercel Cron, systemd timer — бесплатно):
//   curl -H "x-cron-secret: $CRON_SECRET" https://site/api/cron/reminders
// Достаточно раз в час. Повторный вызов безопасен: письмо уходит один раз,
// потому что после отправки проставляется reminderSentAt.
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailShell, isRealEmail, secretMatches } from "@/lib/notify";

async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (!secretMatches(request.headers.get("x-cron-secret"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] }, // отменённые не напоминаем
      reminderSentAt: null,
      startTime: { gte: now, lte: in24h },
    },
    include: { user: true, service: true, doctor: true },
  });

  let sent = 0;
  let skipped = 0; // записи без настоящей почты (телефон указан, email нет)

  for (const b of bookings) {
    // Помечаем до отправки, чтобы повторный cron не задвоил письмо
    await prisma.booking.update({
      where: { id: b.id },
      data: { reminderSentAt: new Date() },
    });

    if (!isRealEmail(b.user.email)) {
      skipped++;
      continue;
    }

    const when = format(b.startTime, "d MMMM в HH:mm", { locale: ru });
    await sendEmail(
      b.user.email,
      `Напоминание: приём ${when}`,
      emailShell(
        "Напоминаем о приёме",
        `<p>Здравствуйте, ${b.user.name}!</p>` +
          `<p>Напоминаем: <b>${when}</b> у вас приём в клинике DentaPremium.</p>` +
          `<p><b>Услуга:</b> ${b.service.title}<br/><b>Врач:</b> ${b.doctor.name}</p>` +
          `<p style="color:#64748b;font-size:12px;">Если время не подходит, перенесите приём по ссылке из письма о записи или позвоните нам: +7 999 000-00-00.</p>`
      )
    );
    sent++;
  }

  return NextResponse.json({ sent, skipped, total: bookings.length });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

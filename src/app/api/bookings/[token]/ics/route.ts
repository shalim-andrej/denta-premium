// src/app/api/bookings/[token]/ics/route.ts
// Экспорт записи в календарь (.ics) — работает в iOS/Android/Google Calendar.
import { NextResponse } from "next/server";
import { bookingByToken } from "@/lib/tokens";

const CLINIC_ADDRESS = "Москва, ул. Примерная, д. 1";

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const booking = await bookingByToken(token);
  if (!booking) {
    return new NextResponse("Not found", { status: 404 });
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DentaPremium//Booking//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${token}@denta-premium`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(booking.startTime)}`,
    `DTEND:${icsDate(booking.endTime)}`,
    `SUMMARY:${icsEscape(`Стоматология DentaPremium: ${booking.service.title}`)}`,
    `DESCRIPTION:${icsEscape(
      `Врач: ${booking.doctor.name} (${booking.doctor.specialty}). ` +
        `Стоимость: ${booking.service.price} руб. ` +
        `Пациент: ${booking.user.name}, тел. ${booking.user.phone ?? "—"}`
    )}`,
    `LOCATION:${icsEscape(CLINIC_ADDRESS)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape("Приём в стоматологии через 2 часа")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="priem-dentapremium.ics"',
    },
  });
}

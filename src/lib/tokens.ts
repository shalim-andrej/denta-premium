// src/lib/tokens.ts
// Токены «управления записью»: пациент отменяет или переносит запись по
// защищённой ссылке без звонка в клинику. Токен — 256 бит энтропии.
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export const MANAGE_TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 дней

export function generateManageToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Запись по валидному (не истёкшему) токену, иначе null. */
export async function bookingByToken(token: string) {
  if (!token || token.length > 128) return null;
  const rec = await prisma.bookingToken.findUnique({
    where: { token },
    include: {
      booking: { include: { service: true, doctor: true, user: true } },
    },
  });
  if (!rec || rec.expiresAt.getTime() < Date.now()) return null;
  return rec.booking;
}

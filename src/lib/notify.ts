// src/lib/notify.ts
// Уведомления на бесплатных каналах:
//  - Telegram Bot API — админу клиники (новая запись, оплата, отмена);
//  - email через любой SMTP (Яндекс/Mail.ru/Gmail с паролем приложения) — пациенту.
// Если переменные окружения не заданы, уведомления тихо пропускаются:
// сайт полностью работает без них, настройка — только в .env.
import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import type { Transporter } from "nodemailer";

/** Абсолютный base-URL сайта: NEXT_PUBLIC_SITE_URL или заголовки запроса. */
export async function siteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Уведомление админу в Telegram. Нет токена — пропускаем. */
export async function notifyAdminTelegram(text: string): Promise<void> {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000), // не вешаем запрос, если Telegram недоступен
    });
  } catch (e) {
    console.error("Telegram notify failed:", e);
  }
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 5000,
      socketTimeout: 10000,
    });
  }
  return transporter;
}

/** Email пациенту. SMTP не настроен — пропускаем. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const tx = getTransporter();
  if (!tx) return;
  try {
    await tx.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

/** Временные адреса вида 79991234567@temp.dentapremium.ru — это не настоящая почта. */
export function isRealEmail(email: string): boolean {
  return !email.endsWith("@temp.dentapremium.ru");
}

/** Простое письмо в фирменном стиле (инлайн-стили — совместимость с почтовиками). */
export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="ru"><body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0f172a;padding:20px 28px;">
      <span style="color:#2dd4bf;font-weight:bold;font-size:18px;">DentaPremium</span>
      <span style="color:#94a3b8;font-size:13px;margin-left:8px;">премиальная стоматология</span>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;">${title}</h2>
      <div style="color:#334155;font-size:14px;line-height:1.6;">${bodyHtml}</div>
    </div>
    <div style="padding:16px 28px;background:#f8fafc;color:#94a3b8;font-size:12px;">
      Вы получили это письмо, потому что записывались в клинику DentaPremium.
    </div>
  </div></body></html>`;
}

/** Сравнение секрета за постоянное время (для cron-роута). */
export function secretMatches(provided: string | null, secret: string): boolean {
  if (!provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

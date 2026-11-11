// src/lib/auth.ts
// Подписанная сессия администратора.
// Значение cookie = HMAC-SHA256(ADMIN_PASSWORD, "admin:<пароль>") —
// его нельзя подделать из браузера, в отличие от простого "true".

export const ADMIN_COOKIE = "admin_session";

export async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Ожидаемое значение cookie для валидной админ-сессии. */
export async function adminSessionValue(): Promise<string | null> {
  // Секрет сессии — либо ADMIN_PASSWORD, либо хеш из ADMIN_PASSWORD_HASH:
  // работать должно в обоих вариантах конфигурации.
  const secret = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD;
  if (!secret) return null; // пароль не настроен — сессии невозможны
  return hmacSha256(secret, `admin:${secret}`);
}

/** Проверка значения cookie из запроса (используется в proxy.ts). */
export async function isAdminRequest(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await adminSessionValue();
  if (!expected) return false;
  // сравнение по символам одинаковой длины, чтобы не было раннего выхода
  if (cookieValue.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= cookieValue.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

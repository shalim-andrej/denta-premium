// src/lib/ratelimit.ts
// Простейший rate-limit на скользящем окне в памяти процесса.
// Для сайта клиники на одном инстансе (SQLite) этого достаточно;
// при горизонтальном масштабировании — заменить на Redis.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false; // лимит исчерпан
  }

  recent.push(now);
  buckets.set(key, recent);

  // периодическая уборка, чтобы память не росла бесконечно
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return true;
}

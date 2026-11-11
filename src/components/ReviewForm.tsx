"use client";

// Форма отзыва: публикуется только после модерации администратором.
import { useState } from "react";
import { submitReview } from "@/app/actions";

export default function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("rating", String(rating));
    fd.append("text", text);

    const res = await submitReview(fd);
    setLoading(false);

    if (res.error) {
      setStatus({ ok: false, text: res.error });
    } else {
      setStatus({ ok: true, text: "Спасибо! Отзыв появится на сайте после проверки." });
      setName("");
      setText("");
      setRating(5);
    }
  }

  if (!open) {
    return (
      <div className="text-center">
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors underline underline-offset-4"
        >
          Оставить свой отзыв
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-teal-500 outline-none";

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-3">
      <input
        type="text"
        required
        minLength={2}
        maxLength={60}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ваше имя"
        className={inputCls}
      />
      <div className="flex gap-1.5 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`Оценка ${n}`}
            className={`text-2xl leading-none transition-colors ${
              n <= rating ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        required
        minLength={10}
        maxLength={1000}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Расскажите о своём приёме (минимум 10 символов)"
        className={inputCls}
      />
      <div className="flex gap-2 justify-center">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Отправляем..." : "Отправить отзыв"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl border border-white/10 transition-colors"
        >
          Отмена
        </button>
      </div>
      {status && (
        <p className={`text-sm text-center ${status.ok ? "text-teal-400" : "text-rose-400"}`}>{status.text}</p>
      )}
    </form>
  );
}

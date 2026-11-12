"use client";

// Форма отзыва: публикуется только после модерации администратором.
import { useState } from "react";
import { submitReview } from "@/app/actions";
import { PenLine } from "lucide-react";

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
        <button onClick={() => setOpen(true)} className="btn-ghost px-7 py-3.5 text-sm">
          <PenLine className="w-4 h-4 text-mint" />
          Оставить свой отзыв
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl mx-auto p-7 md:p-9 space-y-4">
      <h3 className="font-display text-lg text-ink">Ваш отзыв</h3>
      <input
        type="text"
        required
        minLength={2}
        maxLength={60}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ваше имя"
        className="field"
      />
      <div className="flex items-center gap-2">
        <span className="text-sm text-fog mr-2">Оценка:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`Оценка ${n}`}
            className={`text-2xl leading-none transition-all hover:scale-110 ${
              n <= rating ? "text-gold fill-gold" : "text-white/20 hover:text-gold/60"
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
        className="field resize-none"
      />
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading} className="btn-primary px-7 py-3 text-sm">
          {loading ? "Отправляем…" : "Отправить отзыв"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-ghost px-7 py-3 text-sm"
        >
          Отмена
        </button>
      </div>
      {status && (
        <p className={`text-sm text-center pt-1 ${status.ok ? "text-mint" : "text-rose-400"}`}>
          {status.text}
        </p>
      )}
    </form>
  );
}

// src/components/ReviewsSection.tsx
// Отзывы пациентов на главной: только одобренные модерацией + форма отзыва.
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Star } from "lucide-react";
import ReviewForm from "./ReviewForm";

export default async function ReviewsSection() {
  await connection();
  const reviews = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <section className="px-4 sm:px-6 pb-20 md:pb-28">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="chip-mint mb-5">Отзывы</span>
            <h2 className="font-display text-[1.7rem] sm:text-3xl md:text-[2.5rem] leading-[1.16] text-ink">
              Пациенты <span className="accent-word">о клинике</span>
            </h2>
            <p className="mt-4 text-fog text-base md:text-lg leading-relaxed">
              Реальные впечатления о приёмах. Каждый отзыв проходит модерацию.
            </p>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {reviews.map((r) => (
              <figure key={r.id} className="card card-hover p-7 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating ? "text-gold fill-gold" : "text-white/15"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-accent italic text-5xl leading-none text-mint/20 select-none" aria-hidden="true">
                    ”
                  </span>
                </div>
                <blockquote className="text-sm text-ink/85 leading-relaxed flex-1">{r.text}</blockquote>
                <figcaption className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#04120e] font-bold text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, #4bf0c8 0%, #2bd4a6 100%)" }}
                    aria-hidden="true"
                  >
                    {r.name[0]}
                  </span>
                  <span>
                    <span className="block text-ink font-semibold text-sm">{r.name}</span>
                    <span className="block text-xs text-fog">
                      {format(r.createdAt, "d MMMM yyyy", { locale: ru })}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <ReviewForm />
      </div>
    </section>
  );
}

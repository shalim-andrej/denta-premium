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
    <section className="px-5 sm:px-8 lg:px-12 pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <span className="eyebrow">07 · Отзывы</span>
            <h2 className="mt-6 font-display text-[1.9rem] sm:text-[2.6rem] md:text-[2.9rem] leading-[1.14] text-ink">
              Пациенты о клинике
            </h2>
            <p className="mt-5 text-ink-soft text-[15px] md:text-base leading-relaxed">
              Реальные впечатления о приёмах. Каждый отзыв проходит модерацию.
            </p>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-0 mb-16">
            {reviews.map((r) => (
              <figure key={r.id} className="border-t border-ink/10 py-9 flex flex-col">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? "text-gold fill-gold" : "text-ink/15"
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="font-display text-[17px] leading-relaxed text-ink/90 flex-1">
                  {r.text}
                </blockquote>
                <figcaption className="mt-6 text-[13px]">
                  <span className="block text-ink font-semibold">{r.name}</span>
                  <span className="block text-ink-soft mt-0.5">
                    {format(r.createdAt, "d MMMM yyyy", { locale: ru })}
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

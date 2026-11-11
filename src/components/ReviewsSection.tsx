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
    <section className="px-6 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Отзывы пациентов</h2>
          <p className="text-slate-400">Реальные впечатления о приёмах в клинике</p>
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">{r.text}</p>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="text-white font-medium text-sm">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    {format(r.createdAt, "d MMMM yyyy", { locale: ru })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ReviewForm />
      </div>
    </section>
  );
}

// src/app/admin/reviews/page.tsx
// Модерация отзывов: одобренные видны на главной, новые ждут проверки.
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { approveReview, deleteReview } from "../../actions";

async function ReviewsData() {
  await connection();
  const [pending, approved] = await Promise.all([
    prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: "desc" } }),
    prisma.review.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  const card = (r: (typeof pending)[number]) => (
    <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-medium text-gray-900">{r.name}</div>
          <div className="text-amber-500 text-sm">{stars(r.rating)}</div>
          <p className="text-sm text-gray-600 mt-2">{r.text}</p>
          <div className="text-xs text-gray-400 mt-2">
            {format(r.createdAt, "d MMMM yyyy, HH:mm", { locale: ru })}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <form action={approveReview}>
            <input type="hidden" name="id" value={r.id} />
            <button className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              r.approved
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}>
              {r.approved ? "Снять с публикации" : "Опубликовать"}
            </button>
          </form>
          <form action={deleteReview}>
            <input type="hidden" name="id" value={r.id} />
            <button className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
              Удалить
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-gray-800 mb-4">
          На модерации {pending.length > 0 && <span className="text-amber-600">({pending.length})</span>}
        </h2>
        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm bg-white p-4 rounded-xl border border-gray-100">Новых отзывов нет.</p>
        ) : (
          <div className="space-y-3">{pending.map(card)}</div>
        )}
      </div>

      <div>
        <h2 className="font-bold text-gray-800 mb-4">Опубликованные ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="text-gray-500 text-sm bg-white p-4 rounded-xl border border-gray-100">Пока нет опубликованных отзывов.</p>
        ) : (
          <div className="space-y-3">{approved.map(card)}</div>
        )}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Загрузка...</div>}>
      <ReviewsData />
    </Suspense>
  );
}

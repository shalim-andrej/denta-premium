// src/app/(marketing)/services/ServicesList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

interface Service {
  id: string;
  title: string;
  category: string;
  description: string | null;
  price: number;
  duration: number;
}

export default function ServicesList({ services }: { services: Service[] }) {
  // Собираем уникальные категории и добавляем "Все"
  const categories = ["Все", ...Array.from(new Set(services.map((s) => s.category)))];
  const [activeCategory, setActiveCategory] = useState("Все");

  // Фильтруем услуги
  const filteredServices = activeCategory === "Все"
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <div>
      {/* Фильтры-пилюли */}
      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Категории услуг">
        {categories.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                active
                  ? "text-[#04120e]"
                  : "text-fog bg-white/[0.04] border border-white/10 hover:text-ink hover:border-mint/40"
              }`}
              style={active ? {
                background: "linear-gradient(135deg, #4bf0c8 0%, #2bd4a6 100%)",
                boxShadow: "0 6px 20px -6px rgba(60,230,189,.45)",
              } : undefined}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="card card-hover p-7 flex flex-col group"
          >
            <div className="flex items-start justify-between mb-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-mint/90 bg-mint/[0.08] border border-mint/20 px-3 py-1 rounded-full">
                {service.category}
              </span>
              <ArrowUpRight className="w-4 h-4 text-fog group-hover:text-mint group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <h2 className="text-lg font-bold text-ink leading-snug mb-2">
              {service.title}
            </h2>

            {service.description && (
              <p className="text-sm text-fog leading-relaxed line-clamp-2 mb-4">
                {service.description}
              </p>
            )}

            <div className="mt-auto pt-5 border-t border-white/[0.06] flex items-end justify-between gap-3">
              <div>
                <div className="font-display text-xl text-ink">
                  {service.price.toLocaleString("ru-RU")} ₽
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-fog">
                  <Clock className="w-3.5 h-3.5" />
                  {service.duration} мин
                </div>
              </div>
              <Link
                href={`/book?service=${service.id}`}
                className="text-sm font-semibold text-mint hover:text-ink transition-colors inline-flex items-center gap-1.5"
              >
                Записаться
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

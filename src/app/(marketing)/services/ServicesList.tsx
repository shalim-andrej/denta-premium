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
      {/* Фильтры — тихий текст с точкой у активного */}
      <div data-reveal className="flex flex-wrap gap-x-8 gap-y-3 mb-12" role="tablist" aria-label="Категории услуг">
        {categories.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(cat)}
              className={`text-[13px] uppercase tracking-[0.14em] transition-colors duration-300 flex items-center gap-2 ${
                active ? "text-ink font-semibold" : "text-ink-soft hover:text-ink font-medium"
              }`}
            >
              {active && <span className="w-1 h-1 rounded-full bg-fern" aria-hidden="true" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Меню-список с тонкими линиями */}
      <div>
        {filteredServices.map((service, i) => (
          <Link
            key={service.id}
            href={`/book?service=${service.id}`}
            data-reveal
            style={{ transitionDelay: `${Math.min(i, 8) * 0.05}s` }}
            className={`group grid md:grid-cols-[auto_1fr_auto] gap-x-8 gap-y-2 items-baseline py-7 border-t border-ink/10 hover:border-fern/40 transition-colors ${
              i === filteredServices.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="hidden md:block font-display italic text-[15px] text-fern/70 w-10" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-ink group-hover:text-fern transition-colors leading-snug">
                {service.title}
              </h2>
              <span className="mt-1.5 block text-[11.5px] uppercase tracking-[0.14em] text-ink-soft">
                {service.category}
              </span>
              {service.description && (
                <p className="mt-3 text-sm text-ink-soft leading-relaxed max-w-xl">
                  {service.description}
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-6 md:justify-end">
              <span className="flex items-center gap-1.5 text-[12.5px] text-ink-soft whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" />
                {service.duration} мин
              </span>
              <span className="font-display text-2xl text-ink whitespace-nowrap">
                {service.price.toLocaleString("ru-RU")} ₽
              </span>
              <ArrowUpRight className="w-4.5 h-4.5 text-ink-soft group-hover:text-fern group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all hidden md:block" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

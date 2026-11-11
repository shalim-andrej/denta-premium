// src/app/(marketing)/services/ServicesList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";

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
      {/* Фильтры */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeCategory === cat
                ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-teal-500/20 transition-all" />
            
            <div className="relative z-10 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {service.category}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                {service.title}
              </h3>
              
              {service.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <Clock className="w-4 h-4" />
                <span>Длительность: {service.duration} мин.</span>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-2xl font-bold text-white">
                {service.price.toLocaleString("ru-RU")} ₽
              </div>
              <Link
                href={`/book?service=${service.id}`}
                className="flex items-center gap-1.5 text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors"
              >
                Записаться
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
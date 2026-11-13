// src/app/admin/services/page.tsx
// Каталог услуг: добавление, редактирование цены/длительности, вкл/выкл в записи.
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { createService, updateService, toggleServiceActive } from "../../actions";

async function ServicesData() {
  await connection();
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { title: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Добавить услугу</h2>
        <form action={createService} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <input name="title" placeholder="Название" required className="p-2 border rounded-lg text-sm bg-gray-50" />
          <input name="category" placeholder="Категория" required className="p-2 border rounded-lg text-sm bg-gray-50" />
          <input name="price" type="number" placeholder="Цена, ₽" required min="1" className="p-2 border rounded-lg text-sm bg-gray-50" />
          <input name="duration" type="number" placeholder="Минут" required min="15" step="15" className="p-2 border rounded-lg text-sm bg-gray-50" />
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Добавить
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-40">
                <div className="font-medium text-gray-900">
                  {s.title}{" "}
                  {s.isActive ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">активна</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">скрыта</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{s.category}</div>
              </div>
              <form action={toggleServiceActive}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                  {s.isActive ? "Скрыть из записи" : "Включить"}
                </button>
              </form>
            </div>

            {/* Редактирование параметров */}
            <form action={updateService} className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 items-end">
              <input type="hidden" name="id" value={s.id} />
              <label className="contents">
                <span className="sr-only">Название</span>
                <input name="title" defaultValue={s.title} required className="col-span-2 p-1.5 border rounded-lg text-sm bg-gray-50" />
              </label>
              <input name="category" defaultValue={s.category} required className="p-1.5 border rounded-lg text-sm bg-gray-50" />
              <input name="price" type="number" defaultValue={s.price} required min="1" className="p-1.5 border rounded-lg text-sm bg-gray-50" />
              <div className="flex gap-2">
                <input name="duration" type="number" defaultValue={s.duration} required min="15" step="15" className="w-full p-1.5 border rounded-lg text-sm bg-gray-50" />
                <button className="shrink-0 text-xs bg-[#0e7c57] text-white px-3 rounded-lg font-medium hover:bg-[#0a5e40] transition-colors">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Загрузка...</div>}>
      <ServicesData />
    </Suspense>
  );
}

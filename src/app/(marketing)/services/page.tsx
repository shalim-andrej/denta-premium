// src/app/(marketing)/services/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import ServicesList from "./ServicesList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Услуги и цены | DentaPremium",
  description: "Полный спектр стоматологических услуг в Москве. Прозрачные цены, современное оборудование, врачи с опытом более 10 лет.",
  openGraph: {
    title: "Услуги и цены | DentaPremium",
    description: "Лечение, имплантация, отбеливание. Прозрачные цены без скрытых платежей.",
    type: "website",
  },
};

async function ServicesData() {
  await connection();
  const services = await prisma.service.findMany({
    orderBy: { price: "asc" },
  });

  if (services.length === 0) {
    return (
      <div className="card p-10 text-center text-fog">
        Пока нет доступных услуг. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return <ServicesList services={services} />;
}

export default function ServicesPage() {
  return (
    <main className="px-4 sm:px-6 py-14 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12 md:mb-16 animate-fade-up">
          <span className="chip-mint mb-5">Прайс-лист</span>
          <h1 className="font-display text-[2rem] sm:text-4xl md:text-[3rem] leading-[1.12] text-ink">
            Услуги и цены{" "}
            <span className="accent-word">без сюрпризов</span>
          </h1>
          <p className="mt-5 text-fog text-base md:text-lg leading-relaxed">
            Стоимость на сайте равна цене в договоре. Выберите услугу — и запишитесь
            на удобное время в пару кликов.
          </p>
        </div>

        <Suspense fallback={<div className="py-24 text-center text-fog">Загрузка услуг…</div>}>
          <ServicesData />
        </Suspense>
      </div>
    </main>
  );
}

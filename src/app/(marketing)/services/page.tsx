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
      <div className="py-16 border-t border-b border-ink/10 text-center text-ink-soft">
        Пока нет доступных услуг. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return <ServicesList services={services} />;
}

export default function ServicesPage() {
  return (
    <main className="px-5 sm:px-8 lg:px-12 pt-[110px] md:pt-[150px] pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-3xl mb-14 md:mb-20 animate-fade-up">
          <span className="eyebrow">Прайс-лист</span>
          <h1 className="mt-7 font-display text-[2.3rem] sm:text-5xl md:text-[3.4rem] leading-[1.1] text-ink uppercase">
            Услуги и цены{" "}
            <span className="serif-italic normal-case text-fern">без сюрпризов</span>
          </h1>
          <p className="mt-6 text-ink-soft text-base md:text-lg leading-relaxed">
            Стоимость на сайте равна цене в договоре. Выберите услугу — и запишитесь
            на удобное время в пару кликов.
          </p>
        </div>

        <Suspense fallback={<div className="py-24 text-center text-ink-soft">Загрузка услуг…</div>}>
          <ServicesData />
        </Suspense>
      </div>
    </main>
  );
}

// src/app/(marketing)/services/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import ServicesList from "./ServicesList";

async function ServicesData() {
  await connection();
  const services = await prisma.service.findMany({
    orderBy: { price: "asc" },
  });

  if (services.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        Пока нет доступных услуг. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return <ServicesList services={services} />;
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Услуги и цены</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Прозрачные цены без скрытых платежей. Современные материалы и оборудование.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500 py-12">Загрузка прайс-листа...</div>}>
          <ServicesData />
        </Suspense>
      </div>
    </main>
  );
}
// src/app/book/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import BookingWidget from "./BookingWidget";
import { connection } from "next/server";

interface BookPageProps {
  searchParams: Promise<{ doctor?: string; service?: string }>;
}

// Дочерний компонент, который принимает searchParams как промис
async function BookingData({ searchParams }: { searchParams: Promise<{ doctor?: string; service?: string }> }) {
  // Ждем searchParams ВНУТРИ этого компонента, который обернут в Suspense
  const params = await searchParams;
  const doctorId = params.doctor;
  const serviceId = params.service;

  await connection();
  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { title: "asc" } });
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });

  if (services.length === 0 || doctors.length === 0) {
    return (
      <div className="bg-white border border-ink/10 rounded-3xl p-10 text-center text-ink-soft">
        Пока нет доступных услуг или врачей. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return (
    <BookingWidget
      services={services}
      doctors={doctors}
      initialDoctorId={doctorId}
      initialServiceId={serviceId}
    />
  );
}

// Сама страница НЕ ждет searchParams, а передает промис дальше
export default function BookPage({ searchParams }: BookPageProps) {
  return (
    <main className="px-5 sm:px-8 lg:px-12 pt-[110px] md:pt-[150px] pb-24 md:pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="max-w-xl mb-12 animate-fade-up">
          <span className="eyebrow">Оплата онлайн</span>
          <h1 className="mt-6 font-display text-[2.2rem] sm:text-[3.1rem] leading-[1.14] text-ink">
            Запись на приём
          </h1>
          <p className="mt-5 text-ink-soft text-base md:text-lg leading-relaxed">
            Врача можно не выбирать — подберём свободного специалиста.
            Оплата СБП или картой закрепляет время за вами.
          </p>
        </div>

        <Suspense fallback={<div className="bg-white border border-ink/10 rounded-3xl p-10 text-center text-ink-soft">Загрузка формы…</div>}>
          <BookingData searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

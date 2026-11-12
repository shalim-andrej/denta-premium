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
      <div className="card p-10 text-center text-fog">
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
    <main className="px-4 sm:px-6 py-14 md:py-20 relative overflow-hidden">
      <div className="glow w-[560px] h-[380px] bg-mint/[0.07] -top-24 left-1/2 -translate-x-1/2" aria-hidden="true" />

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="max-w-xl mb-10 md:mb-12 animate-fade-up">
          <span className="chip-mint mb-5">Оплата онлайн</span>
          <h1 className="font-display text-[2rem] sm:text-4xl md:text-[2.8rem] leading-[1.12] text-ink">
            Запись <span className="accent-word">на приём</span>
          </h1>
          <p className="mt-5 text-fog text-base md:text-lg leading-relaxed">
            Врача можно не выбирать — подберём свободного специалиста.
            Оплата СБП или картой закрепляет время за вами.
          </p>
        </div>

        <Suspense fallback={<div className="card p-10 text-center text-fog">Загрузка формы…</div>}>
          <BookingData searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

// src/app/(marketing)/doctors/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import DoctorsList from "./DoctorsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Наши врачи | DentaPremium",
  description: "Познакомьтесь с нашими специалистами. Стоматологи-терапевты, хирурги, ортодонты с опытом работы более 10 лет.",
  openGraph: {
    title: "Наши врачи | DentaPremium",
    description: "Врачи, которым доверяют тысячи пациентов.",
    type: "website",
  },
};

async function DoctorsData() {
  await connection();
  const doctors = await prisma.doctor.findMany({
    orderBy: { experience: "desc" },
  });

  if (doctors.length === 0) {
    return (
      <div className="py-16 border-t border-b border-ink/10 text-center text-ink-soft">
        Пока нет добавленных врачей. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return <DoctorsList doctors={doctors} />;
}

export default function DoctorsPage() {
  return (
    <main className="px-5 sm:px-8 lg:px-12 pt-[110px] md:pt-[150px] pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-3xl mb-14 md:mb-20 animate-fade-up">
          <span className="eyebrow">Команда</span>
          <h1 className="mt-7 font-display text-[2.3rem] sm:text-[3.2rem] md:text-[3.6rem] leading-[1.12] text-ink">
            Врачи, которым доверяют улыбки
          </h1>
          <p className="mt-6 text-ink-soft text-base md:text-lg leading-relaxed">
            Узкие специалисты с подтверждённой квалификацией. Выберите врача —
            или доверьтесь подбору: назначим свободного эксперта.
          </p>
        </div>

        <Suspense fallback={<div className="py-24 text-center text-ink-soft">Загрузка врачей…</div>}>
          <DoctorsData />
        </Suspense>
      </div>
    </main>
  );
}

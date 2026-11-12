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
      <div className="card p-10 text-center text-fog">
        Пока нет добавленных врачей. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return <DoctorsList doctors={doctors} />;
}

export default function DoctorsPage() {
  return (
    <main className="px-4 sm:px-6 py-14 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12 md:mb-16 animate-fade-up">
          <span className="chip-mint mb-5">Команда</span>
          <h1 className="font-display text-[2rem] sm:text-4xl md:text-[3rem] leading-[1.12] text-ink">
            Врачи, которым{" "}
            <span className="accent-word">доверяют улыбки</span>
          </h1>
          <p className="mt-5 text-fog text-base md:text-lg leading-relaxed">
            Узкие специалисты с подтверждённой квалификацией. Выберите врача —
            или доверьтесь подбору: назначим свободного эксперта.
          </p>
        </div>

        <Suspense fallback={<div className="py-24 text-center text-fog">Загрузка врачей…</div>}>
          <DoctorsData />
        </Suspense>
      </div>
    </main>
  );
}

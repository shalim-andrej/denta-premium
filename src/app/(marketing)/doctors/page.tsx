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
      <div className="text-center text-slate-500 py-12">
        Пока нет добавленных врачей. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return <DoctorsList doctors={doctors} />;
}

export default function DoctorsPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Наши специалисты</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Врачи с многолетним опытом, которые любят свою работу и заботятся о вашей улыбке.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500 py-12">Загрузка специалистов...</div>}>
          <DoctorsData />
        </Suspense>
      </div>
    </main>
  );
}
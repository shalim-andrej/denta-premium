// src/app/book/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import BookingWidget from "./BookingWidget";
import { connection } from "next/server";

async function BookingData() {
  await connection();
  const services = await prisma.service.findMany({ orderBy: { title: "asc" } });
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });

  if (services.length === 0 || doctors.length === 0) {
    return (
      <div className="text-center text-gray-500 bg-white p-6 rounded-xl shadow-sm">
        Пока нет доступных услуг или врачей. Пожалуйста, добавьте их в админ-панели.
      </div>
    );
  }

  return <BookingWidget services={services} doctors={doctors} />;
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Онлайн-запись</h1>
        <p className="text-center text-gray-600 mb-8">Выберите врача, услугу и удобное время</p>
        
        <Suspense fallback={<div className="text-center py-12 text-gray-500">Загрузка...</div>}>
          <BookingData />
        </Suspense>
      </div>
    </div>
  );
}
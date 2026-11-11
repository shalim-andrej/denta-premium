// src/app/admin/book/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import AdminBookingForm from "./AdminBookingForm";

async function BookData({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string; date?: string }>;
}) {
  const params = await searchParams;
  await connection();
  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { title: "asc" } });
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });

  return (
    <AdminBookingForm
      services={services}
      doctors={doctors}
      initialDoctorId={params.doctor}
      initialDate={params.date}
    />
  );
}

export default function AdminBookPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string; date?: string }>;
}) {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Загрузка...</div>}>
      <BookData searchParams={searchParams} />
    </Suspense>
  );
}

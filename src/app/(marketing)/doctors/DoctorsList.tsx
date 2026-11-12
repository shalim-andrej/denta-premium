// src/app/(marketing)/doctors/DoctorsList.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  description: string | null;
  experience: number;
  imageUrl: string | null;
}

// Локальные фото подобраны под штат клиники; порядок = опыт по убыванию
const LOCAL_PHOTOS: Record<string, string> = {
  "Шалимов Андрей Михайлович": "/images/doctor-shalimov.jpg",
  "Волкова Елена Сергеевна": "/images/doctor-volkova.jpg",
  "Ким Ирина Викторовна": "/images/doctor-kim.jpg",
  "Гаврилов Дмитрий Павлович": "/images/doctor-gavrilov.jpg",
};

export default function DoctorsList({ doctors }: { doctors: Doctor[] }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
      {doctors.map((doctor) => {
        const photo = doctor.imageUrl || LOCAL_PHOTOS[doctor.name];
        return (
          <div key={doctor.id} className="group">
            {/* Арочный портрет */}
            <div className="arch-sm relative aspect-[3/4] bg-sand">
              {photo ? (
                <Image
                  src={photo}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-5xl text-ink/20">{getInitials(doctor.name)}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-display text-xl text-ink leading-snug">{doctor.name}</h2>
              <p className="mt-1.5 serif-italic text-[16px] text-terra">{doctor.specialty}</p>
            </div>

            <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-ink-soft">
              Опыт {doctor.experience} лет
            </p>

            {doctor.description && (
              <p className="mt-4 text-sm text-ink-soft leading-relaxed line-clamp-3">
                {doctor.description}
              </p>
            )}

            <Link
              href={`/book?doctor=${doctor.id}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-ink/30 pb-1 hover:text-terra hover:border-terra transition-colors group/link"
            >
              Записаться к врачу
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

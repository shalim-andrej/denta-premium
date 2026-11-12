// src/app/(marketing)/doctors/DoctorsList.tsx
"use client";

import Link from "next/link";
import { Award, ArrowUpRight } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  description: string | null;
  experience: number;
  imageUrl: string | null;
}

export default function DoctorsList({ doctors }: { doctors: Doctor[] }) {
  // Функция для получения инициалов (если нет фото)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {doctors.map((doctor) => (
        <div key={doctor.id} className="card card-hover p-7 flex flex-col group">
          {/* Аватар */}
          <div
            className="w-24 h-24 rounded-3xl mb-6 overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03] group-hover:rotate-1"
            style={{ boxShadow: "0 18px 40px -16px rgba(60,230,189,.3)" }}
          >
            {doctor.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-display text-2xl text-[#04120e]"
                style={{ background: "linear-gradient(135deg, #4bf0c8 0%, #2bd4a6 100%)" }}
              >
                {getInitials(doctor.name)}
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-ink leading-tight">{doctor.name}</h2>
          <p className="text-sm text-mint font-medium mt-1.5">{doctor.specialty}</p>

          <div className="mt-4 self-start flex items-center gap-2 text-xs text-fog bg-white/[0.04] border border-white/10 px-3.5 py-1.5 rounded-full">
            <Award className="w-3.5 h-3.5 text-mint" />
            Опыт {doctor.experience} лет
          </div>

          {doctor.description && (
            <p className="text-sm text-fog leading-relaxed line-clamp-3 mt-4 mb-6">
              {doctor.description}
            </p>
          )}

          <Link
            href={`/book?doctor=${doctor.id}`}
            className="mt-auto btn-ghost py-3 text-sm group/link"
          >
            Записаться к врачу
            <ArrowUpRight className="w-4 h-4 group-hover/link:text-mint transition-colors" />
          </Link>
        </div>
      ))}
    </div>
  );
}

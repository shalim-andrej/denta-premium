// src/app/(marketing)/doctors/DoctorsList.tsx
"use client";

import Link from "next/link";
import { Award, GraduationCap, ArrowRight } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Аватар */}
            <div className="w-28 h-28 rounded-full mb-6 overflow-hidden border-4 border-slate-800 shadow-xl group-hover:border-teal-500/50 transition-colors">
              {doctor.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials(doctor.name)}
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{doctor.name}</h3>
            <p className="text-sm font-medium text-teal-400 mb-3">{doctor.specialty}</p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-4 bg-slate-900/50 px-3 py-1.5 rounded-full">
              <Award className="w-4 h-4 text-teal-500" />
              <span>Опыт {doctor.experience} лет</span>
            </div>

            {doctor.description && (
              <p className="text-sm text-slate-400 mb-6 line-clamp-3">
                {doctor.description}
              </p>
            )}

            <Link
              href={`/book?doctor=${doctor.id}`}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-teal-500 hover:text-slate-950 text-white font-medium rounded-xl transition-all border border-white/10 hover:border-teal-500"
            >
              Записаться к врачу
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
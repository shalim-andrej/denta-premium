// src/app/(marketing)/doctors/DoctorsList.tsx
"use client";

import Image from "next/image";

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
  "Абаев Тимур Русланович": "/images/doctor-abaev.jpg",
  "Соколов Игорь Валерьевич": "/images/doctor-sokolov.jpg",
  "Морозова Анна Александровна": "/images/doctor-morozova.jpg",
  "Лебедев Артём Викторович": "/images/doctor-lebedev.jpg",
  "Дементьева Ольга Николаевна": "/images/doctor-dementieva.jpg",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
      {doctors.map((doctor, i) => {
        const photo = doctor.imageUrl || LOCAL_PHOTOS[doctor.name];
        return (
          <div key={doctor.id} data-reveal style={{ transitionDelay: `${(i % 3) * 0.08}s` }} className="group">
            {/* Арочный портрет: единая подача — grayscale, цвет проявляется на hover */}
            <div className="arch-sm relative aspect-[3/4] bg-sand">
              {photo ? (
                <Image
                  src={photo}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  className="object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-5xl text-ink/20">{getInitials(doctor.name)}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-display text-xl text-ink leading-snug">{doctor.name}</h2>
              <p className="mt-2 font-label text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink-soft">
                {doctor.specialty}
              </p>
            </div>

            <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-ink-soft">
              Опыт {doctor.experience} лет
            </p>

            {doctor.description && (
              <p className="mt-4 text-sm text-ink-soft leading-relaxed line-clamp-3">
                {doctor.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

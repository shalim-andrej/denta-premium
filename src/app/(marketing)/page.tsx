// src/app/(marketing)/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Star, ShieldCheck, Clock, Award, Stethoscope } from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";
import ReviewsSection from "@/components/ReviewsSection";

// Асинхронный компонент для загрузки врачей (динамические данные)
async function TopDoctors() {
  await connection();
  const doctors = await prisma.doctor.findMany({
    take: 3,
    orderBy: { experience: "desc" },
  });

  if (doctors.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <div key={doctor.id} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-teal-500/25">
              {doctor.name.split(" ")[0][0]}{doctor.name.split(" ")[1]?.[0] || ""}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{doctor.name}</h3>
            <p className="text-sm text-teal-400 font-medium mb-3">{doctor.specialty}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Award className="w-4 h-4 text-teal-500" />
              <span>Опыт более {doctor.experience} лет</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-teal-500/30">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Фоновые градиенты */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <Star className="w-4 h-4 text-teal-400 fill-teal-400" />
            <span className="text-sm font-medium text-slate-300">Премиальная стоматология в Москве</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Здоровые зубы — <br />
            <span className="text-teal-400">уверенная улыбка</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Современное оборудование, врачи с опытом более 10 лет и индивидуальный подход. 
            Запишитесь онлайн за 2 минуты.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="group flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/25 w-full sm:w-auto justify-center"
            >
              Записаться на прием
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all backdrop-blur-sm w-full sm:w-auto justify-center"
            >
              Услуги и цены
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Гарантия качества", desc: "Официальный договор и гарантия на все услуги" },
            { icon: Clock, title: "Прием без очередей", desc: "Запись на удобное время, прием строго по записи" },
            { icon: Stethoscope, title: "Врачи-эксперты", desc: "Специалисты с опытом более 10 лет" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5">
              <item.icon className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Doctors Section */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Наши специалисты</h2>
              <p className="text-slate-400">Врачи, которым доверяют тысячи пациентов</p>
            </div>
            <Link href="/doctors" className="hidden sm:flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Все врачи <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <Suspense fallback={<div className="text-center text-slate-500 py-10">Загрузка врачей...</div>}>
            <TopDoctors />
          </Suspense>
        </div>
      </section>

      {/* Reviews */}
      <Suspense fallback={<div className="text-center text-slate-500 py-10">Загрузка отзывов...</div>}>
        <ReviewsSection />
      </Suspense>

      {/* CTA Section */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 to-slate-900 border border-teal-500/20 p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Готовы к здоровой улыбке?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Запишитесь на первичную консультацию прямо сейчас. Это бесплатно и займет всего 2 минуты.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25"
            >
              Записаться онлайн
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
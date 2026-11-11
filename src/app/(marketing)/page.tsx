import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-teal-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
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

          {/* Trust Badges */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: ShieldCheck, text: "Гарантия качества" },
              { icon: Clock, text: "Прием без очередей" },
              { icon: Star, text: "5.0 на Яндекс.Картах" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <item.icon className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-medium text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
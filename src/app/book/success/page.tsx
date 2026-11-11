// src/app/book/success/page.tsx
import Link from "next/link";
import { CheckCircle2, Calendar, Phone } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-teal-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Оплата прошла успешно!</h1>
          <p className="text-slate-400 mb-8">
            Ваша запись подтверждена. Мы отправили детали на ваш телефон. Ждем вас в клинике!
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10"
            >
              <Calendar className="w-5 h-5" />
              Вернуться на главную
            </Link>
            <a
              href="tel:+79990000000"
              className="flex items-center justify-center gap-2 w-full py-3 text-slate-400 hover:text-white font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              Связаться с клиникой
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
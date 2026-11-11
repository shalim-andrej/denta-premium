// src/app/(marketing)/contacts/page.tsx
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Контакты</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Мы всегда рады помочь. Свяжитесь с нами удобным способом или приезжайте в клинику.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка: Информация */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Наши контакты</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Адрес</h3>
                    <p className="text-slate-400">г. Москва, ул. Примерная, д. 1</p>
                    <p className="text-sm text-slate-500 mt-1">м. Тверская, 5 минут пешком</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Телефон</h3>
                    <a href="tel:+79990000000" className="text-slate-400 hover:text-teal-400 transition-colors">
                      +7 (999) 000-00-00
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Email</h3>
                    <a href="mailto:info@dentapremium.ru" className="text-slate-400 hover:text-teal-400 transition-colors">
                      info@dentapremium.ru
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Режим работы</h3>
                    <p className="text-slate-400">Ежедневно с 9:00 до 21:00</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <a
                  href="https://wa.me/79990000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-medium rounded-xl transition-colors border border-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Написать в WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Правая колонка: Карта */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-2 h-[500px] lg:h-auto overflow-hidden relative">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae5d9e5d2c2f1a5b4e8f9c1d2e3f4a5b6&amp;source=constructor"
              width="100%"
              height="100%"
              frameBorder="0"
              className="w-full h-full rounded-2xl grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              title="Карта клиники"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
// src/app/(marketing)/contacts/page.tsx
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты | DentaPremium",
  description: "Адрес, телефон и режим работы стоматологической клиники DentaPremium в Москве. Запишитесь на прием или свяжитесь с нами.",
  openGraph: {
    title: "Контакты | DentaPremium",
    description: "Мы всегда рады помочь. Свяжитесь с нами удобным способом.",
    type: "website",
  },
};

const CONTACTS = [
  {
    icon: MapPin,
    title: "Адрес",
    main: "г. Москва, ул. Примерная, д. 1",
    sub: "м. Тверская, 5 минут пешком",
  },
  {
    icon: Phone,
    title: "Телефон",
    main: "+7 (999) 000-00-00",
    href: "tel:+79990000000",
    sub: "Ежедневно с 9:00 до 21:00",
  },
  {
    icon: Mail,
    title: "Email",
    main: "info@dentapremium.ru",
    href: "mailto:info@dentapremium.ru",
    sub: "Ответим в течение рабочего дня",
  },
  {
    icon: Clock,
    title: "Режим работы",
    main: "9:00 — 21:00",
    sub: "Без выходных",
  },
];

export default function ContactsPage() {
  return (
    <main className="px-4 sm:px-6 py-14 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12 md:mb-16 animate-fade-up">
          <span className="chip-mint mb-5">Связаться с нами</span>
          <h1 className="font-display text-[2rem] sm:text-4xl md:text-[3rem] leading-[1.12] text-ink">
            Контакты{" "}
            <span className="accent-word">клиники</span>
          </h1>
          <p className="mt-5 text-fog text-base md:text-lg leading-relaxed">
            Позвоните, напишите или приезжайте — мы всегда рады помочь
            и подскажут удобное время приёма.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Левая колонка: информация */}
          <div className="flex flex-col gap-5">
            <div className="card p-8 md:p-9">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
                {CONTACTS.map((c) => (
                  <div key={c.title} className="flex items-start gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-mint/[0.08] border border-mint/20 flex items-center justify-center shrink-0">
                      <c.icon className="w-5 h-5 text-mint" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-fog mb-1.5">
                        {c.title}
                      </h2>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="font-semibold text-ink hover:text-mint transition-colors break-words"
                        >
                          {c.main}
                        </a>
                      ) : (
                        <p className="font-semibold text-ink">{c.main}</p>
                      )}
                      <p className="text-xs text-fog mt-1">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-9 pt-7 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/79990000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost px-6 py-3 text-sm flex-1 !text-emerald-300 hover:!border-emerald-400/40"
                >
                  <MessageCircle className="w-4 h-4" />
                  Написать в WhatsApp
                </a>
                <a href="tel:+79990000000" className="btn-primary px-6 py-3 text-sm flex-1">
                  <Phone className="w-4 h-4" />
                  Позвонить
                </a>
              </div>
            </div>

            {/* Как добраться */}
            <div className="card p-8 md:p-9 flex-1">
              <h2 className="font-display text-lg text-ink mb-4">Как добраться</h2>
              <ul className="space-y-3 text-sm text-fog leading-relaxed">
                <li className="flex gap-3">
                  <Navigation className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                  Метро «Тверская» — выход №4, далее 5 минут пешком по Тверской улице.
                </li>
                <li className="flex gap-3">
                  <Navigation className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                  Парковка для пациентов — бесплатная, 2 часа, по записи.
                </li>
              </ul>
            </div>
          </div>

          {/* Правая колонка: карта (тёмная через CSS-фильтр) */}
          <div className="card p-2 min-h-[420px] overflow-hidden relative">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae5d9e5d2c2f1a5b4e8f9c1d2e3f4a5b6&amp;source=constructor"
              width="100%"
              height="100%"
              frameBorder="0"
              className="w-full h-full min-h-[400px] rounded-[1.35rem] grayscale-[0.4] invert-[0.92] hue-rotate-[180deg] saturate-[0.7] contrast-[0.95]"
              title="Карта клиники"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

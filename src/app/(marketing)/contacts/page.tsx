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
    href: null as string | null,
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
    href: null as string | null,
    sub: "Без выходных",
  },
];

export default function ContactsPage() {
  return (
    <main className="px-5 sm:px-8 lg:px-12 pt-[110px] md:pt-[150px] pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-3xl mb-14 md:mb-20 animate-fade-up">
          <span className="eyebrow">Связаться с нами</span>
          <h1 className="mt-7 font-display font-medium text-[2.3rem] sm:text-5xl md:text-[3.4rem] leading-[1.1] text-ink uppercase">
            Контакты{" "}
            <span className="serif-italic normal-case text-terra">клиники</span>
          </h1>
          <p className="mt-6 text-ink-soft text-base md:text-lg leading-relaxed">
            Позвоните, напишите или приезжайте — мы всегда рады помочь
            и подскажем удобное время приёма.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* Левая колонка: редакционная таблица контактов */}
          <div>
            <div>
              {CONTACTS.map((c, i) => (
                <div
                  key={c.title}
                  className={`grid sm:grid-cols-[1fr_1.1fr] gap-x-8 gap-y-1.5 py-7 border-t border-ink/10 ${i === CONTACTS.length - 1 ? "border-b" : ""}`}
                >
                  <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-ink-soft">
                    <c.icon className="w-4 h-4 text-terra" strokeWidth={1.5} />
                    {c.title}
                  </div>
                  <div>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="font-display text-lg md:text-xl text-ink hover:text-terra transition-colors break-words"
                      >
                        {c.main}
                      </a>
                    ) : (
                      <p className="font-display text-lg md:text-xl text-ink">{c.main}</p>
                    )}
                    <p className="text-[13px] text-ink-soft mt-1">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Действия */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/79990000000"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-6 py-3.5 text-sm flex-1"
              >
                <MessageCircle className="w-4 h-4 text-terra" />
                Написать в WhatsApp
              </a>
              <a href="tel:+79990000000" className="btn-primary px-6 py-3.5 text-sm flex-1">
                <Phone className="w-4 h-4" />
                Позвонить
              </a>
            </div>

            {/* Как добраться */}
            <div className="mt-12">
              <h2 className="font-display text-xl text-ink mb-5">Как добраться</h2>
              <ul className="space-y-4 text-[15px] text-ink-soft leading-relaxed">
                <li className="flex gap-3">
                  <Navigation className="w-4 h-4 text-terra shrink-0 mt-1" strokeWidth={1.5} />
                  Метро «Тверская» — выход №4, далее 5 минут пешком по Тверской улице.
                </li>
                <li className="flex gap-3">
                  <Navigation className="w-4 h-4 text-terra shrink-0 mt-1" strokeWidth={1.5} />
                  Парковка для пациентов — бесплатная, 2 часа, по записи.
                </li>
              </ul>
            </div>
          </div>

          {/* Правая колонка: карта в тёплой тонировке */}
          <div className="photo relative min-h-[480px] bg-sand overflow-hidden">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae5d9e5d2c2f1a5b4e8f9c1d2e3f4a5b6&amp;source=constructor"
              width="100%"
              height="100%"
              frameBorder="0"
              className="absolute inset-0 w-full h-full sepia-[0.25] saturate-[0.85]"
              title="Карта клиники"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

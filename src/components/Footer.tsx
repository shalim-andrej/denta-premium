// src/components/Footer.tsx
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import { Logo } from "./Header";

// Вычисляем год один раз при загрузке модуля (на сервере)
const CURRENT_YEAR = new Date().getFullYear();

const COLUMNS = [
  {
    title: "Клиника",
    links: [
      { href: "/doctors", label: "Наши врачи" },
      { href: "/services", label: "Услуги и цены" },
      { href: "/contacts", label: "Контакты" },
      { href: "/book", label: "Онлайн-запись" },
    ],
  },
  {
    title: "Документы",
    links: [
      { href: "/privacy", label: "Политика конфиденциальности" },
      { href: "/offer", label: "Публичная оферта" },
      { href: "/license", label: "Лицензия" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.06] overflow-hidden">
      {/* Свечение у нижней границы */}
      <div className="glow w-[720px] h-[280px] bg-mint/[0.05] -top-40 left-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* CTA-строка */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-12 border-b border-white/[0.06]">
          <h2 className="font-display text-xl sm:text-2xl leading-snug max-w-md">
            Остались вопросы?{" "}
            <span className="accent-word">Поможем выбрать врача</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="tel:+79990000000"
              className="font-display text-lg text-ink hover:text-mint transition-colors"
            >
              +7 (999) 000-00-00
            </a>
            <Link href="/book" className="btn-primary px-6 py-3 text-sm">
              Записаться
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Колонки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* Бренд */}
          <div className="space-y-5">
            <Logo />
            <p className="text-sm text-fog leading-relaxed max-w-xs">
              Премиальная стоматология в Москве. Современное оборудование и врачи с опытом более 10 лет.
            </p>
            <div className="flex gap-2">
              <span className="chip !text-[12px]">Онлайн-оплата</span>
              <span className="chip !text-[12px]">Гарантия по договору</span>
            </div>
          </div>

          {/* Навигация и документы */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-fog mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ink/80 hover:text-mint transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Контакты */}
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-fog mb-5">
              Контакты
            </h3>
            <ul className="space-y-4 text-sm text-ink/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-mint shrink-0 mt-0.5" />
                <span>
                  г. Москва, ул. Примерная, д. 1
                  <span className="block text-fog text-xs mt-1">м. Тверская, 5 минут пешком</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4.5 h-4.5 text-mint shrink-0" />
                <a href="tel:+79990000000" className="hover:text-mint transition-colors">
                  +7 (999) 000-00-00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5 text-mint shrink-0" />
                <a href="mailto:info@dentapremium.ru" className="hover:text-mint transition-colors">
                  info@dentapremium.ru
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4.5 h-4.5 text-mint shrink-0" />
                <span>Ежедневно с 9:00 до 21:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="py-7 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-fog">
          <p>© {CURRENT_YEAR} DentaPremium. Все права защищены.</p>
          <p className="flex items-center gap-5">
            <span>Лицензия ЛО-77-01-000000 от 01.01.2024</span>
            <span className="hidden md:inline text-fog/50">•</span>
            <span className="hidden md:inline">Оплата через ЮKassa</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

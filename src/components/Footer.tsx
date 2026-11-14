// src/components/Footer.tsx
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import Logo from "./Logo";

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
    <footer className="relative bg-forest text-[#efe6da] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* CTA-строка */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-16 lg:py-20 border-b border-[#efe6da]/15">
          <div className="max-w-xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
              Остались вопросы
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.14] text-[#f5efe6]">
              Поможем подобрать врача и время визита
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-4">
            <a
              href="tel:+79990000000"
              className="font-display text-2xl text-[#f5efe6] hover:text-gold transition-colors"
            >
              +7 (999) 000-00-00
            </a>
            <Link
              href="/book"
              className="link-light text-[13px]"
            >
              Записаться
            </Link>
          </div>
        </div>

        {/* Колонки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-14">
          {/* Бренд */}
          <div className="space-y-6">
            <Logo tone="light" />
            <p className="text-[13.5px] leading-relaxed text-[#efe6da]/65 max-w-xs">
              Премиальная стоматология в центре Москвы. Оборудование
              экспертного класса, врачи с опытом более 10 лет.
            </p>
            <p className="text-[12px] leading-relaxed text-[#efe6da]/45">
              Ежедневно 9:00–21:00<br />
              без выходных
            </p>
          </div>

          {/* Навигация и документы */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold mb-6">
                {col.title}
              </h3>
              <ul className="space-y-3.5 text-[14px]">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#efe6da]/80 hover:text-[#f5efe6] transition-colors"
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
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold mb-6">
              Контакты
            </h3>
            <ul className="space-y-4 text-[14px] text-[#efe6da]/80">
              <li>
                г. Москва, ул. Примерная, д. 1
                <span className="block text-[12.5px] text-[#efe6da]/45 mt-1">
                  м. Тверская, 5 минут пешком
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                <a href="tel:+79990000000" className="hover:text-[#f5efe6] transition-colors">
                  +7 (999) 000-00-00
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                <a href="mailto:info@dentapremium.ru" className="hover:text-[#f5efe6] transition-colors">
                  info@dentapremium.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="py-7 border-t border-[#efe6da]/15 flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-[#efe6da]/45">
          <p>© {CURRENT_YEAR} DentaPremium. Все права защищены.</p>
          <p className="flex items-center gap-5">
            <span>Лицензия ЛО-77-01-000000 от 01.01.2024</span>
            <span className="hidden md:inline">Оплата через ЮKassa</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

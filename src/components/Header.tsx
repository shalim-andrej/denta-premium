// src/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Phone, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/services", label: "Услуги" },
  { href: "/doctors", label: "Врачи" },
  { href: "/contacts", label: "Контакты" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const word = size === "lg" ? "text-[30px]" : "text-[22px]";
  return (
    <Link href="/" className="group inline-flex items-baseline" aria-label="DentaPremium — на главную">
      <span className={`${word} leading-none whitespace-nowrap font-display font-medium tracking-tight text-ink`}>
        Denta
        <span className="serif-italic text-fern">Premium</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";

  // Лёгкое уплотнение шапки при скролле
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Блокируем скролл страницы при открытом мобильном меню
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || isOpen
          ? "bg-paper/95 backdrop-blur-md border-b border-ink/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[76px]">
          <Logo />

          {/* Навигация — тихий текст, точка у активной страницы */}
          <nav
            aria-label="Основная навигация"
            className="hidden lg:flex items-center gap-9"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[13.5px] uppercase tracking-[0.14em] transition-colors duration-300 flex items-center gap-2 ${
                    active ? "text-ink font-semibold" : "text-ink-soft hover:text-ink font-medium"
                  }`}
                >
                  {active && <span className="w-1 h-1 rounded-full bg-fern" aria-hidden="true" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Действия */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="tel:+79990000000"
              className="flex items-center gap-2 text-[14px] font-medium text-ink-soft hover:text-fern transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              +7 (999) 000-00-00
            </a>
            <Link href="/book" className="btn-primary px-6 py-2.5 text-[13.5px]">
              Записаться
            </Link>
          </div>

          {/* Бургер */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={isOpen}
            className="lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-[7px] text-ink"
          >
            <span className="block w-6 h-px bg-ink" aria-hidden="true" />
            <span className="block w-6 h-px bg-ink" aria-hidden="true" />
            <span className="block w-4 h-px bg-ink self-center" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Мобильное полноэкранное меню — молочная бумага */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-paper flex flex-col animate-fade-up">
          <div className="max-w-[1400px] w-full mx-auto px-5 sm:px-8">
            <div className="flex items-center justify-between h-[76px]">
              <Logo />
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть меню"
                className="w-11 h-11 flex items-center justify-center text-ink"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <nav aria-label="Мобильная навигация" className="flex-1 flex flex-col justify-center px-8">
            <ul>
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} className="border-b border-ink/10">
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-baseline gap-5 py-5"
                  >
                    <span className="font-display italic text-fern/70 text-lg w-8">
                      0{i + 1}
                    </span>
                    <span className="font-display text-4xl text-ink group-hover:text-fern transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-8 pb-12 space-y-5">
            <a href="tel:+79990000000" className="flex items-center gap-3 text-ink-soft">
              <Phone className="w-4 h-4 text-fern" />
              +7 (999) 000-00-00
            </a>
            <Link
              href="/book"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full py-4"
            >
              Записаться на приём
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

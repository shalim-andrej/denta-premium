// src/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Phone, Calendar, X } from "lucide-react";

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
  const box = size === "lg" ? "w-12 h-12 rounded-2xl" : "w-10 h-10 rounded-xl";
  const word = size === "lg" ? "text-[26px]" : "text-xl";
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="DentaPremium — на главную">
      <span
        className={`${box} flex items-center justify-center transition-transform duration-500 group-hover:rotate-[10deg]`}
        style={{
          background: "linear-gradient(135deg, #4bf0c8 0%, #2bd4a6 100%)",
          boxShadow: "0 6px 20px -4px rgba(60,230,189,.45), inset 0 1px 0 rgba(255,255,255,.4)",
        }}
      >
        <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" fill="#04120e" aria-hidden="true">
          <path d="M12 2.2c-3.9 0-6.9 2.6-6.9 6 0 2 .9 3.5 1.5 5 .6 1.8.9 4 1.3 6.2.2 1.3.5 2.4 1.7 2.4 1.5 0 1.3-2.2 1.6-4.2.2-1.3.7-2.3 1.8-2.3s1.6 1 1.8 2.3c.3 2 .1 4.2 1.6 4.2 1.2 0 1.5-1.1 1.7-2.4.4-2.2.7-4.4 1.3-6.2.6-1.5 1.5-3 1.5-5 0-3.4-3-6-6.9-6z" />
        </svg>
      </span>
      <span className={`${word} leading-none whitespace-nowrap`}>
        <span className="font-display font-semibold text-ink">Denta</span>
        <span className="font-accent italic font-medium text-mint">Premium</span>
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
        scrolled
          ? "bg-[#05090b]/85 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_12px_40px_-20px_rgba(0,0,0,.8)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Logo />

          {/* Центральная навигация-пилюля */}
          <nav
            aria-label="Основная навигация"
            className="hidden lg:flex items-center gap-1 rounded-full p-1.5 border border-white/[0.07] bg-white/[0.04] backdrop-blur-md"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    active
                      ? "bg-white/10 text-ink font-semibold"
                      : "text-fog hover:text-ink hover:bg-white/[0.06] font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Действия */}
          <div className="hidden lg:flex items-center gap-5">
            <a
              href="tel:+79990000000"
              className="flex items-center gap-2 text-sm font-medium text-fog hover:text-ink transition-colors"
            >
              <Phone className="w-4 h-4 text-mint" />
              +7 (999) 000-00-00
            </a>
            <Link href="/book" className="btn-primary px-5 py-2.5 text-sm">
              <Calendar className="w-4 h-4" />
              Записаться
            </Link>
          </div>

          {/* Бургер */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={isOpen}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5.5h14M3 10h14M3 14.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Мобильное полноэкранное меню */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-[#05090b]/97 backdrop-blur-2xl flex flex-col animate-fade-up">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-[72px]">
              <Logo />
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть меню"
                className="w-11 h-11 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav aria-label="Мобильная навигация" className="flex-1 flex flex-col justify-center px-8">
            <ul className="space-y-2">
              {NAV_LINKS.map((link, i) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-baseline gap-4 py-3"
                  >
                    <span className="font-accent italic text-mint/70 text-xl w-8">
                      0{i + 1}
                    </span>
                    <span className="font-display text-3xl sm:text-4xl text-ink group-hover:text-mint transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-8 pb-10 space-y-4">
            <a href="tel:+79990000000" className="flex items-center gap-3 text-fog">
              <span className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center">
                <Phone className="w-4 h-4 text-mint" />
              </span>
              +7 (999) 000-00-00
            </a>
            <Link
              href="/book"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full py-4"
            >
              <Calendar className="w-5 h-5" />
              Записаться на приём
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

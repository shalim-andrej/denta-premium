"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Calendar } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/doctors", label: "Врачи" },
    { href: "/services", label: "Услуги" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
              D
            </div>
            <span className="text-xl font-bold text-white tracking-tight">DentaPremium</span>
          </Link>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Кнопки действий */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+79990000000" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              +7 (999) 000-00-00
            </a>
            <Link
              href="/book"
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-teal-600/25"
            >
              <Calendar className="w-4 h-4" />
              Записаться
            </Link>
          </div>

          {/* Мобильное меню (кнопка) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню (выпадающее) */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-white/5">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-base font-medium text-slate-300 hover:text-teal-400"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <a href="tel:+79990000000" className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="w-4 h-4" />
                +7 (999) 000-00-00
              </a>
              <Link
                href="/book"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-teal-600 text-white font-bold rounded-xl"
              >
                <Calendar className="w-4 h-4" />
                Записаться на прием
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
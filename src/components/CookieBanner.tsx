"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setIsVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    // Здесь позже будет инициализация Яндекс.Метрики
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-300 text-center md:text-left">
          Мы используем файлы cookie для улучшения работы сайта. Продолжая использовать сайт, вы соглашаетесь с{" "}
          <Link href="/privacy" className="text-teal-400 underline hover:text-teal-300">
            Политикой обработки персональных данных
          </Link>.
        </p>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-6 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Отклонить
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
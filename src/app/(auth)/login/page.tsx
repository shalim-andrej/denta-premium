// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // loginAction делает redirect("/admin") при успехе,
    // поэтому если мы вернулись сюда, значит пароль неверный
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16 bg-cream/50">
      <div className="w-full max-w-md animate-fade-up">
        <div className="border-t border-ink/15 pt-10">
          {/* Логотип */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-ink mb-2">
              Панель <span className="serif-italic text-fern">управления</span>
            </h1>
            <p className="text-sm text-ink-soft">Вход для сотрудников клиники</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block font-label text-[11.5px] font-medium uppercase tracking-[0.18em] text-ink-soft mb-3">
                Пароль администратора
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="field text-center"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="text-rose-700 text-sm text-center font-medium"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="link-action w-full justify-center text-[13.5px]"
            >
              {isLoading ? "Проверка…" : "Войти в систему"}
              {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
            </button>
          </form>

          <div className="mt-9 pt-6 border-t border-ink/10 flex items-center justify-center gap-2 text-xs text-ink-soft">
            <ShieldCheck className="w-4 h-4 text-fern/70" />
            <span>Защищённая зона. Только для сотрудников.</span>
          </div>
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="font-label text-[12px] uppercase tracking-[0.16em] text-ink-soft hover:text-fern transition-colors">
            ← Вернуться на сайт
          </Link>
        </p>
      </div>
    </div>
  );
}

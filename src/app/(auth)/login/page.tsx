// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Header";

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Фоновые свечения */}
      <div className="glow w-[480px] h-[380px] bg-mint/[0.08] top-[12%] left-[8%]" aria-hidden="true" />
      <div className="glow w-[420px] h-[340px] bg-[#1d5c4d]/25 bottom-[10%] right-[6%]" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="card p-8 md:p-10" style={{ boxShadow: "0 40px 90px -30px rgba(0,0,0,.8)" }}>
          {/* Логотип */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-xl text-ink mb-2">
              Панель <span className="accent-word">управления</span>
            </h1>
            <p className="text-sm text-fog">Вход для сотрудников клиники</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink/80 mb-2.5">
                Пароль администратора
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4.5 h-4.5 text-fog" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="field !pl-12"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm text-center"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-[15px]"
            >
              {isLoading ? "Проверка…" : "Войти в систему"}
              {!isLoading && <ArrowRight className="w-4.5 h-4.5" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-center gap-2 text-xs text-fog">
            <ShieldCheck className="w-4 h-4 text-mint/70" />
            <span>Защищённая зона. Только для сотрудников.</span>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-fog hover:text-mint transition-colors">
            ← Вернуться на сайт
          </Link>
        </p>
      </div>
    </div>
  );
}

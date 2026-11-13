// src/app/admin/layout.tsx
// Консоль администратора: светлая рабочая тема (отличима от сайта),
// фирменные мятные акценты, навигация CRM.
import Link from "next/link";
import { logoutAction } from "../actions";
import { LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Записи" },
  { href: "/admin/schedule", label: "Расписание" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/reviews", label: "Отзывы" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-200/70">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "#0e7c57",
                boxShadow: "0 6px 16px -4px rgba(157,59,32,.4)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#f6f4ee" aria-hidden="true">
                <path d="M12 2.2c-3.9 0-6.9 2.6-6.9 6 0 2 .9 3.5 1.5 5 .6 1.8.9 4 1.3 6.2.2 1.3.5 2.4 1.7 2.4 1.5 0 1.3-2.2 1.6-4.2.2-1.3.7-2.3 1.8-2.3s1.6 1 1.8 2.3c.3 2 .1 4.2 1.6 4.2 1.2 0 1.5-1.1 1.7-2.4.4-2.2.7-4.4 1.3-6.2.6-1.5 1.5-3 1.5-5 0-3.4-3-6-6.9-6z" />
              </svg>
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">DentaPremium CRM</h1>
              <p className="text-xs text-gray-500">Управление клиникой</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-[#0e7c57] hover:bg-[#0e7c57]/[0.06] px-3 py-1.5 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                Выйти
              </button>
            </form>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

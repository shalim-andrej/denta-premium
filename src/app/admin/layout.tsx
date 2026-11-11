// src/app/admin/layout.tsx
import Link from "next/link";
import { logoutAction } from "../actions";

const NAV = [
  { href: "/admin", label: "Записи" },
  { href: "/admin/schedule", label: "Расписание" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/reviews", label: "Отзывы" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DentaPremium CRM</h1>
            <p className="text-sm text-gray-500">Управление клиникой</p>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
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

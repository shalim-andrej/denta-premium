// src/components/ChromeGate.tsx
// Показывает шапку/подвал и обёртку страницы только на публичных маршрутах.
// В админке (/admin) и на /login сайт-обвязка скрыта — там свои макеты.
"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ChromeGate({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const isConsole = pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (isConsole) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {header}
      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer />
    </div>
  );
}

// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "DentaPremium | Премиальная стоматология в Москве",
  description: "Современное оборудование, врачи с опытом более 10 лет и индивидуальный подход. Запишитесь онлайн за 2 минуты.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
        <Header />
        {/* pt-20 отступает контент под фиксированный Header */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
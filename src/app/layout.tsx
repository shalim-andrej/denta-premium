// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import ChromeGate from "@/components/ChromeGate";
import Header from "@/components/Header";

// Дисплейная антиква с кириллицей — заголовки и курсивные подзаголовки
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

// Основной текст
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "DentaPremium | Премиальная стоматология в Москве",
    template: "%s | DentaPremium",
  },
  description: "Современное оборудование, врачи с опытом более 10 лет и индивидуальный подход. Запишитесь онлайн за 2 минуты.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "DentaPremium",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${playfair.variable} bg-paper text-ink antialiased`}
      >
        <ChromeGate header={<Header />}>{children}</ChromeGate>
      </body>
    </html>
  );
}

// src/app/layout.tsx
import type { Metadata } from "next";
import { Unbounded, Cormorant_Garamond, Golos_Text } from "next/font/google";
import "./globals.css";
import ChromeGate from "@/components/ChromeGate";
import Header from "@/components/Header";

// Дисплейный широкий гротеск (подача ЗАРЯ) — капс-заголовки, числа, навигация
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-unbounded",
});

// Тонкая антиква-курсив — акцентные слова в заголовках
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

// Основной текст — аккуратный русский гротеск
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-golos",
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
        className={`${golos.variable} ${unbounded.variable} ${cormorant.variable} bg-paper text-ink antialiased`}
      >
        <ChromeGate header={<Header />}>{children}</ChromeGate>
      </body>
    </html>
  );
}

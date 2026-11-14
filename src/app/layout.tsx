// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ChromeGate from "@/components/ChromeGate";
import Header from "@/components/Header";

/*
  Шрифтовая система — ровно две гарнитуры, файлы в проекте (src/fonts):
  - Prata   — высококонтрастная антиква: заголовки, цифры, вордмарк (400)
  - Manrope — нейтральный гротеск: текст, лейблы, навигация, поля (variable)
  Никаких курсивных акцентов и «четвёртого шрифта для капса».
*/
const prata = localFont({
  src: "../fonts/Prata-Regular.ttf",
  weight: "400",
  variable: "--font-prata",
  display: "swap",
});

const manrope = localFont({
  src: "../fonts/Manrope.ttf",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
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
        className={`${prata.variable} ${manrope.variable} bg-paper text-ink antialiased`}
      >
        <ChromeGate header={<Header />}>{children}</ChromeGate>
      </body>
    </html>
  );
}

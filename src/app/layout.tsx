// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ChromeGate from "@/components/ChromeGate";
import Header from "@/components/Header";

/*
  Шрифтовая система — 4 разные семьи, файлы лежат в проекте (src/fonts),
  кириллица проверена fontTools. Ничего системного и «дефолтного»:
  - Oranienbaum — русская высококонтрастная дидона: заголовки (400, одновесовая)
  - Cormorant   — курсивная антиква: акцентные слова, крупные цифры (variable 300–700)
  - Literata    — книжная антиква для основного текста (variable 300–900)
  - Jost        — геометрический гротеск: капс-лейблы, навигация, поля (variable 100–900)
*/
const oranienbaum = localFont({
  src: "../fonts/Oranienbaum-Regular.ttf",
  weight: "400",
  variable: "--font-oranienbaum",
  display: "swap",
});

const cormorant = localFont({
  src: "../fonts/Cormorant-Italic.ttf",
  weight: "300 700",
  style: "italic",
  variable: "--font-cormorant",
  display: "swap",
});

const literata = localFont({
  src: "../fonts/Literata.ttf",
  weight: "300 900",
  variable: "--font-literata",
  display: "swap",
});

const jost = localFont({
  src: "../fonts/Jost.ttf",
  weight: "100 900",
  variable: "--font-jost",
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
        className={`${oranienbaum.variable} ${cormorant.variable} ${literata.variable} ${jost.variable} bg-paper text-ink antialiased`}
      >
        <ChromeGate header={<Header />}>{children}</ChromeGate>
      </body>
    </html>
  );
}

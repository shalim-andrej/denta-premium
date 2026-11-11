// src/components/StructuredData.tsx
// JSON-LD разметка: организация (Dentist), рейтинг по отзывам и FAQPage.
// Рендерится в Suspense, потому что рейтинг — данные из БД.
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const CLINIC_PHONE = "+7 999 000-00-00";
const CLINIC_ADDRESS = "Москва, ул. Примерная, д. 1";

export default async function StructuredData() {
  await connection();

  const agg = await prisma.review.aggregate({
    where: { approved: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  const ratingCount = agg._count.id;
  const ratingValue = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null;

  const dentist: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: "DentaPremium",
    description:
      "Премиальная стоматология в Москве: имплантация, ортодонтия, лечение каналов под микроскопом. Онлайн-запись и оплата.",
    url: BASE,
    telephone: CLINIC_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: CLINIC_ADDRESS.replace("Москва, ", ""),
      addressLocality: "Москва",
      addressCountry: "RU",
    },
    priceRange: "₽₽₽",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
  };
  if (ratingCount >= 3 && ratingValue) {
    dentist.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Как записаться на приём?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Через форму онлайн-записи на сайте: выберите услугу (и врача, если хотите) и удобное время. Запись занимает пару минут, подтверждение приходит на email.",
        },
      },
      {
        "@type": "Question",
        name: "Нужно ли платить сразу при записи?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Да, оплата онлайн по карте или через СБП фиксирует за вами выбранное время. Цена на сайте совпадает с ценой в договоре.",
        },
      },
      {
        "@type": "Question",
        name: "Можно ли отменить или перенести запись?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Да, по ссылке управления записью из письма: отмените или перенесите приём в пару кликов без звонка в клинику.",
        },
      },
      {
        "@type": "Question",
        name: "Есть ли гарантия на лечение?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Гарантия предоставляется официально по договору на все виды лечения.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dentist) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

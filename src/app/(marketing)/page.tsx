// src/app/(marketing)/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, ArrowUpRight, Star, ShieldCheck, Clock, Sparkles, Microscope, FileCheck, CreditCard, Baby, CalendarCheck, Wallet, MailCheck, CalendarClock } from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";
import ReviewsSection from "@/components/ReviewsSection";
import StructuredData from "@/components/StructuredData";

const priceFmt = (p: number) => p.toLocaleString("ru-RU");

/* ---------- Общий заголовок секции ---------- */
function SectionHead({
  chip,
  title,
  sub,
  href,
  linkLabel,
}: {
  chip: string;
  title: React.ReactNode;
  sub?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="max-w-2xl">
        <span className="chip-mint mb-5">{chip}</span>
        <h2 className="font-display text-[1.7rem] sm:text-3xl md:text-[2.5rem] leading-[1.16] text-ink">
          {title}
        </h2>
        {sub && <p className="mt-4 text-fog text-base md:text-lg leading-relaxed">{sub}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="btn-ghost px-6 py-3 text-sm shrink-0 self-start md:self-auto">
          {linkLabel}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

/* ---------- Hero: орбитальная композиция ---------- */
function OrbitVisual() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto animate-fade-up" aria-hidden="true">
      {/* Кольца */}
      <div className="absolute inset-0 rounded-full border border-white/[0.07]" />
      <div className="absolute inset-[13%] rounded-full border border-dashed border-mint/20 animate-spin-slower" />
      <div
        className="absolute inset-[27%] rounded-full border border-white/[0.05]"
        style={{ background: "radial-gradient(circle at 35% 30%, rgba(60,230,189,.16), transparent 62%)" }}
      />

      {/* Центр — знак зуба */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-28 h-28 md:w-32 md:h-32 rounded-[2.2rem] card flex items-center justify-center rotate-[-8deg]"
          style={{ boxShadow: "0 30px 70px -24px rgba(60,230,189,.35), 0 20px 50px -20px rgba(0,0,0,.7)" }}
        >
          <svg viewBox="0 0 24 24" className="w-14 h-14" fill="url(#toothGrad)" aria-hidden="true">
            <defs>
              <linearGradient id="toothGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7df5d8" />
                <stop offset="100%" stopColor="#2bd4a6" />
              </linearGradient>
            </defs>
            <path d="M12 2.2c-3.9 0-6.9 2.6-6.9 6 0 2 .9 3.5 1.5 5 .6 1.8.9 4 1.3 6.2.2 1.3.5 2.4 1.7 2.4 1.5 0 1.3-2.2 1.6-4.2.2-1.3.7-2.3 1.8-2.3s1.6 1 1.8 2.3c.3 2 .1 4.2 1.6 4.2 1.2 0 1.5-1.1 1.7-2.4.4-2.2.7-4.4 1.3-6.2.6-1.5 1.5-3 1.5-5 0-3.4-3-6-6.9-6z" />
          </svg>
        </div>
      </div>

      {/* Плавающие карточки на орбите */}
      <div className="absolute top-[4%] left-[2%] card px-4 py-3 animate-float">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-mint" />
          </span>
          <div>
            <div className="text-[13px] font-bold text-ink leading-tight">Гарантия</div>
            <div className="text-[11px] text-fog">по договору</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[8%] right-[0%] card px-4 py-3 animate-float-late">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center">
            <Star className="w-4.5 h-4.5 text-gold fill-gold" />
          </span>
          <div>
            <div className="text-[13px] font-bold text-ink leading-tight">4.9 из 5</div>
            <div className="text-[11px] text-fog">1 200+ отзывов</div>
          </div>
        </div>
      </div>

      <div className="absolute top-[38%] right-[-4%] card px-4 py-3 animate-float" style={{ animationDelay: "2s" }}>
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center">
            <Clock className="w-4.5 h-4.5 text-mint" />
          </span>
          <div>
            <div className="text-[13px] font-bold text-ink leading-tight">9:00–21:00</div>
            <div className="text-[11px] text-fog">без выходных</div>
          </div>
        </div>
      </div>

      {/* Вращающаяся круговая подпись */}
      <div className="absolute bottom-[2%] left-[6%] w-24 h-24 md:w-28 md:h-28 animate-spin-slower">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <path id="circlePath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-fog" style={{ fontSize: "9.2px", letterSpacing: "2.6px" }}>
            <textPath href="#circlePath">DENTAPREMIUM • МОСКВА • С 2014 •</textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
const STATS = [
  { value: "12+", label: "лет клинике" },
  { value: "15 000+", label: "счастливых пациентов" },
  { value: "4.9", label: "рейтинг из 5", gold: true },
  { value: "9–21", label: "работаем без выходных" },
];

function Hero() {
  return (
    <section className="relative pt-14 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 overflow-hidden">
      <div className="glow w-[640px] h-[420px] bg-mint/[0.09] -top-32 -left-40" />
      <div className="glow w-[500px] h-[360px] bg-[#1d5c4d]/25 top-40 -right-32" />

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-8 items-center">
        {/* Левая колонка */}
        <div className="animate-fade-up">
          <span className="chip-mint mb-7">
            <Sparkles className="w-3.5 h-3.5" />
            Онлайн-запись за 2 минуты
          </span>

          <h1 className="font-display text-[2.1rem] sm:text-5xl xl:text-[3.6rem] leading-[1.1] tracking-tight text-ink">
            Здоровая улыбка —{" "}
            <span className="accent-word !text-[1.18em]">без боли</span>
            <br />
            и ожидания
          </h1>

          <p className="mt-6 text-fog text-base md:text-lg leading-relaxed max-w-xl">
            Диагностика на оборудовании экспертного класса, врачи с опытом от 10 лет
            и прозрачные цены. Запишитесь онлайн — подтверждение придёт на email за минуту.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="btn-primary px-8 py-4 text-base group">
              Записаться онлайн
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/services" className="btn-ghost px-8 py-4 text-base">
              Услуги и цены
            </Link>
          </div>

          {/* Статистика */}
          <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 max-w-xl">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl md:text-[1.7rem] text-ink flex items-center gap-1.5">
                  {s.value}
                  {s.gold && <Star className="w-4 h-4 text-gold fill-gold" />}
                </dd>
                <dd className="mt-1.5 text-xs text-fog leading-snug">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Правая колонка — орбита */}
        <OrbitVisual />
      </div>
    </section>
  );
}

/* ---------- Бегущая строка ---------- */
const MARQUEE_ITEMS = [
  "Имплантация", "Отбеливание ZOOM 4", "Гигиена и профилактика", "Ортодонтия",
  "Протезирование", "Детская стоматология", "Лечение каналов", "Виниры E.max",
];

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="border-y border-white/[0.06] py-5 overflow-hidden bg-white/[0.015]" aria-hidden="true">
      <div className="flex w-max gap-10 animate-marquee">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-sm uppercase tracking-[0.18em] text-ink/70">{item}</span>
            <span className="text-mint text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Услуги: бенто из БД ---------- */
async function ServicesBento() {
  await connection();
  const services = await prisma.service.findMany({
    orderBy: { price: "desc" },
    take: 6,
  });
  if (services.length === 0) return null;

  const [featured, ...rest] = services;

  return (
    <section id="services" className="px-4 sm:px-6 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          chip="Услуги и цены"
          title={<>Забота о зубах <span className="accent-word">на любом этапе</span></>}
          sub="Прозрачные цены без скрытых доплат: стоимость на сайте совпадает с ценой в договоре."
          href="/services"
          linkLabel="Все услуги"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr gap-5">
          {/* Главная карточка */}
          <div className="card card-hover sm:col-span-2 lg:col-span-2 lg:row-span-2 p-8 md:p-10 flex flex-col overflow-hidden">
            <div className="glow w-72 h-72 bg-mint/[0.1] -top-20 -right-20" />
            <div className="relative z-10 flex flex-col h-full">
              <span className="chip-mint self-start mb-6">{featured.category}</span>
              <h3 className="font-display text-xl md:text-3xl text-ink leading-tight max-w-md">
                {featured.title}
              </h3>
              {featured.description && (
                <p className="mt-4 text-fog leading-relaxed max-w-md">{featured.description}</p>
              )}
              <div className="mt-auto pt-8 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="font-display text-3xl md:text-[2.6rem] text-mint leading-none">
                    {priceFmt(featured.price)} ₽
                  </div>
                  <div className="mt-2 text-xs text-fog">
                    под ключ · {featured.duration} минут
                  </div>
                </div>
                <Link
                  href={`/book?service=${featured.id}`}
                  className="btn-primary px-7 py-3.5 text-sm"
                >
                  Записаться
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Остальные услуги */}
          {rest.map((s) => (
            <Link
              key={s.id}
              href={`/book?service=${s.id}`}
              className="card card-hover p-6 flex flex-col group"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-mint/90 bg-mint/[0.08] border border-mint/20 px-3 py-1 rounded-full">
                  {s.category}
                </span>
                <ArrowUpRight className="w-4 h-4 text-fog group-hover:text-mint group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h3 className="mt-4 font-semibold text-ink leading-snug">{s.title}</h3>
              <div className="mt-auto pt-5 flex items-end justify-between">
                <span className="font-display text-lg text-ink">{priceFmt(s.price)} ₽</span>
                <span className="text-xs text-fog">{s.duration} мин</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Преимущества ---------- */
const ADVANTAGES = [
  {
    icon: Microscope,
    title: "Оборудование экспертного класса",
    desc: "Лечение под микроскопом, цифровая диагностика и стерилизация по международному протоколу.",
  },
  {
    icon: FileCheck,
    title: "Гарантия по договору",
    desc: "Официальный договор и гарантия на все виды лечения — цена на сайте равна цене в договоре.",
  },
  {
    icon: CreditCard,
    title: "Оплата онлайн",
    desc: "СБП или банковская карта через ЮKassa. Время приёма закрепляется за вами мгновенно.",
  },
  {
    icon: Baby,
    title: "Бережно к детям",
    desc: "Детский приём без страха: мультики в кабинете, мягкий подход и врачи, которых любят.",
  },
];

function Advantages() {
  return (
    <section className="px-4 sm:px-6 pb-20 md:pb-28">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          chip="Почему мы"
          title={<>Стоматология, в которую <span className="accent-word">не страшно</span> идти</>}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {ADVANTAGES.map((a, i) => (
            <div key={a.title} className="card card-hover p-7 overflow-hidden group">
              <span className="absolute -top-3 right-4 font-accent italic text-[5.5rem] leading-none text-white/[0.05] select-none" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="relative z-10 w-12 h-12 rounded-2xl bg-mint/10 border border-mint/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <a.icon className="w-5.5 h-5.5 text-mint" />
              </span>
              <h3 className="relative z-10 font-bold text-ink leading-snug mb-2.5">{a.title}</h3>
              <p className="relative z-10 text-sm text-fog leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Врачи ---------- */
async function TopDoctors() {
  await connection();
  const doctors = await prisma.doctor.findMany({
    take: 3,
    orderBy: { experience: "desc" },
  });
  if (doctors.length === 0) return null;

  return (
    <section id="doctors" className="px-4 sm:px-6 pb-20 md:pb-28">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          chip="Команда"
          title={<>Врачи, которым <span className="accent-word">доверяют улыбки</span></>}
          sub="Каждый специалист — узкий эксперт в своём направлении с подтверждённой квалификацией."
          href="/doctors"
          linkLabel="Все врачи"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="card card-hover p-7 flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-lg text-[#04120e] shrink-0"
                  style={{ background: "linear-gradient(135deg, #4bf0c8 0%, #2bd4a6 100%)" }}
                >
                  {doctor.name.split(" ")[0][0]}{doctor.name.split(" ")[1]?.[0] || ""}
                </div>
                <div>
                  <h3 className="font-bold text-ink leading-tight">{doctor.name}</h3>
                  <p className="text-sm text-mint mt-1">{doctor.specialty}</p>
                </div>
              </div>
              {doctor.description && (
                <p className="text-sm text-fog leading-relaxed line-clamp-2 mb-5">{doctor.description}</p>
              )}
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-fog flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-mint" />
                  Опыт более {doctor.experience} лет
                </span>
                <Link
                  href={`/book?doctor=${doctor.id}`}
                  className="text-sm font-semibold text-mint hover:text-ink transition-colors inline-flex items-center gap-1"
                >
                  Записаться
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Этапы записи ---------- */
const STEPS = [
  {
    icon: CalendarClock,
    title: "Выберите услугу",
    desc: "Прозрачные цены на сайте — без доплат на месте.",
  },
  {
    icon: Clock,
    title: "Подберите время",
    desc: "Свободные слоты считает сервер в реальном времени.",
  },
  {
    icon: Wallet,
    title: "Оплатите онлайн",
    desc: "СБП или картой — слот закреплён за вами.",
  },
  {
    icon: MailCheck,
    title: "Получите подтверждение",
    desc: "Email с деталями и ссылкой для отмены или переноса.",
  },
];

function Steps() {
  return (
    <section className="px-4 sm:px-6 pb-20 md:pb-28">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          chip="Как это работает"
          title={<>Запись <span className="accent-word">за четыре шага</span></>}
        />
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Пунктирная линия соединения */}
          <div className="hidden md:block absolute top-9 left-[12%] right-[12%] border-t border-dashed border-white/10" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="card p-7 h-full">
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <span
                    className="w-[4.5rem] h-[4.5rem] rounded-full border border-mint/25 bg-mint/[0.08] flex items-center justify-center"
                    style={{ boxShadow: "0 0 30px -8px rgba(60,230,189,.3)" }}
                  >
                    <s.icon className="w-6 h-6 text-mint" />
                  </span>
                  <span className="font-display text-3xl text-white/10" aria-hidden="true">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-fog leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQ_ITEMS = [
  {
    q: "Как записаться на приём?",
    a: "Через форму онлайн-записи: выберите услугу и удобное время — подтверждение придёт на email. Врача можно не выбирать: назначим свободного специалиста.",
  },
  {
    q: "Нужно ли платить сразу при записи?",
    a: "Да, оплата картой или через СБП фиксирует за вами время. Цена на сайте совпадает с ценой в договоре — без скрытых доплат.",
  },
  {
    q: "Можно ли отменить или перенести запись?",
    a: "Да, по защищённой ссылке из письма — в пару кликов, без звонка в клинику. При отмене оплата возвращается на карту.",
  },
  {
    q: "Есть ли гарантия на лечение?",
    a: "Гарантия предоставляется официально по договору на все виды лечения. Все условия фиксируются до начала терапии.",
  },
];

function Faq() {
  return (
    <section className="px-4 sm:px-6 pb-20 md:pb-28">
      <div className="max-w-4xl mx-auto">
        <SectionHead
          chip="Вопросы и ответы"
          title={<>Частые <span className="accent-word">вопросы</span></>}
        />
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="card group overflow-hidden">
              <summary className="cursor-pointer list-none px-6 md:px-8 py-5 md:py-6 flex items-center gap-5 select-none">
                <span className="font-accent italic text-2xl text-mint/70 w-8 shrink-0" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="font-semibold text-ink flex-1">{item.q}</span>
                <span className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center shrink-0 group-open:rotate-45 group-open:border-mint/40 transition-all duration-300" aria-hidden="true">
                  <span className="text-mint text-lg leading-none">+</span>
                </span>
              </summary>
              <p className="px-6 md:px-8 pb-6 pl-[4.75rem] md:pl-[5.25rem] text-sm text-fog leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Финальный CTA ---------- */
function Cta() {
  return (
    <section className="px-4 sm:px-6 pb-24">
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2.5rem] card p-10 md:p-16 text-center">
        <div className="glow w-[520px] h-[320px] bg-mint/[0.12] -top-24 left-1/2 -translate-x-1/2" />
        <div className="glow w-[380px] h-[240px] bg-[#1d5c4d]/30 -bottom-24 -right-16" />
        <div className="relative z-10">
          <h2 className="font-display text-[1.8rem] sm:text-4xl md:text-[3rem] leading-[1.12] text-ink max-w-3xl mx-auto">
            Ваша лучшая улыбка —{" "}
            <span className="accent-word">в одном клике</span>
          </h2>
          <p className="mt-5 text-fog text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Первичная консультация с планом лечения. Оплата после записи —
            СБП или банковской картой.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/book" className="btn-primary px-9 py-4 text-base group">
              Записаться на приём
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Страница ---------- */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Suspense fallback={<div className="py-24 text-center text-fog">Загрузка услуг…</div>}>
        <ServicesBento />
      </Suspense>
      <Advantages />
      <Suspense fallback={<div className="py-24 text-center text-fog">Загрузка врачей…</div>}>
        <TopDoctors />
      </Suspense>
      <Steps />
      <Suspense fallback={<div className="py-24 text-center text-fog">Загрузка отзывов…</div>}>
        <ReviewsSection />
      </Suspense>
      <Faq />
      <Cta />
      <Suspense fallback={null}>
        <StructuredData />
      </Suspense>
    </>
  );
}

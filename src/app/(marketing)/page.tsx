// src/app/(marketing)/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, ArrowUpRight, Star, Clock, Microscope, FileCheck, CreditCard, Baby, CalendarCheck, Wallet, MailCheck, CalendarClock } from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";
import ReviewsSection from "@/components/ReviewsSection";
import StructuredData from "@/components/StructuredData";
import HeroVideo from "@/components/HeroVideo";
import Parallax from "@/components/Parallax";

const priceFmt = (p: number) => p.toLocaleString("ru-RU");

/* ---------- Заголовок секции: слева, с линией ---------- */
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
    <div data-reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <div className="max-w-2xl">
        <span className="eyebrow">{chip}</span>
        <h2 className="mt-6 font-display font-normal text-[1.5rem] sm:text-[1.9rem] md:text-[2.1rem] leading-[1.18] uppercase text-ink">
          {title}
        </h2>
        {sub && <p className="mt-5 text-ink-soft text-[15px] md:text-base leading-relaxed max-w-xl">{sub}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="link-action shrink-0 self-start md:self-auto">
          {linkLabel}
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}

/* ---------- Hero: видео-обложка в духе ЗАРЯ ---------- */
const HERO_STATS = [
  { value: "12", label: "лет клинике", italic: false },
  { value: "15 000+", label: "счастливых пациентов", italic: false },
  { value: "9:00–21:00", label: "работаем без выходных", italic: true },
  { value: "5 мин", label: "на онлайн-запись", italic: false },
];

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <HeroVideo />

      {/* Молочная вуаль: читаемость текста и мягкий переход из шапки */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-paper/90 via-paper/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-paper/85 via-paper/45 to-paper/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-paper/75 via-paper/30 to-transparent"
        aria-hidden="true"
      />

      {/* Контент — построчное появление */}
      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 pt-[84px] pb-4 sm:px-8 lg:px-12">
        <span className="eyebrow animate-fade-up" style={{ animationDelay: "0.15s" }}>
          Премиальная стоматология · Москва
        </span>

        <h1 className="mt-5 max-w-4xl font-display uppercase leading-[1.08] text-ink text-[1.95rem] sm:text-[3.4rem] xl:text-[4.15rem]">
          <span className="block overflow-hidden pb-1">
            <span className="block line-reveal" style={{ animationDelay: "0.25s" }}>
              Стоматология
            </span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span
              className="block line-reveal serif-italic normal-case text-fern"
              style={{ animationDelay: "0.4s" }}
            >
              премиум-класса
            </span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span className="block line-reveal" style={{ animationDelay: "0.55s" }}>
              в центре Москвы
            </span>
          </span>
        </h1>

        <p
          className="mt-4 max-w-lg text-ink-soft text-[15px] md:text-[17px] leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.7s" }}
        >
          Диагностика на оборудовании экспертного класса, врачи с опытом от 10 лет
          и цены, которые не меняются после осмотра. Подтверждение записи —
          на email за минуту.
        </p>

        <div
          className="mt-8 flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-5 animate-fade-up"
          style={{ animationDelay: "0.85s" }}
        >
          <Link href="/book" className="link-action text-[13px] sm:text-sm">
            Записаться онлайн
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <Link href="/services" className="link-action text-[13px] sm:text-sm">
            Услуги и цены
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <span className="hidden md:inline-flex items-center gap-2 font-label text-[11.5px] font-medium uppercase tracking-[0.14em] text-ink/80">
            <Star className="w-3.5 h-3.5 text-gold fill-gold" aria-hidden="true" />
            4.9 из 5 — по 1 200+ отзывам
          </span>
        </div>
      </div>

      {/* Статистика — полоса на hairline внизу обложки */}
      <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-5 sm:px-8 lg:px-12">
        <dl
          className="grid grid-cols-2 md:grid-cols-4 gap-y-6 border-t border-ink/15 animate-fade-up"
          style={{ animationDelay: "1s" }}
        >
          {HERO_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`pt-5 pb-1 ${i !== 0 ? "md:border-l md:border-ink/15 md:pl-8" : ""} ${
                i === 2 ? "col-start-1 md:col-start-3" : ""
              } ${i === 3 ? "col-start-2 md:col-start-4" : ""}`}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd
                className={`font-display text-[1.6rem] md:text-[2rem] leading-none text-ink ${
                  s.italic ? "serif-italic" : ""
                }`}
              >
                {s.value}
              </dd>
              <dd className="mt-2.5 text-[12.5px] text-ink-soft leading-snug max-w-[150px]">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- Бегущая строка — антиква капс ---------- */
const MARQUEE_ITEMS = [
  "Имплантация", "Отбеливание ZOOM 4", "Гигиена и профилактика", "Ортодонтия",
  "Протезирование", "Детская стоматология", "Лечение каналов", "Виниры E.max",
];

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="border-y border-ink/10 py-6 overflow-hidden bg-cream/60" aria-hidden="true">
      <div className="flex w-max gap-12 animate-marquee">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap">
            <span className="font-display text-[15px] uppercase tracking-[0.2em] text-ink/75">{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-fern/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Услуги: меню-список с фото ---------- */
async function ServicesMenu() {
  await connection();
  const services = await prisma.service.findMany({
    orderBy: { price: "desc" },
    take: 6,
  });
  if (services.length === 0) return null;

  const [featured, ...rest] = services;

  return (
    <section id="services" className="px-5 sm:px-8 lg:px-12 py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto">
        {/* Центрированный заголовок в духе референсов */}
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow eyebrow-center justify-center">Услуги и цены</span>
          <h2 className="mt-6 font-display font-normal text-[1.5rem] sm:text-[1.9rem] md:text-[2.1rem] leading-[1.18] text-ink uppercase">
            Всё для здоровья улыбки{" "}
            <span className="serif-italic normal-case text-fern">в одном месте</span>
          </h2>
          <p className="mt-5 text-ink-soft text-[15px] md:text-base leading-relaxed">
            Цена на сайте равна цене в договоре — без скрытых доплат на месте.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-start">
          {/* Левая колонка — арка и featured-услуга */}
          <div data-reveal>
            <Parallax speed={0.05}>
              <div className="arch relative aspect-[4/5] max-w-[420px]">
              <Image
                src="/images/interior-2.jpg"
                alt="Ресепшн клиники DentaPremium — тёплый премиальный интерьер"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
              />
            </div>
            </Parallax>

            <div className="mt-10 pt-8 border-t border-ink/10 max-w-[420px]">
              <span className="eyebrow">{featured.category}</span>
              <h3 className="mt-4 font-display text-2xl md:text-[1.7rem] leading-snug text-ink">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                {featured.description ||
                  "В стоимость включены все этапы — от диагностики и 3D-планирования до установки импланта и контрольного осмотра."}
              </p>
              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <div className="font-display text-[2rem] leading-none text-fern">
                    {priceFmt(featured.price)} ₽
                  </div>
                  <div className="mt-2 text-[12px] text-ink-soft">
                    под ключ · {featured.duration} минут
                  </div>
                </div>
                <Link href={`/book?service=${featured.id}`} className="link-action text-[13px]">
                  Записаться
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>

          {/* Правая колонка — меню-список услуг */}
          <div>
            {rest.map((s, i) => (
              <Link
                key={s.id}
                href={`/book?service=${s.id}`}
                className={`group flex items-baseline justify-between gap-6 py-7 border-t border-ink/10 hover:border-fern/40 transition-colors ${i === rest.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-accent italic text-[15px] text-fern/70 w-8 shrink-0" aria-hidden="true">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl md:text-[1.45rem] text-ink group-hover:text-fern transition-colors leading-snug">
                      {s.title}
                    </h3>
                    <span className="mt-1.5 block text-[12px] uppercase tracking-[0.14em] text-ink-soft">
                      {s.category}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-baseline gap-4">
                  <span className="font-display text-xl text-ink">{priceFmt(s.price)} ₽</span>
                  <span className="hidden sm:block text-[12px] text-ink-soft whitespace-nowrap">{s.duration} мин</span>
                  <ArrowUpRight className="w-4 h-4 text-ink-soft group-hover:text-fern group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all hidden md:block" />
                </div>
              </Link>
            ))}
            <Link
              href="/services"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-ink/30 pb-1 hover:text-fern hover:border-fern transition-colors group"
            >
              Смотреть все услуги
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- О клинике: фото-композиция и текст ---------- */
function About() {
  return (
    <section className="bg-cream/60 border-y border-ink/10 px-5 sm:px-8 lg:px-12 py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-24 items-center">
        {/* Фотографии со смещением */}
        <div className="relative pb-14 pr-10 sm:pr-16" data-reveal>
          <Parallax speed={0.07}>
          <div className="photo relative aspect-[4/5]">
            <Image
              src="/images/smile.jpg"
              alt="Пациентка с брекетами искренне улыбается"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
          </Parallax>
          <div className="photo absolute bottom-0 right-0 w-[38%] aspect-square border-[6px] border-paper shadow-[0_24px_60px_-24px_rgba(33,26,19,0.4)]">
            <Image
              src="/images/interior-1.jpg"
              alt="Интерьер клиники — арочная ниша ресепшн"
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Текст */}
        <div data-reveal style={{ transitionDelay: "0.12s" }}>
          <span className="eyebrow">О клинике</span>
          <h2 className="mt-6 font-display font-normal text-[1.5rem] sm:text-[1.9rem] md:text-[2.1rem] leading-[1.18] uppercase text-ink">
            Лечим бережно{" "}
            <span className="serif-italic normal-case text-fern">и не считаем минуты</span>
          </h2>
          <p className="mt-6 text-ink-soft text-[15px] md:text-base leading-relaxed max-w-xl">
            DentaPremium — клиника полного цикла: от гигиены и лечения каналов
            до имплантации и ортодонтии. Врач не «продаёт» лишнего: план лечения
            и смета фиксируются до начала работы, а гарантия оформляется
            официально, по договору.
          </p>
          <p className="mt-4 text-ink-soft text-[15px] md:text-base leading-relaxed max-w-xl">
            Тихие кабинеты, координата-микроскоп, цифровой рентген с минимальной
            лучевой нагрузкой и стерилизация по международному протоколу.
          </p>

          <dl className="mt-12 grid grid-cols-3 border-t border-ink/10">
            {[
              { v: "12", l: "лет заботы", i: false },
              { v: "10+", l: "лет опыта врачей", i: false },
              { v: "24 ч", l: "ответ по гарантиям", i: true },
            ].map((s, i) => (
              <div key={s.l} className={`pt-7 pb-2 ${i !== 0 ? "border-l border-ink/10 pl-6" : ""}`}>
                <dt className="sr-only">{s.l}</dt>
                <dd className={`font-display text-[1.6rem] md:text-[1.9rem] leading-none text-ink ${s.i ? "serif-italic" : ""}`}>
                  {s.v}
                </dd>
                <dd className="mt-3 text-[12.5px] text-ink-soft leading-snug">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- Преимущества: редакционные строки с номерами ---------- */
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
    <section className="px-5 sm:px-8 lg:px-12 py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          chip="Почему мы"
          title={<>Стоматология, в которую{" "}
            <span className="serif-italic text-fern">не страшно</span> идти</>}
        />
        <div>
          {ADVANTAGES.map((a, i) => (
            <div
              key={a.title}
              data-reveal
              style={{ transitionDelay: `${i * 0.06}s` }}
              className={`grid md:grid-cols-[auto_1fr_1.2fr] gap-x-10 gap-y-3 items-baseline py-8 border-t border-ink/10 group ${i === ADVANTAGES.length - 1 ? "border-b" : ""}`}
            >
              <span className="font-accent italic text-xl text-fern/80 w-12" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl md:text-2xl text-ink leading-snug group-hover:text-fern transition-colors">
                {a.title}
              </h3>
              <p className="text-sm md:text-[15px] text-ink-soft leading-relaxed md:max-w-lg">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Врачи: арочные портреты ---------- */
async function TopDoctors() {
  await connection();
  const doctors = await prisma.doctor.findMany({
    take: 4,
    orderBy: { experience: "desc" },
  });
  if (doctors.length === 0) return null;

  const photos: Record<string, string> = {
    "Шалимов Андрей Михайлович": "/images/doctor-shalimov.jpg",
    "Волкова Елена Сергеевна": "/images/doctor-volkova.jpg",
    "Ким Ирина Викторовна": "/images/doctor-kim.jpg",
    "Гаврилов Дмитрий Павлович": "/images/doctor-gavrilov.jpg",
  };

  return (
    <section id="doctors" className="bg-cream/60 border-y border-ink/10 px-5 sm:px-8 lg:px-12 py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          chip="Команда"
          title={<>Врачи, которым{" "}
            <span className="serif-italic text-fern">доверяют улыбки</span></>}
          sub="Каждый специалист — узкий эксперт в своём направлении с подтверждённой квалификацией."
          href="/doctors"
          linkLabel="Все врачи"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {doctors.map((doctor, i) => (
            <div key={doctor.id} data-reveal style={{ transitionDelay: `${(i % 4) * 0.08}s` }} className="group">
              <div className="arch-sm relative aspect-[3/4] bg-sand">
                {photos[doctor.name] ? (
                  <Image
                    src={photos[doctor.name]}
                    alt={doctor.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-5xl text-ink/20">
                      {doctor.name.split(" ")[0][0]}{doctor.name.split(" ")[1]?.[0] || ""}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="mt-5 font-display text-lg md:text-xl text-ink leading-snug">{doctor.name}</h3>
              <p className="mt-1 serif-italic text-[15px] text-fern">{doctor.specialty}</p>
              <div className="mt-4 flex items-center justify-between text-[13px] text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-fern" />
                  Опыт {doctor.experience} лет
                </span>
                <Link
                  href={`/book?doctor=${doctor.id}`}
                  className="font-semibold text-ink hover:text-fern transition-colors inline-flex items-center gap-1 group/link"
                >
                  Записаться
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Этапы записи: колонки с номерами ---------- */
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
    <section className="px-5 sm:px-8 lg:px-12 py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          chip="Как это работает"
          title={<>Запись{" "}
            <span className="serif-italic text-fern">за четыре шага</span></>}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-10 gap-y-10">
          {STEPS.map((s, i) => (
            <div key={s.title} data-reveal style={{ transitionDelay: `${i * 0.08}s` }} className="border-t border-ink/10 pt-7">
              <div className="flex items-baseline justify-between">
                <span className="font-accent italic text-2xl text-fern/80" aria-hidden="true">
                  0{i + 1}
                </span>
                <s.icon className="w-4.5 h-4.5 text-ink-soft" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 font-display text-xl text-ink leading-snug">{s.title}</h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ: аккордеон на линиях ---------- */
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
    <section className="px-5 sm:px-8 lg:px-12 pb-24 md:pb-32">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-14">
          <span className="eyebrow eyebrow-center justify-center">Вопросы и ответы</span>
          <h2 className="mt-6 font-display font-normal text-[1.5rem] sm:text-[1.9rem] md:text-[2.1rem] leading-[1.18] text-ink uppercase">
            Частые <span className="serif-italic normal-case text-fern">вопросы</span>
          </h2>
        </div>
        <div data-reveal>
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className={`group border-t border-ink/10 ${i === FAQ_ITEMS.length - 1 ? "border-b" : ""}`}>
              <summary className="cursor-pointer list-none px-2 md:px-4 py-6 flex items-center gap-5 select-none">
                <span className="font-accent italic text-lg text-fern/70 w-8 shrink-0" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="font-display text-lg md:text-xl text-ink flex-1">{item.q}</span>
                <span
                  className="text-2xl leading-none text-ink-soft group-open:rotate-45 transition-transform duration-300 shrink-0"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="px-2 md:px-4 pb-7 pl-[3.75rem] md:pl-[4.25rem] text-[15px] text-ink-soft leading-relaxed max-w-2xl">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Финальный CTA: глубокий ель, золото, широкая антиква ---------- */
function Cta() {
  return (
    <section className="bg-forest text-[#f2efe7]">
      <div data-reveal className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-24 md:py-32 text-center">
        <span className="eyebrow eyebrow-center justify-center text-[#c4a15a]">
          Первый шаг — проще, чем кажется
        </span>
        <h2 className="mt-8 font-display font-normal text-[1.9rem] sm:text-[2.8rem] md:text-[3.4rem] leading-[1.12] text-[#f2efe7] uppercase max-w-4xl mx-auto">
          Запишитесь на{" "}
          <span className="serif-italic normal-case text-[#c4a15a]">первый визит</span>
        </h2>
        <p className="mt-7 text-[#f2efe7]/70 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Первичная консультация с планом лечения. Оплата после записи —
          СБП или банковской картой.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-x-8 gap-y-5">
          <Link href="/book" className="link-light text-[13px] sm:text-sm">
            Записаться на приём
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
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
      <Suspense fallback={<div className="py-24 text-center text-ink-soft">Загрузка услуг…</div>}>
        <ServicesMenu />
      </Suspense>
      <About />
      <Advantages />
      <Suspense fallback={<div className="py-24 text-center text-ink-soft">Загрузка врачей…</div>}>
        <TopDoctors />
      </Suspense>
      <Steps />
      <Suspense fallback={<div className="py-24 text-center text-ink-soft">Загрузка отзывов…</div>}>
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

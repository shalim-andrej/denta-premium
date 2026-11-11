// prisma/seed.mjs
// Демо-данные для разработки и первого запуска.
// Запуск: npm run seed  (или: node prisma/seed.mjs)
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const doctors = [
  {
    name: "Шалимов Андрей Михайлович",
    specialty: "Хирург-имплантолог",
    description: "Хирургия, имплантация, костная пластика. Стаж более 20 лет.",
    experience: 20,
    schedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },
    ],
  },
  {
    name: "Волкова Елена Сергеевна",
    specialty: "Терапевт-эндодонтист",
    description: "Лечение каналов под микроскопом, реставрация.",
    experience: 12,
    schedule: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "19:00" },
      { dayOfWeek: 2, startTime: "10:00", endTime: "19:00" },
      { dayOfWeek: 4, startTime: "10:00", endTime: "19:00" },
      { dayOfWeek: 5, startTime: "10:00", endTime: "19:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "16:00" },
    ],
  },
  {
    name: "Ким Ирина Викторовна",
    specialty: "Ортодонт",
    description: "Элайнеры и брекет-системы для детей и взрослых.",
    experience: 9,
    schedule: [
      { dayOfWeek: 2, startTime: "09:00", endTime: "15:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "15:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "15:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "15:00" },
    ],
  },
  {
    name: "Гаврилов Дмитрий Павлович",
    specialty: "Ортопед-протезист",
    description: "Керамические и циркониевые коронки, виниры.",
    experience: 15,
    schedule: [
      { dayOfWeek: 1, startTime: "12:00", endTime: "20:00" },
      { dayOfWeek: 3, startTime: "12:00", endTime: "20:00" },
      { dayOfWeek: 4, startTime: "12:00", endTime: "20:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "16:00" },
    ],
  },
];

const services = [
  { title: "Консультация и план лечения", category: "Диагностика", price: 3000, duration: 30 },
  { title: "Профессиональная гигиена полости рта", category: "Гигиена", price: 6500, duration: 60 },
  { title: "Лечение кариеса (1 зуб)", category: "Терапия", price: 8900, duration: 60 },
  { title: "Лечение каналов под микроскопом", category: "Эндодонтия", price: 24900, duration: 120 },
  { title: "Имплантация (под ключ)", category: "Хирургия", price: 54900, duration: 120 },
  { title: "Керамический винир E.max", category: "Ортопедия", price: 39900, duration: 90 },
  { title: "Отбеливание ZOOM 4", category: "Эстетика", price: 19900, duration: 90 },
  { title: "Установка элайнеров (этап)", category: "Ортодонтия", price: 29900, duration: 60 },
];

async function main() {
  console.log("Сеем демо-данные...");

  for (const d of doctors) {
    const existing = await prisma.doctor.findFirst({ where: { name: d.name } });
    if (existing) {
      console.log("  врач уже есть:", d.name);
      continue;
    }
    const { schedule, ...data } = d;
    await prisma.doctor.create({
      data: { ...data, schedules: { create: schedule } },
    });
    console.log("  + врач:", d.name);
  }

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { title: s.title } });
    if (existing) {
      console.log("  услуга уже есть:", s.title);
      continue;
    }
    await prisma.service.create({ data: s });
    console.log("  + услуга:", s.title);
  }

  console.log("Готово.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

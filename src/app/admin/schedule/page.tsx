// src/app/admin/schedule/page.tsx
// Управление расписанием врачей: интервалы работы по дням недели.
// Не задано расписание — действует дефолт (пн–сб 9:00–18:00, вс выходной).
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { createSchedule, deleteSchedule } from "../../actions";

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

async function ScheduleData() {
  await connection();
  const doctors = await prisma.doctor.findMany({
    orderBy: { name: "asc" },
    include: { schedules: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
  });

  return (
    <div className="space-y-6">
      {/* Форма добавления интервала */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Добавить рабочий интервал</h2>
        <form action={createSchedule} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Врач</label>
            <select name="doctorId" required className="w-full p-2 border rounded-lg text-sm bg-gray-50">
              <option value="">— выберите —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">День недели</label>
            <select name="dayOfWeek" required defaultValue="1" className="w-full p-2 border rounded-lg text-sm bg-gray-50">
              {DAYS.map((label, idx) => (
                <option key={idx} value={idx}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Начало</label>
            <input type="time" name="startTime" required defaultValue="09:00" className="w-full p-2 border rounded-lg text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Конец</label>
            <input type="time" name="endTime" required defaultValue="18:00" className="w-full p-2 border rounded-lg text-sm bg-gray-50" />
          </div>
          <button className="bg-[#9d3b20] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#7d2c15] transition-colors">
            Добавить
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3">
          Если у врача не задано ни одного интервала, работает дефолт: пн–сб 9:00–18:00, воскресенье — выходной.
        </p>
      </div>

      {/* Расписания по врачам */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900">{doc.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{doc.specialty}</p>
            {doc.schedules.length === 0 ? (
              <p className="text-sm text-gray-400">Интервалы не заданы — действует дефолтный график.</p>
            ) : (
              <ul className="space-y-2">
                {doc.schedules.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-700">
                      <span className="inline-block w-8 font-semibold text-[#9d3b20]">{DAYS[s.dayOfWeek]}</span>
                      {s.startTime} — {s.endTime}
                    </span>
                    <form action={deleteSchedule}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded transition-colors">
                        Удалить
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Загрузка...</div>}>
      <ScheduleData />
    </Suspense>
  );
}

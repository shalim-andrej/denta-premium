// src/app/(marketing)/license/page.tsx
export default function LicensePage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-12 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Лицензия на осуществление медицинской деятельности</h1>
          <p className="text-slate-400">Сведения о лицензирующем органе и документе</p>
        </div>

        <div className="prose prose-invert prose-teal max-w-none bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="p-6 bg-teal-500/10 border border-teal-500/20 rounded-2xl mb-8">
            <p className="text-teal-300 font-medium mb-2">ООО «ДентаПремиум»</p>
            <p className="text-slate-300 text-sm">
              Деятельность осуществляется на основании лицензии, выданной Департаментом здравоохранения города Москвы.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">Реквизиты лицензии</h2>
          <ul className="space-y-3 text-slate-400 mb-8">
            <li className="flex gap-2">
              <span className="font-semibold text-white shrink-0">Номер:</span>
              <span>ЛО-77-01-000000</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-white shrink-0">Дата выдачи:</span>
              <span>01 января 2024 г.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-white shrink-0">Срок действия:</span>
              <span>Бессрочно</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-white shrink-0">Лицензирующий орган:</span>
              <span>Департамент здравоохранения города Москвы</span>
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white mb-4">Виды деятельности</h2>
          <p className="text-slate-400 mb-4 leading-relaxed">
            В соответствии с лицензией, клиника имеет право осуществлять следующие виды медицинской деятельности:
          </p>
          <ul className="list-disc pl-6 text-slate-400 mb-6 space-y-2">
            <li>Стоматология терапевтическая;</li>
            <li>Стоматология хирургическая;</li>
            <li>Стоматология ортопедическая;</li>
            <li>Стоматология детская.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
// src/app/(marketing)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-12 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Политика обработки персональных данных</h1>
          <p className="text-slate-400">Дата последнего обновления: 1 января 2024 г.</p>
        </div>

        <div className="prose prose-invert prose-teal max-w-none bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-xl font-bold text-white mb-4">1. Общие положения</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые ООО «ДентаПремиум» (далее — Оператор).
          </p>

          <h2 className="text-xl font-bold text-white mb-4">2. Какие данные мы собираем</h2>
          <p className="text-slate-400 mb-4 leading-relaxed">Оператор может обрабатывать следующие персональные данные Пользователя:</p>
          <ul className="list-disc pl-6 text-slate-400 mb-6 space-y-2">
            <li>Фамилия, имя, отчество;</li>
            <li>Номер контактного телефона;</li>
            <li>Адрес электронной почты;</li>
            <li>Данные о записи на прием (дата, время, выбранная услуга и врач).</li>
          </ul>

          <h2 className="text-xl font-bold text-white mb-4">3. Цели обработки данных</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Персональные данные Пользователя обрабатываются в целях: записи на прием к врачу, связи с Пользователем для подтверждения записи, информирования об изменениях в расписании, а также для улучшения качества обслуживания.
          </p>

          <h2 className="text-xl font-bold text-white mb-4">4. Права пользователя</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Пользователь имеет право на получение информации, касающейся обработки его персональных данных, требовать уточнения, блокирования или уничтожения данных, а также отозвать согласие на обработку персональных данных, направив соответствующий запрос на электронную почту info@dentapremium.ru.
          </p>

          <h2 className="text-xl font-bold text-white mb-4">5. Заключительные положения</h2>
          <p className="text-slate-400 leading-relaxed">
            Оператор вправе вносить изменения в настоящую Политику. Новая Политика вступает в силу с момента ее размещения на сайте. Действующая редакция всегда доступна по адресу /privacy.
          </p>
        </div>
      </div>
    </main>
  );
}
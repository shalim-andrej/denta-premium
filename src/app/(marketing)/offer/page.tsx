// src/app/(marketing)/offer/page.tsx
export default function OfferPage() {
  return (
    <main className="min-h-screen bg-paper pt-[110px] md:pt-[150px] pb-24 px-5 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4">Публичная оферта</h1>
          <p className="text-ink-soft">Договор на оказание стоматологических услуг</p>
        </div>

        <div className="prose max-w-none bg-white border border-ink/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-xl font-bold text-ink mb-4">1. Предмет договора</h2>
          <p className="text-ink-soft mb-6 leading-relaxed">
            ООО «ДентаПремиум» (далее — Исполнитель) обязуется оказать Заказчику стоматологические услуги, а Заказчик обязуется оплатить эти услуги. Перечень услуг, их стоимость и сроки оказания определяются при записи на прием и в прайс-листе на сайте.
          </p>

          <h2 className="text-xl font-bold text-ink mb-4">2. Порядок оплаты</h2>
          <p className="text-ink-soft mb-6 leading-relaxed">
            Оплата услуг производится в рублях РФ. Исполнитель принимает оплату наличными, банковскими картами, а также через систему быстрых платежей (СБП). Предоплата может быть внесена онлайн при записи через сайт.
          </p>

          <h2 className="text-xl font-bold text-ink mb-4">3. Возврат средств</h2>
          <p className="text-ink-soft mb-6 leading-relaxed">
            В случае отмены записи более чем за 24 часа до приема, предоплата возвращается в полном объеме. При отмене менее чем за 24 часа, предоплата может быть зачтена в счет будущих услуг или возвращена с удержанием комиссии.
          </p>

          <h2 className="text-xl font-bold text-ink mb-4">4. Ответственность сторон</h2>
          <p className="text-ink-soft leading-relaxed">
            Стороны несут ответственность в соответствии с законодательством РФ. Исполнитель гарантирует качество оказанных услуг и соблюдение всех медицинских протоколов.
          </p>
        </div>
      </div>
    </main>
  );
}
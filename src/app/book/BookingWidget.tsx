// src/app/book/BookingWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { createBooking } from "../actions";
import { Loader2, Info, ShieldCheck } from "lucide-react";

interface Service { id: string; title: string; duration: number; price: number; }
interface Doctor { id: string; name: string; specialty: string; }
interface Slot { time: string; doctorId: string; }

interface BookingWidgetProps {
  services: Service[];
  doctors: Doctor[];
  initialDoctorId?: string;
  initialServiceId?: string;
}

export default function BookingWidget({ services, doctors, initialDoctorId, initialServiceId }: BookingWidgetProps) {
  // Начальные значения из URL берём лениво в инициализаторе useState:
  // пропсы приходят готовыми с сервера, эффект не нужен.
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(() =>
    initialDoctorId ? doctors.find((d) => d.id === initialDoctorId) ?? null : null
  );
  const [selectedService, setSelectedService] = useState<Service | null>(() =>
    initialServiceId ? services.find((s) => s.id === initialServiceId) ?? null : null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "sbp">("sbp");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsNonce, setSlotsNonce] = useState(0); // принудительный перезапрос слотов
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  // Устанавливаем начальные значения из URL при монтировании — см. ленивые
  // инициализаторы useState выше (props приходят с сервера и не меняются).

  // Слоты считает СЕРВЕР: график врача (или всех врачей — «подберите за меня»),
  // занятые записи, длительность услуги. Клиент только показывает ответ /api/slots.
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      // Отложенный вызов: сам эффект синхронно состояние не меняет
      queueMicrotask(() => setAvailableSlots([]));
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => setLoadingSlots(true));
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const doctorParam = selectedDoctor ? `&doctorId=${selectedDoctor.id}` : "";

    fetch(
      `/api/slots?serviceId=${selectedService.id}&date=${dateStr}${doctorParam}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
        setSelectedSlot(null);
      })
      .catch(() => {}) // отменённый запрос игнорируем
      .finally(() => setLoadingSlots(false));

    return () => controller.abort();
  }, [selectedDate, selectedService, selectedDoctor, slotsNonce]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) {
      setMessage({ type: "error", text: "Выберите услугу и время" });
      return;
    }

    const cleanPhone = clientPhone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      setMessage({ type: "error", text: "Пожалуйста, введите корректный номер телефона (минимум 10 цифр)" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    // doctorId не передаём в режиме «подберите за меня» — сервер назначит
    // свободного врача и перепроверит занятость в транзакции.
    if (selectedDoctor) formData.append("doctorId", selectedDoctor.id);
    formData.append("serviceId", selectedService.id);
    formData.append("startTime", selectedSlot.time);
    formData.append("clientName", clientName);
    formData.append("clientPhone", cleanPhone);
    // email отправляем ТОЛЬКО если заполнен: сервер сам сгенерирует уникальный
    // временный email из телефона. Единый "no-email@clinic.ru" ломал данные —
    // все гости без email перезаписывали одну и ту же учётку.
    if (clientEmail.trim()) formData.append("clientEmail", clientEmail.trim());

    const result = await createBooking(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
      setIsLoading(false);
      setSlotsNonce((n) => n + 1); // слоты могли устареть — перезапрашиваем
      return;
    }

    if (result.success && result.bookingId) {
      try {
        // manageToken даёт пациенту страницу управления записью после оплаты
        const manageUrl = result.manageToken
          ? `${window.location.origin}/book/success?t=${result.manageToken}`
          : `${window.location.origin}/book/success`;

        const paymentRes = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: result.bookingId,
            returnUrl: manageUrl,
            method: paymentMethod,
          }),
        });

        const paymentData = await paymentRes.json();

        if (paymentData.confirmationUrl) {
          window.location.href = paymentData.confirmationUrl;
        } else {
          setMessage({ type: "error", text: paymentData.error || "Ошибка создания платежа. Попробуйте позже." });
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Ошибка сети при создании платежа." });
        setIsLoading(false);
      }
    }
  };

  /* ---------- Оформление шагов ---------- */
  const stepCls = "flex gap-4 md:gap-6";
  const numCls =
    "font-display italic text-xl text-terra/80 w-9 shrink-0 pt-0.5";
  const labelCls = "block text-sm font-semibold text-ink mb-2.5";

  const payOptions = [
    { id: "sbp" as const, title: "СБП", sub: "По QR-коду" },
    { id: "card" as const, title: "Банковская карта", sub: "Visa, Mastercard, МИР" },
  ];

  return (
    <div className="bg-white border border-ink/10 rounded-3xl p-7 md:p-10 relative overflow-hidden">
      <div className="space-y-9">
        {/* Шаг 1: Врач (опционально) */}
        <div className={stepCls}>
          <span className={numCls} aria-hidden="true">01</span>
          <div className="flex-1 min-w-0">
            <label htmlFor="doctor-select" className={labelCls}>
              Врач <span className="font-normal text-ink-soft">— можно не выбирать</span>
            </label>
            <select
              id="doctor-select"
              className="field"
              onChange={(e) => {
                const doc = doctors.find((d) => d.id === e.target.value);
                setSelectedDoctor(doc || null);
              }}
              value={selectedDoctor?.id || ""}
            >
              <option value="">Подберите за меня — любой свободный специалист</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name} — {doc.specialty}</option>
              ))}
            </select>
            {!selectedDoctor && (
              <p className="mt-2.5 text-xs text-ink-soft flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-terra/70 shrink-0" />
                Врач будет назначен автоматически — свободный специалист на выбранное время.
              </p>
            )}
          </div>
        </div>

        {/* Шаг 2: Услуга */}
        <div className={stepCls}>
          <span className={numCls} aria-hidden="true">02</span>
          <div className="flex-1 min-w-0">
            <label htmlFor="service-select" className={labelCls}>Услуга</label>
            <select
              id="service-select"
              className="field"
              onChange={(e) => {
                const srv = services.find((s) => s.id === e.target.value);
                setSelectedService(srv || null);
              }}
              value={selectedService?.id || ""}
            >
              <option value="">Выберите услугу</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>{srv.title} ({srv.duration} мин.) — {srv.price} ₽</option>
              ))}
            </select>
          </div>
        </div>

        {/* Шаг 3: Дата */}
        {selectedService && (
          <div className={stepCls}>
            <span className={numCls} aria-hidden="true">03</span>
            <div className="flex-1 min-w-0">
              <span className={labelCls}>Дата</span>
              <div className="inline-block bg-paper border border-ink/10 rounded-2xl p-4 md:p-5">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ru}
                  disabled={{ before: new Date() }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Шаг 4: Время */}
        {selectedService && (
          <div className={stepCls}>
            <span className={numCls} aria-hidden="true">04</span>
            <div className="flex-1 min-w-0">
              <span className={labelCls}>Время</span>
              {loadingSlots ? (
                <div className="text-sm text-ink-soft flex items-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-terra" />
                  Загружаем свободные слоты…
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-sm text-ink-soft py-2">
                  {selectedDoctor
                    ? "У этого врача на выбранную дату свободных слотов нет. Попробуйте другой день или режим «подберите за меня»."
                    : "На выбранную дату свободных слотов нет. Попробуйте другой день."}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {availableSlots.map((slot) => {
                    const active = selectedSlot?.time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        title={doctors.find((d) => d.id === slot.doctorId)?.name}
                        className={`py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                          active
                            ? "text-[#faf7f2] border-transparent bg-ink"
                            : "text-ink border-ink/15 bg-white hover:border-terra hover:text-terra"
                        }`}
                      >
                        {format(new Date(slot.time), "HH:mm")}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Шаг 5: Данные и оплата */}
        {selectedSlot && (
          <form onSubmit={handleSubmit} className={stepCls}>
            <span className={numCls} aria-hidden="true">05</span>
            <div className="flex-1 min-w-0 space-y-5">
              <span className={labelCls}>Ваши данные</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
                  className="field"
                  placeholder="Ваше имя *"
                  autoComplete="name"
                />
                <input
                  type="tel" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                  className="field"
                  placeholder="Телефон *"
                  autoComplete="tel"
                />
              </div>
              <input
                type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                className="field"
                placeholder="Email — необязательно, но пришлём подтверждение и напоминание"
                autoComplete="email"
              />

              {/* Выбор оплаты */}
              <fieldset>
                <legend className="text-sm font-semibold text-ink mb-3">Способ оплаты</legend>
                <div className="grid grid-cols-2 gap-3">
                  {payOptions.map((opt) => {
                    const active = paymentMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        aria-pressed={active}
                        className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                          active
                            ? "border-terra/60 bg-terra/[0.06]"
                            : "border-ink/15 bg-white hover:border-ink/35"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-ink">{opt.title}</span>
                          <span
                            className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                              active ? "border-terra" : "border-ink/25"
                            }`}
                            aria-hidden="true"
                          >
                            {active && <span className="w-2 h-2 rounded-full bg-terra" />}
                          </span>
                        </div>
                        <div className="text-xs text-ink-soft mt-1.5">{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Переходим к оплате…
                  </>
                ) : (
                  `Перейти к оплате — ${(selectedService?.price ?? 0).toLocaleString("ru-RU")} ₽`
                )}
              </button>

              <p className="text-xs text-ink-soft flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-terra/70" />
                Платёж защищён. Возврат при отмене — по правилам клиники.
              </p>
            </div>
          </form>
        )}

        {message && (
          <div
            role="status"
            className={`p-4 rounded-2xl border text-sm font-medium ${
              message.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

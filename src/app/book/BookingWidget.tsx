// src/app/book/BookingWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, addMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { createBooking } from "../actions";

interface Service { id: string; title: string; duration: number; price: number; }
interface Doctor { id: string; name: string; specialty: string; }

export default function BookingWidget({ services, doctors }: { services: Service[], doctors: Doctor[] }) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "sbp">("sbp");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDate || !selectedService || !selectedDoctor) return;
    const slots: string[] = [];
    let current = new Date(selectedDate);
    current.setHours(9, 0, 0, 0);

    while (current.getHours() < 18) {
      slots.push(current.toISOString());
      current = addMinutes(current, 30);
    }
    setAvailableSlots(slots);
    setSelectedTime("");
  }, [selectedDate, selectedService, selectedDoctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTime || !selectedDoctor) {
      setMessage({ type: "error", text: "Выберите врача, услугу и время" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("doctorId", selectedDoctor.id);
    formData.append("serviceId", selectedService.id);
    formData.append("startTime", selectedTime);
    formData.append("clientName", clientName);
    formData.append("clientPhone", clientPhone);
    formData.append("clientEmail", clientEmail || "no-email@clinic.ru");

    const result = await createBooking(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
      setIsLoading(false);
      return;
    }

    if (result.success && result.bookingId) {
      try {
        const paymentRes = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selectedService.price,
            description: `Оплата услуги: ${selectedService.title}`,
            bookingId: result.bookingId,
            returnUrl: `${window.location.origin}/book/success`,
            method: paymentMethod,
          }),
        });

        const paymentData = await paymentRes.json();

        if (paymentData.confirmationUrl) {
          window.location.href = paymentData.confirmationUrl;
        } else {
          setMessage({ type: "error", text: "Ошибка создания платежа. Попробуйте позже." });
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Ошибка сети при создании платежа." });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Запись на прием</h2>

      <div className="space-y-6">
        {/* Шаг 1: Врач */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">1. Выберите врача</label>
          <select
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none"
            onChange={(e) => {
              const doc = doctors.find((d) => d.id === e.target.value);
              setSelectedDoctor(doc || null);
            }}
            value={selectedDoctor?.id || ""}
          >
            <option value="">-- Выберите специалиста --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name} — {doc.specialty}</option>
            ))}
          </select>
        </div>

        {/* Шаг 2: Услуга */}
        {selectedDoctor && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">2. Выберите услугу</label>
            <select
              className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none"
              onChange={(e) => {
                const srv = services.find((s) => s.id === e.target.value);
                setSelectedService(srv || null);
              }}
              value={selectedService?.id || ""}
            >
              <option value="">-- Выберите услугу --</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>{srv.title} ({srv.duration} мин.) — {srv.price} ₽</option>
              ))}
            </select>
          </div>
        )}

        {/* Шаг 3: Дата */}
        {selectedService && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">3. Выберите дату</label>
            <div className="border rounded-xl p-2 inline-block">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ru}
                disabled={{ before: new Date() }}
              />
            </div>
          </div>
        )}

        {/* Шаг 4: Время */}
        {selectedDate && selectedService && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">4. Выберите время</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`p-2 text-sm border rounded-lg transition-colors font-medium ${
                    selectedTime === slot
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-teal-500 hover:text-teal-600"
                  }`}
                >
                  {format(new Date(slot), "HH:mm")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Шаг 5: Данные и Оплата */}
        {selectedTime && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700">5. Ваши данные</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ваше имя *"
              />
              <input
                type="tel" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Телефон *"
              />
            </div>

            {/* Выбор оплаты */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Способ оплаты</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("sbp")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "sbp" ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">СБП</div>
                  <div className="text-xs text-gray-500 mt-1">По QR-коду</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "card" ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">Банковская карта</div>
                  <div className="text-xs text-gray-500 mt-1">Visa, Mastercard, МИР</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "Переход к оплате..." : `Перейти к оплате (${selectedService?.price ?? 0} ₽)`}
            </button>
          </form>
        )}

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
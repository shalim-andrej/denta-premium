"use client";

// Форма ручной записи: админ принимает пациента по телефону и заносит его в CRM.
import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { adminCreateBooking } from "../../actions";

interface Service { id: string; title: string; duration: number; price: number; }
interface Doctor { id: string; name: string; specialty: string; }
interface Slot { time: string; doctorId: string; }

export default function AdminBookingForm({
  services,
  doctors,
  initialDoctorId,
  initialDate,
}: {
  services: Service[];
  doctors: Doctor[];
  initialDoctorId?: string;
  initialDate?: string;
}) {
  const [doctorId, setDoctorId] = useState(initialDoctorId || "");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState<Date | undefined>(
    initialDate && !isNaN(new Date(`${initialDate}T00:00:00`).getTime())
      ? new Date(`${initialDate}T00:00:00`)
      : new Date()
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "error" | "success"; text: string; manageUrl?: string } | null>(null);

  useEffect(() => {
    if (!date || !serviceId || !doctorId) {
      // Отложенный вызов: сам эффект синхронно состояние не меняет
      queueMicrotask(() => setSlots([]));
      return;
    }
    const controller = new AbortController();
    queueMicrotask(() => setLoadingSlots(true));
    fetch(`/api/slots?doctorId=${doctorId}&serviceId=${serviceId}&date=${format(date, "yyyy-MM-dd")}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        setSlots(Array.isArray(d.slots) ? d.slots : []);
        setSelectedTime("");
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
    return () => controller.abort();
  }, [date, serviceId, doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !serviceId || !selectedTime) {
      setResult({ type: "error", text: "Выберите врача, услугу и время" });
      return;
    }
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("doctorId", doctorId);
    fd.append("serviceId", serviceId);
    fd.append("startTime", selectedTime);
    fd.append("clientName", name);
    fd.append("clientPhone", phone.replace(/\D/g, ""));
    if (email.trim()) fd.append("clientEmail", email.trim());

    const res = await adminCreateBooking(fd);
    setLoading(false);

    if (res.error) {
      setResult({ type: "error", text: res.error });
      return;
    }
    setResult({
      type: "success",
      text: "Пациент записан. Ссылка управления записью:",
      manageUrl: res.manageToken ? `/booking/${res.manageToken}` : undefined,
    });
    setName("");
    setPhone("");
    setEmail("");
    setSelectedTime("");
  };

  const inputCls =
    "w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[#0e7c57]/30 outline-none";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 max-w-2xl space-y-4">
      <h2 className="font-bold text-gray-800">Записать пациента</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Врач *</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={inputCls} required>
            <option value="">— выберите —</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Услуга *</label>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputCls} required>
            <option value="">— выберите —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.title} — {s.price} ₽</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Дата *</label>
        <div className="border rounded-xl p-2 inline-block">
          <DayPicker mode="single" selected={date} onSelect={setDate} locale={ru} disabled={{ before: new Date() }} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Время *</label>
        {loadingSlots ? (
          <div className="text-sm text-gray-500 py-2">Загрузка слотов...</div>
        ) : slots.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">Нет свободных слотов — врач не работает или всё занято.</div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {slots.map((s) => (
              <button
                key={s.time}
                type="button"
                onClick={() => setSelectedTime(s.time)}
                className={`p-2 text-sm border rounded-lg font-medium transition-colors ${
                  selectedTime === s.time
                    ? "bg-[#0e7c57] text-white border-[#0e7c57]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#0e7c57]"
                }`}
              >
                {format(new Date(s.time), "HH:mm")}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя пациента *" className={inputCls} />
        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон *" className={inputCls} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (для письма)" className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0e7c57] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#0a5e40] transition-colors disabled:opacity-50"
      >
        {loading ? "Сохраняем..." : "Создать запись (подтверждена)"}
      </button>

      {result && (
        <div className={`p-3 rounded-xl text-sm ${result.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {result.text}{" "}
          {result.manageUrl && (
            <Link href={result.manageUrl} className="underline font-medium">
              открыть
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

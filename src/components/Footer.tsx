// src/components/Footer.tsx
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

// Вычисляем год один раз при загрузке модуля (на сервере)
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Бренд */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <span className="text-xl font-bold text-white">DentaPremium</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Премиальная стоматология в Москве. Современное оборудование и врачи с опытом более 10 лет.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="text-white font-bold mb-4">Клиника</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/doctors" className="hover:text-teal-400 transition-colors">Наши врачи</Link></li>
              <li><Link href="/services" className="hover:text-teal-400 transition-colors">Услуги и цены</Link></li>
              <li><Link href="/contacts" className="hover:text-teal-400 transition-colors">Контакты</Link></li>
              <li><Link href="/book" className="hover:text-teal-400 transition-colors">Онлайн-запись</Link></li>
            </ul>
          </div>

          {/* Юридическая информация */}
          <div>
            <h4 className="text-white font-bold mb-4">Документы</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">Политика конфиденциальности</Link></li>
              <li><Link href="/offer" className="hover:text-teal-400 transition-colors">Публичная оферта</Link></li>
              <li><Link href="/license" className="hover:text-teal-400 transition-colors">Лицензия</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-white font-bold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-500 shrink-0" />
                <span>г. Москва, ул. Примерная, д. 1</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-500 shrink-0" />
                <a href="tel:+79990000000" className="hover:text-white transition-colors">+7 (999) 000-00-00</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-500 shrink-0" />
                <a href="mailto:info@dentapremium.ru" className="hover:text-white transition-colors">info@dentapremium.ru</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-500 shrink-0" />
                <span>Ежедневно с 9:00 до 21:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {CURRENT_YEAR} DentaPremium. Все права защищены.</p>
          <p>Лицензия ЛО-77-01-000000 от 01.01.2024</p>
        </div>
      </div>
    </footer>
  );
}
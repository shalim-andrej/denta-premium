// src/components/Logo.tsx
import Link from "next/link";

/*
  Знак clinics — тонкий линейный силуэт зуба без плашки/рамки:
  одна непрерывная кривая, штрих 1.3, текущий цвет текста.
  Рядом — двухстрочный вордмарк: капс Jost с широким трекингом
  и курсивная строка Cormorant снизу.
*/
function ToothMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 26"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.6c-2.1 0-3.4 1-4.9 1-2.6 0-4.4 1.9-4.4 4.5 0 3.1 2.2 5.5 3 8.4.6 2.2 1.1 6.6 2.5 7.5 1.3.9 2.2-.8 2.4-3.3.2-1.9.4-3.6 1.4-3.6s1.2 1.7 1.4 3.6c.2 2.5 1.1 4.2 2.4 3.3 1.4-.9 1.9-5.3 2.5-7.5.8-2.9 3-5.3 3-8.4 0-2.6-1.8-4.5-4.4-4.5-1.5 0-2.8-1-4.9-1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3.5"
      aria-label="DentaPremium — на главную"
    >
      <ToothMark
        className={`${lg ? "w-10" : "w-8"} transition-colors duration-500 text-ink group-hover:text-fern`}
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-label font-semibold uppercase text-ink whitespace-nowrap ${
            lg ? "text-[15px] tracking-[0.3em]" : "text-[12.5px] tracking-[0.26em]"
          }`}
        >
          Denta<span className="text-fern">Premium</span>
        </span>
        <span
          className={`serif-italic text-ink-soft mt-1.5 ${
            lg ? "text-[15px]" : "text-[12px]"
          }`}
        >
          стоматология премиум-класса
        </span>
      </span>
    </Link>
  );
}

// src/components/ScrollReveal.tsx
"use client";

import { useEffect } from "react";

/**
 * Глобальный наблюдатель появления: все элементы с атрибутом [data-reveal]
 * получают класс .is-revealed, когда входят в зону видимости.
 * Задержка каскада задаётся инлайн: style={{ transitionDelay: "0.1s" }}.
 * Уважает prefers-reduced-motion (стили отключены на уровне CSS).
 */
export default function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("is-revealed");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    const attach = () =>
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)")
        .forEach((el) => io.observe(el));

    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

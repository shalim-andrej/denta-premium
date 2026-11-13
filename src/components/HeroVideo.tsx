// src/components/HeroVideo.tsx
"use client";

import { useEffect, useRef } from "react";

/**
 * Видео-фон обложки: автоплей, луп, параллакс при скролле.
 * При prefers-reduced-motion — статичный постер без движения.
 */
export default function HeroVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Статичный постер вместо движения
    if (reduced) {
      video.pause();
      video.removeAttribute("autoplay");
      return;
    }

    // Автоплей с повторной попыткой (мобильные браузеры)
    const tryPlay = () => {
      if (video.paused) video.play().catch(() => {});
    };
    tryPlay();
    document.addEventListener("visibilitychange", tryPlay);

    // Параллакс: видео уезжает медленнее контента + лёгкий зум
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (y > vh * 1.3) return; // герой уже уехал — не считаем
        const shift = y * 0.3;
        const zoom = 1 + Math.min(y / 6000, 0.06);
        wrap.style.transform = `translate3d(0, ${shift}px, 0) scale(${zoom})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", tryPlay);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="absolute inset-0 will-change-transform"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src="/video/hero.mp4"
        poster="/video/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
}

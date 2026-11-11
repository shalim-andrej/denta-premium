// src/app/opengraph-image.tsx
// Динамическая OG-картинка для соцсетей и мессенджеров (1200×630).
// Кириллица гарантирована: шрифт DejaVu Sans Bold лежит рядом и отдаётся в ImageResponse.
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "DentaPremium — премиальная стоматология в Москве";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = await readFile(join(process.cwd(), "src/app/fonts/DejaVuSans-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #134e4a 100%)",
          color: "white",
          position: "relative",
        }}
      >
        {/* мягкое свечение */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: 220,
            width: 760,
            height: 380,
            background: "rgba(45,212,191,0.22)",
            filter: "blur(90px)",
            borderRadius: 9999,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 9999,
            padding: "12px 28px",
            marginBottom: 42,
          }}
        >
          <div style={{ width: 14, height: 14, background: "#2dd4bf", borderRadius: 9999, display: "flex" }} />
          <div style={{ fontSize: 30, color: "#cbd5e1", display: "flex" }}>Премиальная стоматология в Москве</div>
        </div>

        <div style={{ fontSize: 96, fontWeight: 700, display: "flex", letterSpacing: -2 }}>
          Denta<span style={{ color: "#2dd4bf", display: "flex" }}>Premium</span>
        </div>

        <div style={{ fontSize: 40, color: "#94a3b8", marginTop: 34, display: "flex" }}>
          Онлайн-запись за 2 минуты · оплата картой и СБП
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "DejaVu",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}

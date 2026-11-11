// src/app/robots.ts
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Личные кабинеты и API в индекс не нужны
        disallow: ["/admin", "/api", "/booking/", "/login"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}

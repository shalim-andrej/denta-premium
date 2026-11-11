// src/app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/services", "/doctors", "/book", "/contacts", "/privacy", "/offer", "/license"];

  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/book" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/book" ? 0.9 : 0.7,
  }));
}

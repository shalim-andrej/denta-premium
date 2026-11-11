import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdminRequest } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Подделать cookie нельзя: проверяем подписанное значение, а не сам факт наличия
  const authorized = await isAdminRequest(request.cookies.get(ADMIN_COOKIE)?.value);

  // Защищаем все роуты, начинающиеся с /admin
  if (pathname.startsWith("/admin") && !authorized) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Если админ уже залогинен и идет на /login, редиректим в админку
  if (pathname === "/login" && authorized) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Исключаем статику и API из проверки
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

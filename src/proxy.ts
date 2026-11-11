import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("admin_session");

  // Защищаем все роуты, начинающиеся с /admin
  if (pathname.startsWith("/admin") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Если админ уже залогинен и идет на /login, редиректим в админку
  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Исключаем статику и API из проверки
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
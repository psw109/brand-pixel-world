import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/admin/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.ADMIN_SESSION_SECRET;

  const isLogin =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isLogin) {
    if (secret && secret.length >= 32) {
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (token) {
        const ok = await verifyAdminSession(token, secret);
        if (ok) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  if (!secret || secret.length < 32) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const ok = await verifyAdminSession(token, secret);
  if (!ok) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import { signAdminSession, ADMIN_COOKIE_NAME } from "@/lib/admin/token";

export async function POST(request: Request) {
  let body: { id?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  const loginId = process.env.ADMIN_LOGIN_ID;
  const password = process.env.ADMIN_PASSWORD;

  if (!secret || secret.length < 32 || !loginId || !password) {
    return NextResponse.json(
      {
        error:
          "서버에 관리자 로그인 환경변수(ADMIN_*)가 설정되지 않았습니다.",
      },
      { status: 503 },
    );
  }

  if (body.id !== loginId || body.password !== password) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const token = await signAdminSession(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

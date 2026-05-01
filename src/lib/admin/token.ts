import { SignJWT, jwtVerify } from "jose";

/** HttpOnly 쿠키 이름 — 미들웨어·API와 동일해야 함 */
export const ADMIN_COOKIE_NAME = "bpw_admin_session";

const ALG = "HS256";

export async function signAdminSession(secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ role: "admin" as const })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAdminSession(
  token: string,
  secret: string,
): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, {
      algorithms: [ALG],
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

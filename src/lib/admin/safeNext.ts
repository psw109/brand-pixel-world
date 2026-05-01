/**
 * 로그인 후 리다이렉트 — 오픈 리다이렉트 방지 (`/admin` 하위만 허용).
 */
export function safeAdminNextPath(raw: string | null): string {
  if (
    raw &&
    raw.startsWith("/admin") &&
    !raw.startsWith("/admin/login")
  ) {
    return raw;
  }
  return "/admin";
}

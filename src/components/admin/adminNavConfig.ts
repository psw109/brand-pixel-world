export type AdminNavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", match: (p) => p === "/admin" },
  {
    href: "/admin/inquiries",
    label: "문의 목록",
    match: (p) => p === "/admin/inquiries" || p.startsWith("/admin/inquiries/"),
  },
  {
    href: "/admin/progress",
    label: "진행 목록",
    match: (p) => p === "/admin/progress" || p.startsWith("/admin/progress/"),
  },
  {
    href: "/admin/lots",
    label: "부지 목록",
    match: (p) => p === "/admin/lots" || p.startsWith("/admin/lots/"),
  },
];

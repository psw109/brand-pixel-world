"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "./adminNavConfig";

type Props = {
  /** desktop: 좌측 고정(모바일 숨김). drawer: 오버레이 패널 전용 */
  variant?: "desktop" | "drawer";
  /** 링크 클릭 시(모바일 드로어 닫기 등) */
  onNavigate?: () => void;
};

export function AdminSidebar({ variant = "desktop", onNavigate }: Props) {
  const pathname = usePathname() ?? "";

  const asideClass =
    variant === "desktop"
      ? "hidden w-52 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 md:flex"
      : "flex h-full w-[min(17.5rem,88vw)] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 shadow-xl dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <aside className={asideClass}>
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex h-12 shrink-0 items-center border-b border-zinc-200 px-4 text-sm font-semibold tracking-tight text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900 md:h-14"
      >
        LOGO
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 text-sm">
        {ADMIN_NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={
                active
                  ? "rounded-md bg-zinc-900 px-3 py-2.5 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded-md px-3 py-2.5 font-medium text-zinc-700 hover:bg-zinc-200/80 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-800/80"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

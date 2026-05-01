"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

type Props = {
  children: React.ReactNode;
};

export function AdminAppShell({ children }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 md:flex-row">
      <AdminSidebar variant="desktop" />

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-40 flex flex-row md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="관리 메뉴"
        >
          <AdminSidebar
            variant="drawer"
            onNavigate={() => setMobileNavOpen(false)}
          />
          <button
            type="button"
            className="min-h-0 min-w-0 flex-1 bg-black/45"
            aria-label="메뉴 닫기"
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopBar onOpenNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import VillageGame from "@/components/game/VillageGame";

export function VillageShell() {
  return (
    <div className="flex h-[100dvh] flex-col bg-[#1a1a1e]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-700 px-4 py-3 text-zinc-100">
        <h1 className="text-lg font-semibold">마을</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            id="last-hit"
            className="max-w-[min(100vw-2rem,28rem)] truncate text-zinc-400"
          >
            마지막 탭: —
          </span>
          <Link
            href="/"
            className="text-zinc-400 underline-offset-4 hover:text-white hover:underline"
          >
            홈으로
          </Link>
        </div>
      </header>
      <VillageGame />
    </div>
  );
}

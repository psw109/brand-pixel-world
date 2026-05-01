"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { InquiryRow, MapLotRow } from "./mockAdminData";
import {
  LOT_BOARD_COLUMN_LABEL_KO,
  getLotBoardColumn,
} from "@/lib/bpw/lotBoard";
import {
  LOT_INQUIRY_STATUS_LABEL_KO,
  LOT_PHASE_LABEL_KO,
} from "@/lib/bpw/lotInquirySpec";

type Props = {
  lots: MapLotRow[];
  inquiries: InquiryRow[];
};

function lotSummary(lot: MapLotRow, inquiries: InquiryRow[]) {
  const rows = inquiries.filter((i) => i.mapLotId === lot.id);
  const pending = rows.filter((r) => r.status === "pending").length;
  const selected = rows.find((r) => r.status === "selected");
  const rejected = rows.filter((r) => r.status === "rejected").length;
  return {
    rows,
    pending,
    rejected,
    selectedDisplay: selected?.applicantDisplay ?? null,
    total: rows.length,
  };
}

export function AdminLotList({ lots, inquiries }: Props) {
  const sortedLots = useMemo(
    () => [...lots].sort((a, b) => a.lotCode.localeCompare(b.lotCode)),
    [lots],
  );
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {sortedLots.map((lot) => {
          const s = lotSummary(lot, inquiries);
          const boardCol = getLotBoardColumn(lot, inquiries);
          const expanded = openIds.has(lot.id);

          return (
            <li key={lot.id}>
              <button
                type="button"
                onClick={() => toggle(lot.id)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              >
                <span
                  className={`shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${expanded ? "rotate-90" : ""}`}
                  aria-hidden
                >
                  ▸
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {lot.lotCode}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {LOT_BOARD_COLUMN_LABEL_KO[boardCol]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    부지 단계 {LOT_PHASE_LABEL_KO[lot.lotPhase]}
                    {s.selectedDisplay ? (
                      <>
                        {" "}
                        · 선정{" "}
                        <span className="font-medium text-violet-700 dark:text-violet-300">
                          {s.selectedDisplay}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    문의 {s.total}건
                  </p>
                  <p className="text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                    대기 {s.pending} · 반려 {s.rejected}
                  </p>
                </div>
              </button>

              {expanded ? (
                <div className="border-t border-zinc-100 bg-zinc-50/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                  {s.rows.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      아직 문의가 없습니다.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {s.rows.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                        >
                          <div className="min-w-0">
                            <Link
                              href={`/admin/inquiries/${encodeURIComponent(row.id)}`}
                              className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-medium text-zinc-900 underline-offset-2 hover:text-sky-700 hover:underline dark:text-zinc-50 dark:hover:text-sky-400"
                            >
                              <span>{row.applicantDisplay}</span>
                              <span className="text-xs font-normal text-sky-600 dark:text-sky-400">
                                상세 · 수정
                              </span>
                            </Link>
                            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                              {row.contactEmail}
                            </span>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                              {LOT_INQUIRY_STATUS_LABEL_KO[row.status]}
                            </span>
                            <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                              {row.submittedAt}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-center text-xs">
                    <Link
                      href={`/admin/inquiries?lotId=${encodeURIComponent(lot.id)}`}
                      className="font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      문의 목록에서 이 부지만 보기
                    </Link>
                    <span className="mx-2 text-zinc-300 dark:text-zinc-600">|</span>
                    <Link
                      href={`/admin/lots/${encodeURIComponent(lot.id)}`}
                      className="font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      전용 페이지로
                    </Link>
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import type { InquiryRow } from "./mockAdminData";
import { LOT_PHASE_LABEL_KO } from "@/lib/bpw/lotInquirySpec";

function shortUuid(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

function scheduleKindLabel(row: InquiryRow): string {
  if (row.lotPhase === "construction") return "개발 진행";
  if (row.status === "selected" && row.lotPhase === "contact") return "예약 확정";
  return LOT_PHASE_LABEL_KO[row.lotPhase];
}

function scheduleBadgeClass(row: InquiryRow): string {
  if (row.lotPhase === "construction") {
    return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
  }
  if (row.status === "selected" && row.lotPhase === "contact") {
    return "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200";
  }
  return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
}

type TableProps = {
  rows?: InquiryRow[];
  emptyMessage?: string;
};

export function ProgressPipelineTable({
  rows = [],
  emptyMessage = "표시할 일정이 없습니다.",
}: TableProps) {
  const router = useRouter();

  function goDetail(id: string) {
    router.push(`/admin/inquiries/${id}`);
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => goDetail(row.id)}
              className="flex w-full flex-col gap-1 px-2.5 py-2 text-left text-[11px] leading-tight text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100 sm:px-3 sm:text-xs dark:text-zinc-200 dark:hover:bg-zinc-900/60 dark:active:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {row.lotCode}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${scheduleBadgeClass(row)}`}
                >
                  {scheduleKindLabel(row)}
                </span>
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">{row.applicantDisplay}</span>
              <span className="text-zinc-500 dark:text-zinc-500">
                예상 완료{" "}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {row.expectedCompletionAt ?? "—"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] table-fixed text-left text-xs sm:text-sm">
          <colgroup>
            <col className="w-28" />
            <col className="w-28" />
            <col />
            <col className="w-28" />
            <col className="w-28" />
          </colgroup>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <tr>
              <th className="px-2 py-2 font-medium sm:px-2.5">부지 코드</th>
              <th className="px-2 py-2 font-medium sm:px-2.5" title="map_lot.id">
                부지 ID
              </th>
              <th className="px-2 py-2 font-medium sm:px-2.5">신청자</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">예상 완료</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">구분</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr
                key={row.id}
                role="link"
                tabIndex={0}
                title="행을 눌러 상세로 이동"
                className="cursor-pointer text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900/50 dark:active:bg-zinc-900"
                onClick={() => goDetail(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goDetail(row.id);
                  }
                }}
              >
                <td className="truncate px-2 py-1.5 font-mono text-[11px] font-semibold tabular-nums sm:px-2.5 sm:text-xs">
                  {row.lotCode}
                </td>
                <td
                  className="truncate px-2 py-1.5 font-mono text-[10px] text-zinc-500 sm:px-2.5 sm:text-[11px] dark:text-zinc-400"
                  title={row.mapLotId}
                >
                  {shortUuid(row.mapLotId)}
                </td>
                <td className="truncate px-2 py-1.5 sm:px-2.5">{row.applicantDisplay}</td>
                <td className="truncate px-2 py-1.5 tabular-nums text-zinc-700 dark:text-zinc-300 sm:px-2.5">
                  {row.expectedCompletionAt ?? "—"}
                </td>
                <td className="px-2 py-1.5 sm:px-2.5">
                  <span
                    className={`inline-flex max-w-full truncate rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs ${scheduleBadgeClass(row)}`}
                  >
                    {scheduleKindLabel(row)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

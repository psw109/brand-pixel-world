import Link from "next/link";
import { LOT_BOARD_COLUMN_LABEL_KO } from "@/lib/bpw/lotBoard";
import { LOT_PHASE_LABEL_KO } from "@/lib/bpw/lotInquirySpec";
import type { ProgressLotRow } from "@/lib/bpw/progressLots";

function shortUuid(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

function badgeClass(col: ProgressLotRow["boardColumn"]): string {
  switch (col) {
    case "development":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
    case "done":
      return "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100";
    case "reserved":
      return "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200";
    case "inquiry":
    default:
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
  }
}

type Props = {
  rows: ProgressLotRow[];
  emptyMessage?: string;
};

export function ProgressLotsTable({
  rows,
  emptyMessage = "표시할 부지가 없습니다.",
}: Props) {
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
          <li key={row.mapLotId}>
            <Link
              href={`/admin/lots/${encodeURIComponent(row.mapLotId)}`}
              className="flex flex-col gap-1 px-3 py-3 text-left text-[11px] leading-tight text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100 sm:text-xs dark:text-zinc-200 dark:hover:bg-zinc-900/60"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  {row.lotCode}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badgeClass(row.boardColumn)}`}
                >
                  {LOT_BOARD_COLUMN_LABEL_KO[row.boardColumn]}
                </span>
              </div>
              <span className="text-zinc-500 dark:text-zinc-400">
                부지 {LOT_PHASE_LABEL_KO[row.lotPhase]} · 문의 {row.inquiryCount}건
                {row.selectedApplicant ? ` · 선정 ${row.selectedApplicant}` : ""}
              </span>
              <span className="text-zinc-500">
                예상 일정{" "}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {row.expectedCompletionAt ?? "—"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[880px] table-fixed text-left text-xs sm:text-sm">
          <colgroup>
            <col className="w-24" />
            <col className="w-28" />
            <col className="w-36" />
            <col />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-36" />
          </colgroup>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <tr>
              <th className="px-2 py-2 font-medium sm:px-2.5">부지</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">부지 ID</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">부지 단계</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">운영 구분</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">문의</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">예상 일정</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">바로가기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.mapLotId} className="text-zinc-800 dark:text-zinc-200">
                <td className="truncate px-2 py-1.5 font-mono text-[11px] font-semibold sm:px-2.5 sm:text-xs">
                  {row.lotCode}
                </td>
                <td
                  className="truncate px-2 py-1.5 font-mono text-[10px] text-zinc-500 sm:px-2.5 sm:text-[11px] dark:text-zinc-400"
                  title={row.mapLotId}
                >
                  {shortUuid(row.mapLotId)}
                </td>
                <td className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400 sm:px-2.5">
                  <span className="font-mono text-[11px]">{row.lotPhase}</span>
                  <span className="ml-1 text-zinc-500">
                    ({LOT_PHASE_LABEL_KO[row.lotPhase]})
                  </span>
                </td>
                <td className="px-2 py-1.5 sm:px-2.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${badgeClass(row.boardColumn)}`}
                  >
                    {LOT_BOARD_COLUMN_LABEL_KO[row.boardColumn]}
                  </span>
                </td>
                <td className="px-2 py-1.5 tabular-nums text-zinc-600 dark:text-zinc-400 sm:px-2.5">
                  {row.inquiryCount}건
                  {row.pendingCount > 0 ? ` · 대기 ${row.pendingCount}` : ""}
                  {row.selectedApplicant ? (
                    <span className="mt-0.5 block truncate text-[11px] text-violet-700 dark:text-violet-300">
                      선정 {row.selectedApplicant}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[11px] text-zinc-400">선정 없음</span>
                  )}
                </td>
                <td className="truncate px-2 py-1.5 tabular-nums text-zinc-700 dark:text-zinc-300 sm:px-2.5">
                  {row.expectedCompletionAt ?? "—"}
                </td>
                <td className="px-2 py-1.5 sm:px-2.5">
                  <Link
                    href={`/admin/lots/${encodeURIComponent(row.mapLotId)}`}
                    className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-400"
                  >
                    부지 · 문의
                  </Link>
                  <Link
                    href={`/admin/inquiries?lotId=${encodeURIComponent(row.mapLotId)}`}
                    className="ml-2 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    필터
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

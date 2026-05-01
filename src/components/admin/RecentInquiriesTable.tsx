"use client";

import { useRouter } from "next/navigation";
import type { InquiryRow } from "./mockAdminData";
import { MOCK_RECENT_INQUIRIES } from "./mockAdminData";
import {
  LOT_INQUIRY_STATUS_LABEL_KO,
  LOT_PHASE_LABEL_KO,
} from "@/lib/bpw/lotInquirySpec";
import type { LotInquiryStatus, LotPhase } from "@/lib/bpw/lotInquirySpec";

function inquiryStatusClass(status: LotInquiryStatus) {
  switch (status) {
    case "pending":
      return "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200";
    case "selected":
      return "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200";
    case "rejected":
      return "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}

function shortUuid(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

function lotPhaseClass(phase: LotPhase) {
  switch (phase) {
    case "vacant":
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
    case "contact":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
    case "construction":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
    case "built":
      return "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}

type TableProps = {
  /** 미지정 시 목업 전체 */
  rows?: InquiryRow[];
  emptyMessage?: string;
  /** 대시보드 등에서 1…n 접수 순서 표시 */
  receiptOrderStart?: number;
};

export function RecentInquiriesTable({
  rows: rowsProp,
  emptyMessage = "표시할 문의가 없습니다.",
  receiptOrderStart = 0,
}: TableProps) {
  const router = useRouter();
  const rows = rowsProp ?? MOCK_RECENT_INQUIRIES;

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
        {rows.map((row, i) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => goDetail(row.id)}
              className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-2 text-left text-[11px] leading-tight text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100 sm:px-3 sm:text-xs dark:text-zinc-200 dark:hover:bg-zinc-900/60 dark:active:bg-zinc-900"
            >
              {receiptOrderStart > 0 ? (
                <span className="shrink-0 w-5 tabular-nums text-zinc-400 dark:text-zinc-500">
                  {receiptOrderStart + i}
                </span>
              ) : null}
              <span className="shrink-0 font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {row.lotCode}
              </span>
              <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{row.applicantDisplay}</span>
                <span className="text-zinc-400 dark:text-zinc-500"> · </span>
                <span>{row.contactEmail}</span>
                {row.phoneNumber ? (
                  <>
                    <span className="text-zinc-400 dark:text-zinc-500"> · </span>
                    <span>{row.phoneNumber}</span>
                  </>
                ) : null}
              </span>
              <span className="flex w-full flex-wrap items-center gap-1.5 pl-0">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${inquiryStatusClass(row.status)}`}
                >
                  문의 {LOT_INQUIRY_STATUS_LABEL_KO[row.status]}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${lotPhaseClass(row.lotPhase)}`}
                >
                  부지 {LOT_PHASE_LABEL_KO[row.lotPhase]}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[960px] table-fixed text-left text-xs sm:text-sm">
          <colgroup>
            <col className="w-10" />
            <col className="w-24" />
            <col className="w-28" />
            <col />
            <col className="w-44" />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-36" />
          </colgroup>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <tr>
              <th className="px-2 py-2 font-medium sm:px-2.5" title="목록에서의 접수 순서">
                #
              </th>
              <th className="px-2 py-2 font-medium sm:px-2.5">부지 코드</th>
              <th className="px-2 py-2 font-medium sm:px-2.5" title="map_lot.id">
                부지 ID
              </th>
              <th className="px-2 py-2 font-medium sm:px-2.5">신청인</th>
              <th className="px-2 py-2 font-medium sm:px-2.5">메일 · 연락처</th>
              <th className="px-2 py-2 font-medium sm:px-2.5" title="lot_inquiry.status">
                문의 상태
              </th>
              <th className="px-2 py-2 font-medium sm:px-2.5" title="map_lot.lot_phase">
                부지 단계
              </th>
              <th className="px-2 py-2 font-medium sm:px-2.5">접수일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row, i) => (
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
                <td className="px-2 py-1.5 tabular-nums text-zinc-400 sm:px-2.5 dark:text-zinc-500">
                  {receiptOrderStart > 0 ? receiptOrderStart + i : "—"}
                </td>
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
                <td className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400 sm:px-2.5">
                  <div className="truncate">{row.contactEmail}</div>
                  {row.phoneNumber ? (
                    <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-500">
                      {row.phoneNumber}
                    </div>
                  ) : null}
                </td>
                <td className="px-2 py-1.5 sm:px-2.5">
                  <span
                    className={`inline-flex max-w-full rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs ${inquiryStatusClass(row.status)}`}
                  >
                    {LOT_INQUIRY_STATUS_LABEL_KO[row.status]}
                  </span>
                </td>
                <td className="px-2 py-1.5 sm:px-2.5">
                  <span
                    className={`inline-flex max-w-full rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs ${lotPhaseClass(row.lotPhase)}`}
                  >
                    {LOT_PHASE_LABEL_KO[row.lotPhase]}
                  </span>
                </td>
                <td className="truncate px-2 py-1.5 tabular-nums text-zinc-600 dark:text-zinc-400 sm:px-2.5">
                  {row.submittedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

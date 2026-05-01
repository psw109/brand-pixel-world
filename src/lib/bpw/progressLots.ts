/**
 * `/admin/progress` — 예약 확정(reserved) 이후 필지만 (문의·접수 단계 제외)
 */

import type { LotBoardColumnId } from "./lotBoard";
import { getLotBoardColumn, type MapLotLike } from "./lotBoard";
import type { LotInquiryStatus, LotPhase } from "./lotInquirySpec";

export type ProgressPageStage = "pipeline" | "reserved" | "construction" | "built";

export const PROGRESS_PAGE_STAGES = [
  "pipeline",
  "reserved",
  "construction",
  "built",
] as const satisfies readonly ProgressPageStage[];

/** URL `?stage=` — 예전 presales 는 예약 확정(reserved) 탭으로 매핑 */
export function parseProgressPageStage(
  value: string | null | undefined,
): ProgressPageStage {
  if (value === "reserved" || value === "construction" || value === "built") {
    return value;
  }
  if (value === "presales") return "reserved";
  if (value === "pipeline") return "pipeline";
  return "pipeline";
}

export const PROGRESS_PAGE_STAGE_LABEL_KO: Record<ProgressPageStage, string> = {
  pipeline: "전체",
  reserved: "예약 확정",
  construction: "개발 진행",
  built: "완료",
};

export type ProgressLotInquiryLike = {
  mapLotId: string;
  status: LotInquiryStatus;
  applicantDisplay: string;
  expectedCompletionAt: string | null;
};

export type ProgressLotRow = {
  mapLotId: string;
  lotCode: string;
  lotPhase: LotPhase;
  boardColumn: LotBoardColumnId;
  inquiryCount: number;
  pendingCount: number;
  selectedApplicant: string | null;
  expectedCompletionAt: string | null;
};

export function buildProgressLotRows<
  L extends MapLotLike & { lotCode: string },
  I extends ProgressLotInquiryLike,
>(lots: L[], inquiries: I[]): ProgressLotRow[] {
  return lots.map((lot) => {
    const lotInquiries = inquiries.filter((i) => i.mapLotId === lot.id);
    const pendingCount = lotInquiries.filter((i) => i.status === "pending").length;
    const selected = lotInquiries.find((i) => i.status === "selected");
    const expectedDates = lotInquiries
      .map((i) => i.expectedCompletionAt)
      .filter((d): d is string => Boolean(d))
      .sort();
    const expectedCompletionAt =
      selected?.expectedCompletionAt ?? expectedDates[0] ?? null;

    return {
      mapLotId: lot.id,
      lotCode: lot.lotCode,
      lotPhase: lot.lotPhase,
      boardColumn: getLotBoardColumn(lot, inquiries),
      inquiryCount: lotInquiries.length,
      pendingCount,
      selectedApplicant: selected?.applicantDisplay ?? null,
      expectedCompletionAt,
    };
  });
}

/** 문의·접수(inquiry) 단계는 모든 탭에서 제외 */
function withoutInquiryPhase(rows: ProgressLotRow[]): ProgressLotRow[] {
  return rows.filter((r) => r.boardColumn !== "inquiry");
}

export function filterProgressLotRows(
  rows: ProgressLotRow[],
  stage: ProgressPageStage,
): ProgressLotRow[] {
  const base = withoutInquiryPhase(rows);
  switch (stage) {
    case "pipeline":
      return base;
    case "reserved":
      return base.filter((r) => r.boardColumn === "reserved");
    case "construction":
      return base.filter((r) => r.boardColumn === "development");
    case "built":
      return base.filter((r) => r.boardColumn === "done");
    default:
      return base;
  }
}

export function sortProgressLotRows(rows: ProgressLotRow[]): ProgressLotRow[] {
  return [...rows].sort((a, b) => {
    if (!a.expectedCompletionAt && !b.expectedCompletionAt) {
      return a.lotCode.localeCompare(b.lotCode);
    }
    if (!a.expectedCompletionAt) return 1;
    if (!b.expectedCompletionAt) return -1;
    const c = a.expectedCompletionAt.localeCompare(b.expectedCompletionAt);
    return c !== 0 ? c : a.lotCode.localeCompare(b.lotCode);
  });
}

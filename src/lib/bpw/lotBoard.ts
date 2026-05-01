/**
 * 운영 화면용 부지 칸반 열 — map_lot.lot_phase + 해당 부지 문의 중 선정 여부
 */

import type { LotInquiryStatus, LotPhase } from "./lotInquirySpec";

export const LOT_BOARD_COLUMN_IDS = [
  "inquiry",
  "reserved",
  "development",
  "done",
] as const;
export type LotBoardColumnId = (typeof LOT_BOARD_COLUMN_IDS)[number];

/** 칸반 헤더 · 카드 배치 기준 */
export const LOT_BOARD_COLUMN_LABEL_KO: Record<LotBoardColumnId, string> = {
  inquiry: "문의·접수",
  reserved: "예약 진행",
  development: "개발 진행",
  done: "완료",
};

export type MapLotLike = { id: string; lotPhase: LotPhase };

export type InquiryRefLike = {
  mapLotId: string;
  status: LotInquiryStatus;
};

/**
 * - 완료: lot_phase = built
 * - 개발: lot_phase = construction
 * - 예약: contact 이고 해당 부지에 selected 문의 1건 이상
 * - 문의: vacant 또는 (contact 이지만 아직 선정 없음)
 */
export function getLotBoardColumn(
  lot: MapLotLike,
  inquiries: InquiryRefLike[],
): LotBoardColumnId {
  const lotRows = inquiries.filter((i) => i.mapLotId === lot.id);
  const hasSelected = lotRows.some((r) => r.status === "selected");

  if (lot.lotPhase === "built") return "done";
  if (lot.lotPhase === "construction") return "development";
  if (lot.lotPhase === "contact") {
    return hasSelected ? "reserved" : "inquiry";
  }
  return "inquiry";
}

export function countLotsByBoardColumn<T extends MapLotLike>(
  lots: T[],
  inquiries: InquiryRefLike[],
): Record<LotBoardColumnId, number> {
  const counts: Record<LotBoardColumnId, number> = {
    inquiry: 0,
    reserved: 0,
    development: 0,
    done: 0,
  };
  for (const lot of lots) {
    counts[getLotBoardColumn(lot, inquiries)] += 1;
  }
  return counts;
}

/** 부지 목록 필터 — 칸반 열을 3묶음으로 묶음 */
export const LOT_LIST_STAGE_FILTERS = ["presales", "development", "done"] as const;
export type LotListStageFilter =
  | "all"
  | (typeof LOT_LIST_STAGE_FILTERS)[number];

export const LOT_LIST_STAGE_LABEL_KO: Record<LotListStageFilter, string> = {
  all: "전체",
  presales: "문의·예약 단계",
  development: "개발 진행",
  done: "완료",
};

/** `/admin/lots?phase=` */
export function parseLotListStageFilter(value: string | null): LotListStageFilter {
  if (value === "presales" || value === "development" || value === "done") {
    return value;
  }
  return "all";
}

export function matchesLotListStageFilter(
  lot: MapLotLike,
  inquiries: InquiryRefLike[],
  filter: LotListStageFilter,
): boolean {
  if (filter === "all") return true;
  const col = getLotBoardColumn(lot, inquiries);
  if (filter === "presales") return col === "inquiry" || col === "reserved";
  if (filter === "development") return col === "development";
  if (filter === "done") return col === "done";
  return true;
}

export function filterLotsByStageFilter<T extends MapLotLike>(
  lots: T[],
  inquiries: InquiryRefLike[],
  filter: LotListStageFilter,
): T[] {
  return lots.filter((lot) => matchesLotListStageFilter(lot, inquiries, filter));
}

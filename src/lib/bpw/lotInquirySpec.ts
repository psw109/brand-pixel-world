/**
 * BPW DB 명세 참고용 상수 (DB 미생성 — 앱·목업만 정렬)
 * @see 프로젝트 내 맵·부지 DB 명세 (lot_inquiry, map_lot.lot_phase)
 */

/** `lot_inquiry.status` CHECK */
export const LOT_INQUIRY_STATUSES = ["pending", "selected", "rejected"] as const;
export type LotInquiryStatus = (typeof LOT_INQUIRY_STATUSES)[number];

export const LOT_INQUIRY_STATUS_LABEL_KO: Record<LotInquiryStatus, string> = {
  pending: "대기",
  selected: "선정",
  rejected: "반려",
};

/** `map_lot.lot_phase` 캐시 */
export const LOT_PHASES = ["vacant", "contact", "construction", "built"] as const;
export type LotPhase = (typeof LOT_PHASES)[number];

export const LOT_PHASE_LABEL_KO: Record<LotPhase, string> = {
  vacant: "공실",
  contact: "문의",
  construction: "공사",
  built: "완료",
};

export type InquiryPipelineRow = {
  status: LotInquiryStatus;
  lotPhase: LotPhase;
};

/** 진행 목록: 부지가 아직 오픈 전인 단계 (명세 §3 흐름상 운영 화면용) */
export function isLotPhaseOnProgressKanban(phase: LotPhase): boolean {
  return phase === "contact" || phase === "construction";
}

/**
 * 예약 확정(선정·개발 전) + 개발 진행(공사)만 — 부지 `contact` 이지만 아직 선정 전인 문의는 제외.
 */
export function isRowOnDevelopmentSchedule(row: InquiryPipelineRow): boolean {
  return (
    row.lotPhase === "construction" ||
    (row.status === "selected" && row.lotPhase === "contact")
  );
}

export function parseLotInquiryStatusQuery(
  value: string | null,
): LotInquiryStatus | null {
  if (!value) return null;
  if ((LOT_INQUIRY_STATUSES as readonly string[]).includes(value)) {
    return value as LotInquiryStatus;
  }
  return null;
}

/** `/admin/inquiries?focus=` — 부지 단계 기준 목록 뷰 */
export const INQUIRY_LIST_FOCUS_VALUES = ["development", "completed"] as const;
export type InquiryListFocus =
  | "all"
  | (typeof INQUIRY_LIST_FOCUS_VALUES)[number];

export function parseInquiryListFocus(value: string | null): InquiryListFocus {
  if (value === "development" || value === "completed") return value;
  return "all";
}

/** 대시보드 상단 4칸 — DB 컬럼 조합(목업·집계 규칙) */
export const DASHBOARD_PIPELINE_KEYS = [
  "inquiry",
  "reserved",
  "development",
  "completed",
] as const;
export type DashboardPipelineKey = (typeof DASHBOARD_PIPELINE_KEYS)[number];

export const DASHBOARD_PIPELINE_LABEL_KO: Record<DashboardPipelineKey, string> = {
  inquiry: "문의 접수",
  reserved: "예약 확정",
  development: "개발 진행",
  completed: "개발 완료",
};

/**
 * - 문의 접수: 검토 대기 문의(`lot_inquiry.status === pending`)
 * - 예약 확정: 선정됐으나 아직 공사 단계 전(`selected` + `lot_phase === contact`)
 * - 개발 진행: 공사 중(`lot_phase === construction`)
 * - 개발 완료: 건축·오픈 완료 단계(`lot_phase === built`)
 */
export function matchesDashboardPipelineKey(
  row: InquiryPipelineRow,
  key: DashboardPipelineKey,
): boolean {
  switch (key) {
    case "inquiry":
      return row.status === "pending";
    case "reserved":
      return row.status === "selected" && row.lotPhase === "contact";
    case "development":
      return row.lotPhase === "construction";
    case "completed":
      return row.lotPhase === "built";
    default:
      return false;
  }
}

export function countDashboardPipeline<T extends InquiryPipelineRow>(
  rows: T[],
): Record<DashboardPipelineKey, number> {
  return {
    inquiry: rows.filter((r) => matchesDashboardPipelineKey(r, "inquiry")).length,
    reserved: rows.filter((r) => matchesDashboardPipelineKey(r, "reserved")).length,
    development: rows.filter((r) =>
      matchesDashboardPipelineKey(r, "development"),
    ).length,
    completed: rows.filter((r) => matchesDashboardPipelineKey(r, "completed")).length,
  };
}

/** `/admin/progress?stage=` — 목록 필터 */
export const PROGRESS_LIST_STAGES = [
  "pipeline",
  "reserved",
  "construction",
  "built",
] as const;
export type ProgressListStage = (typeof PROGRESS_LIST_STAGES)[number];

export function parseProgressListStage(
  value: string | null | undefined,
): ProgressListStage {
  if (
    value &&
    (PROGRESS_LIST_STAGES as readonly string[]).includes(value)
  ) {
    return value as ProgressListStage;
  }
  return "pipeline";
}

export function filterRowsForProgressList<T extends InquiryPipelineRow>(
  rows: T[],
  stage: ProgressListStage,
): T[] {
  switch (stage) {
    case "reserved":
      return rows.filter(
        (r) => r.status === "selected" && r.lotPhase === "contact",
      );
    case "construction":
      return rows.filter((r) => r.lotPhase === "construction");
    case "built":
      return rows.filter((r) => r.lotPhase === "built");
    case "pipeline":
    default:
      return rows.filter((r) => isRowOnDevelopmentSchedule(r));
  }
}

import type {
  InquiryListFocus,
  LotInquiryStatus,
  LotPhase,
} from "@/lib/bpw/lotInquirySpec";
import {
  countDashboardPipeline,
  isLotPhaseOnProgressKanban,
  isRowOnDevelopmentSchedule,
  LOT_INQUIRY_STATUSES,
  parseLotInquiryStatusQuery,
} from "@/lib/bpw/lotInquirySpec";

export type {
  InquiryListFocus,
  LotInquiryStatus,
  LotPhase,
} from "@/lib/bpw/lotInquirySpec";

/** URL `?status=` — lot_inquiry.status 값만 허용 */
export { parseLotInquiryStatusQuery as parseInquiryStatusQuery };

/** 문의 목록 필터 옵션 (DB 컬럼값과 동일) */
export const INQUIRY_STATUS_OPTIONS = LOT_INQUIRY_STATUSES;

/** `map_lot` 한 행 (부지 단계의 단일 소스) */
export type MapLotRow = {
  id: string;
  lotCode: string;
  lotPhase: LotPhase;
};

export const MOCK_MAP_LOTS: MapLotRow[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    lotCode: "A-03",
    lotPhase: "contact",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    lotCode: "B-12",
    lotPhase: "construction",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    lotCode: "C-01",
    lotPhase: "built",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    lotCode: "D-07",
    lotPhase: "contact",
  },
  {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    lotCode: "E-99",
    lotPhase: "built",
  },
  {
    id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    lotCode: "F-01",
    lotPhase: "contact",
  },
];

const LOT_LOOKUP = new Map(MOCK_MAP_LOTS.map((l) => [l.id, l]));

function attachLotFields<T extends { mapLotId: string }>(
  row: T,
): T & { lotCode: string; lotPhase: LotPhase } {
  const lot = LOT_LOOKUP.get(row.mapLotId);
  if (!lot) {
    throw new Error(`mock: unknown map_lot id ${row.mapLotId}`);
  }
  return { ...row, lotCode: lot.lotCode, lotPhase: lot.lotPhase };
}

export type InquiryRow = {
  id: string;
  mapLotId: string;
  lotCode: string;
  applicantDisplay: string;
  contactEmail: string;
  phoneNumber: string | null;
  status: LotInquiryStatus;
  lotPhase: LotPhase;
  submittedAt: string;
  expectedCompletionAt: string | null;
};

export type InquiryDetail = InquiryRow & {
  applicantIdentityJson: string;
  message: string | null;
};

type InquirySeed = Omit<InquiryRow, "lotCode" | "lotPhase"> & {
  applicantIdentityJson: string;
  message: string | null;
};

const INQUIRY_SEEDS: InquirySeed[] = [
  {
    id: "1",
    mapLotId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    applicantDisplay: "홍길동",
    contactEmail: "hong@example.com",
    phoneNumber: "010-1234-5678",
    status: "pending",
    submittedAt: "2026-04-01 10:20",
    expectedCompletionAt: null,
    applicantIdentityJson: '{"type":"individual","name":"홍길동"}',
    message: "입점 문의드립니다.",
  },
  {
    id: "4",
    mapLotId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    applicantDisplay: "이세컨",
    contactEmail: "second@example.com",
    phoneNumber: null,
    status: "pending",
    submittedAt: "2026-04-01 15:00",
    expectedCompletionAt: null,
    applicantIdentityJson: '{"type":"company","name":"이세컨"}',
    message: null,
  },
  {
    id: "5",
    mapLotId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    applicantDisplay: "박서드",
    contactEmail: "third@example.com",
    phoneNumber: "02-000-0000",
    status: "rejected",
    submittedAt: "2026-04-02 09:30",
    expectedCompletionAt: null,
    applicantIdentityJson: '{"type":"individual","name":"박서드"}',
    message: null,
  },
  {
    id: "2",
    mapLotId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    applicantDisplay: "(주)픽셀",
    contactEmail: "pixel@example.com",
    phoneNumber: null,
    status: "selected",
    submittedAt: "2026-04-02 14:05",
    expectedCompletionAt: "2026-06-30",
    applicantIdentityJson: '{"type":"company","name":"(주)픽셀","regNo":"000-00-00000"}',
    message: "브랜드 소개 첨부 예정",
  },
  {
    id: "3",
    mapLotId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    applicantDisplay: "김브랜",
    contactEmail: "brand@example.com",
    phoneNumber: null,
    status: "selected",
    submittedAt: "2026-04-03 09:00",
    expectedCompletionAt: "2026-04-10",
    applicantIdentityJson: '{"type":"individual","name":"김브랜"}',
    message: null,
  },
  {
    id: "6",
    mapLotId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    applicantDisplay: "최런칭",
    contactEmail: "launch@example.com",
    phoneNumber: "010-9999-0000",
    status: "pending",
    submittedAt: "2026-04-04 11:00",
    expectedCompletionAt: null,
    applicantIdentityJson: '{"type":"company","name":"최런칭"}',
    message: "오픈 일정 문의",
  },
  {
    id: "7",
    mapLotId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    applicantDisplay: "정오픈",
    contactEmail: "open@example.com",
    phoneNumber: null,
    status: "rejected",
    submittedAt: "2026-03-20 18:00",
    expectedCompletionAt: "2026-03-25",
    applicantIdentityJson: '{"type":"individual","name":"정오픈"}',
    message: null,
  },
  {
    id: "8",
    mapLotId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    applicantDisplay: "(주)예약확",
    contactEmail: "reserve@example.com",
    phoneNumber: "010-2000-3000",
    status: "selected",
    submittedAt: "2026-04-05 09:15",
    expectedCompletionAt: "2026-07-15",
    applicantIdentityJson: '{"type":"company","name":"(주)예약확"}',
    message: "선정 후 일정 협의 중",
  },
];

export const MOCK_INQUIRIES: InquiryDetail[] =
  INQUIRY_SEEDS.map((seed) => attachLotFields(seed));

export const MOCK_RECENT_INQUIRIES: InquiryRow[] = MOCK_INQUIRIES;

export const MOCK_DASHBOARD_PIPELINE_COUNTS =
  countDashboardPipeline(MOCK_RECENT_INQUIRIES);

/** @deprecated 상단 카드가 파이프라인 4분할로 바뀜 — `MOCK_DASHBOARD_PIPELINE_COUNTS` 사용 */
export const MOCK_STAT_COUNTS = {
  pending: MOCK_DASHBOARD_PIPELINE_COUNTS.inquiry,
  selected:
    MOCK_DASHBOARD_PIPELINE_COUNTS.reserved +
    MOCK_DASHBOARD_PIPELINE_COUNTS.development,
  rejected: MOCK_RECENT_INQUIRIES.filter((r) => r.status === "rejected").length,
};

/** 대시보드 KPI·`?focus=` — 문의 행의 부지 단계(`lot_phase` 목업) 기준 */
export function filterInquiriesByListFocus<T extends Pick<InquiryRow, "lotPhase">>(
  rows: T[],
  focus: InquiryListFocus,
): T[] {
  if (focus === "all") return rows;
  if (focus === "development") {
    return rows.filter((r) => r.lotPhase === "construction");
  }
  if (focus === "completed") {
    return rows.filter((r) => r.lotPhase === "built");
  }
  return rows;
}

export function sortInquiriesBySubmittedDesc<T extends InquiryRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function sortPipelineByExpectedDateAsc<T extends InquiryRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (!a.expectedCompletionAt && !b.expectedCompletionAt) return 0;
    if (!a.expectedCompletionAt) return 1;
    if (!b.expectedCompletionAt) return -1;
    return a.expectedCompletionAt.localeCompare(b.expectedCompletionAt);
  });
}

export function filterInquiriesDevelopmentSchedule(rows: InquiryRow[]): InquiryRow[] {
  return rows.filter((r) => isRowOnDevelopmentSchedule(r));
}

export function filterInquiriesOnLotPhasePipeline(rows: InquiryRow[]): InquiryRow[] {
  return rows.filter((r) => isLotPhaseOnProgressKanban(r.lotPhase));
}

/** @deprecated 이름 호환 */
export const filterInquiriesInProgress = filterInquiriesOnLotPhasePipeline;

export function getInquiryById(id: string): InquiryDetail | null {
  return MOCK_INQUIRIES.find((r) => r.id === id) ?? null;
}

export function getMapLotById(id: string): MapLotRow | null {
  return MOCK_MAP_LOTS.find((l) => l.id === id) ?? null;
}

export function getInquiriesForLot(mapLotId: string): InquiryDetail[] {
  return MOCK_INQUIRIES.filter((r) => r.mapLotId === mapLotId);
}

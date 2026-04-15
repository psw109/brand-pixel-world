/** 직사각형 footprint (앵커 타일 + 가로×세로). 기획 §5.3.2 프로토타입 방식. */
export type RectFootprint = {
  kind: "rect";
  anchor: { x: number; y: number };
  w: number;
  h: number;
};

export type PlacedLot = {
  id: string;
  footprint: RectFootprint;
};

export type PlacedBuilding = {
  id: string;
  footprint: RectFootprint;
};

/** 월드 탭 결과 — 오버레이/스토어로 넘기기 위한 최소 페이로드 */
export type WorldTapPayload =
  | { kind: "lot"; lotId: string }
  | { kind: "building"; buildingId: string };

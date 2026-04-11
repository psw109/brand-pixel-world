import type { PlacedBuilding, PlacedLot, PlacedNpc } from "@/types/world";

/**
 * 수동 테스트용 샘플: 2칸 부지, 4칸 부지, 건물 1개 이상.
 * 타일 좌표는 왼쪽 위가 (0,0), x는 오른쪽, y는 아래.
 */
export const SAMPLE_LOTS: PlacedLot[] = [
  {
    id: "lot_2x1",
    footprint: { kind: "rect", anchor: { x: 3, y: 2 }, w: 2, h: 1 },
  },
  {
    id: "lot_2x2",
    footprint: { kind: "rect", anchor: { x: 8, y: 4 }, w: 2, h: 2 },
  },
];

export const SAMPLE_BUILDINGS: PlacedBuilding[] = [
  {
    id: "building_cafe_01",
    footprint: { kind: "rect", anchor: { x: 14, y: 3 }, w: 1, h: 2 },
  },
  {
    id: "building_shop_02",
    footprint: { kind: "rect", anchor: { x: 18, y: 6 }, w: 3, h: 1 },
  },
];

/** 그리드 가시 영역(바닥 타일 수) — 카메라 클램프·배경 크기 참고 */
export const SAMPLE_MAP_TILES = { width: 32, height: 20 };

export const SAMPLE_NPCS: PlacedNpc[] = [
  { id: "npc_01", tx: 6, ty: 6 },
  { id: "npc_02", tx: 11, ty: 9 },
  { id: "npc_03", tx: 23, ty: 7 },
];

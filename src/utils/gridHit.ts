import type {
  PlacedBuilding,
  PlacedLot,
  RectFootprint,
  WorldTapPayload,
} from "@/types/world";

/** 직사각형 타일(가로·세로 픽셀 크기가 다를 수 있음) */
export type GridMetrics = {
  tileW: number;
  tileH: number;
};

export function worldToTile(
  wx: number,
  wy: number,
  g: GridMetrics,
): { tx: number; ty: number } {
  return {
    tx: Math.floor(wx / g.tileW),
    ty: Math.floor(wy / g.tileH),
  };
}

export function tileToWorldTopLeft(
  tx: number,
  ty: number,
  g: GridMetrics,
): { x: number; y: number } {
  return { x: tx * g.tileW, y: ty * g.tileH };
}

export function rectFootprintContainsTile(
  fp: RectFootprint,
  tx: number,
  ty: number,
): boolean {
  const { anchor, w, h } = fp;
  return (
    tx >= anchor.x &&
    tx < anchor.x + w &&
    ty >= anchor.y &&
    ty < anchor.y + h
  );
}

/**
 * 건물 → 부지 순 (같은 타일이면 건물이 위).
 */
export function hitTestWorld(
  wx: number,
  wy: number,
  buildings: PlacedBuilding[],
  lots: PlacedLot[],
  g: GridMetrics,
): WorldTapPayload | null {
  const { tx, ty } = worldToTile(wx, wy, g);
  for (const b of buildings) {
    if (rectFootprintContainsTile(b.footprint, tx, ty)) {
      return { kind: "building", buildingId: b.id };
    }
  }
  for (const lot of lots) {
    if (rectFootprintContainsTile(lot.footprint, tx, ty)) {
      return { kind: "lot", lotId: lot.id };
    }
  }
  return null;
}

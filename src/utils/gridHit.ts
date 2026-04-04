import type {
  PlacedBuilding,
  PlacedLot,
  PlacedNpc,
  RectFootprint,
  WorldTapPayload,
} from "@/types/world";

export const TILE_SIZE = 32;

/** WorldScene NPC 스프라이트와 동일 — 히트 판정에 사용 */
export const NPC_DISPLAY_W = TILE_SIZE * 0.9;
export const NPC_DISPLAY_H = TILE_SIZE * 1.3;

function pointInNpcHitBox(wx: number, wy: number, npc: PlacedNpc): boolean {
  const cx = npc.tx * TILE_SIZE + TILE_SIZE / 2;
  const cy = npc.ty * TILE_SIZE + TILE_SIZE / 2;
  const hw = NPC_DISPLAY_W / 2;
  const hh = NPC_DISPLAY_H / 2;
  return wx >= cx - hw && wx <= cx + hw && wy >= cy - hh && wy <= cy + hh;
}

export function tileToWorldTopLeft(
  tx: number,
  ty: number,
): { x: number; y: number } {
  return { x: tx * TILE_SIZE, y: ty * TILE_SIZE };
}

export function worldToTile(wx: number, wy: number): { tx: number; ty: number } {
  return {
    tx: Math.floor(wx / TILE_SIZE),
    ty: Math.floor(wy / TILE_SIZE),
  };
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
 * 건물 → 부지 → NPC 순 (같은 위치에 겹치면 앞선 타입이 우선).
 */
export function hitTestWorld(
  wx: number,
  wy: number,
  buildings: PlacedBuilding[],
  lots: PlacedLot[],
  npcs: PlacedNpc[] = [],
): WorldTapPayload | null {
  const { tx, ty } = worldToTile(wx, wy);
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
  for (const npc of npcs) {
    if (pointInNpcHitBox(wx, wy, npc)) {
      return { kind: "npc", npcId: npc.id };
    }
  }
  return null;
}

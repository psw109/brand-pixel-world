import type { RectFootprint } from "@/types/world";

export type FootprintEntity = { id: string; footprint: RectFootprint };

function rectTiles(fp: RectFootprint): Set<string> {
  const { anchor, w, h } = fp;
  const set = new Set<string>();
  for (let ty = anchor.y; ty < anchor.y + h; ty++) {
    for (let tx = anchor.x; tx < anchor.x + w; tx++) {
      set.add(`${tx},${ty}`);
    }
  }
  return set;
}

function rectsOverlap(a: RectFootprint, b: RectFootprint): boolean {
  const ta = rectTiles(a);
  const tb = rectTiles(b);
  for (const k of ta) {
    if (tb.has(k)) return true;
  }
  return false;
}

export type OverlapPair = { a: string; b: string };

/**
 * 서로 다른 엔티티 footprint가 겹치면 쌍을 반환한다.
 * 기획 §5.3.3: 부지·건물 간 겹침 금지 검증용.
 */
export function findFootprintOverlaps(
  entities: FootprintEntity[],
): OverlapPair[] {
  const pairs: OverlapPair[] = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const ei = entities[i];
      const ej = entities[j];
      if (rectsOverlap(ei.footprint, ej.footprint)) {
        pairs.push({ a: ei.id, b: ej.id });
      }
    }
  }
  return pairs;
}

export function hasFootprintOverlap(entities: FootprintEntity[]): boolean {
  return findFootprintOverlaps(entities).length > 0;
}

/** DB `map.tile_px` — 정사각 타일 한 변(px). 반드시 양수. */
export function squareTilePixelSize(tilePx: number): {
  tileWidthPx: number;
  tileHeightPx: number;
} {
  if (!Number.isFinite(tilePx) || tilePx <= 0) {
    throw new Error(
      `map.tile_px 는 양의 유한 숫자여야 합니다 (받은 값: ${String(tilePx)})`,
    );
  }
  return { tileWidthPx: tilePx, tileHeightPx: tilePx };
}

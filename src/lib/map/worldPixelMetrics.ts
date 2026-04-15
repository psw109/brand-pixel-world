/** 기획: 36×20 타일 월드가 이 픽셀 크기로 표시됨 (타일당 가로·세로 비율 분리) */
export const MAIN_MAP_PIXEL_WIDTH = 1902.85;
export const MAIN_MAP_PIXEL_HEIGHT = 1080;

export function tilePixelSizeForMap(
  widthTiles: number,
  heightTiles: number,
): { tileWidthPx: number; tileHeightPx: number } {
  return {
    tileWidthPx: MAIN_MAP_PIXEL_WIDTH / widthTiles,
    tileHeightPx: MAIN_MAP_PIXEL_HEIGHT / heightTiles,
  };
}

import type { RectFootprint } from "@/types/world";

/** DB `area` jsonb와 동일 계약 */
export type MapAreaJson = {
  tile_x: number;
  tile_y: number;
  width_tiles: number;
  height_tiles: number;
};

export function areaToRectFootprint(area: MapAreaJson): RectFootprint {
  return {
    kind: "rect",
    anchor: { x: area.tile_x, y: area.tile_y },
    w: area.width_tiles,
    h: area.height_tiles,
  };
}

export type WorldMapBundle = {
  map: {
    id: string;
    slug: string;
    widthTiles: number;
    heightTiles: number;
    defaultGroundTileKey: string;
    defaultGroundSpritePath: string | null;
    /** DB `map.tile_px` — 정사각 타일 한 변(px), NOT NULL */
    tilePx: number;
    tileWidthPx: number;
    tileHeightPx: number;
  };
  /** 희소 바닥 덮어쓰기 (없는 칸은 기본 바닥 스프라이트) */
  tiles: {
    tileX: number;
    tileY: number;
    tileKey: string;
    spritePath: string | null;
  }[];
  lots: {
    id: string;
    lotPhase: string;
    area: MapAreaJson;
    spritePath: string;
  }[];
  objects: {
    id: string;
    objectKey: string;
    area: MapAreaJson;
    spritePath: string;
  }[];
  buildings: {
    id: string;
    lotId: string;
    area: MapAreaJson;
    spritePath: string | null;
  }[];
};

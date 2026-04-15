import type Phaser from "phaser";
import type { WorldMapBundle } from "@/lib/map/worldMapTypes";
import { areaToRectFootprint } from "@/lib/map/worldMapTypes";
import { findFootprintOverlaps } from "@/utils/footprintCollision";
import type { PlacedBuilding, PlacedLot } from "@/types/world";
import { MAP_ASSET_KEYS } from "./mapAssets";

const DEPTH_BASE = 0;
const DEPTH_TILE_OVERLAY = 1;
const DEPTH_OBJECT = 2;
const DEPTH_LOT = 3;
const DEPTH_BUILDING = 4;

function rectCenterWorld(
  area: { tile_x: number; tile_y: number; width_tiles: number; height_tiles: number },
  tileW: number,
  tileH: number,
): { cx: number; cy: number } {
  const cx = (area.tile_x + area.width_tiles / 2) * tileW;
  const cy = (area.tile_y + area.height_tiles / 2) * tileH;
  return { cx, cy };
}

/**
 * Supabase에서 받은 번들로 바닥·(희소 타일)·오브젝트·부지·건물을 그린다.
 * 스프라이트 파일은 `loadMapAssets`에서 미리 로드한 `/public/assets/*` 키를 사용한다.
 */
export function renderWorldMap(
  scene: Phaser.Scene,
  bundle: WorldMapBundle,
): void {
  const tw = bundle.map.tileWidthPx;
  const th = bundle.map.tileHeightPx;
  const gw = bundle.map.widthTiles;
  const gh = bundle.map.heightTiles;

  const lotsPlaced: PlacedLot[] = bundle.lots.map((l) => ({
    id: l.id,
    footprint: areaToRectFootprint(l.area),
  }));
  const buildingsPlaced: PlacedBuilding[] = bundle.buildings.map((b) => ({
    id: b.id,
    footprint: areaToRectFootprint(b.area),
  }));

  const allEntities = [
    ...lotsPlaced.map((l) => ({ id: l.id, footprint: l.footprint })),
    ...buildingsPlaced.map((b) => ({ id: b.id, footprint: b.footprint })),
    ...bundle.objects.map((o) => ({
      id: o.id,
      footprint: areaToRectFootprint(o.area),
    })),
  ];
  const overlaps = findFootprintOverlaps(allEntities);
  if (overlaps.length > 0) {
    console.warn("[renderWorldMap] footprint 겹침:", overlaps);
  }

  for (let x = 0; x < gw; x++) {
    for (let y = 0; y < gh; y++) {
      scene.add
        .image(x * tw + tw / 2, y * th + th / 2, MAP_ASSET_KEYS.road)
        .setDisplaySize(tw, th)
        .setDepth(DEPTH_BASE);
    }
  }

  for (const t of bundle.tiles) {
    const { cx, cy } = rectCenterWorld(
      {
        tile_x: t.tileX,
        tile_y: t.tileY,
        width_tiles: 1,
        height_tiles: 1,
      },
      tw,
      th,
    );
    scene.add
      .image(cx, cy, MAP_ASSET_KEYS.road)
      .setDisplaySize(tw, th)
      .setDepth(DEPTH_TILE_OVERLAY);
  }

  for (const obj of bundle.objects) {
    const { cx, cy } = rectCenterWorld(obj.area, tw, th);
    scene.add
      .image(cx, cy, MAP_ASSET_KEYS.road)
      .setDisplaySize(obj.area.width_tiles * tw, obj.area.height_tiles * th)
      .setDepth(DEPTH_OBJECT);
  }

  for (const lot of bundle.lots) {
    const { cx, cy } = rectCenterWorld(lot.area, tw, th);
    scene.add
      .image(cx, cy, MAP_ASSET_KEYS.lot)
      .setDisplaySize(lot.area.width_tiles * tw, lot.area.height_tiles * th)
      .setDepth(DEPTH_LOT)
      .setAlpha(0.92);
  }

  for (const b of bundle.buildings) {
    const { cx, cy } = rectCenterWorld(b.area, tw, th);
    scene.add
      .image(cx, cy, MAP_ASSET_KEYS.building)
      .setDisplaySize(b.area.width_tiles * tw, b.area.height_tiles * th)
      .setDepth(DEPTH_BUILDING);
  }
}

export function bundleToPlacedLots(bundle: WorldMapBundle): PlacedLot[] {
  return bundle.lots.map((l) => ({
    id: l.id,
    footprint: areaToRectFootprint(l.area),
  }));
}

export function bundleToPlacedBuildings(bundle: WorldMapBundle): PlacedBuilding[] {
  return bundle.buildings.map((b) => ({
    id: b.id,
    footprint: areaToRectFootprint(b.area),
  }));
}

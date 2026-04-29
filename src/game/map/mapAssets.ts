import type Phaser from "phaser";
import type { WorldMapBundle } from "@/lib/map/worldMapTypes";

/** 월드 맵 기본 텍스처 키 (DB 경로가 없거나 로드 맵에 없을 때 fallback) */
export const MAP_ASSET_KEYS = {
  road: "texRoad",
  lot: "texLot",
  building: "texBuilding",
} as const;

const DEFAULT_URLS = {
  road: "/assets/road.png",
  lot: "/assets/lot.jpg",
  building: "/assets/building.png",
} as const;

/** DB `sprite_path` (예: `/assets/foo.png`) → Phaser load 키 */
const pathToPhaserKey = new Map<string, string>();
let dynamicSeq = 0;

function resetPathRegistry(): void {
  pathToPhaserKey.clear();
  dynamicSeq = 0;
}

function collectUniqueSpritePaths(bundle: WorldMapBundle): string[] {
  const raw: (string | null | undefined)[] = [
    ...bundle.tiles.map((t) => t.spritePath),
    ...bundle.lots.map((l) => l.spritePath),
    ...bundle.objects.map((o) => o.spritePath),
    ...bundle.buildings.map((b) => b.spritePath),
  ];
  return [...new Set(raw.filter((p): p is string => Boolean(p)))];
}

/** 기본 텍스처 + 번들에 나온 모든 `sprite_path`를 preload; 렌더는 `textureKeyForSpritePath`. */
export function loadMapAssets(scene: Phaser.Scene, bundle: WorldMapBundle): void {
  resetPathRegistry();

  scene.load.image(MAP_ASSET_KEYS.road, DEFAULT_URLS.road);
  pathToPhaserKey.set(DEFAULT_URLS.road, MAP_ASSET_KEYS.road);
  scene.load.image(MAP_ASSET_KEYS.lot, DEFAULT_URLS.lot);
  pathToPhaserKey.set(DEFAULT_URLS.lot, MAP_ASSET_KEYS.lot);
  scene.load.image(MAP_ASSET_KEYS.building, DEFAULT_URLS.building);
  pathToPhaserKey.set(DEFAULT_URLS.building, MAP_ASSET_KEYS.building);

  for (const url of collectUniqueSpritePaths(bundle)) {
    if (pathToPhaserKey.has(url)) continue;
    const key = `mapDyn_${dynamicSeq++}`;
    pathToPhaserKey.set(url, key);
    scene.load.image(key, url);
  }
}

export function textureKeyForSpritePath(
  path: string | null | undefined,
  fallback: (typeof MAP_ASSET_KEYS)[keyof typeof MAP_ASSET_KEYS],
): string {
  if (!path) return fallback;
  return pathToPhaserKey.get(path) ?? fallback;
}

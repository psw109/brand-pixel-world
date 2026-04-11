import type Phaser from "phaser";

/** 월드 맵에서 사용하는 정적 에셋 키·경로 */
export const MAP_ASSET_KEYS = {
  road: "texRoad",
  lot: "texLot",
  building: "texBuilding",
  npc: "texNpc",
} as const;

export function loadMapAssets(scene: Phaser.Scene): void {
  scene.load.image(MAP_ASSET_KEYS.road, "/assets/road.png");
  scene.load.image(MAP_ASSET_KEYS.lot, "/assets/lot.jpg");
  scene.load.image(MAP_ASSET_KEYS.building, "/assets/building.png");
  scene.load.image(MAP_ASSET_KEYS.npc, "/assets/npc.png");
}

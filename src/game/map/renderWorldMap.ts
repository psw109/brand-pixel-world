import type Phaser from "phaser";
import {
  SAMPLE_BUILDINGS,
  SAMPLE_LOTS,
  SAMPLE_MAP_TILES,
  SAMPLE_NPCS,
} from "@/data/sampleWorld";
import { findFootprintOverlaps } from "@/utils/footprintCollision";
import { NPC_DISPLAY_H, NPC_DISPLAY_W, TILE_SIZE } from "@/utils/gridHit";
import { MAP_ASSET_KEYS } from "./mapAssets";

const DEPTH_ROAD = 0;
const DEPTH_LOT = 1;
const DEPTH_BUILDING = 2;
const DEPTH_NPC = 3;

/**
 * 샘플 데이터 기준으로 바닥(길)·부지·건물·NPC를 씬에 그린다.
 */
export function renderWorldMap(scene: Phaser.Scene): void {
  const allEntities = [
    ...SAMPLE_LOTS.map((l) => ({ id: l.id, footprint: l.footprint })),
    ...SAMPLE_BUILDINGS.map((b) => ({ id: b.id, footprint: b.footprint })),
  ];
  const overlaps = findFootprintOverlaps(allEntities);
  if (overlaps.length > 0) {
    console.warn("[renderWorldMap] footprint 겹침:", overlaps);
  }

  for (let x = 0; x < SAMPLE_MAP_TILES.width; x++) {
    for (let y = 0; y < SAMPLE_MAP_TILES.height; y++) {
      scene.add
        .image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          MAP_ASSET_KEYS.road,
        )
        .setDisplaySize(TILE_SIZE, TILE_SIZE)
        .setDepth(DEPTH_ROAD);
    }
  }

  for (const lot of SAMPLE_LOTS) {
    const { anchor, w, h } = lot.footprint;
    const cx = (anchor.x + w / 2) * TILE_SIZE;
    const cy = (anchor.y + h / 2) * TILE_SIZE;
    scene.add
      .image(cx, cy, MAP_ASSET_KEYS.lot)
      .setDisplaySize(w * TILE_SIZE, h * TILE_SIZE)
      .setDepth(DEPTH_LOT)
      .setAlpha(0.92);
  }

  for (const b of SAMPLE_BUILDINGS) {
    const { anchor, w, h } = b.footprint;
    const cx = (anchor.x + w / 2) * TILE_SIZE;
    const cy = (anchor.y + h / 2) * TILE_SIZE;
    scene.add
      .image(cx, cy, MAP_ASSET_KEYS.building)
      .setDisplaySize(w * TILE_SIZE, h * TILE_SIZE)
      .setDepth(DEPTH_BUILDING);
  }

  for (const npc of SAMPLE_NPCS) {
    scene.add
      .image(
        npc.tx * TILE_SIZE + TILE_SIZE / 2,
        npc.ty * TILE_SIZE + TILE_SIZE / 2,
        MAP_ASSET_KEYS.npc,
      )
      .setDisplaySize(NPC_DISPLAY_W, NPC_DISPLAY_H)
      .setDepth(DEPTH_NPC);
  }
}

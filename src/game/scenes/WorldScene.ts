import * as Phaser from "phaser";
import type { WorldMapBundle } from "@/lib/map/worldMapTypes";
import type { WorldTapPayload } from "@/types/world";
import { hitTestWorld } from "@/utils/gridHit";
import type { WorldMapInputHandle } from "../map";
import {
  bundleToPlacedBuildings,
  bundleToPlacedLots,
  loadMapAssets,
  renderWorldMap,
  setupWorldCamera,
  setupWorldMapInput,
} from "../map";

export const WORLD_BUNDLE_REGISTRY_KEY = "worldBundle";

export class WorldScene extends Phaser.Scene {
  private mapInput: WorldMapInputHandle | null = null;

  constructor() {
    super({ key: "WorldScene" });
  }

  preload(): void {
    loadMapAssets(this);
  }

  create(): void {
    const bundle = this.registry.get(
      WORLD_BUNDLE_REGISTRY_KEY,
    ) as WorldMapBundle | undefined;
    if (!bundle) {
      throw new Error(
        `[WorldScene] registry에 ${WORLD_BUNDLE_REGISTRY_KEY} 가 없습니다.`,
      );
    }

    renderWorldMap(this, bundle);

    const cam = this.cameras.main;
    setupWorldCamera(cam, bundle);

    const g = { tileW: bundle.map.tileWidthPx, tileH: bundle.map.tileHeightPx };
    const lots = bundleToPlacedLots(bundle);
    const buildings = bundleToPlacedBuildings(bundle);

    this.mapInput = setupWorldMapInput(this, cam, (wx, wy) => {
      const hit = hitTestWorld(wx, wy, buildings, lots, g);
      this.emitWorldTap(hit);
    });

    this.sys.events.once("shutdown", () => {
      this.mapInput?.destroy();
      this.mapInput = null;
    });
  }

  private emitWorldTap(payload: WorldTapPayload | null): void {
    const el = document.getElementById("last-hit");

    if (!payload) {
      if (el) el.textContent = "마지막 탭: (빈 땅)";
      this.events.emit("world-tap", null);
      return;
    }
    if (payload.kind === "building") {
      if (el) el.textContent = `마지막 탭: building_id = ${payload.buildingId}`;
    } else {
      if (el) el.textContent = `마지막 탭: lot_id = ${payload.lotId}`;
    }
    this.events.emit("world-tap", payload);
    console.log("[world-tap]", payload);
  }
}

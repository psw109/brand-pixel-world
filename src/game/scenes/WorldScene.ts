import * as Phaser from "phaser";
import {
  SAMPLE_BUILDINGS,
  SAMPLE_LOTS,
  SAMPLE_NPCS,
} from "@/data/sampleWorld";
import type { WorldTapPayload } from "@/types/world";
import { hitTestWorld } from "@/utils/gridHit";
import type { NpcSpeechBubbleController, WorldMapInputHandle } from "../map";
import {
  createNpcSpeechBubble,
  loadMapAssets,
  renderWorldMap,
  setupWorldCamera,
  setupWorldMapInput,
} from "../map";

export class WorldScene extends Phaser.Scene {
  private npcSpeech: NpcSpeechBubbleController | null = null;
  private mapInput: WorldMapInputHandle | null = null;

  constructor() {
    super({ key: "WorldScene" });
  }

  preload(): void {
    loadMapAssets(this);
  }

  create(): void {
    renderWorldMap(this);

    const cam = this.cameras.main;
    setupWorldCamera(cam);

    this.npcSpeech = createNpcSpeechBubble(this, SAMPLE_NPCS);

    this.mapInput = setupWorldMapInput(this, cam, (wx, wy) => {
      const hit = hitTestWorld(wx, wy, SAMPLE_BUILDINGS, SAMPLE_LOTS, SAMPLE_NPCS);
      this.emitWorldTap(hit);
    });

    this.sys.events.once("shutdown", () => {
      this.mapInput?.destroy();
      this.mapInput = null;
      this.npcSpeech?.clear();
      this.npcSpeech = null;
    });
  }

  private emitWorldTap(payload: WorldTapPayload | null): void {
    const el = document.getElementById("last-hit");
    const speech = this.npcSpeech;

    if (!payload) {
      speech?.clear();
      if (el) el.textContent = "마지막 탭: (빈 땅)";
      this.events.emit("world-tap", null);
      return;
    }
    if (payload.kind === "building") {
      speech?.clear();
      if (el) el.textContent = `마지막 탭: building_id = ${payload.buildingId}`;
    } else if (payload.kind === "lot") {
      speech?.clear();
      if (el) el.textContent = `마지막 탭: lot_id = ${payload.lotId}`;
    } else {
      speech?.showForNpc(payload.npcId);
      if (el) el.textContent = `마지막 탭: npc = ${payload.npcId}`;
    }
    this.events.emit("world-tap", payload);
    console.log("[world-tap]", payload);
  }
}

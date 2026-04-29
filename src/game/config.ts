import * as Phaser from "phaser";
import type { WorldMapBundle } from "@/lib/map/worldMapTypes";
import { WORLD_BUNDLE_REGISTRY_KEY, WorldScene } from "./scenes/WorldScene";

const CANVAS_MIN_W = 320;
const CANVAS_MIN_H = 240;

/** Phaser 초기 캔버스 크기. 부모가 아직 0×0이면 window 기준(다음 틱에 Scale.RESIZE로 맞춤). */
function initialCanvasSize(parent: HTMLElement): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 960, height: 640 };
  }
  const pw = parent.clientWidth;
  const ph = parent.clientHeight;
  const useWindow = pw <= 0 || ph <= 0;
  const rw = useWindow ? window.innerWidth : pw;
  const rh = useWindow ? window.innerHeight : ph;
  return {
    width: Math.max(CANVAS_MIN_W, Math.floor(rw)),
    height: Math.max(CANVAS_MIN_H, Math.floor(rh)),
  };
}

export function createGame(
  parent: HTMLElement,
  worldBundle: WorldMapBundle,
): Phaser.Game {
  const { width, height } = initialCanvasSize(parent);

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: "#1a1a1e",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    scene: [WorldScene],
    banner: false,
    callbacks: {
      preBoot: (game) => {
        game.registry.set(WORLD_BUNDLE_REGISTRY_KEY, worldBundle);
      },
      postBoot: (game) => {
        game.scale.refresh();
      },
    },
  });
}

import * as Phaser from "phaser";
import type { WorldMapBundle } from "@/lib/map/worldMapTypes";
import { WORLD_BUNDLE_REGISTRY_KEY, WorldScene } from "./scenes/WorldScene";

export function createGame(
  parent: HTMLElement,
  worldBundle: WorldMapBundle,
): Phaser.Game {
  const w =
    typeof window !== "undefined" ? Math.min(window.innerWidth, 960) : 960;
  const h =
    typeof window !== "undefined" ? Math.min(window.innerHeight, 640) : 640;

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: w,
    height: h,
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

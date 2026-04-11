import * as Phaser from "phaser";
import { WORLD_HEIGHT, WORLD_WIDTH } from "./constants";
import { WorldScene } from "./scenes/WorldScene";

export function createGame(parent: HTMLElement): Phaser.Game {
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
      postBoot: (game) => {
        game.scale.refresh();
      },
    },
  });
}

export { WORLD_WIDTH, WORLD_HEIGHT };

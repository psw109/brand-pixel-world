import type Phaser from "phaser";
import type { WorldMapBundle } from "@/lib/map/worldMapTypes";
import { CAMERA_ZOOM } from "../constants";

export function setupWorldCamera(
  camera: Phaser.Cameras.Scene2D.Camera,
  bundle: WorldMapBundle,
): void {
  const w = bundle.map.widthTiles * bundle.map.tileWidthPx;
  const h = bundle.map.heightTiles * bundle.map.tileHeightPx;
  camera.setBounds(0, 0, w, h);
  camera.setZoom(CAMERA_ZOOM);
  camera.centerOn(w / 2, h / 2);
  camera.roundPixels = false;
}

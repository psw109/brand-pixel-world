import type Phaser from "phaser";
import type { WorldMapBundle } from "@/lib/map/worldMapTypes";
import { MAP_CAMERA_FIT_INSET } from "../constants";

/** 월드 전체가 뷰에 들어가도록 zoom·중심을 맞춘다. */
export function setupWorldCamera(
  camera: Phaser.Cameras.Scene2D.Camera,
  bundle: WorldMapBundle,
): void {
  const w = bundle.map.widthTiles * bundle.map.tileWidthPx;
  const h = bundle.map.heightTiles * bundle.map.tileHeightPx;
  camera.setBounds(0, 0, w, h);

  const camW = Math.max(1, camera.width);
  const camH = Math.max(1, camera.height);
  const fitZoom = Math.min(camW / w, camH / h) * MAP_CAMERA_FIT_INSET;
  camera.setZoom(Math.max(fitZoom, 0.05));
  camera.centerOn(w / 2, h / 2);
  camera.roundPixels = false;
}

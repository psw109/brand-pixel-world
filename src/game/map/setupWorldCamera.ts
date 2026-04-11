import type Phaser from "phaser";
import { CAMERA_ZOOM, WORLD_HEIGHT, WORLD_WIDTH } from "../constants";

export function setupWorldCamera(camera: Phaser.Cameras.Scene2D.Camera): void {
  camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  camera.setZoom(CAMERA_ZOOM);
  camera.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  camera.roundPixels = false;
}

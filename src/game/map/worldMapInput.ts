import type Phaser from "phaser";
import { MAP_DRAG_THRESHOLD_PX } from "./mapConstants";

export type WorldMapTapCallback = (worldX: number, worldY: number) => void;

export type WorldMapInputHandle = {
  /** 등록한 리스너 제거 (씬 종료 시 등) */
  destroy: () => void;
};

/**
 * 맵 패닝(드래그) + 짧은 탭 시 월드 좌표 콜백.
 */
export function setupWorldMapInput(
  scene: Phaser.Scene,
  camera: Phaser.Cameras.Scene2D.Camera,
  onWorldTap: WorldMapTapCallback,
  dragThresholdPx: number = MAP_DRAG_THRESHOLD_PX,
): WorldMapInputHandle {
  let lastPointerDown = { x: 0, y: 0 };
  let dragPointerPrev = { x: 0, y: 0 };
  let isDragging = false;

  const onDown = (p: Phaser.Input.Pointer) => {
    lastPointerDown = { x: p.x, y: p.y };
    dragPointerPrev = { x: p.x, y: p.y };
    isDragging = false;
  };

  const onMove = (p: Phaser.Input.Pointer) => {
    if (!p.isDown) return;
    const dxFromDown = p.x - lastPointerDown.x;
    const dyFromDown = p.y - lastPointerDown.y;
    if (Math.hypot(dxFromDown, dyFromDown) > dragThresholdPx) {
      isDragging = true;
    }
    const dx = p.x - dragPointerPrev.x;
    const dy = p.y - dragPointerPrev.y;
    dragPointerPrev = { x: p.x, y: p.y };
    const z = camera.zoom;
    camera.scrollX -= dx / z;
    camera.scrollY -= dy / z;
  };

  const onUp = (p: Phaser.Input.Pointer) => {
    if (isDragging) return;
    onWorldTap(p.worldX, p.worldY);
  };

  scene.input.on("pointerdown", onDown);
  scene.input.on("pointermove", onMove);
  scene.input.on("pointerup", onUp);

  return {
    destroy: () => {
      scene.input.off("pointerdown", onDown);
      scene.input.off("pointermove", onMove);
      scene.input.off("pointerup", onUp);
    },
  };
}

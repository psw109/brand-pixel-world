import type Phaser from "phaser";
import type { PlacedNpc } from "@/types/world";
import { NPC_DISPLAY_H, TILE_SIZE } from "@/utils/gridHit";
import {
  MAP_SPEECH_BUBBLE_DEPTH,
  NPC_BUBBLE_GAP,
  NPC_BUBBLE_PADDING,
  NPC_BUBBLE_TEXT_WRAP,
} from "./mapConstants";

export type NpcSpeechBubbleController = {
  clear: () => void;
  showForNpc: (npcId: string) => void;
};

/**
 * 월드 좌표에 네모 말풍선을 띄운다. `npcs`는 위치 조회용(렌더와 동일 목록을 넘길 것).
 */
export function createNpcSpeechBubble(
  scene: Phaser.Scene,
  npcs: readonly PlacedNpc[],
): NpcSpeechBubbleController {
  let bubble: Phaser.GameObjects.Container | null = null;

  const clear = () => {
    if (bubble) {
      bubble.destroy(true);
      bubble = null;
    }
  };

  const showForNpc = (npcId: string) => {
    clear();
    const npc = npcs.find((n) => n.id === npcId);
    if (!npc) return;

    const cx = npc.tx * TILE_SIZE + TILE_SIZE / 2;
    const cy = npc.ty * TILE_SIZE + TILE_SIZE / 2;
    const body = `안녕하세요.\n${npcId}입니다`;

    const label = scene.add
      .text(0, 0, body, {
        fontFamily:
          'system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
        fontSize: "14px",
        color: "#1a1a1a",
        align: "center",
        wordWrap: { width: NPC_BUBBLE_TEXT_WRAP },
      })
      .setOrigin(0.5);

    const bw = Math.max(120, label.width + NPC_BUBBLE_PADDING * 2);
    const bh = label.height + NPC_BUBBLE_PADDING * 2;
    const bg = scene.add
      .rectangle(0, 0, bw, bh, 0xf7f7f7, 1)
      .setStrokeStyle(2, 0x444444);

    const bubbleY = cy - NPC_DISPLAY_H / 2 - NPC_BUBBLE_GAP - bh / 2;
    const container = scene.add.container(cx, bubbleY, [bg, label]);
    container.setDepth(MAP_SPEECH_BUBBLE_DEPTH);
    bubble = container;
  };

  return { clear, showForNpc };
}

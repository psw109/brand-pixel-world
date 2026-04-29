"use client";

import { useEffect, useRef } from "react";

/**
 * 1) Supabase에서 맵 번들 로드
 * 2) `createGame` → preBoot에 번들 등록 → preload에서 에셋 로드 → create에서 렌더·카메라
 * Phaser는 동적 import로 클라이언트 전용 유지.
 */
export default function VillageGame() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{ destroy: (removeCanvas: boolean) => void } | null>(
    null,
  );

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    let cancelled = false;

    void (async () => {
      const [{ createGame }, { loadWorldMapBundle }] = await Promise.all([
        import("@/game/config"),
        import("@/lib/map/loadWorldMap"),
      ]);
      if (cancelled || !hostRef.current) return;
      try {
        const bundle = await loadWorldMapBundle("main");
        if (cancelled || !hostRef.current) return;
        const game = createGame(hostRef.current, bundle);
        if (cancelled) {
          game.destroy(true);
          return;
        }
        gameRef.current = game;
      } catch (e) {
        console.error("[VillageGame] 맵 로드 실패", e);
      }
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="bpw-game-host min-h-0 w-full flex-1"
      style={{ touchAction: "none" }}
    />
  );
}

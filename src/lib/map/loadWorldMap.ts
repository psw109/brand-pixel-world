import { supabaseBrowserClient } from "@/lib/supabase/client";
import { tilePixelSizeForMap } from "@/lib/map/worldPixelMetrics";
import type { MapAreaJson, WorldMapBundle } from "@/lib/map/worldMapTypes";

/** PostgREST 임베드는 many-to-one이어도 클라이언트 타입이 배열로 올 수 있음 */
function embedOne<T>(v: T | T[] | null | undefined): T | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parseArea(raw: unknown): MapAreaJson {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid area json");
  }
  const o = raw as Record<string, unknown>;
  const tile_x = Number(o.tile_x);
  const tile_y = Number(o.tile_y);
  const width_tiles = Number(o.width_tiles);
  const height_tiles = Number(o.height_tiles);
  if (
    ![tile_x, tile_y, width_tiles, height_tiles].every((n) =>
      Number.isFinite(n),
    )
  ) {
    throw new Error("area fields must be numbers");
  }
  return { tile_x, tile_y, width_tiles, height_tiles };
}

/**
 * slug 기본 `main` — Supabase `map` + 관련 테이블을 한 번에 불러 Phaser에 넘길 번들.
 */
export async function loadWorldMapBundle(
  slug: string = "main",
): Promise<WorldMapBundle> {
  const supabase = supabaseBrowserClient;

  const { data: mapRow, error: mapErr } = await supabase
    .from("map")
    .select(
      "id, slug, width_tiles, height_tiles, default_ground_tile_key, tile_px",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (mapErr) throw mapErr;
  if (!mapRow) {
    throw new Error(`맵을 찾을 수 없습니다 (slug=${slug})`);
  }

  const { tileWidthPx, tileHeightPx } = tilePixelSizeForMap(
    mapRow.width_tiles,
    mapRow.height_tiles,
  );

  const { data: defTile } = await supabase
    .from("tile_type")
    .select("sprite_path")
    .eq("tile_key", mapRow.default_ground_tile_key)
    .maybeSingle();

  const { data: allTileTypes } = await supabase
    .from("tile_type")
    .select("tile_key, sprite_path");

  const spriteByTileKey = new Map(
    (allTileTypes ?? []).map((t) => [t.tile_key, t.sprite_path as string | null]),
  );

  const { data: tileRows, error: tileErr } = await supabase
    .from("map_tile")
    .select("tile_x, tile_y, tile_key")
    .eq("map_id", mapRow.id);

  if (tileErr) throw tileErr;

  const tiles = (tileRows ?? []).map((r) => ({
    tileX: r.tile_x,
    tileY: r.tile_y,
    tileKey: r.tile_key,
    spritePath: spriteByTileKey.get(r.tile_key) ?? null,
  }));

  const { data: lotRows, error: lotErr } = await supabase
    .from("map_lot")
    .select("id, lot_phase, area, lot_type(sprite_path)")
    .eq("map_id", mapRow.id);

  if (lotErr) throw lotErr;

  const lots = (lotRows ?? []).map((r) => {
    const lt = embedOne(r.lot_type) as { sprite_path?: string } | undefined;
    return {
      id: r.id,
      lotPhase: r.lot_phase,
      area: parseArea(r.area),
      spritePath: lt?.sprite_path ?? "/assets/lot.jpg",
    };
  });

  const { data: objRows, error: objErr } = await supabase
    .from("map_object")
    .select("id, object_key, area, object_type(sprite_path)")
    .eq("map_id", mapRow.id);

  if (objErr) throw objErr;

  const objects = (objRows ?? []).map((r) => {
    const ot = embedOne(r.object_type) as
      | { sprite_path?: string }
      | undefined;
    return {
      id: r.id,
      objectKey: r.object_key,
      area: parseArea(r.area),
      spritePath: ot?.sprite_path ?? "/assets/road.png",
    };
  });

  const { data: bRows, error: bErr } = await supabase
    .from("map_building")
    .select("id, lot_id, area, sprite_path")
    .eq("map_id", mapRow.id);

  if (bErr) throw bErr;

  const buildings = (bRows ?? []).map((r) => ({
    id: r.id,
    lotId: r.lot_id,
    area: parseArea(r.area),
    spritePath: r.sprite_path,
  }));

  return {
    map: {
      id: mapRow.id,
      slug: mapRow.slug,
      widthTiles: mapRow.width_tiles,
      heightTiles: mapRow.height_tiles,
      defaultGroundTileKey: mapRow.default_ground_tile_key,
      defaultGroundSpritePath: defTile?.sprite_path ?? null,
      tileWidthPx,
      tileHeightPx,
    },
    tiles,
    lots,
    objects,
    buildings,
  };
}

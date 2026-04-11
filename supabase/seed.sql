-- 로컬·CI `db reset` 직후 자동 실행 (supabase/config.toml → db.seed.sql_paths)
-- 최소 데이터: 기본 바닥 타일 + 맵 1장 (FK 만족). 앱·에디터가 맵을 바로 조회할 때 비어 있지 않게 함.

INSERT INTO public.tile_type (tile_key, label, category, sprite_path, walkable, meta)
VALUES (
  'grass',
  '잔디',
  'ground',
  NULL,
  true,
  '{}'::jsonb
)
ON CONFLICT (tile_key) DO NOTHING;

INSERT INTO public.map (
  id,
  slug,
  name,
  width_tiles,
  height_tiles,
  default_ground_tile_key,
  tile_px
)
VALUES (
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'main',
  '메인 맵',
  32,
  24,
  'grass',
  32
)
ON CONFLICT (slug) DO NOTHING;

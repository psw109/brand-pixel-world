-- 메인 맵 36×20 및 부지 6곳 (로컬 seed와 동일 레이아웃, 원격 db push용)

INSERT INTO public.tile_type (tile_key, label, category, sprite_path, walkable, meta)
VALUES ('grass', '잔디', 'ground', NULL, true, '{}'::jsonb)
ON CONFLICT (tile_key) DO NOTHING;

INSERT INTO public.lot_type (id, key, name, sprite_path, meta)
VALUES (
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'parcel',
  '기본 부지',
  '/assets/lot.jpg',
  NULL
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  sprite_path = EXCLUDED.sprite_path;

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
  36,
  20,
  'grass',
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  width_tiles = EXCLUDED.width_tiles,
  height_tiles = EXCLUDED.height_tiles,
  default_ground_tile_key = EXCLUDED.default_ground_tile_key,
  tile_px = EXCLUDED.tile_px;

DELETE FROM public.map_lot
WHERE map_id = (SELECT id FROM public.map WHERE slug = 'main');

INSERT INTO public.map_lot (id, map_id, lot_type_id, area, lot_phase)
VALUES
  ('c0000001-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":6,"tile_y":1,"width_tiles":8,"height_tiles":6}'::jsonb, 'vacant'),
  ('c0000002-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":17,"tile_y":1,"width_tiles":5,"height_tiles":6}'::jsonb, 'vacant'),
  ('c0000003-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":30,"tile_y":2,"width_tiles":5,"height_tiles":5}'::jsonb, 'vacant'),
  ('c0000004-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":1,"tile_y":9,"width_tiles":6,"height_tiles":6}'::jsonb, 'vacant'),
  ('c0000005-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":12,"tile_y":11,"width_tiles":5,"height_tiles":5}'::jsonb, 'vacant'),
  ('c0000006-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":19,"tile_y":11,"width_tiles":6,"height_tiles":5}'::jsonb, 'vacant');

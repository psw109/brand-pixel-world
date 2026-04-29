-- main 맵: 1920×1080에 정사각 타일 60px → 32×18 격자
-- 부지·건물은 새 격자 안에 맞게 재배치 (기존 UUID 유지)

UPDATE public.map
SET
  width_tiles = 32,
  height_tiles = 18,
  tile_px = 60
WHERE slug = 'main';

DELETE FROM public.map_building
WHERE map_id = (SELECT id FROM public.map WHERE slug = 'main' LIMIT 1);

DELETE FROM public.map_lot
WHERE map_id = (SELECT id FROM public.map WHERE slug = 'main' LIMIT 1);

INSERT INTO public.map_lot (id, map_id, lot_type_id, area, lot_phase)
VALUES
  ('c0000001-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":4,"tile_y":1,"width_tiles":8,"height_tiles":5}'::jsonb, 'vacant'),
  ('c0000002-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":13,"tile_y":1,"width_tiles":6,"height_tiles":4}'::jsonb, 'vacant'),
  ('c0000003-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":21,"tile_y":2,"width_tiles":5,"height_tiles":5}'::jsonb, 'vacant'),
  ('c0000004-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":2,"tile_y":8,"width_tiles":7,"height_tiles":5}'::jsonb, 'vacant'),
  ('c0000005-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":11,"tile_y":9,"width_tiles":6,"height_tiles":5}'::jsonb, 'vacant'),
  ('c0000006-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid,
   '{"tile_x":19,"tile_y":9,"width_tiles":7,"height_tiles":5}'::jsonb, 'vacant');

INSERT INTO public.map_building (id, map_id, lot_id, label, area, sprite_path)
VALUES (
  'd0000001-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'c0000001-0000-4000-8000-000000000001'::uuid,
  '테스트 베이커리',
  '{"tile_x":4,"tile_y":1,"width_tiles":8,"height_tiles":5}'::jsonb,
  '/assets/brand_building_test.png'
);

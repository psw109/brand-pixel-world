-- 메인 맵 lot1 부지에 테스트 건물 스프라이트(공개 정적 경로) 연결
-- 에셋 파일: public/assets/brand_building_test.png

INSERT INTO public.map_building (id, map_id, lot_id, label, area, sprite_path)
VALUES (
  'd0000001-0000-4000-8000-000000000001'::uuid,
  (SELECT id FROM public.map WHERE slug = 'main' LIMIT 1),
  'c0000001-0000-4000-8000-000000000001'::uuid,
  '테스트 베이커리',
  '{"tile_x":6,"tile_y":1,"width_tiles":8,"height_tiles":6}'::jsonb,
  '/assets/brand_building_test.png'
)
ON CONFLICT (lot_id) DO UPDATE SET
  map_id = EXCLUDED.map_id,
  label = EXCLUDED.label,
  area = EXCLUDED.area,
  sprite_path = EXCLUDED.sprite_path,
  updated_at = now();

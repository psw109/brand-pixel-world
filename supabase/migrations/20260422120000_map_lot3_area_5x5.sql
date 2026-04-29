-- lot3 (c0000003): 타일 영역 5×4 → 5×5 (정사각 부지)

UPDATE public.map_lot
SET
  area = '{"tile_x":21,"tile_y":2,"width_tiles":5,"height_tiles":5}'::jsonb,
  updated_at = now()
WHERE id = 'c0000003-0000-4000-8000-000000000001'::uuid;

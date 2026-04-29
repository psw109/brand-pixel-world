-- map.tile_px 필수(정사각 타일 한 변 px). 기존 NULL 은 임시로 60 (이후 맵별로 수정).

UPDATE public.map
SET tile_px = 60
WHERE tile_px IS NULL;

ALTER TABLE public.map DROP CONSTRAINT IF EXISTS map_tile_px_positive;

ALTER TABLE public.map
  ADD CONSTRAINT map_tile_px_positive CHECK (tile_px > 0);

ALTER TABLE public.map
  ALTER COLUMN tile_px SET NOT NULL;

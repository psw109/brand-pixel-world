-- BPW 맵·부지 스택 재정의: 기존 leads/lots/buildings 제거 후 map 계열 테이블 생성
-- 명세: 레포 팀 합의(심시티식 비겹침, lot_phase 캐시 + 트리거 동기)

-- ---------------------------------------------------------------------------
-- 0) 이전 코어 테이블 제거 (의존 순서)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;
DROP POLICY IF EXISTS "anon_select_lots" ON public.lots;
DROP POLICY IF EXISTS "authenticated_all_lots" ON public.lots;
DROP POLICY IF EXISTS "anon_select_buildings" ON public.buildings;
DROP POLICY IF EXISTS "authenticated_all_buildings" ON public.buildings;

DROP TABLE IF EXISTS public.buildings CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.lots CASCADE;

-- ---------------------------------------------------------------------------
-- 1) 공통: updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bpw_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2) 카탈로그: tile_type, object_type, lot_type
-- ---------------------------------------------------------------------------
CREATE TABLE public.tile_type (
  tile_key text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL,
  sprite_path text,
  walkable boolean,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_tile_type_updated_at
  BEFORE UPDATE ON public.tile_type
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

CREATE TABLE public.object_type (
  object_key text PRIMARY KEY,
  label text NOT NULL,
  default_width_tiles int NOT NULL,
  default_height_tiles int NOT NULL,
  sprite_path text NOT NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT object_type_dims_positive CHECK (
    default_width_tiles > 0 AND default_height_tiles > 0
  )
);

CREATE TRIGGER trg_object_type_updated_at
  BEFORE UPDATE ON public.object_type
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

CREATE TABLE public.lot_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  name text NOT NULL,
  sprite_path text NOT NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lot_type_key_unique UNIQUE (key)
);

CREATE TRIGGER trg_lot_type_updated_at
  BEFORE UPDATE ON public.lot_type
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

-- ---------------------------------------------------------------------------
-- 3) map
-- ---------------------------------------------------------------------------
CREATE TABLE public.map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  width_tiles int NOT NULL,
  height_tiles int NOT NULL,
  default_ground_tile_key text NOT NULL
    REFERENCES public.tile_type (tile_key) ON UPDATE CASCADE ON DELETE RESTRICT,
  tile_px int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT map_dims_positive CHECK (width_tiles > 0 AND height_tiles > 0),
  CONSTRAINT map_tile_px_positive CHECK (tile_px IS NULL OR tile_px > 0),
  CONSTRAINT map_slug_unique UNIQUE (slug)
);

CREATE TRIGGER trg_map_updated_at
  BEFORE UPDATE ON public.map
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) map_tile, map_object
-- ---------------------------------------------------------------------------
CREATE TABLE public.map_tile (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  map_id uuid NOT NULL REFERENCES public.map (id) ON DELETE CASCADE,
  tile_x int NOT NULL,
  tile_y int NOT NULL,
  tile_key text NOT NULL REFERENCES public.tile_type (tile_key) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT map_tile_xy_nonnegative CHECK (tile_x >= 0 AND tile_y >= 0),
  CONSTRAINT map_tile_cell_unique UNIQUE (map_id, tile_x, tile_y)
);

CREATE INDEX idx_map_tile_map_id ON public.map_tile (map_id);

CREATE TABLE public.map_object (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES public.map (id) ON DELETE CASCADE,
  object_key text NOT NULL REFERENCES public.object_type (object_key) ON UPDATE CASCADE ON DELETE RESTRICT,
  area jsonb NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_map_object_map_id ON public.map_object (map_id);

CREATE TRIGGER trg_map_object_updated_at
  BEFORE UPDATE ON public.map_object
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

-- ---------------------------------------------------------------------------
-- 5) map_lot, lot_inquiry, map_building
-- ---------------------------------------------------------------------------
CREATE TABLE public.map_lot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES public.map (id) ON DELETE CASCADE,
  lot_type_id uuid NOT NULL REFERENCES public.lot_type (id) ON DELETE RESTRICT,
  area jsonb NOT NULL,
  lot_phase text NOT NULL DEFAULT 'vacant',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT map_lot_phase_chk CHECK (
    lot_phase IN ('vacant', 'contact', 'construction', 'built')
  )
);

CREATE INDEX idx_map_lot_map_id ON public.map_lot (map_id);
CREATE INDEX idx_map_lot_map_phase ON public.map_lot (map_id, lot_phase);

CREATE TRIGGER trg_map_lot_updated_at
  BEFORE UPDATE ON public.map_lot
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

CREATE TABLE public.lot_inquiry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES public.map_lot (id) ON DELETE CASCADE,
  contact_email text NOT NULL,
  phone_number text,
  message text,
  applicant_identity jsonb NOT NULL,
  applicant_brand jsonb,
  status text NOT NULL,
  extra jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lot_inquiry_status_chk CHECK (
    status IN ('pending', 'selected', 'rejected')
  )
);

CREATE UNIQUE INDEX lot_inquiry_one_selected_per_lot
  ON public.lot_inquiry (lot_id)
  WHERE status = 'selected';

CREATE INDEX idx_lot_inquiry_lot_id ON public.lot_inquiry (lot_id);
CREATE INDEX idx_lot_inquiry_status ON public.lot_inquiry (status);

CREATE TRIGGER trg_lot_inquiry_updated_at
  BEFORE UPDATE ON public.lot_inquiry
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

CREATE TABLE public.map_building (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES public.map (id) ON DELETE CASCADE,
  lot_id uuid NOT NULL REFERENCES public.map_lot (id) ON DELETE CASCADE,
  label text,
  area jsonb NOT NULL,
  sprite_path text,
  modal jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT map_building_one_per_lot UNIQUE (lot_id)
);

CREATE INDEX idx_map_building_map_id ON public.map_building (map_id);

CREATE TRIGGER trg_map_building_updated_at
  BEFORE UPDATE ON public.map_building
  FOR EACH ROW EXECUTE FUNCTION public.bpw_set_updated_at();

-- ---------------------------------------------------------------------------
-- 6) lot_phase 동기화
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bpw_refresh_map_lot_phase(p_lot_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_phase text;
BEGIN
  IF p_lot_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.map_building b WHERE b.lot_id = p_lot_id
  ) THEN
    v_phase := 'built';
  ELSIF EXISTS (
    SELECT 1 FROM public.lot_inquiry i
    WHERE i.lot_id = p_lot_id AND i.status = 'selected'
  ) THEN
    v_phase := 'construction';
  ELSIF EXISTS (
    SELECT 1 FROM public.lot_inquiry i
    WHERE i.lot_id = p_lot_id AND i.status = 'pending'
  ) THEN
    v_phase := 'contact';
  ELSE
    v_phase := 'vacant';
  END IF;

  UPDATE public.map_lot
  SET lot_phase = v_phase, updated_at = now()
  WHERE id = p_lot_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.bpw_trg_lot_inquiry_refresh_phase()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.bpw_refresh_map_lot_phase(OLD.lot_id);
    RETURN OLD;
  END IF;

  PERFORM public.bpw_refresh_map_lot_phase(NEW.lot_id);
  IF TG_OP = 'UPDATE' AND OLD.lot_id IS DISTINCT FROM NEW.lot_id THEN
    PERFORM public.bpw_refresh_map_lot_phase(OLD.lot_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_lot_inquiry_phase
  AFTER INSERT OR UPDATE OR DELETE ON public.lot_inquiry
  FOR EACH ROW EXECUTE FUNCTION public.bpw_trg_lot_inquiry_refresh_phase();

CREATE OR REPLACE FUNCTION public.bpw_trg_map_building_refresh_phase()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.lot_id IS NOT NULL THEN
      PERFORM public.bpw_refresh_map_lot_phase(OLD.lot_id);
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.lot_id IS NOT NULL THEN
    PERFORM public.bpw_refresh_map_lot_phase(NEW.lot_id);
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.lot_id IS DISTINCT FROM NEW.lot_id THEN
    IF OLD.lot_id IS NOT NULL THEN
      PERFORM public.bpw_refresh_map_lot_phase(OLD.lot_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_map_building_phase
  AFTER INSERT OR UPDATE OR DELETE ON public.map_building
  FOR EACH ROW EXECUTE FUNCTION public.bpw_trg_map_building_refresh_phase();

-- ---------------------------------------------------------------------------
-- 7) RLS (기존 bpw_core 패턴 유지)
-- ---------------------------------------------------------------------------
ALTER TABLE public.tile_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.object_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_tile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_object ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_lot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_inquiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_building ENABLE ROW LEVEL SECURITY;

-- 읽기 공개: 맵·타일·오브젝트·부지·건물·타입 카탈로그
CREATE POLICY "anon_select_tile_type" ON public.tile_type FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_object_type" ON public.object_type FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_lot_type" ON public.lot_type FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_map" ON public.map FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_map_tile" ON public.map_tile FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_map_object" ON public.map_object FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_map_lot" ON public.map_lot FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_map_building" ON public.map_building FOR SELECT TO anon USING (true);

-- 문의: 익명 INSERT 만 (폼 제출)
CREATE POLICY "anon_insert_lot_inquiry" ON public.lot_inquiry
  FOR INSERT TO anon
  WITH CHECK (true);

-- authenticated: 운영/에디터용 전체 접근
CREATE POLICY "authenticated_all_tile_type" ON public.tile_type
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_object_type" ON public.object_type
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_lot_type" ON public.lot_type
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_map" ON public.map
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_map_tile" ON public.map_tile
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_map_object" ON public.map_object
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_map_lot" ON public.map_lot
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_lot_inquiry" ON public.lot_inquiry
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_map_building" ON public.map_building
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.map IS '맵 한 장의 공통 정보';
COMMENT ON TABLE public.tile_type IS '바닥 타일 종류 카탈로그';
COMMENT ON TABLE public.map_tile IS '맵 바닥 덮어쓰기(희소)';
COMMENT ON TABLE public.object_type IS '바닥 위 오브젝트 종류 카탈로그';
COMMENT ON TABLE public.map_object IS '맵 위 오브젝트 배치';
COMMENT ON TABLE public.lot_type IS '부지 종류 카탈로그';
COMMENT ON TABLE public.map_lot IS '입점 가능 부지(영역)';
COMMENT ON TABLE public.lot_inquiry IS '입점 문의 접수';
COMMENT ON TABLE public.map_building IS '브랜드 건물';

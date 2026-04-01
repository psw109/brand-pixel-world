-- BPW 코어 스키마: leads / lots / buildings + RLS (팀 개발 기준선)
-- footprint·display·inquiry·interaction 은 JSONB로 유연하게 둔다 (PROJECT.md §5 정합)

-- ---------------------------------------------------------------------------
-- leads: 부지 입점 문의
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id text NOT NULL,
  contact_email text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;
CREATE POLICY "anon_insert_leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (true);

COMMENT ON TABLE public.leads IS '부지 입점 문의 접수';

-- ---------------------------------------------------------------------------
-- lots: 입점 가능 부지
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lots (
  id text PRIMARY KEY,
  footprint jsonb NOT NULL,
  display jsonb,
  inquiry jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lots" ON public.lots;
CREATE POLICY "anon_select_lots" ON public.lots
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "authenticated_all_lots" ON public.lots;
CREATE POLICY "authenticated_all_lots" ON public.lots
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.lots IS '입점 가능 부지(월드 엔티티)';

-- ---------------------------------------------------------------------------
-- buildings: 브랜드 건물
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.buildings (
  id text PRIMARY KEY,
  lot_id text REFERENCES public.lots (id) ON DELETE SET NULL,
  label text NOT NULL,
  footprint jsonb NOT NULL,
  sprite text,
  interaction jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buildings_lot_id ON public.buildings (lot_id);

ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_buildings" ON public.buildings;
CREATE POLICY "anon_select_buildings" ON public.buildings
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "authenticated_all_buildings" ON public.buildings;
CREATE POLICY "authenticated_all_buildings" ON public.buildings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.buildings IS '브랜드 건물(월드 엔티티)';

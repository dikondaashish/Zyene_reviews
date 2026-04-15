-- Competitor Watch foundation: historical snapshots + domain events.
-- Safe to run once; creates tables and backfills initial snapshot rows.

CREATE TABLE IF NOT EXISTS public.competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  average_rating NUMERIC(3,1) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_competitor_captured
  ON public.competitor_snapshots (competitor_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_business_captured
  ON public.competitor_snapshots (business_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS public.competitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  event_value NUMERIC,
  event_delta NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_events_competitor_created
  ON public.competitor_events (competitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_events_business_created
  ON public.competitor_events (business_id, created_at DESC);

ALTER TABLE public.competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitor_snapshots_select ON public.competitor_snapshots;
CREATE POLICY competitor_snapshots_select ON public.competitor_snapshots
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS competitor_snapshots_insert ON public.competitor_snapshots;
CREATE POLICY competitor_snapshots_insert ON public.competitor_snapshots
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS competitor_events_select ON public.competitor_events;
CREATE POLICY competitor_events_select ON public.competitor_events
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS competitor_events_insert ON public.competitor_events;
CREATE POLICY competitor_events_insert ON public.competitor_events
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

-- Backfill one baseline snapshot per existing competitor if absent.
INSERT INTO public.competitor_snapshots (
  competitor_id,
  business_id,
  captured_at,
  average_rating,
  total_reviews,
  source,
  metadata
)
SELECT
  c.id,
  c.business_id,
  COALESCE(c.updated_at, c.created_at, NOW()),
  COALESCE(c.average_rating, 0),
  COALESCE(c.total_reviews, 0),
  'backfill',
  jsonb_build_object('note', 'initial baseline snapshot')
FROM public.competitors c
WHERE NOT EXISTS (
  SELECT 1
  FROM public.competitor_snapshots s
  WHERE s.competitor_id = c.id
);

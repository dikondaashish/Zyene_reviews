-- Week 1 Competitor Watch upgrades:
-- 1) richer AI insight schema
-- 2) alert threshold defaults per business

ALTER TABLE public.competitor_insights
  ADD COLUMN IF NOT EXISTS why_it_matters TEXT,
  ADD COLUMN IF NOT EXISTS actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS owner_suggestion TEXT;

CREATE TABLE IF NOT EXISTS public.competitor_watch_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  rating_alert_delta NUMERIC(3,2) NOT NULL DEFAULT 0.20,
  review_spike_threshold INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_watch_settings_business_id
  ON public.competitor_watch_settings (business_id);

ALTER TABLE public.competitor_watch_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitor_watch_settings_select ON public.competitor_watch_settings;
CREATE POLICY competitor_watch_settings_select ON public.competitor_watch_settings
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS competitor_watch_settings_insert ON public.competitor_watch_settings;
CREATE POLICY competitor_watch_settings_insert ON public.competitor_watch_settings
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS competitor_watch_settings_update ON public.competitor_watch_settings;
CREATE POLICY competitor_watch_settings_update ON public.competitor_watch_settings
  FOR UPDATE USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

INSERT INTO public.competitor_watch_settings (business_id)
SELECT b.id
FROM public.businesses b
LEFT JOIN public.competitor_watch_settings s ON s.business_id = b.id
WHERE s.business_id IS NULL;

-- Business-level AI market positioning brief (Gemini, on-demand). Uses only data we already store:
-- your GBP keywords, your reviews summary, public Places fields for tracked competitors.

CREATE TABLE IF NOT EXISTS public.competitor_market_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  overview TEXT NOT NULL,
  positioning_bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  opportunity_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_limitations TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_market_briefs_business_created
  ON public.competitor_market_briefs (business_id, created_at DESC);

ALTER TABLE public.competitor_market_briefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitor_market_briefs_select ON public.competitor_market_briefs;
CREATE POLICY competitor_market_briefs_select ON public.competitor_market_briefs
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS competitor_market_briefs_insert ON public.competitor_market_briefs;
CREATE POLICY competitor_market_briefs_insert ON public.competitor_market_briefs
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

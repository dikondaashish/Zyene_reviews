-- Competitor Watch: AI insight storage (Gemini-generated summaries/action points).

CREATE TABLE IF NOT EXISTS public.competitor_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  range_key TEXT NOT NULL DEFAULT '30d',
  summary TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'low',
  confidence NUMERIC(3,2),
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_insights_competitor_created
  ON public.competitor_insights (competitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_insights_business_created
  ON public.competitor_insights (business_id, created_at DESC);

ALTER TABLE public.competitor_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitor_insights_select ON public.competitor_insights;
CREATE POLICY competitor_insights_select ON public.competitor_insights
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS competitor_insights_insert ON public.competitor_insights;
CREATE POLICY competitor_insights_insert ON public.competitor_insights
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

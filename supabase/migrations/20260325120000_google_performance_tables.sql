-- Phase 1: Google Business Profile Performance API storage
-- Daily metrics (FetchMultiDailyMetricsTimeSeries) + monthly search keywords

CREATE TABLE IF NOT EXISTS public.google_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_platform_id UUID NOT NULL REFERENCES public.review_platforms(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_key TEXT NOT NULL,
  dimension_key TEXT NOT NULL DEFAULT 'default',
  value BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_platform_id, metric_date, metric_key, dimension_key)
);

CREATE INDEX IF NOT EXISTS idx_google_perf_business_date
  ON public.google_performance_metrics (business_id, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_google_perf_platform_date
  ON public.google_performance_metrics (review_platform_id, metric_date DESC);

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_performance_synced_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.google_search_keyword_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_platform_id UUID NOT NULL REFERENCES public.review_platforms(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  keyword TEXT NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  is_threshold BOOLEAN NOT NULL DEFAULT FALSE,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_platform_id, month_start, keyword)
);

CREATE INDEX IF NOT EXISTS idx_google_kw_business_month
  ON public.google_search_keyword_monthly (business_id, month_start DESC);

ALTER TABLE public.google_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_search_keyword_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "google_performance_metrics_select_own_org"
  ON public.google_performance_metrics FOR SELECT
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b
      INNER JOIN public.organization_members om ON om.organization_id = b.organization_id
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );

CREATE POLICY "google_search_keyword_monthly_select_own_org"
  ON public.google_search_keyword_monthly FOR SELECT
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b
      INNER JOIN public.organization_members om ON om.organization_id = b.organization_id
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );

COMMENT ON TABLE public.google_performance_metrics IS 'Daily GBP Performance API metrics per connected Google location';
COMMENT ON TABLE public.google_search_keyword_monthly IS 'Monthly search keyword impressions from GBP Performance API';

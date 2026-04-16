-- Google SEO/AEO: AI visibility + heatmap audit storage

CREATE TABLE IF NOT EXISTS public.google_seo_ai_visibility_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_google_seo_ai_runs_business_created
  ON public.google_seo_ai_visibility_runs (business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.google_seo_ai_visibility_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.google_seo_ai_visibility_runs(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  found BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER,
  snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_seo_ai_results_run
  ON public.google_seo_ai_visibility_results (run_id, model);

CREATE TABLE IF NOT EXISTS public.google_seo_heatmap_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_google_seo_heatmap_runs_business_created
  ON public.google_seo_heatmap_runs (business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.google_seo_heatmap_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.google_seo_heatmap_runs(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  cell_label TEXT NOT NULL,
  rank_position INTEGER,
  visibility_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_seo_heatmap_cells_run
  ON public.google_seo_heatmap_cells (run_id, cell_label);

ALTER TABLE public.google_seo_ai_visibility_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_seo_ai_visibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_seo_heatmap_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_seo_heatmap_cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY google_seo_ai_visibility_runs_select
  ON public.google_seo_ai_visibility_runs FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY google_seo_ai_visibility_results_select
  ON public.google_seo_ai_visibility_results FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY google_seo_heatmap_runs_select
  ON public.google_seo_heatmap_runs FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY google_seo_heatmap_cells_select
  ON public.google_seo_heatmap_cells FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );


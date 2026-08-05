-- Google SEO/AEO: provenance columns separating estimated data from measured data.
--
-- Context: the AI-visibility and heatmap workers shipped as heuristics. They never
-- queried an answer engine or a SERP provider — AI visibility was derived from
-- average_rating vs. competitor ratings, and heatmap cells from the business city
-- string. Phase 1 replaces both with real provider calls.
--
-- These columns let measured rows and estimated rows coexist without ever being
-- averaged together, and let the UI badge every number truthfully. Existing rows
-- are backfilled to estimated because every row written before this migration is.

ALTER TABLE public.google_seo_ai_visibility_runs
  ADD COLUMN IF NOT EXISTS is_estimated BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS method TEXT NOT NULL DEFAULT 'heuristic_rating_comparison';

ALTER TABLE public.google_seo_ai_visibility_results
  ADD COLUMN IF NOT EXISTS is_estimated BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS method TEXT NOT NULL DEFAULT 'heuristic_rating_comparison';

ALTER TABLE public.google_seo_heatmap_runs
  ADD COLUMN IF NOT EXISTS is_estimated BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS method TEXT NOT NULL DEFAULT 'heuristic_city_label';

ALTER TABLE public.google_seo_heatmap_cells
  ADD COLUMN IF NOT EXISTS is_estimated BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS method TEXT NOT NULL DEFAULT 'heuristic_city_label';

-- No explicit backfill statement: ADD COLUMN ... DEFAULT TRUE already stamps every
-- pre-existing row. An UPDATE here would be redundant on first run and destructive
-- on replay — it would flip Phase 1's measured rows back to estimated.

-- Phase 1 writers must set these explicitly; new rows default to measured so a
-- forgotten flag fails loudly in QA rather than silently mislabeling real data.
ALTER TABLE public.google_seo_ai_visibility_runs
  ALTER COLUMN is_estimated SET DEFAULT FALSE,
  ALTER COLUMN method SET DEFAULT 'unspecified';

ALTER TABLE public.google_seo_ai_visibility_results
  ALTER COLUMN is_estimated SET DEFAULT FALSE,
  ALTER COLUMN method SET DEFAULT 'unspecified';

ALTER TABLE public.google_seo_heatmap_runs
  ALTER COLUMN is_estimated SET DEFAULT FALSE,
  ALTER COLUMN method SET DEFAULT 'unspecified';

ALTER TABLE public.google_seo_heatmap_cells
  ALTER COLUMN is_estimated SET DEFAULT FALSE,
  ALTER COLUMN method SET DEFAULT 'unspecified';

-- Partial indexes: the dashboard reads measured rows almost exclusively once
-- Phase 1 lands, so keep that path off the estimated backlog.
CREATE INDEX IF NOT EXISTS idx_google_seo_ai_runs_measured
  ON public.google_seo_ai_visibility_runs (business_id, created_at DESC)
  WHERE is_estimated = FALSE;

CREATE INDEX IF NOT EXISTS idx_google_seo_heatmap_runs_measured
  ON public.google_seo_heatmap_runs (business_id, created_at DESC)
  WHERE is_estimated = FALSE;

COMMENT ON COLUMN public.google_seo_ai_visibility_runs.is_estimated IS
  'TRUE when the run was produced by a heuristic rather than a real answer-engine query. Estimated rows must never be shown as measurements or mixed into scores.';
COMMENT ON COLUMN public.google_seo_heatmap_runs.is_estimated IS
  'TRUE when the run was produced by a heuristic rather than a real SERP/Maps provider query. Estimated rows must never be shown as measurements or mixed into scores.';

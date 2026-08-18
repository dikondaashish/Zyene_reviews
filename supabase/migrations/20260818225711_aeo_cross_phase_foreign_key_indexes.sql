-- Complete the foreign-key indexes reported by the Supabase performance advisor
-- across the Phase 0 and Phase 1 AEO schema.
CREATE INDEX IF NOT EXISTS aeo_alerts_organization_idx ON public.aeo_alerts (organization_id);
CREATE INDEX IF NOT EXISTS aeo_alerts_prompt_idx ON public.aeo_alerts (prompt_id);
CREATE INDEX IF NOT EXISTS aeo_brand_mentions_competitor_idx ON public.aeo_brand_mentions (competitor_id);
CREATE INDEX IF NOT EXISTS aeo_geo_grid_points_business_idx ON public.aeo_geo_grid_points (business_id);
CREATE INDEX IF NOT EXISTS aeo_quota_reservations_run_idx ON public.aeo_quota_reservations (run_id);
CREATE INDEX IF NOT EXISTS aeo_samples_prompt_idx ON public.aeo_samples (prompt_id);
CREATE INDEX IF NOT EXISTS crawl_findings_business_idx ON public.crawl_findings (business_id);
CREATE INDEX IF NOT EXISTS crawl_findings_page_idx ON public.crawl_findings (crawl_page_id);
CREATE INDEX IF NOT EXISTS crawl_pages_business_idx ON public.crawl_pages (business_id);
CREATE INDEX IF NOT EXISTS google_seo_ai_visibility_results_business_idx
  ON public.google_seo_ai_visibility_results (business_id);
CREATE INDEX IF NOT EXISTS google_seo_heatmap_cells_business_idx
  ON public.google_seo_heatmap_cells (business_id);

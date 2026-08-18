CREATE INDEX IF NOT EXISTS aeo_alert_channels_business_idx
  ON public.aeo_alert_channels (business_id);

CREATE INDEX IF NOT EXISTS aeo_citation_changes_current_sample_idx
  ON public.aeo_citation_changes (current_sample_id);
CREATE INDEX IF NOT EXISTS aeo_citation_changes_previous_sample_idx
  ON public.aeo_citation_changes (previous_sample_id);
CREATE INDEX IF NOT EXISTS aeo_citation_changes_prompt_idx
  ON public.aeo_citation_changes (prompt_id);

CREATE INDEX IF NOT EXISTS aeo_crawler_log_sources_org_idx
  ON public.aeo_crawler_log_sources (organization_id);

CREATE INDEX IF NOT EXISTS aeo_page_diagnostics_crawl_page_idx
  ON public.aeo_page_diagnostics (crawl_page_id);

CREATE INDEX IF NOT EXISTS aeo_public_api_keys_business_idx
  ON public.aeo_public_api_keys (business_id);

CREATE INDEX IF NOT EXISTS aeo_recommendations_content_brief_idx
  ON public.aeo_recommendations (content_brief_id);
CREATE INDEX IF NOT EXISTS aeo_recommendations_prompt_idx
  ON public.aeo_recommendations (prompt_id);

CREATE INDEX IF NOT EXISTS aeo_report_schedules_business_idx
  ON public.aeo_report_schedules (business_id);
CREATE INDEX IF NOT EXISTS aeo_report_schedules_org_idx
  ON public.aeo_report_schedules (organization_id);

CREATE INDEX IF NOT EXISTS aeo_reports_business_idx
  ON public.aeo_reports (business_id);
CREATE INDEX IF NOT EXISTS aeo_reports_schedule_idx
  ON public.aeo_reports (schedule_id);

CREATE INDEX IF NOT EXISTS aeo_review_citation_matches_review_idx
  ON public.aeo_review_citation_matches (review_id);

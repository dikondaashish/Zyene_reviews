-- apply-plan: with-code -- Phase 2 competitive-parity storage.
-- All customer-visible rows are tenant-scoped and SELECT-only through RLS.
-- Mutations run through authenticated server actions or service-role workers.

ALTER TABLE public.aeo_prompts
  ADD COLUMN funnel_stage TEXT CHECK (funnel_stage IN ('awareness', 'consideration', 'decision', 'retention')),
  ADD COLUMN source_query TEXT,
  ADD COLUMN discovery_score DOUBLE PRECISION CHECK (discovery_score BETWEEN 0 AND 1);

ALTER TABLE public.aeo_brand_mentions
  ADD COLUMN sentiment_rationale TEXT,
  ADD COLUMN prominence_score DOUBLE PRECISION CHECK (prominence_score BETWEEN 0 AND 1),
  ADD COLUMN attributes JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.aeo_content_briefs
  ADD COLUMN rewrite_before TEXT,
  ADD COLUMN rewrite_after TEXT,
  ADD COLUMN review_insights JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.aeo_alerts DROP CONSTRAINT IF EXISTS aeo_alerts_alert_type_check;
ALTER TABLE public.aeo_alerts ADD CONSTRAINT aeo_alerts_alert_type_check CHECK (alert_type IN (
  'visibility_drop', 'visibility_gain', 'technical_blocker', 'run_failure',
  'citation_lost', 'citation_gained', 'rank_drop', 'competitor_overtake', 'negative_sentiment_spike'
));

CREATE TABLE public.aeo_review_citation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sample_id UUID NOT NULL REFERENCES public.aeo_samples(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  answer_excerpt TEXT NOT NULL,
  review_excerpt TEXT NOT NULL,
  match_kind TEXT NOT NULL CHECK (match_kind IN ('quote', 'paraphrase')),
  confidence DOUBLE PRECISION NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  extraction_model_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sample_id, review_id, answer_excerpt)
);

CREATE INDEX aeo_review_citation_matches_business_created_idx
  ON public.aeo_review_citation_matches (business_id, created_at DESC);

CREATE TABLE public.aeo_citation_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.aeo_prompts(id) ON DELETE SET NULL,
  engine_id TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('gained', 'lost', 'moved_up', 'moved_down')),
  previous_ordinal INTEGER CHECK (previous_ordinal >= 1),
  current_ordinal INTEGER CHECK (current_ordinal >= 1),
  previous_sample_id UUID REFERENCES public.aeo_samples(id) ON DELETE SET NULL,
  current_sample_id UUID REFERENCES public.aeo_samples(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, engine_id, normalized_url, previous_sample_id, current_sample_id)
);

CREATE INDEX aeo_citation_changes_business_detected_idx
  ON public.aeo_citation_changes (business_id, detected_at DESC);

CREATE TABLE public.aeo_crawler_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL,
  crawler TEXT NOT NULL CHECK (crawler IN ('GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'CCBot')),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER CHECK (status_code BETWEEN 100 AND 599),
  user_agent TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('vercel', 'cloudflare', 'proxy', 'manual')),
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, source, request_id)
);

CREATE INDEX aeo_crawler_access_logs_business_occurred_idx
  ON public.aeo_crawler_access_logs (business_id, occurred_at DESC);

CREATE TABLE public.aeo_crawler_log_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('vercel', 'cloudflare', 'proxy', 'manual')),
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_crawler_log_sources_business_idx
  ON public.aeo_crawler_log_sources (business_id, enabled);

CREATE TABLE public.aeo_page_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  crawl_page_id UUID REFERENCES public.crawl_pages(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  raw_text_hash TEXT,
  rendered_text_hash TEXT,
  js_only_word_count INTEGER CHECK (js_only_word_count >= 0),
  js_delta_ratio DOUBLE PRECISION CHECK (js_delta_ratio BETWEEN 0 AND 1),
  lcp_ms INTEGER CHECK (lcp_ms >= 0),
  cls DOUBLE PRECISION CHECK (cls >= 0),
  inp_ms INTEGER CHECK (inp_ms >= 0),
  performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
  index_status TEXT CHECK (index_status IN ('indexed', 'discovered_not_indexed', 'crawled_not_indexed', 'excluded', 'unknown', 'not_checked')),
  index_verdict TEXT,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_page_diagnostics_business_checked_idx
  ON public.aeo_page_diagnostics (business_id, checked_at DESC);
CREATE INDEX aeo_page_diagnostics_url_idx
  ON public.aeo_page_diagnostics (business_id, url, checked_at DESC);

CREATE TABLE public.aeo_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.aeo_prompts(id) ON DELETE SET NULL,
  content_brief_id UUID REFERENCES public.aeo_content_briefs(id) ON DELETE SET NULL,
  target_url TEXT,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('rewrite', 'review_brief', 'freshness', 'gbp_description', 'gbp_post', 'gbp_qa')),
  title TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'applied', 'dismissed')),
  baseline JSONB NOT NULL DEFAULT '{}'::jsonb,
  latest_impact JSONB NOT NULL DEFAULT '{}'::jsonb,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_recommendations_business_status_idx
  ON public.aeo_recommendations (business_id, status, created_at DESC);
CREATE UNIQUE INDEX aeo_recommendations_business_type_title_uidx
  ON public.aeo_recommendations (business_id, recommendation_type, title);

CREATE TABLE public.aeo_report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  cadence TEXT NOT NULL CHECK (cadence IN ('weekly', 'monthly')),
  recipients TEXT[] NOT NULL CHECK (cardinality(recipients) BETWEEN 1 AND 20),
  enabled BOOLEAN NOT NULL DEFAULT true,
  next_send_at TIMESTAMPTZ NOT NULL,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_report_schedules_due_idx
  ON public.aeo_report_schedules (next_send_at) WHERE enabled;

CREATE TABLE public.aeo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.aeo_report_schedules(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('html', 'pdf')),
  storage_path TEXT,
  html TEXT,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  delivery_status TEXT NOT NULL DEFAULT 'generated' CHECK (delivery_status IN ('generated', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  CHECK (period_end >= period_start),
  CHECK (storage_path IS NOT NULL OR html IS NOT NULL)
);

CREATE INDEX aeo_reports_org_created_idx ON public.aeo_reports (organization_id, created_at DESC);

CREATE TABLE public.aeo_public_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL CHECK (scopes <@ ARRAY['prompts:read','results:read','citations:read','scores:read']::TEXT[]),
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60 CHECK (rate_limit_per_minute BETWEEN 1 AND 600),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_public_api_keys_org_idx ON public.aeo_public_api_keys (organization_id, created_at DESC);

CREATE TABLE public.aeo_alert_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('slack', 'webhook')),
  name TEXT NOT NULL,
  endpoint_ciphertext TEXT NOT NULL,
  signing_secret_ciphertext TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_delivery_at TIMESTAMPTZ,
  last_delivery_status TEXT CHECK (last_delivery_status IN ('success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_alert_channels_org_idx ON public.aeo_alert_channels (organization_id, enabled);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('aeo-reports', 'aeo-reports', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE public.aeo_review_citation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_citation_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_crawler_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_crawler_log_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_page_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_public_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_alert_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY aeo_review_citation_matches_select_own_org ON public.aeo_review_citation_matches FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_citation_changes_select_own_org ON public.aeo_citation_changes FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_crawler_access_logs_select_own_org ON public.aeo_crawler_access_logs FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_crawler_log_sources_select_own_org ON public.aeo_crawler_log_sources FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_page_diagnostics_select_own_org ON public.aeo_page_diagnostics FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_recommendations_select_own_org ON public.aeo_recommendations FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_report_schedules_select_own_org ON public.aeo_report_schedules FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_reports_select_own_org ON public.aeo_reports FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_public_api_keys_select_own_org ON public.aeo_public_api_keys FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_alert_channels_select_own_org ON public.aeo_alert_channels FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));

REVOKE ALL ON TABLE public.aeo_review_citation_matches, public.aeo_citation_changes,
  public.aeo_crawler_access_logs, public.aeo_crawler_log_sources, public.aeo_page_diagnostics, public.aeo_recommendations,
  public.aeo_report_schedules, public.aeo_reports, public.aeo_public_api_keys,
  public.aeo_alert_channels FROM anon;
GRANT SELECT ON TABLE public.aeo_review_citation_matches, public.aeo_citation_changes,
  public.aeo_crawler_access_logs, public.aeo_page_diagnostics, public.aeo_recommendations,
  public.aeo_report_schedules, public.aeo_reports TO authenticated;
GRANT SELECT (id, organization_id, business_id, name, source, key_prefix, enabled, last_received_at, created_at)
  ON public.aeo_crawler_log_sources TO authenticated;
GRANT SELECT (id, organization_id, business_id, name, key_prefix, scopes, rate_limit_per_minute,
  last_used_at, expires_at, revoked_at, created_at) ON public.aeo_public_api_keys TO authenticated;
GRANT SELECT (id, organization_id, business_id, channel_type, name, enabled, last_delivery_at,
  last_delivery_status, created_at, updated_at) ON public.aeo_alert_channels TO authenticated;
GRANT ALL ON TABLE public.aeo_review_citation_matches, public.aeo_citation_changes,
  public.aeo_crawler_access_logs, public.aeo_crawler_log_sources, public.aeo_page_diagnostics, public.aeo_recommendations,
  public.aeo_report_schedules, public.aeo_reports, public.aeo_public_api_keys,
  public.aeo_alert_channels TO service_role;

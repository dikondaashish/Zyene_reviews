-- apply-plan: with-code -- Phase 3 differentiation storage.
-- Customer-visible analytics are SELECT-only through tenant RLS. Configuration
-- mutations and all secret access remain service-role only.

ALTER TABLE public.organizations
  ADD COLUMN aeo_sender_domain TEXT,
  ADD COLUMN aeo_sender_domain_status TEXT NOT NULL DEFAULT 'not_configured'
    CHECK (aeo_sender_domain_status IN ('not_configured', 'pending', 'verified', 'failed')),
  ADD COLUMN aeo_sender_domain_checked_at TIMESTAMPTZ;

ALTER TABLE public.aeo_alerts DROP CONSTRAINT IF EXISTS aeo_alerts_alert_type_check;
ALTER TABLE public.aeo_alerts ADD CONSTRAINT aeo_alerts_alert_type_check CHECK (alert_type IN (
  'visibility_drop', 'visibility_gain', 'technical_blocker', 'run_failure',
  'citation_lost', 'citation_gained', 'rank_drop', 'competitor_overtake',
  'negative_sentiment_spike', 'statistical_anomaly'
));

CREATE TABLE public.aeo_answer_volatility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.aeo_prompts(id) ON DELETE CASCADE,
  engine_id TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  observation_count INTEGER NOT NULL CHECK (observation_count >= 2),
  answer_volatility DOUBLE PRECISION NOT NULL CHECK (answer_volatility BETWEEN 0 AND 1),
  citation_volatility DOUBLE PRECISION NOT NULL CHECK (citation_volatility BETWEEN 0 AND 1),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, prompt_id, engine_id)
);

CREATE TABLE public.aeo_citation_traffic_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  normalized_url TEXT NOT NULL,
  window_start DATE NOT NULL,
  window_end DATE NOT NULL,
  observation_days INTEGER NOT NULL CHECK (observation_days >= 0),
  correlation DOUBLE PRECISION CHECK (correlation BETWEEN -1 AND 1),
  eligible BOOLEAN NOT NULL,
  interpretation TEXT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, normalized_url, window_start, window_end)
);

CREATE TABLE public.aeo_competitor_page_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  normalized_url TEXT NOT NULL,
  title TEXT,
  content_hash TEXT NOT NULL,
  citation_count INTEGER NOT NULL DEFAULT 0 CHECK (citation_count >= 0),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, normalized_url)
);

CREATE TABLE public.aeo_competitor_page_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  normalized_url TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('new', 'updated', 'citation_gain')),
  previous_hash TEXT,
  current_hash TEXT NOT NULL,
  previous_citation_count INTEGER CHECK (previous_citation_count >= 0),
  current_citation_count INTEGER NOT NULL CHECK (current_citation_count >= 0),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.aeo_prompt_demand_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.aeo_prompts(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  language_code TEXT NOT NULL,
  monthly_search_volume INTEGER CHECK (monthly_search_volume >= 0),
  provider TEXT NOT NULL,
  provider_cost_micro_usd INTEGER NOT NULL CHECK (provider_cost_micro_usd >= 0),
  source_month DATE,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, prompt_id, location_name, language_code)
);

CREATE TABLE public.aeo_llms_txt_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  http_status INTEGER CHECK (http_status BETWEEN 100 AND 599),
  present BOOLEAN NOT NULL,
  valid BOOLEAN NOT NULL,
  content_hash TEXT,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.aeo_nap_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT,
  observed_name TEXT,
  observed_address TEXT,
  observed_phone TEXT,
  name_matches BOOLEAN,
  address_matches BOOLEAN,
  phone_matches BOOLEAN,
  provenance TEXT NOT NULL CHECK (provenance IN ('connected_platform', 'dataforseo_business_listing', 'manual')),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, source_name)
);

CREATE TABLE public.aeo_webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  endpoint_ciphertext TEXT NOT NULL,
  signing_secret_ciphertext TEXT NOT NULL,
  event_types TEXT[] NOT NULL CHECK (event_types <@ ARRAY['aeo.alert.created','aeo.run.completed']::TEXT[]),
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_delivery_at TIMESTAMPTZ,
  last_delivery_status TEXT CHECK (last_delivery_status IN ('success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.aeo_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES public.aeo_webhook_endpoints(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('aeo.alert.created','aeo.run.completed')),
  source_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  response_status INTEGER CHECK (response_status BETWEEN 100 AND 599),
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (endpoint_id, event_type, source_id)
);

CREATE TABLE public.aeo_bigquery_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  table_id TEXT NOT NULL,
  credentials_ciphertext TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_export_at TIMESTAMPTZ,
  last_export_status TEXT CHECK (last_export_status IN ('success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, business_id)
);

CREATE TABLE public.aeo_bigquery_export_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.aeo_bigquery_integrations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  row_count INTEGER NOT NULL CHECK (row_count >= 0),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.aeo_anomaly_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('visibility_rate')),
  evaluated_date DATE NOT NULL,
  history_days INTEGER NOT NULL CHECK (history_days >= 0),
  current_value DOUBLE PRECISION,
  baseline_median DOUBLE PRECISION,
  median_absolute_deviation DOUBLE PRECISION,
  robust_z_score DOUBLE PRECISION,
  eligible BOOLEAN NOT NULL,
  anomalous BOOLEAN NOT NULL DEFAULT false,
  direction TEXT CHECK (direction IN ('high', 'low')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, metric, evaluated_date)
);

CREATE INDEX aeo_answer_volatility_business_idx ON public.aeo_answer_volatility (business_id, calculated_at DESC);
CREATE INDEX aeo_citation_traffic_business_idx ON public.aeo_citation_traffic_correlations (business_id, calculated_at DESC);
CREATE INDEX aeo_competitor_snapshots_competitor_idx ON public.aeo_competitor_page_snapshots (competitor_id);
CREATE INDEX aeo_competitor_changes_business_idx ON public.aeo_competitor_page_changes (business_id, detected_at DESC);
CREATE INDEX aeo_competitor_changes_competitor_idx ON public.aeo_competitor_page_changes (competitor_id);
CREATE INDEX aeo_prompt_demand_business_idx ON public.aeo_prompt_demand_estimates (business_id, measured_at DESC);
CREATE INDEX aeo_llms_audits_business_idx ON public.aeo_llms_txt_audits (business_id, checked_at DESC);
CREATE INDEX aeo_nap_observations_business_idx ON public.aeo_nap_observations (business_id, checked_at DESC);
CREATE INDEX aeo_webhook_endpoints_org_idx ON public.aeo_webhook_endpoints (organization_id, enabled);
CREATE INDEX aeo_webhook_endpoints_business_idx ON public.aeo_webhook_endpoints (business_id);
CREATE INDEX aeo_webhook_deliveries_endpoint_idx ON public.aeo_webhook_deliveries (endpoint_id, created_at DESC);
CREATE INDEX aeo_webhook_deliveries_org_idx ON public.aeo_webhook_deliveries (organization_id, created_at DESC);
CREATE INDEX aeo_webhook_deliveries_business_idx ON public.aeo_webhook_deliveries (business_id);
CREATE INDEX aeo_bigquery_integrations_business_idx ON public.aeo_bigquery_integrations (business_id);
CREATE INDEX aeo_bigquery_exports_integration_idx ON public.aeo_bigquery_export_runs (integration_id, exported_at DESC);
CREATE INDEX aeo_bigquery_exports_org_idx ON public.aeo_bigquery_export_runs (organization_id, exported_at DESC);
CREATE INDEX aeo_bigquery_exports_business_idx ON public.aeo_bigquery_export_runs (business_id);
CREATE INDEX aeo_anomaly_evaluations_business_idx ON public.aeo_anomaly_evaluations (business_id, evaluated_date DESC);

ALTER TABLE public.aeo_answer_volatility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_citation_traffic_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_competitor_page_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_competitor_page_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_prompt_demand_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_llms_txt_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_nap_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_bigquery_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_bigquery_export_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_anomaly_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY aeo_answer_volatility_select_org ON public.aeo_answer_volatility FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_citation_traffic_select_org ON public.aeo_citation_traffic_correlations FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_competitor_snapshots_select_org ON public.aeo_competitor_page_snapshots FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_competitor_changes_select_org ON public.aeo_competitor_page_changes FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_prompt_demand_select_org ON public.aeo_prompt_demand_estimates FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_llms_audits_select_org ON public.aeo_llms_txt_audits FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_nap_observations_select_org ON public.aeo_nap_observations FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY aeo_webhook_endpoints_select_org ON public.aeo_webhook_endpoints FOR SELECT USING
  (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_webhook_deliveries_select_org ON public.aeo_webhook_deliveries FOR SELECT USING
  (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_bigquery_integrations_select_org ON public.aeo_bigquery_integrations FOR SELECT USING
  (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_bigquery_exports_select_org ON public.aeo_bigquery_export_runs FOR SELECT USING
  (organization_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY aeo_anomaly_evaluations_select_org ON public.aeo_anomaly_evaluations FOR SELECT USING
  (business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));

REVOKE ALL ON TABLE public.aeo_answer_volatility, public.aeo_citation_traffic_correlations,
  public.aeo_competitor_page_snapshots, public.aeo_competitor_page_changes, public.aeo_prompt_demand_estimates,
  public.aeo_llms_txt_audits, public.aeo_nap_observations, public.aeo_webhook_endpoints,
  public.aeo_webhook_deliveries, public.aeo_bigquery_integrations, public.aeo_bigquery_export_runs,
  public.aeo_anomaly_evaluations FROM anon, authenticated;
GRANT SELECT ON TABLE public.aeo_answer_volatility, public.aeo_citation_traffic_correlations,
  public.aeo_competitor_page_snapshots, public.aeo_competitor_page_changes, public.aeo_prompt_demand_estimates,
  public.aeo_llms_txt_audits, public.aeo_nap_observations, public.aeo_webhook_deliveries,
  public.aeo_bigquery_export_runs, public.aeo_anomaly_evaluations TO authenticated;
GRANT SELECT (id, organization_id, business_id, name, event_types, enabled, last_delivery_at,
  last_delivery_status, created_at, updated_at) ON public.aeo_webhook_endpoints TO authenticated;
GRANT SELECT (id, organization_id, business_id, project_id, dataset_id, table_id, enabled,
  last_export_at, last_export_status, created_at, updated_at) ON public.aeo_bigquery_integrations TO authenticated;
GRANT ALL ON TABLE public.aeo_answer_volatility, public.aeo_citation_traffic_correlations,
  public.aeo_competitor_page_snapshots, public.aeo_competitor_page_changes, public.aeo_prompt_demand_estimates,
  public.aeo_llms_txt_audits, public.aeo_nap_observations, public.aeo_webhook_endpoints,
  public.aeo_webhook_deliveries, public.aeo_bigquery_integrations, public.aeo_bigquery_export_runs,
  public.aeo_anomaly_evaluations TO service_role;

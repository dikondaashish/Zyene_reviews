-- E-4: Phase 1 AEO sampling schema.
--
-- Mirrors the engine contract in src/services/aeo/engines/engine-types.ts. Where
-- that contract makes an error structurally impossible in TypeScript, this schema
-- makes the same error impossible in Postgres, so a bad write cannot enter through
-- the admin client or a manual query.
--
-- Three invariants are enforced with CHECK constraints rather than convention:
--
--   1. aeo_samples has NO brand-presence column. An engine sample records what an
--      engine said; whether our brand appeared is decided by a separate extraction
--      pass and lives in aeo_brand_mentions. This is the schema-level form of the
--      rule that produced the pre-Phase-1 incident: nothing that writes engine
--      output may also assert visibility.
--   2. A 'failed' sample cannot carry an answer payload, so it can never be
--      misread as "brand not found".
--   3. Citations are tri-state. citations_availability distinguishes "engine
--      returned no sources" from "engine exposes no sources", which a bare row
--      count would collapse and silently corrupt the citation-rate denominator.
--
-- Crawl tables (crawl_runs / crawl_pages / crawl_findings) are deliberately NOT
-- here; they land with E-3, whose crawler defines their shape.
--
-- RLS matches the established pattern: SELECT-only for members of the owning org,
-- writes via the service-role admin client only.

-- ---------------------------------------------------------------------------
-- Prompt library (F4.1-F4.3)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.aeo_prompt_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, name)
);

CREATE TABLE IF NOT EXISTS public.aeo_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES public.aeo_prompt_clusters(id) ON DELETE SET NULL,
  prompt_text TEXT NOT NULL CHECK (length(btrim(prompt_text)) > 0),
  -- Where the prompt came from. 'suggested' rows are inert until a human
  -- activates them: quota is money, so nothing auto-enrols into a paid run.
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'suggested', 'imported', 'discovered')),
  intent TEXT CHECK (intent IN ('discovery', 'comparison', 'transactional', 'branded')),
  locale_country TEXT NOT NULL DEFAULT 'US',
  locale_language TEXT NOT NULL DEFAULT 'en',
  locale_city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aeo_prompts_business_active
  ON public.aeo_prompts (business_id, is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_aeo_prompts_cluster ON public.aeo_prompts (cluster_id);

-- ---------------------------------------------------------------------------
-- Competitor aliases (F3.1) — one brand, many names in an answer
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.aeo_competitor_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  alias TEXT NOT NULL CHECK (length(btrim(alias)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (competitor_id, alias)
);

CREATE INDEX IF NOT EXISTS idx_aeo_competitor_aliases_business
  ON public.aeo_competitor_aliases (business_id);

-- ---------------------------------------------------------------------------
-- Runs and samples (E-7, F1.1)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.aeo_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'partial', 'failed', 'deferred')),
  trigger TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (trigger IN ('scheduled', 'manual', 'backfill')),
  -- Slot this run was dispatched from, for E-10 smoothing audits.
  scheduled_for TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_aeo_runs_business_created
  ON public.aeo_runs (business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.aeo_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.aeo_runs(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.aeo_prompts(id) ON DELETE SET NULL,

  engine_id TEXT NOT NULL CHECK (engine_id IN (
    'google_serp', 'google_ai_overview', 'google_ai_mode',
    'chatgpt', 'perplexity', 'gemini', 'claude', 'copilot'
  )),
  -- The model actually called. Pinned per engine in engine-catalog.ts so a
  -- trend line stays interpretable after the underlying model is swapped.
  model_id TEXT,

  status TEXT NOT NULL CHECK (status IN ('ok', 'no_answer', 'failed')),
  -- Pointer into Supabase Storage; answers are too large to keep in-row (E-8).
  answer_storage_path TEXT,
  citations_availability TEXT CHECK (citations_availability IN ('present', 'unavailable')),
  no_answer_reason TEXT,
  error_kind TEXT CHECK (error_kind IN (
    'rate_limited', 'upstream_unavailable', 'timeout',
    'auth', 'invalid_request', 'quota_exhausted', 'unknown'
  )),

  -- 1-based repeat index within a run (F1.13 repeat sampling).
  attempt INTEGER NOT NULL DEFAULT 1 CHECK (attempt >= 1),
  latency_ms INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
  cost_micro_usd INTEGER NOT NULL DEFAULT 0 CHECK (cost_micro_usd >= 0),
  -- Consistent with the Phase 0 provenance columns: measured unless stated.
  is_estimated BOOLEAN NOT NULL DEFAULT FALSE,

  sampled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Invariant 1: anything that reached a model records which one.
  CONSTRAINT aeo_samples_model_id_required_unless_failed
    CHECK (status = 'failed' OR (model_id IS NOT NULL AND length(btrim(model_id)) > 0)),
  -- Invariant 2: only an answered sample may carry an answer or citation state.
  CONSTRAINT aeo_samples_payload_only_when_ok
    CHECK (status = 'ok' OR (answer_storage_path IS NULL AND citations_availability IS NULL)),
  -- ...and an answered sample must declare its citation availability.
  CONSTRAINT aeo_samples_ok_declares_citations
    CHECK (status <> 'ok' OR citations_availability IS NOT NULL),
  -- Invariant 3: error detail belongs to failures, refusal detail to refusals.
  CONSTRAINT aeo_samples_error_kind_only_when_failed
    CHECK (status = 'failed' OR error_kind IS NULL),
  CONSTRAINT aeo_samples_failed_requires_error_kind
    CHECK (status <> 'failed' OR error_kind IS NOT NULL),
  CONSTRAINT aeo_samples_no_answer_reason_only_when_no_answer
    CHECK (status = 'no_answer' OR no_answer_reason IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_aeo_samples_run ON public.aeo_samples (run_id);
CREATE INDEX IF NOT EXISTS idx_aeo_samples_business_engine_sampled
  ON public.aeo_samples (business_id, engine_id, sampled_at DESC);
-- Denominator queries read answered samples only; keep them off the failure rows.
CREATE INDEX IF NOT EXISTS idx_aeo_samples_observations
  ON public.aeo_samples (business_id, prompt_id, sampled_at DESC) WHERE status = 'ok';

COMMENT ON TABLE public.aeo_samples IS
  'One engine response. Deliberately has no brand-presence column: presence is extracted separately into aeo_brand_mentions so that nothing writing raw engine output can also assert visibility.';

-- ---------------------------------------------------------------------------
-- Citations (P2) and brand mentions (P3)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.aeo_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id UUID NOT NULL REFERENCES public.aeo_samples(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL CHECK (ordinal >= 1),
  url TEXT NOT NULL,
  -- Tracking params stripped and host canonicalised, for stable joins.
  normalized_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT,
  classification TEXT NOT NULL DEFAULT 'other'
    CHECK (classification IN ('own', 'competitor', 'directory', 'social', 'other')),
  -- A cited page that 404s is itself a finding (F2.x stale citation).
  is_stale BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sample_id, ordinal)
);

CREATE INDEX IF NOT EXISTS idx_aeo_citations_business_domain
  ON public.aeo_citations (business_id, domain);
CREATE INDEX IF NOT EXISTS idx_aeo_citations_business_normalized
  ON public.aeo_citations (business_id, normalized_url);

CREATE TABLE IF NOT EXISTS public.aeo_brand_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id UUID NOT NULL REFERENCES public.aeo_samples(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  -- 'own' is us; 'competitor' resolves to competitors.id; 'unknown' is an
  -- emerging brand we have not tracked yet (suggested to the user at 3+ hits).
  brand_kind TEXT NOT NULL CHECK (brand_kind IN ('own', 'competitor', 'unknown')),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  brand_label TEXT NOT NULL,
  -- 1-based order of first mention within the answer (F3.4 prominence).
  mention_ordinal INTEGER CHECK (mention_ordinal >= 1),
  cited_only BOOLEAN NOT NULL DEFAULT FALSE,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  -- Provenance of the extraction itself, so E-6 can attribute a drift regression.
  extraction_model_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT aeo_brand_mentions_competitor_id_matches_kind
    CHECK ((brand_kind = 'competitor') = (competitor_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_aeo_brand_mentions_sample
  ON public.aeo_brand_mentions (sample_id);
CREATE INDEX IF NOT EXISTS idx_aeo_brand_mentions_business_kind
  ON public.aeo_brand_mentions (business_id, brand_kind);

-- ---------------------------------------------------------------------------
-- Geo-grid (PRD-5) — real coordinates, replacing the city-label heuristic
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.aeo_geo_grid_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  grid_size INTEGER NOT NULL CHECK (grid_size IN (5, 7, 9)),
  spacing_meters INTEGER NOT NULL CHECK (spacing_meters > 0),
  center_lat DOUBLE PRECISION NOT NULL CHECK (center_lat BETWEEN -90 AND 90),
  center_lng DOUBLE PRECISION NOT NULL CHECK (center_lng BETWEEN -180 AND 180),
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'partial', 'failed')),
  error_message TEXT,
  is_estimated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_aeo_geo_grid_runs_business_created
  ON public.aeo_geo_grid_runs (business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.aeo_geo_grid_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.aeo_geo_grid_runs(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  grid_row INTEGER NOT NULL CHECK (grid_row >= 0),
  grid_col INTEGER NOT NULL CHECK (grid_col >= 0),
  lat DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng DOUBLE PRECISION NOT NULL CHECK (lng BETWEEN -180 AND 180),
  -- NULL means "not found in the local pack" and must render as a distinct
  -- state. A sentinel like 0 or 20 would silently average into ATRP.
  rank_position INTEGER CHECK (rank_position >= 1),
  place_id_found TEXT,
  top_competitors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, grid_row, grid_col)
);

CREATE INDEX IF NOT EXISTS idx_aeo_geo_grid_points_run
  ON public.aeo_geo_grid_points (run_id);

-- ---------------------------------------------------------------------------
-- Quota ledger (E-5) — per-org, per-engine, per-day billable accounting
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.aeo_quota_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  engine_id TEXT NOT NULL,
  usage_date DATE NOT NULL,
  -- Samples taken vs. the subset that fell outside a free allowance.
  sampled_units INTEGER NOT NULL DEFAULT 0 CHECK (sampled_units >= 0),
  billable_units INTEGER NOT NULL DEFAULT 0 CHECK (billable_units >= 0),
  cost_micro_usd BIGINT NOT NULL DEFAULT 0 CHECK (cost_micro_usd >= 0),
  -- TRUE only when an org explicitly opted into paying past a free allowance.
  -- E-10 must record this before the first billable call, not after.
  overage_override BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT aeo_quota_ledger_billable_within_sampled
    CHECK (billable_units <= sampled_units),
  UNIQUE (organization_id, engine_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_aeo_quota_ledger_engine_date
  ON public.aeo_quota_ledger (engine_id, usage_date DESC);

-- ---------------------------------------------------------------------------
-- RLS — SELECT-only for the owning org; all writes via service role
-- ---------------------------------------------------------------------------

ALTER TABLE public.aeo_prompt_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_competitor_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_brand_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_geo_grid_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_geo_grid_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_quota_ledger ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'aeo_prompt_clusters', 'aeo_prompts', 'aeo_competitor_aliases',
    'aeo_runs', 'aeo_samples', 'aeo_citations', 'aeo_brand_mentions',
    'aeo_geo_grid_runs', 'aeo_geo_grid_points'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING ('
      || 'business_id IN (SELECT id FROM public.businesses '
      || 'WHERE organization_id IN (SELECT public.get_user_org_ids())))',
      t || '_select_own_org', t
    );
  END LOOP;
END
$$;

-- Ledger is org-scoped directly; it has no business_id.
CREATE POLICY aeo_quota_ledger_select_own_org
  ON public.aeo_quota_ledger FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));

-- apply-plan: immediate - required by the Phase 1 geo-grid, prompt-limit, and
-- accounting code deployed in the same release. Apply after 20260818154353.
--
-- Phase 1 launch integrity:
--   1. distinguish searched/not-found geo cells from failed searches;
--   2. persist estimated and measured geo-grid spend;
--   3. enforce active-prompt plan caps atomically;
--   4. maintain the quota ledger from its authoritative reservations; and
--   5. reconcile sample cost from settled reservations, including old rows.

ALTER TABLE public.aeo_geo_grid_runs
  ADD COLUMN IF NOT EXISTS estimated_cost_micro_usd BIGINT NOT NULL DEFAULT 0
    CHECK (estimated_cost_micro_usd >= 0),
  ADD COLUMN IF NOT EXISTS actual_cost_micro_usd BIGINT
    CHECK (actual_cost_micro_usd IS NULL OR actual_cost_micro_usd >= 0),
  ADD COLUMN IF NOT EXISTS requested_units INTEGER NOT NULL DEFAULT 0
    CHECK (requested_units >= 0),
  ADD COLUMN IF NOT EXISTS billed_units INTEGER NOT NULL DEFAULT 0
    CHECK (billed_units >= 0);

ALTER TABLE public.aeo_geo_grid_points
  ADD COLUMN IF NOT EXISTS search_status TEXT NOT NULL DEFAULT 'searched'
    CHECK (search_status IN ('searched', 'failed')),
  ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE public.aeo_geo_grid_points
  ADD CONSTRAINT aeo_geo_grid_points_search_state_consistent CHECK (
    (search_status = 'searched' AND error_message IS NULL)
    OR
    (search_status = 'failed' AND error_message IS NOT NULL
      AND rank_position IS NULL AND place_id_found IS NULL)
  );

CREATE UNIQUE INDEX aeo_geo_grid_one_running_per_business
  ON public.aeo_geo_grid_runs (business_id)
  WHERE status = 'running';

-- One transaction cannot activate prompt N+1 while another activation for the
-- same business is between its count and write. The lock grain is the business,
-- because allowances are per location.
CREATE OR REPLACE FUNCTION public.enforce_aeo_active_prompt_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_plan TEXT;
  v_status TEXT;
  v_limit INTEGER;
  v_active INTEGER;
BEGIN
  IF NOT NEW.is_active OR (TG_OP = 'UPDATE' AND OLD.is_active) THEN
    RETURN NEW;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.business_id::text || ':aeo-prompts', 0)
  );

  SELECT lower(o.plan), lower(o.plan_status)
  INTO v_plan, v_status
  FROM public.businesses b
  JOIN public.organizations o ON o.id = b.organization_id
  WHERE b.id = NEW.business_id;

  v_limit := CASE
    WHEN v_status NOT IN ('active', 'trialing') THEN 0
    WHEN v_plan = 'enterprise' THEN 25
    WHEN v_plan LIKE 'professional_%' OR v_plan = 'pro' THEN 15
    WHEN v_plan LIKE 'starter_%' OR v_plan = 'starter' THEN 5
    ELSE 0
  END;

  SELECT count(*) INTO v_active
  FROM public.aeo_prompts
  WHERE business_id = NEW.business_id
    AND is_active
    AND id <> NEW.id;

  IF v_active >= v_limit THEN
    RAISE EXCEPTION 'AEO_PROMPT_LIMIT_REACHED:%', v_limit USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS enforce_aeo_active_prompt_limit ON public.aeo_prompts;
CREATE TRIGGER enforce_aeo_active_prompt_limit
  BEFORE INSERT OR UPDATE OF is_active ON public.aeo_prompts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_aeo_active_prompt_limit();

REVOKE ALL ON FUNCTION public.enforce_aeo_active_prompt_limit()
  FROM PUBLIC, anon, authenticated;

-- Atomic deltas avoid the lost-update problem an aggregate-and-replace trigger
-- would have when two reservations settle concurrently in the same bucket.
CREATE OR REPLACE FUNCTION public.apply_aeo_quota_ledger_delta(
  p_organization_id UUID,
  p_engine_id TEXT,
  p_usage_date DATE,
  p_sampled_delta INTEGER,
  p_billable_delta INTEGER,
  p_cost_delta BIGINT,
  p_overage_override BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
BEGIN
  INSERT INTO public.aeo_quota_ledger (
    organization_id, engine_id, usage_date, sampled_units,
    billable_units, cost_micro_usd, overage_override
  ) VALUES (
    p_organization_id, p_engine_id, p_usage_date,
    GREATEST(0, p_sampled_delta), GREATEST(0, p_billable_delta),
    GREATEST(0, p_cost_delta), p_overage_override
  )
  ON CONFLICT (organization_id, engine_id, usage_date) DO UPDATE SET
    sampled_units = public.aeo_quota_ledger.sampled_units + p_sampled_delta,
    billable_units = public.aeo_quota_ledger.billable_units + p_billable_delta,
    cost_micro_usd = public.aeo_quota_ledger.cost_micro_usd + p_cost_delta,
    overage_override = public.aeo_quota_ledger.overage_override OR p_overage_override,
    updated_at = now();

  IF EXISTS (
    SELECT 1 FROM public.aeo_quota_ledger
    WHERE organization_id = p_organization_id
      AND engine_id = p_engine_id
      AND usage_date = p_usage_date
      AND (sampled_units < 0 OR billable_units < 0 OR cost_micro_usd < 0)
  ) THEN
    RAISE EXCEPTION 'AEO quota ledger delta would make a bucket negative';
  END IF;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.sync_aeo_quota_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_old_sampled INTEGER := 0;
  v_old_billable INTEGER := 0;
  v_old_cost BIGINT := 0;
  v_new_sampled INTEGER := 0;
  v_new_billable INTEGER := 0;
  v_new_cost BIGINT := 0;
BEGIN
  IF TG_OP <> 'INSERT' AND OLD.state = 'settled' THEN
    v_old_sampled := OLD.settled_units + OLD.overrun_units;
    v_old_billable := OLD.billable_units;
    v_old_cost := OLD.cost_micro_usd;
  END IF;
  IF TG_OP <> 'DELETE' AND NEW.state = 'settled' THEN
    v_new_sampled := NEW.settled_units + NEW.overrun_units;
    v_new_billable := NEW.billable_units;
    v_new_cost := NEW.cost_micro_usd;
  END IF;

  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND
      (OLD.organization_id, OLD.engine_id, OLD.usage_date)
      IS DISTINCT FROM (NEW.organization_id, NEW.engine_id, NEW.usage_date)) THEN
    PERFORM public.apply_aeo_quota_ledger_delta(
      OLD.organization_id, OLD.engine_id, OLD.usage_date,
      -v_old_sampled, -v_old_billable, -v_old_cost, false
    );
    v_old_sampled := 0; v_old_billable := 0; v_old_cost := 0;
  END IF;

  IF TG_OP <> 'DELETE' THEN
    PERFORM public.apply_aeo_quota_ledger_delta(
      NEW.organization_id, NEW.engine_id, NEW.usage_date,
      v_new_sampled - v_old_sampled,
      v_new_billable - v_old_billable,
      v_new_cost - v_old_cost,
      NEW.overage_authorised
    );

    IF NEW.state = 'settled' THEN
      UPDATE public.aeo_samples s
      SET cost_micro_usd = NEW.cost_micro_usd
      WHERE NEW.idempotency_key =
        s.run_id::text || ':' || s.prompt_id::text || ':' || s.engine_id || ':' || s.attempt::text;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS sync_aeo_quota_ledger ON public.aeo_quota_reservations;
CREATE TRIGGER sync_aeo_quota_ledger
  AFTER INSERT OR UPDATE OR DELETE ON public.aeo_quota_reservations
  FOR EACH ROW EXECUTE FUNCTION public.sync_aeo_quota_ledger();

REVOKE ALL ON FUNCTION public.apply_aeo_quota_ledger_delta(UUID, TEXT, DATE, INTEGER, INTEGER, BIGINT, BOOLEAN)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_aeo_quota_ledger()
  FROM PUBLIC, anon, authenticated;

-- Rebuild both derived surfaces from the authoritative reservations. This also
-- repairs the 61 launch-audit samples whose cost was stored as zero.
INSERT INTO public.aeo_quota_ledger (
  organization_id, engine_id, usage_date, sampled_units,
  billable_units, cost_micro_usd, overage_override
)
SELECT organization_id, engine_id, usage_date,
       COALESCE(sum(settled_units + overrun_units) FILTER (WHERE state = 'settled'), 0)::INTEGER,
       COALESCE(sum(billable_units) FILTER (WHERE state = 'settled'), 0)::INTEGER,
       COALESCE(sum(cost_micro_usd) FILTER (WHERE state = 'settled'), 0)::BIGINT,
       bool_or(overage_authorised)
FROM public.aeo_quota_reservations
GROUP BY organization_id, engine_id, usage_date
ON CONFLICT (organization_id, engine_id, usage_date) DO UPDATE SET
  sampled_units = EXCLUDED.sampled_units,
  billable_units = EXCLUDED.billable_units,
  cost_micro_usd = EXCLUDED.cost_micro_usd,
  overage_override = EXCLUDED.overage_override,
  updated_at = now();

UPDATE public.aeo_samples s
SET cost_micro_usd = r.cost_micro_usd
FROM public.aeo_quota_reservations r
WHERE r.state = 'settled'
  AND r.idempotency_key =
    s.run_id::text || ':' || s.prompt_id::text || ':' || s.engine_id || ':' || s.attempt::text;

-- apply-plan: deferred — applied alongside E-7, in the same window as
--   20260805230000. Nothing reads these tables until the orchestrator exists.
--
-- E-5: quota reservations — the write-ahead half of the ledger.
--
-- Follow-on to 20260805230000 rather than an edit to it. That migration is
-- merged but unapplied, so editing it would in fact be safe here; the repo rule
-- is never to modify an existing migration file, and check-migrations.mjs
-- enforces it. Carving out a quiet exception the first time it is inconvenient
-- is how a guard stops being one. If an exception mechanism is wanted, it should
-- be designed deliberately, not introduced by precedent.
--
-- Why reservations exist at all: charging a vendor and writing our row are
-- separate systems with no shared transaction, so the gap between them cannot be
-- closed — only pointed in a survivable direction.
--
--   call then record -> a crash leaves spend that happened but was not counted.
--                       The budget guard reads this ledger to decide what is
--                       left of a free daily allowance, so an undercount makes
--                       it authorise more spend. The error amplifies itself.
--   record then call -> a crash leaves spend counted that never happened. The
--                       guard turns conservative and some free capacity is lost.
--                       Bounded, detectable, reversible.
--
-- So units are claimed before dispatch and reconciled against what the engine
-- actually charged. Mirrors src/services/aeo/ledger/quota-reservation.ts; the
-- CHECK constraints below restate that state machine in the database, because
-- the service-role client and manual SQL do not pass through the TypeScript.

CREATE TABLE IF NOT EXISTS public.aeo_quota_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  /*
   * Stable across retries of the same work: runId:promptId:engineId:attempt.
   * Inngest step.run is at-least-once — a process that dies mid-step re-runs
   * that step whole — so this unique constraint is what stops a retry opening a
   * second reservation for a call that already went out.
   */
  idempotency_key TEXT NOT NULL UNIQUE,

  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.aeo_runs(id) ON DELETE SET NULL,
  engine_id TEXT NOT NULL CHECK (engine_id IN (
    'google_serp', 'google_ai_overview', 'google_ai_mode',
    'chatgpt', 'perplexity', 'gemini', 'claude', 'copilot'
  )),

  /* Free allowances are daily buckets, so usage is bucketed by UTC date. */
  usage_date DATE NOT NULL,

  /* Claimed up front, before the engine is called. */
  reserved_units INTEGER NOT NULL CHECK (reserved_units >= 0),

  state TEXT NOT NULL DEFAULT 'reserved'
    CHECK (state IN ('reserved', 'settled', 'released', 'expired')),

  /*
   * Recorded at reservation time, before the first billable call, so the
   * authorisation survives a crash — QA criterion #52. It is a record of what
   * was authorised, not a property derived from what happened.
   */
  overage_authorised BOOLEAN NOT NULL DEFAULT FALSE,

  /*
   * Set immediately before the engine is called, and incremented on every
   * attempt. A crash inside the call step re-runs that step, and we cannot know
   * whether the first request was billed — ordering cannot close that window.
   * This makes the retry VISIBLE instead of silent: dispatch_attempts > 1 means
   * a duplicate charge is possible for this reservation.
   *
   * The increment deliberately lives inside the call step rather than a step of
   * its own. A completed Inngest step is memoized and replayed, so a separate
   * marker step would report 1 attempt forever and hide the very duplicate it
   * exists to expose.
   */
  dispatched_at TIMESTAMPTZ,
  dispatch_attempts INTEGER NOT NULL DEFAULT 0 CHECK (dispatch_attempts >= 0),

  /*
   * Two different quantities, deliberately not one column.
   *
   * settled_units is what the engine actually consumed against the vendor's
   * DAILY ALLOWANCE. billable_units is the subset of that which cost MONEY —
   * the part falling outside the free bucket.
   *
   * A grounded Gemini call inside the free allowance consumes one unit and
   * costs nothing, so the two genuinely differ. Collapsing them into one column
   * forces a choice between a row the database rejects (units > 0 with zero
   * cost) and recording zero consumption for work that really did drain the
   * bucket. The second is worse than a lost row: consumedUnits() feeds the
   * budget guard, so undercounting free-tier usage makes it authorise further
   * spend — the self-amplifying failure this table exists to prevent, one layer
   * down.
   *
   * Allowance accounting reads settled_units. Money accounting reads
   * billable_units. Neither is derivable from the other.
   */
  settled_units INTEGER NOT NULL DEFAULT 0 CHECK (settled_units >= 0),
  billable_units INTEGER NOT NULL DEFAULT 0 CHECK (billable_units >= 0),
  cost_micro_usd BIGINT NOT NULL DEFAULT 0 CHECK (cost_micro_usd >= 0),

  /*
   * Consumption the engine reported ABOVE what this reservation claimed.
   *
   * costUnits is adapter-reported and only floored at zero, so a vendor can
   * legitimately report more than we pessimistically claimed. Without somewhere
   * to put the excess, settled_units <= reserved_units rejects the write, the
   * settle step retries forever, and the sweeper eventually expires the row —
   * recording ZERO consumption for units that really did drain the bucket. That
   * is the self-amplifying undercount this whole table exists to prevent, so the
   * overflow gets recorded rather than dropped.
   *
   * Allowance accounting must read settled_units + overrun_units. An overrun
   * also means cost_micro_usd is a FLOOR rather than an exact figure: we know
   * those units were consumed, not what the vendor charged for them. The column
   * being non-zero is the signal to go and reconcile against the vendor invoice.
   */
  overrun_units INTEGER NOT NULL DEFAULT 0 CHECK (overrun_units >= 0),

  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  /*
   * Consumption attributed to the claim cannot exceed it — anything beyond goes
   * to overrun_units — and money cannot exceed TOTAL consumption. So:
   *   settled <= reserved,  billable <= settled + overrun.
   * Note billable is bounded by total consumption rather than by settled_units:
   * an overrun is real consumption, and it is the part most likely to have cost
   * money, so excluding it from the bound would make a truthful row illegal.
   */
  CONSTRAINT aeo_quota_reservations_settled_within_reserved
    CHECK (settled_units <= reserved_units),
  CONSTRAINT aeo_quota_reservations_billable_within_consumed
    CHECK (billable_units <= settled_units + overrun_units),

  /*
   * An overrun is by definition the part that did not fit, so the claim must be
   * fully consumed before any of it exists. This keeps the column from becoming
   * a dumping ground that hides an ordinary accounting bug.
   */
  CONSTRAINT aeo_quota_reservations_overrun_only_when_full
    CHECK (overrun_units = 0 OR settled_units = reserved_units),

  /* An open reservation has not settled anything yet. */
  CONSTRAINT aeo_quota_reservations_open_has_no_settlement
    CHECK (state <> 'reserved' OR (settled_at IS NULL AND settled_units = 0 AND billable_units = 0 AND cost_micro_usd = 0 AND overrun_units = 0)),

  /* Every terminal state records when it terminated. */
  CONSTRAINT aeo_quota_reservations_terminal_has_settled_at
    CHECK (state = 'reserved' OR settled_at IS NOT NULL),

  /* Released and expired free their units; neither consumed nor spent anything. */
  CONSTRAINT aeo_quota_reservations_abandoned_bills_nothing
    CHECK (state NOT IN ('released', 'expired') OR (settled_units = 0 AND billable_units = 0 AND cost_micro_usd = 0 AND overrun_units = 0)),

  /* Money and billable units agree. Note this is deliberately NOT tied to
   * settled_units: consumption inside a free allowance is units without cost. */
  CONSTRAINT aeo_quota_reservations_cost_requires_billable_units
    CHECK ((billable_units = 0) = (cost_micro_usd = 0)),

  /* A counted attempt must have a timestamp, and vice versa. */
  CONSTRAINT aeo_quota_reservations_dispatch_fields_agree
    CHECK ((dispatch_attempts = 0) = (dispatched_at IS NULL))
);

/* The guard's hot read: what has this org consumed for this engine today. */
CREATE INDEX IF NOT EXISTS idx_aeo_quota_reservations_org_engine_date
  ON public.aeo_quota_reservations (organization_id, engine_id, usage_date);

/* The sweeper's read: open reservations old enough to be a crashed run. */
CREATE INDEX IF NOT EXISTS idx_aeo_quota_reservations_open
  ON public.aeo_quota_reservations (reserved_at)
  WHERE state = 'reserved';

ALTER TABLE public.aeo_quota_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY aeo_quota_reservations_select_own_org
  ON public.aeo_quota_reservations FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));

COMMENT ON TABLE public.aeo_quota_reservations IS
  'Source of truth for AEO engine spend. Units are claimed before an engine is called and reconciled to actual afterwards, so a crash overcounts (recoverable) rather than undercounts (self-amplifying, because the budget guard reads this to authorise further spend).';

COMMENT ON COLUMN public.aeo_quota_reservations.idempotency_key IS
  'runId:promptId:engineId:attempt. Deterministic, no timestamp: an Inngest step retry must resolve to the same reservation rather than opening a second one.';

/*
 * aeo_quota_ledger (20260805230000) stays as the derived daily rollup for fast
 * dashboard reads and billing export. Reservations are authoritative; the rollup
 * must always be rebuildable from them, never edited independently.
 */
COMMENT ON TABLE public.aeo_quota_ledger IS
  'Derived daily rollup of aeo_quota_reservations, for fast reads and billing export. Not the source of truth — must be rebuildable from reservations, never written independently.';

-- ---------------------------------------------------------------------------
-- Atomic reservation. This is the only sanctioned way to claim quota.
-- ---------------------------------------------------------------------------
--
-- The in-process budget guard (E-10, planEngineBudget) is ADVISORY. It cannot
-- serialize anything: two dispatch workers both read the same remaining balance
-- and both proceed, and the allowance is silently overspent. The insert has to
-- be the serialization point, so the allowance decision and the row are written
-- together under one lock.
--
-- The lock is keyed on (organization, engine, day), which is exactly the grain
-- of a free daily bucket. Two different engines, or two different orgs, do not
-- block each other.

CREATE OR REPLACE FUNCTION public.aeo_reserve_quota(
  p_idempotency_key TEXT,
  p_organization_id UUID,
  p_engine_id TEXT,
  p_usage_date DATE,
  p_requested_units INTEGER,
  p_free_per_day INTEGER,
  p_overage_authorised BOOLEAN,
  p_run_id UUID DEFAULT NULL
)
RETURNS TABLE (
  outcome TEXT,
  reservation_id UUID,
  granted_units INTEGER,
  deferred_units INTEGER,
  billable_units INTEGER,
  dispatch_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_existing public.aeo_quota_reservations%ROWTYPE;
  v_consumed INTEGER;
  v_remaining INTEGER;
  v_grant INTEGER;
  v_billable INTEGER;
  v_id UUID;
BEGIN
  -- Transaction-scoped: held until this statement's transaction commits, so the
  -- read of current consumption and the insert cannot be interleaved.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      p_organization_id::text || ':' || p_engine_id || ':' || p_usage_date::text, 0
    )
  );

  -- An Inngest step retry must resolve to the reservation it already made,
  -- never open a second one.
  SELECT * INTO v_existing
  FROM public.aeo_quota_reservations
  WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN QUERY SELECT 'existing'::TEXT, v_existing.id, v_existing.reserved_units,
                        0, 0, v_existing.dispatch_attempts;
    RETURN;
  END IF;

  -- No free bucket to protect: the engine bills from the first request by
  -- design. Affordability is the ledger's concern, not this guard's — blocking
  -- here would stop the product rather than protect it.
  IF p_free_per_day <= 0 THEN
    INSERT INTO public.aeo_quota_reservations
      (idempotency_key, organization_id, run_id, engine_id, usage_date, reserved_units, overage_authorised)
    VALUES
      (p_idempotency_key, p_organization_id, p_run_id, p_engine_id, p_usage_date, p_requested_units, p_overage_authorised)
    RETURNING id INTO v_id;
    RETURN QUERY SELECT 'granted'::TEXT, v_id, p_requested_units, 0, p_requested_units, 0;
    RETURN;
  END IF;

  -- Open claims count at full value; settled ones at what they actually used,
  -- INCLUDING any overrun. Omitting overrun_units here would be the undercount
  -- the column was added to prevent, just moved one query along.
  -- Released and expired contribute nothing, which is how swept work returns.
  SELECT COALESCE(SUM(
    CASE WHEN state = 'reserved' THEN reserved_units
         WHEN state = 'settled'  THEN settled_units + overrun_units
         ELSE 0 END
  ), 0)
  INTO v_consumed
  FROM public.aeo_quota_reservations
  WHERE organization_id = p_organization_id
    AND engine_id = p_engine_id
    AND usage_date = p_usage_date;

  v_remaining := GREATEST(0, p_free_per_day - v_consumed);

  IF p_requested_units <= v_remaining THEN
    v_grant := p_requested_units; v_billable := 0;
  ELSIF p_overage_authorised THEN
    v_grant := p_requested_units; v_billable := p_requested_units - v_remaining;
  ELSE
    -- Clip to the allowance and bill nothing. Never "run it and record the
    -- cost": an unauthorised charge cannot be undone once the request is sent.
    v_grant := v_remaining; v_billable := 0;
  END IF;

  IF v_grant <= 0 THEN
    RETURN QUERY SELECT 'deferred'::TEXT, NULL::UUID, 0, p_requested_units, 0, 0;
    RETURN;
  END IF;

  INSERT INTO public.aeo_quota_reservations
    (idempotency_key, organization_id, run_id, engine_id, usage_date, reserved_units, overage_authorised)
  VALUES
    (p_idempotency_key, p_organization_id, p_run_id, p_engine_id, p_usage_date, v_grant, p_overage_authorised)
  RETURNING id INTO v_id;

  RETURN QUERY SELECT
    (CASE WHEN v_grant < p_requested_units THEN 'partial' ELSE 'granted' END)::TEXT,
    v_id, v_grant, p_requested_units - v_grant, v_billable, 0;
END;
$fn$;

-- ---------------------------------------------------------------------------
-- Atomic dispatch marker.
-- ---------------------------------------------------------------------------
-- A read-then-write from the application would lose increments under retry.
-- UPDATE ... RETURNING is atomic on its own and needs no lock.

CREATE OR REPLACE FUNCTION public.aeo_mark_dispatched(
  p_reservation_id UUID,
  p_at TIMESTAMPTZ
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE v_attempts INTEGER;
BEGIN
  UPDATE public.aeo_quota_reservations
  SET dispatch_attempts = dispatch_attempts + 1,
      dispatched_at = COALESCE(dispatched_at, p_at)
  WHERE id = p_reservation_id
  RETURNING dispatch_attempts INTO v_attempts;

  IF v_attempts IS NULL THEN
    RAISE EXCEPTION 'No reservation % to dispatch', p_reservation_id;
  END IF;
  RETURN v_attempts;
END;
$fn$;

-- Service role only. These move money; nothing reachable from a browser session
-- should be able to call them. Matches the hardening in 20260804162339.
REVOKE EXECUTE ON FUNCTION public.aeo_reserve_quota(TEXT, UUID, TEXT, DATE, INTEGER, INTEGER, BOOLEAN, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aeo_mark_dispatched(UUID, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aeo_reserve_quota(TEXT, UUID, TEXT, DATE, INTEGER, INTEGER, BOOLEAN, UUID)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.aeo_mark_dispatched(UUID, TIMESTAMPTZ)
  TO service_role;

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

  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  /* Consumption cannot exceed the pessimistic claim, and money cannot exceed
   * consumption. billable <= settled <= reserved. */
  CONSTRAINT aeo_quota_reservations_settled_within_reserved
    CHECK (settled_units <= reserved_units),
  CONSTRAINT aeo_quota_reservations_billable_within_settled
    CHECK (billable_units <= settled_units),

  /* An open reservation has not settled anything yet. */
  CONSTRAINT aeo_quota_reservations_open_has_no_settlement
    CHECK (state <> 'reserved' OR (settled_at IS NULL AND settled_units = 0 AND billable_units = 0 AND cost_micro_usd = 0)),

  /* Every terminal state records when it terminated. */
  CONSTRAINT aeo_quota_reservations_terminal_has_settled_at
    CHECK (state = 'reserved' OR settled_at IS NOT NULL),

  /* Released and expired free their units; neither consumed nor spent anything. */
  CONSTRAINT aeo_quota_reservations_abandoned_bills_nothing
    CHECK (state NOT IN ('released', 'expired') OR (settled_units = 0 AND billable_units = 0 AND cost_micro_usd = 0)),

  /* Money and billable units agree. Note this is deliberately NOT tied to
   * settled_units: consumption inside a free allowance is units without cost. */
  CONSTRAINT aeo_quota_reservations_cost_requires_billable_units
    CHECK ((billable_units = 0) = (cost_micro_usd = 0))
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

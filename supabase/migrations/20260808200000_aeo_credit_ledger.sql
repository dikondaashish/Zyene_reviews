-- apply-plan: with-code — read and written by the E-9 credit-consumption
--   module and the Stripe renewal/checkout webhook handlers landing with it.
--
-- E-9: internal credit ledger for AEO metered overage.
--
-- Two tables. `aeo_credit_balances` is the current, mutable balance a
-- consumption check reads and decrements — one row per organization, reset
-- (not incremented) to the plan's grant on each billing-cycle renewal, per
-- the product decision that unused credit does not roll over.
--
-- `aeo_credit_ledger_entries` is an append-only journal of every event that
-- touched a balance: a reset, a credit debit, or an Stripe overage charge.
-- The balance table alone cannot answer "why is the balance what it is" or
-- reconcile against Stripe's own invoice items; this table exists so both
-- questions have an answer without re-deriving state from Stripe's API.
--
-- Deliberately NOT yet wired to fire in production: the consuming code checks
-- a kill-switch flag (AEO_METERED_BILLING_LIVE, unset by default) before it
-- ever reads these tables, and the Stripe overage Price these entries would
-- eventually reference (price_1U2HMAIiQQIaqDALvgvid1Us) is created inactive.
-- Applying this migration alone changes no customer-visible behaviour.

CREATE TABLE public.aeo_credit_balances (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- The plan's per-cycle grant, in micro-USD, as of the last reset. Stored
  -- alongside the remaining balance rather than looked up from the plan table
  -- at read time, so a mid-cycle plan change does not retroactively change
  -- what "how much was granted this cycle" means for the entries already
  -- written against it.
  granted_micro_usd BIGINT NOT NULL CHECK (granted_micro_usd >= 0),
  -- Never goes negative. A test that would exceed this amount pays the
  -- shortfall as Stripe overage instead of driving the balance below zero —
  -- enforced in code (credit-consumption.ts), asserted here as a backstop.
  balance_micro_usd BIGINT NOT NULL CHECK (balance_micro_usd >= 0),
  CHECK (balance_micro_usd <= granted_micro_usd),
  cycle_reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.aeo_credit_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- The test this entry accounts for. NULL only for a grant_reset entry, which
  -- belongs to a billing cycle rather than to any one sample.
  sample_id UUID REFERENCES public.aeo_samples(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('grant_reset', 'credit_consumed', 'overage_charged')),
  amount_micro_usd BIGINT NOT NULL CHECK (amount_micro_usd >= 0),
  -- Set only for overage_charged: the InvoiceItem this entry produced, so a
  -- support question ("was I charged for this?") resolves to one Stripe object
  -- instead of a search across the customer's whole invoice history.
  stripe_invoice_item_id TEXT,
  CHECK ((kind = 'overage_charged') = (stripe_invoice_item_id IS NOT NULL)),
  CHECK ((kind = 'grant_reset') = (sample_id IS NULL)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_credit_ledger_entries_org_created_idx
  ON public.aeo_credit_ledger_entries (organization_id, created_at DESC);

ALTER TABLE public.aeo_credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_credit_ledger_entries ENABLE ROW LEVEL SECURITY;

-- Read-only to the owning org, matching the aeo-answers storage bucket and
-- every other AEO table: a financial ledger is not something its own subject
-- may write to. Only the service role, used exclusively by the webhook
-- handlers and the dispatch worker, may insert or update these rows.
CREATE POLICY aeo_credit_balances_select_own_org
  ON public.aeo_credit_balances FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY aeo_credit_ledger_entries_select_own_org
  ON public.aeo_credit_ledger_entries FOR SELECT
  USING (organization_id IN (SELECT public.get_user_org_ids()));

-- One 'credit_consumed' entry per sample: "one test" is one dispatch unit, and
-- a dispatch unit settles at most once (SampleStore.persist is idempotent on
-- run/prompt/engine/attempt already). This is what makes aeo_consume_credit's
-- replay check below correct rather than merely convenient.
CREATE UNIQUE INDEX aeo_credit_ledger_entries_one_consumption_per_sample
  ON public.aeo_credit_ledger_entries (sample_id)
  WHERE kind = 'credit_consumed';

-- Stripe's idempotency key guarantees a replayed charge attempt returns the
-- SAME invoice item id, never a second one. This index makes recording that
-- replay a harmless 23505 rather than a second audit row for one real charge
-- — the application layer treats the conflict as "already recorded", the
-- same idiom src/services/stripe/webhook-handler.ts already uses for
-- stripe_webhook_events.
CREATE UNIQUE INDEX aeo_credit_ledger_entries_one_record_per_invoice_item
  ON public.aeo_credit_ledger_entries (stripe_invoice_item_id)
  WHERE kind = 'overage_charged';

-- Atomic debit-or-overage decision for one test.
--
-- `FOR UPDATE` on the balance row serializes concurrent samples for the SAME
-- org (an Inngest fan-out settles many samples in parallel); different orgs
-- never block each other, since each has its own row to lock.
--
-- Idempotent on p_sample_id, for the same reason aeo_reserve_quota is
-- idempotent on its idempotency_key: an Inngest step that crashes after this
-- runs but before Inngest durably records it WILL replay. Without the replay
-- check below, that replay would debit the balance a second time for a test
-- that was already paid for once — the credit-ledger equivalent of the
-- double-charge aeo_reserve_quota's idempotency_key already exists to prevent
-- on the vendor side.
CREATE OR REPLACE FUNCTION public.aeo_consume_credit(
  p_organization_id UUID,
  p_sample_id UUID,
  p_test_cost_micro_usd BIGINT
)
RETURNS TABLE (
  debited_micro_usd BIGINT,
  overage_micro_usd BIGINT,
  remaining_balance_micro_usd BIGINT,
  already_consumed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_existing public.aeo_credit_ledger_entries%ROWTYPE;
  v_balance BIGINT;
  v_debit BIGINT;
BEGIN
  SELECT * INTO v_existing
  FROM public.aeo_credit_ledger_entries
  WHERE sample_id = p_sample_id AND kind = 'credit_consumed';

  IF FOUND THEN
    RETURN QUERY SELECT
      v_existing.amount_micro_usd,
      GREATEST(p_test_cost_micro_usd - v_existing.amount_micro_usd, 0),
      COALESCE(
        (SELECT balance_micro_usd FROM public.aeo_credit_balances WHERE organization_id = p_organization_id),
        0
      ),
      TRUE;
    RETURN;
  END IF;

  SELECT balance_micro_usd INTO v_balance
  FROM public.aeo_credit_balances
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  -- No grant has ever landed for this org (e.g. its first renewal webhook has
  -- not fired yet). Zero credit, not an error: the whole cost is overage.
  IF NOT FOUND THEN
    v_balance := 0;
  END IF;

  v_debit := LEAST(v_balance, p_test_cost_micro_usd);

  IF v_debit > 0 THEN
    UPDATE public.aeo_credit_balances
    SET balance_micro_usd = balance_micro_usd - v_debit, updated_at = now()
    WHERE organization_id = p_organization_id;

    INSERT INTO public.aeo_credit_ledger_entries (organization_id, sample_id, kind, amount_micro_usd)
    VALUES (p_organization_id, p_sample_id, 'credit_consumed', v_debit);
  END IF;

  RETURN QUERY SELECT v_debit, p_test_cost_micro_usd - v_debit, GREATEST(v_balance - v_debit, 0), FALSE;
END;
$fn$;

-- Resets (never adds to) an org's balance to its plan's per-cycle grant.
--
-- No idempotency parameter of its own: the caller is always a webhook handler,
-- and src/services/stripe/webhook-handler.ts already inserts into
-- stripe_webhook_events (UNIQUE on event_id) before dispatching to any
-- handler, so a redelivered Stripe event never reaches this function twice.
-- Duplicating that guard here would be a second, redundant source of truth for
-- the same fact.
CREATE OR REPLACE FUNCTION public.aeo_reset_credit_grant(
  p_organization_id UUID,
  p_granted_micro_usd BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
BEGIN
  INSERT INTO public.aeo_credit_balances (organization_id, granted_micro_usd, balance_micro_usd, cycle_reset_at)
  VALUES (p_organization_id, p_granted_micro_usd, p_granted_micro_usd, now())
  ON CONFLICT (organization_id) DO UPDATE
  SET granted_micro_usd = EXCLUDED.granted_micro_usd,
      -- Zeroed to the new grant, never added to what was left — unused credit
      -- does not roll over, by product decision.
      balance_micro_usd = EXCLUDED.balance_micro_usd,
      cycle_reset_at = EXCLUDED.cycle_reset_at,
      updated_at = now();

  INSERT INTO public.aeo_credit_ledger_entries (organization_id, kind, amount_micro_usd)
  VALUES (p_organization_id, 'grant_reset', p_granted_micro_usd);
END;
$fn$;

-- Service role only. These move money; nothing reachable from a browser
-- session should be able to call them. Matches the hardening in 20260804162339
-- and the lockdown already applied to aeo_reserve_quota / aeo_mark_dispatched.
REVOKE EXECUTE ON FUNCTION public.aeo_consume_credit(UUID, UUID, BIGINT)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aeo_reset_credit_grant(UUID, BIGINT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aeo_consume_credit(UUID, UUID, BIGINT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.aeo_reset_credit_grant(UUID, BIGINT)
  TO service_role;

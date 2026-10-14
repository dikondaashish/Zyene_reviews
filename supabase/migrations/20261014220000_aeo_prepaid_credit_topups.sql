-- apply-plan: with-code - apply before setting AEO_METERED_BILLING_LIVE=true.
--   While that flag is off no code path reads the new column or calls the new
--   function, so deploying the code first is safe.
--
-- AEO moves from post-paid overage to prepaid balance: when an org's balance
-- reaches $0, tests pause until someone clicks "Add balance" and pays through
-- Stripe Checkout. No card is charged automatically any more.
--
-- Two pots, one row:
--   - balance_micro_usd           plan credit ($5 Starter / $10 Professional).
--                                 Reset - not added to - every billing cycle.
--   - purchased_balance_micro_usd money the customer paid for. Never expires,
--                                 never touched by aeo_reset_credit_grant.
-- A test draws plan credit first, so paid money lasts as long as possible.

ALTER TABLE public.aeo_credit_balances
  ADD COLUMN purchased_balance_micro_usd BIGINT NOT NULL DEFAULT 0
    CHECK (purchased_balance_micro_usd >= 0);

ALTER TABLE public.aeo_credit_ledger_entries
  ADD COLUMN stripe_checkout_session_id TEXT;

-- The original constraints were unnamed, so drop them by definition: the kind
-- list and the "only grant_reset has no sample" rule both mention grant_reset.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.aeo_credit_ledger_entries'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%grant_reset%'
  LOOP
    EXECUTE format('ALTER TABLE public.aeo_credit_ledger_entries DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.aeo_credit_ledger_entries
  ADD CONSTRAINT aeo_credit_ledger_entries_kind_valid
    CHECK (kind IN ('grant_reset', 'credit_consumed', 'overage_charged', 'topup_purchased')),
  ADD CONSTRAINT aeo_credit_ledger_entries_sample_scope
    CHECK ((kind IN ('grant_reset', 'topup_purchased')) = (sample_id IS NULL)),
  ADD CONSTRAINT aeo_credit_ledger_entries_topup_session
    CHECK ((kind = 'topup_purchased') = (stripe_checkout_session_id IS NOT NULL));

-- One credit per paid Checkout Session, however often Stripe redelivers it.
CREATE UNIQUE INDEX aeo_credit_ledger_entries_one_topup_per_session
  ON public.aeo_credit_ledger_entries (stripe_checkout_session_id)
  WHERE kind = 'topup_purchased';

-- Same contract as before (idempotent on sample, row-locked per org), now
-- drawing plan credit first and paid balance second. The single
-- credit_consumed row records the total debit, which the replay branch reads.
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
  v_plan BIGINT;
  v_paid BIGINT;
  v_from_plan BIGINT;
  v_from_paid BIGINT;
BEGIN
  SELECT * INTO v_existing
  FROM public.aeo_credit_ledger_entries
  WHERE sample_id = p_sample_id AND kind = 'credit_consumed';

  IF FOUND THEN
    RETURN QUERY SELECT
      v_existing.amount_micro_usd,
      GREATEST(p_test_cost_micro_usd - v_existing.amount_micro_usd, 0),
      COALESCE(
        (SELECT b.balance_micro_usd + b.purchased_balance_micro_usd
         FROM public.aeo_credit_balances b WHERE b.organization_id = p_organization_id),
        0
      ),
      TRUE;
    RETURN;
  END IF;

  SELECT balance_micro_usd, purchased_balance_micro_usd INTO v_plan, v_paid
  FROM public.aeo_credit_balances
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  IF NOT FOUND THEN
    v_plan := 0;
    v_paid := 0;
  END IF;

  v_from_plan := LEAST(v_plan, p_test_cost_micro_usd);
  v_from_paid := LEAST(v_paid, p_test_cost_micro_usd - v_from_plan);

  IF v_from_plan + v_from_paid > 0 THEN
    UPDATE public.aeo_credit_balances
    SET balance_micro_usd = balance_micro_usd - v_from_plan,
        purchased_balance_micro_usd = purchased_balance_micro_usd - v_from_paid,
        updated_at = now()
    WHERE organization_id = p_organization_id;

    INSERT INTO public.aeo_credit_ledger_entries (organization_id, sample_id, kind, amount_micro_usd)
    VALUES (p_organization_id, p_sample_id, 'credit_consumed', v_from_plan + v_from_paid);
  END IF;

  RETURN QUERY SELECT
    v_from_plan + v_from_paid,
    p_test_cost_micro_usd - v_from_plan - v_from_paid,
    (v_plan - v_from_plan) + (v_paid - v_from_paid),
    FALSE;
END;
$fn$;

-- Credits a paid top-up exactly once per Checkout Session. Returns false on a
-- redelivery. A brand-new row gets cycle_reset_at = epoch so the same-day guard
-- in aeo_reset_credit_grant never mistakes a top-up for today's plan grant.
CREATE OR REPLACE FUNCTION public.aeo_apply_credit_topup(
  p_organization_id UUID,
  p_checkout_session_id TEXT,
  p_amount_micro_usd BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
BEGIN
  IF NULLIF(p_checkout_session_id, '') IS NULL OR p_amount_micro_usd IS NULL OR p_amount_micro_usd <= 0 THEN
    RAISE EXCEPTION 'Invalid AEO credit top-up';
  END IF;

  -- Serializes concurrent redeliveries of the same session on the org row.
  PERFORM 1 FROM public.organizations WHERE id = p_organization_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'AEO credit top-up organization not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.aeo_credit_ledger_entries
    WHERE kind = 'topup_purchased' AND stripe_checkout_session_id = p_checkout_session_id
  ) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.aeo_credit_balances
    (organization_id, granted_micro_usd, balance_micro_usd, purchased_balance_micro_usd, cycle_reset_at)
  VALUES (p_organization_id, 0, 0, p_amount_micro_usd, 'epoch')
  ON CONFLICT (organization_id) DO UPDATE
  SET purchased_balance_micro_usd =
        public.aeo_credit_balances.purchased_balance_micro_usd + EXCLUDED.purchased_balance_micro_usd,
      updated_at = now();

  INSERT INTO public.aeo_credit_ledger_entries
    (organization_id, kind, amount_micro_usd, stripe_checkout_session_id)
  VALUES (p_organization_id, 'topup_purchased', p_amount_micro_usd, p_checkout_session_id);

  RETURN TRUE;
END;
$fn$;

REVOKE EXECUTE ON FUNCTION public.aeo_consume_credit(UUID, UUID, BIGINT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aeo_consume_credit(UUID, UUID, BIGINT)
  TO service_role;
REVOKE EXECUTE ON FUNCTION public.aeo_apply_credit_topup(UUID, TEXT, BIGINT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aeo_apply_credit_topup(UUID, TEXT, BIGINT)
  TO service_role;

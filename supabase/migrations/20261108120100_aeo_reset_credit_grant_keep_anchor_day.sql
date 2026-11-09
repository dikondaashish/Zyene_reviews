-- apply-plan: with-code — yearly-credit-reset-eligibility.ts documents the new cycle_reset_at contract this enforces.
--
-- Bug: a yearly-plan org anchored on the 29th-31st drifted to an earlier day
-- forever. The daily cron (yearly-credit-reset-eligibility.ts) reads the anchor
-- as cycle_reset_at's UTC day-of-month and fires on the LAST day of a month
-- too short to have it (Jan 31 -> Feb 28). This function then stamped
-- cycle_reset_at = now() (Feb 28), so from March on the anchor was the 28th:
-- three lost days in February, then every later cycle fired early. Any 30-day
-- month did the same to a 31st anchor.
--
-- Fix (no new column, no backfill, same signature/grants/SECURITY settings as
-- 20260808200000_aeo_credit_ledger.sql): cycle_reset_at is the date of the
-- latest FULL occurrence of the anchor day. A reset that IS the short-month
-- stand-in for that anchor - in a later month, on that month's last day, and
-- earlier than the anchor day - leaves cycle_reset_at where it is, so the cron
-- still sees the 31st next month. Every other reset (checkout, plan change,
-- monthly webhook renewal, an ordinary anniversary) re-anchors to now() as
-- before. The actual reset time is still recorded in updated_at and in the
-- grant_reset ledger entry.
--
-- Because a preserved cycle_reset_at is no longer today's date, a stand-in day
-- also checks for a grant_reset ledger entry dated today, so a duplicate
-- dispatch on that day stays a no-op. That ledger check runs ONLY on a
-- stand-in day (the only case where cycle_reset_at can lag a reset made
-- today); every other day keeps the original cycle_reset_at-date guard
-- exactly, so callers and tests that back-date cycle_reset_at to simulate a
-- later day still get a real reset. Dates are read in UTC explicitly,
-- matching the TypeScript side.
CREATE OR REPLACE FUNCTION public.aeo_reset_credit_grant(
  p_organization_id UUID,
  p_granted_micro_usd BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_today DATE := (now() AT TIME ZONE 'UTC')::date;
  v_prev TIMESTAMPTZ;
  v_prev_date DATE;
  v_month_start DATE := date_trunc('month', v_today)::date;
  v_last_day_of_month INT := EXTRACT(DAY FROM (v_month_start + INTERVAL '1 month' - INTERVAL '1 day'))::INT;
  v_is_stand_in BOOLEAN := false;
  v_cycle_reset_at TIMESTAMPTZ := now();
BEGIN
  SELECT cycle_reset_at INTO v_prev
  FROM public.aeo_credit_balances
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  IF v_prev IS NOT NULL THEN
    v_prev_date := (v_prev AT TIME ZONE 'UTC')::date;

    -- Short-month stand-in for a 29th/30th/31st anchor (e.g. Jan 31 -> Feb 28).
    v_is_stand_in := v_prev_date < v_month_start
      AND EXTRACT(DAY FROM v_today)::INT = v_last_day_of_month
      AND EXTRACT(DAY FROM v_prev_date)::INT > v_last_day_of_month;

    -- A repeat on the same calendar day is a no-op, never an error: a second
    -- reset would refill a balance already spent down today. A stand-in reset
    -- keeps cycle_reset_at, so on a stand-in day today's ledger entry is the
    -- only evidence a reset already ran.
    IF v_prev_date = v_today OR (v_is_stand_in AND EXISTS (
      SELECT 1 FROM public.aeo_credit_ledger_entries
      WHERE organization_id = p_organization_id
        AND kind = 'grant_reset'
        AND created_at >= (v_today::timestamp AT TIME ZONE 'UTC')
    )) THEN
      RETURN;
    END IF;

    IF v_is_stand_in THEN
      -- Keep the anchor: the cron still sees the 31st next month.
      v_cycle_reset_at := v_prev;
    END IF;
  END IF;

  INSERT INTO public.aeo_credit_balances (organization_id, granted_micro_usd, balance_micro_usd, cycle_reset_at)
  VALUES (p_organization_id, p_granted_micro_usd, p_granted_micro_usd, v_cycle_reset_at)
  ON CONFLICT (organization_id) DO UPDATE
  SET granted_micro_usd = EXCLUDED.granted_micro_usd,
      -- Zeroed to the new grant, never added to what was left - unused credit
      -- does not roll over, by product decision.
      balance_micro_usd = EXCLUDED.balance_micro_usd,
      cycle_reset_at = EXCLUDED.cycle_reset_at,
      updated_at = now();

  INSERT INTO public.aeo_credit_ledger_entries (organization_id, kind, amount_micro_usd)
  VALUES (p_organization_id, 'grant_reset', p_granted_micro_usd);
END;
$fn$;

-- Unchanged from 20260808200000: service role only.
REVOKE EXECUTE ON FUNCTION public.aeo_reset_credit_grant(UUID, BIGINT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aeo_reset_credit_grant(UUID, BIGINT)
  TO service_role;

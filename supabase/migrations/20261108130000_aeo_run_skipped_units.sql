-- apply-plan: with-code — the dispatch worker calls aeo_release_run_unit for
-- every unit that ends without a sample (insufficient balance, quota deferred,
-- engine not runnable, exhausted retries). Without this a run whose children
-- did not all insert a sample stayed 'running' forever: the finalize trigger
-- only counted samples, so aeo.run.completed and the phase-3 refresh never fired.
--
-- Spends and refunds nothing: a released unit never reserved (or its
-- reservation is handled by the existing quota ledger). This only lets the run
-- reach a terminal state.

ALTER TABLE public.aeo_runs
  ADD COLUMN IF NOT EXISTS skipped_samples INTEGER NOT NULL DEFAULT 0
    CHECK (skipped_samples >= 0);

-- One row per unit released without a sample. The primary key makes a release
-- idempotent: an Inngest retry of the release step cannot count a unit twice.
CREATE TABLE IF NOT EXISTS public.aeo_run_skipped_units (
  run_id UUID NOT NULL REFERENCES public.aeo_runs(id) ON DELETE CASCADE,
  unit_key TEXT NOT NULL CHECK (length(unit_key) BETWEEN 1 AND 300),
  reason TEXT NOT NULL CHECK (length(reason) BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (run_id, unit_key)
);

-- Service role only: no policies, so RLS denies every browser session.
ALTER TABLE public.aeo_run_skipped_units ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.aeo_run_skipped_units FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.aeo_run_skipped_units TO service_role;

-- Shared finalize path for the sample trigger and the skip RPC. Callers must
-- already hold the run row lock (both UPDATE it first), so the counters read
-- here are the ones this transaction just wrote.
CREATE OR REPLACE FUNCTION public.aeo_finalize_run_if_complete(p_run_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_expected INTEGER;
  v_completed INTEGER;
  v_skipped INTEGER;
  v_failed INTEGER;
  v_funding_skips INTEGER;
  v_status TEXT;
  v_message TEXT;
BEGIN
  SELECT expected_samples, completed_samples, skipped_samples
  INTO v_expected, v_completed, v_skipped
  FROM public.aeo_runs
  WHERE id = p_run_id AND status = 'running';

  IF NOT FOUND OR v_expected <= 0 OR v_completed + v_skipped < v_expected THEN
    RETURN FALSE;
  END IF;

  SELECT count(*) FILTER (WHERE status = 'failed')
  INTO v_failed
  FROM public.aeo_samples
  WHERE run_id = p_run_id;

  IF v_completed = 0 THEN
    -- Nothing was sampled. If every unit stood down for money or quota, the run
    -- is deferred (same as an empty run the planner could not afford);
    -- otherwise it failed.
    SELECT count(*) FILTER (WHERE reason IN ('insufficient_balance', 'deferred'))
    INTO v_funding_skips
    FROM public.aeo_run_skipped_units
    WHERE run_id = p_run_id;
    v_status := CASE WHEN v_funding_skips >= v_skipped THEN 'deferred' ELSE 'failed' END;
  ELSIF v_failed >= v_completed THEN
    v_status := 'failed';
  ELSIF v_failed > 0 OR v_skipped > 0 THEN
    v_status := 'partial';
  ELSE
    v_status := 'success';
  END IF;

  v_message := concat_ws('; ',
    CASE WHEN v_failed > 0 THEN v_failed::text || ' of ' || v_expected::text || ' samples failed' END,
    CASE WHEN v_skipped > 0 THEN v_skipped::text || ' of ' || v_expected::text || ' samples skipped' END
  );

  UPDATE public.aeo_runs
  SET status = v_status,
    error_message = NULLIF(v_message, ''),
    completed_at = now()
  WHERE id = p_run_id
    AND status = 'running';

  RETURN FOUND;
END;
$fn$;

REVOKE ALL ON FUNCTION public.aeo_finalize_run_if_complete(UUID)
  FROM PUBLIC, anon, authenticated;

-- Same signature, SECURITY DEFINER, search_path and grants as the definition in
-- 20260818190000; only the completion check now goes through the shared path,
-- which also counts skipped units.
--
-- A sample for a unit that was already released (release committed, then a
-- replay or retry went on to sample) reclaims that skip, so the unit is counted
-- once, as completed, and never both ways.
CREATE OR REPLACE FUNCTION public.finalize_aeo_run_sample()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_reclaimed INTEGER;
BEGIN
  -- Takes the run row lock first, the same order as aeo_release_run_unit.
  UPDATE public.aeo_runs
  SET completed_samples = completed_samples + 1
  WHERE id = NEW.run_id
    AND status = 'running';

  IF FOUND THEN
    DELETE FROM public.aeo_run_skipped_units
    WHERE run_id = NEW.run_id
      AND unit_key = NEW.prompt_id::text || ':' || NEW.engine_id || ':' || NEW.attempt::text;
    GET DIAGNOSTICS v_reclaimed = ROW_COUNT;
    IF v_reclaimed > 0 THEN
      UPDATE public.aeo_runs
      SET skipped_samples = GREATEST(0, skipped_samples - v_reclaimed)
      WHERE id = NEW.run_id;
    END IF;

    PERFORM public.aeo_finalize_run_if_complete(NEW.run_id);
  END IF;

  RETURN NEW;
END;
$fn$;

REVOKE ALL ON FUNCTION public.finalize_aeo_run_sample()
  FROM PUBLIC, anon, authenticated;

-- Releases one (prompt x engine x attempt) unit that ended without a sample.
-- Idempotent per unit, and a no-op when that unit did store a sample (e.g. a
-- failure handler firing after the sample was persisted), so a unit is never
-- counted both as completed and as skipped.
CREATE OR REPLACE FUNCTION public.aeo_release_run_unit(
  p_run_id UUID,
  p_prompt_id UUID,
  p_engine_id TEXT,
  p_attempt INTEGER,
  p_reason TEXT
)
RETURNS TABLE (released BOOLEAN, finalized BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_inserted INTEGER;
BEGIN
  -- Lock the run first, in the same order as the sample trigger, so a skip and
  -- the last sample cannot both miss the completion check.
  PERFORM 1 FROM public.aeo_runs WHERE id = p_run_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.aeo_samples
    WHERE run_id = p_run_id
      AND prompt_id IS NOT DISTINCT FROM p_prompt_id
      AND engine_id = p_engine_id
      AND attempt = p_attempt
  ) THEN
    RETURN QUERY SELECT FALSE, FALSE;
    RETURN;
  END IF;

  INSERT INTO public.aeo_run_skipped_units (run_id, unit_key, reason)
  VALUES (p_run_id, p_prompt_id::text || ':' || p_engine_id || ':' || p_attempt::text, p_reason)
  ON CONFLICT (run_id, unit_key) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 0 THEN
    RETURN QUERY SELECT FALSE, FALSE;
    RETURN;
  END IF;

  UPDATE public.aeo_runs
  SET skipped_samples = skipped_samples + 1
  WHERE id = p_run_id
    AND status = 'running';
  IF NOT FOUND THEN
    RETURN QUERY SELECT TRUE, FALSE;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, public.aeo_finalize_run_if_complete(p_run_id);
END;
$fn$;

REVOKE EXECUTE ON FUNCTION public.aeo_release_run_unit(UUID, UUID, TEXT, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aeo_release_run_unit(UUID, UUID, TEXT, INTEGER, TEXT)
  TO service_role;

-- One-time repair: runs already stuck before this fix. A dispatch child finishes
-- (or exhausts its retries) within hours, so anything still 'running' after a
-- day lost units to the old skip paths. Count the gap as skipped and finalize.
DO $repair$
DECLARE
  v_run RECORD;
BEGIN
  FOR v_run IN
    SELECT id FROM public.aeo_runs
    WHERE status = 'running'
      AND expected_samples > 0
      AND created_at < now() - interval '1 day'
    ORDER BY id
    FOR UPDATE
  LOOP
    UPDATE public.aeo_runs
    SET skipped_samples = GREATEST(0, expected_samples - completed_samples)
    WHERE id = v_run.id;
    PERFORM public.aeo_finalize_run_if_complete(v_run.id);
  END LOOP;
END;
$repair$;

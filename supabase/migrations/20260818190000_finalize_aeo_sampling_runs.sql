ALTER TABLE public.aeo_runs
  ADD COLUMN IF NOT EXISTS expected_samples INTEGER NOT NULL DEFAULT 0
    CHECK (expected_samples >= 0),
  ADD COLUMN IF NOT EXISTS completed_samples INTEGER NOT NULL DEFAULT 0
    CHECK (completed_samples >= 0);

CREATE OR REPLACE FUNCTION public.finalize_aeo_run_sample()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_expected INTEGER;
  v_completed INTEGER;
  v_failed INTEGER;
BEGIN
  UPDATE public.aeo_runs
  SET completed_samples = completed_samples + 1
  WHERE id = NEW.run_id
    AND status = 'running'
  RETURNING expected_samples, completed_samples
  INTO v_expected, v_completed;

  IF NOT FOUND OR v_expected <= 0 OR v_completed < v_expected THEN
    RETURN NEW;
  END IF;

  SELECT count(*) FILTER (WHERE status = 'failed')
  INTO v_failed
  FROM public.aeo_samples
  WHERE run_id = NEW.run_id;

  UPDATE public.aeo_runs
  SET status = CASE
      WHEN v_failed >= v_expected THEN 'failed'
      WHEN v_failed > 0 THEN 'partial'
      ELSE 'success'
    END,
    error_message = CASE
      WHEN v_failed > 0 THEN v_failed::text || ' of ' || v_expected::text || ' samples failed'
      ELSE NULL
    END,
    completed_at = now()
  WHERE id = NEW.run_id
    AND status = 'running';

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS finalize_aeo_run_sample ON public.aeo_samples;
CREATE TRIGGER finalize_aeo_run_sample
  AFTER INSERT ON public.aeo_samples
  FOR EACH ROW EXECUTE FUNCTION public.finalize_aeo_run_sample();

REVOKE ALL ON FUNCTION public.finalize_aeo_run_sample()
  FROM PUBLIC, anon, authenticated;

WITH run_counts AS (
  SELECT r.id,
    (SELECT count(*) FROM public.aeo_samples s WHERE s.run_id = r.id)::INTEGER AS samples,
    (SELECT count(*) FROM public.aeo_quota_reservations q WHERE q.run_id = r.id)::INTEGER AS reservations
  FROM public.aeo_runs r
)
UPDATE public.aeo_runs r
SET completed_samples = c.samples,
  expected_samples = GREATEST(r.expected_samples, c.samples, c.reservations)
FROM run_counts c
WHERE c.id = r.id;

WITH ready AS (
  SELECT r.id, r.expected_samples,
    count(*) FILTER (WHERE s.status = 'failed')::INTEGER AS failed
  FROM public.aeo_runs r
  JOIN public.aeo_samples s ON s.run_id = r.id
  WHERE r.status = 'running'
    AND r.expected_samples > 0
    AND r.completed_samples >= r.expected_samples
  GROUP BY r.id, r.expected_samples
)
UPDATE public.aeo_runs r
SET status = CASE
    WHEN ready.failed >= ready.expected_samples THEN 'failed'
    WHEN ready.failed > 0 THEN 'partial'
    ELSE 'success'
  END,
  error_message = CASE
    WHEN ready.failed > 0 THEN ready.failed::text || ' of ' || ready.expected_samples::text || ' samples failed'
    ELSE NULL
  END,
  completed_at = now()
FROM ready
WHERE ready.id = r.id;

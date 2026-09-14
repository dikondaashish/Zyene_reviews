-- Durable, service-role-only execution claims for privileged HTTP cron routes.
-- A claim covers one deterministic schedule occurrence and carries a lease so a
-- terminated serverless invocation cannot block recovery indefinitely.

CREATE TABLE IF NOT EXISTS public.cron_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL CHECK (char_length(job_name) BETWEEN 1 AND 120),
  occurrence_key text NOT NULL CHECK (char_length(occurrence_key) BETWEEN 1 AND 120),
  status text NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  lease_token uuid NOT NULL DEFAULT gen_random_uuid(),
  lease_expires_at timestamptz NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  failed_at timestamptz,
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_name, occurrence_key)
);

CREATE INDEX IF NOT EXISTS cron_job_runs_active_lease_idx
  ON public.cron_job_runs (job_name, lease_expires_at)
  WHERE status = 'running';

ALTER TABLE public.cron_job_runs ENABLE ROW LEVEL SECURITY;

-- No client policy: these records are operational data and only the server's
-- service-role cron wrapper may access them through the functions below.
REVOKE ALL ON TABLE public.cron_job_runs FROM PUBLIC, anon, authenticated;

-- Per-recipient records make an interrupted monthly newsletter retry only the
-- recipients that still lack a recorded provider acceptance.
CREATE TABLE IF NOT EXISTS public.marketing_newsletter_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_key text NOT NULL CHECK (edition_key ~ '^[0-9]{4}-[0-9]{2}$'),
  subscriber_id uuid NOT NULL REFERENCES public.marketing_subscribers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  resend_email_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (edition_key, subscriber_id)
);

ALTER TABLE public.marketing_newsletter_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.marketing_newsletter_deliveries FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_cron_job_run(
  p_job_name text,
  p_occurrence_key text,
  p_lease_seconds integer DEFAULT 900,
  p_max_attempts integer DEFAULT 3,
  p_allow_retry boolean DEFAULT true
)
RETURNS TABLE(action text, lease_token uuid, attempt_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_run public.cron_job_runs;
  v_active public.cron_job_runs;
  v_token uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_job_name IS NULL OR char_length(p_job_name) NOT BETWEEN 1 AND 120
     OR p_occurrence_key IS NULL OR char_length(p_occurrence_key) NOT BETWEEN 1 AND 120
     OR p_lease_seconds NOT BETWEEN 60 AND 3600
     OR p_max_attempts NOT BETWEEN 1 AND 10 THEN
    RAISE EXCEPTION 'Invalid cron run claim' USING ERRCODE = '22023';
  END IF;

  -- Serializes claims for a job across Vercel instances. The durable row below
  -- remains the source of truth after this transaction releases its lock.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('cron-job:' || p_job_name, 0::bigint)
  );

  SELECT * INTO v_run
  FROM public.cron_job_runs
  WHERE job_name = p_job_name
    AND occurrence_key = p_occurrence_key
  FOR UPDATE;

  IF FOUND AND v_run.status = 'completed' THEN
    RETURN QUERY SELECT 'already_completed'::text, v_run.lease_token, v_run.attempt_count;
    RETURN;
  END IF;

  IF FOUND AND v_run.status = 'running' AND v_run.lease_expires_at > now() THEN
    RETURN QUERY SELECT 'already_running'::text, v_run.lease_token, v_run.attempt_count;
    RETURN;
  END IF;

  IF FOUND AND NOT p_allow_retry THEN
    RETURN QUERY SELECT 'recovery_requires_review'::text, v_run.lease_token, v_run.attempt_count;
    RETURN;
  END IF;

  IF FOUND AND v_run.attempt_count >= p_max_attempts THEN
    RETURN QUERY SELECT 'attempts_exhausted'::text, v_run.lease_token, v_run.attempt_count;
    RETURN;
  END IF;

  -- Do not overlap adjacent schedule buckets while a prior occurrence has a
  -- valid lease (for example, a five-minute tick that runs longer than five minutes).
  SELECT * INTO v_active
  FROM public.cron_job_runs
  WHERE job_name = p_job_name
    AND status = 'running'
    AND lease_expires_at > now()
  ORDER BY started_at ASC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RETURN QUERY SELECT 'already_running'::text, v_active.lease_token, v_active.attempt_count;
    RETURN;
  END IF;

  v_token := gen_random_uuid();

  IF v_run.id IS NOT NULL THEN
    UPDATE public.cron_job_runs
    SET status = 'running',
        lease_token = v_token,
        lease_expires_at = now() + (p_lease_seconds * interval '1 second'),
        attempt_count = attempt_count + 1,
        started_at = now(),
        completed_at = NULL,
        failed_at = NULL,
        failure_code = NULL,
        updated_at = now()
    WHERE id = v_run.id;

    RETURN QUERY SELECT 'recovered'::text, v_token, v_run.attempt_count + 1;
    RETURN;
  END IF;

  INSERT INTO public.cron_job_runs (
    job_name,
    occurrence_key,
    status,
    lease_token,
    lease_expires_at
  ) VALUES (
    p_job_name,
    p_occurrence_key,
    'running',
    v_token,
    now() + (p_lease_seconds * interval '1 second')
  );

  RETURN QUERY SELECT 'acquired'::text, v_token, 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_cron_job_run(
  p_job_name text,
  p_occurrence_key text,
  p_lease_token uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.cron_job_runs
  SET status = 'completed',
      completed_at = now(),
      lease_expires_at = now(),
      updated_at = now()
  WHERE job_name = p_job_name
    AND occurrence_key = p_occurrence_key
    AND lease_token = p_lease_token
    AND status = 'running'
  RETURNING true;
$$;

CREATE OR REPLACE FUNCTION public.fail_cron_job_run(
  p_job_name text,
  p_occurrence_key text,
  p_lease_token uuid,
  p_failure_code text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.cron_job_runs
  SET status = 'failed',
      failed_at = now(),
      lease_expires_at = now(),
      failure_code = left(coalesce(p_failure_code, 'failed'), 120),
      updated_at = now()
  WHERE job_name = p_job_name
    AND occurrence_key = p_occurrence_key
    AND lease_token = p_lease_token
    AND status = 'running'
  RETURNING true;
$$;

REVOKE ALL ON FUNCTION public.claim_cron_job_run(text, text, integer, integer, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_cron_job_run(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fail_cron_job_run(text, text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_cron_job_run(text, text, integer, integer, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_cron_job_run(text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_cron_job_run(text, text, uuid, text) TO service_role;

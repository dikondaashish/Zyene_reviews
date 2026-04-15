-- Prevent overlapping competitor watch cron runs.

CREATE OR REPLACE FUNCTION public.acquire_competitor_watch_lock()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pg_try_advisory_lock(hashtext('competitor_watch_cron_v1'));
$$;

CREATE OR REPLACE FUNCTION public.release_competitor_watch_lock()
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pg_advisory_unlock(hashtext('competitor_watch_cron_v1'));
$$;

GRANT EXECUTE ON FUNCTION public.acquire_competitor_watch_lock() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.release_competitor_watch_lock() TO authenticated, service_role;

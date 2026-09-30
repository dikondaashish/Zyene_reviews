-- apply-plan: with-code - apply in the security release; workers already use service_role.
CREATE OR REPLACE FUNCTION public.acquire_platform_lock(
  p_id uuid, p_lock_duration interval DEFAULT '10 minutes'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  locked_id uuid;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Platform sync lock denied' USING ERRCODE = '42501';
  END IF;
  IF p_lock_duration IS NULL OR p_lock_duration < interval '1 minute'
     OR p_lock_duration > interval '30 minutes' THEN
    RAISE EXCEPTION 'Invalid sync lock duration' USING ERRCODE = '22023';
  END IF;

  UPDATE public.review_platforms
  SET sync_status = 'running', updated_at = now(), locked_until = now() + p_lock_duration
  WHERE id = p_id
    AND (sync_status <> 'running' OR locked_until IS NULL OR locked_until < now())
  RETURNING id INTO locked_id;

  RETURN locked_id IS NOT NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.acquire_platform_lock(uuid, interval)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_platform_lock(uuid, interval) TO service_role;

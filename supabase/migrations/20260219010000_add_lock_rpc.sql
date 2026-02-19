-- Remote Procedure Call (RPC) for atomic locking
-- This bypasses JS client query building issues and guarantees atomic updates.

CREATE OR REPLACE FUNCTION acquire_platform_lock(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result uuid;
BEGIN
  -- Attempt to acquire lock
  -- Conditions:
  -- 1. sync_status != 'running'
  -- 2. OR updated_at IS NULL (new rows)
  -- 3. OR updated_at < 10 mins ago (stale lock)
  
  UPDATE review_platforms
  SET 
    sync_status = 'running', 
    updated_at = NOW()
  WHERE id = p_id
  AND (
      sync_status != 'running'
      OR updated_at IS NULL
      OR updated_at < (NOW() - INTERVAL '10 minutes')
  )
  RETURNING id INTO v_result;

  -- Return true if lock acquired, false if rejected
  RETURN v_result IS NOT NULL;
END;
$$;

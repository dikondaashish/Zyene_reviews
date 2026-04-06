-- Phase 1: Add locked_until column for robust TTL-based sync locks
ALTER TABLE review_platforms ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Update the RPC to use locked_until instead of just updated_at
CREATE OR REPLACE FUNCTION acquire_platform_lock(p_id uuid, p_lock_duration interval DEFAULT '10 minutes')
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
  -- 2. OR locked_until IS NULL
  -- 3. OR locked_until < NOW() (stale lock by TTL)
  
  UPDATE review_platforms
  SET 
    sync_status = 'running', 
    updated_at = NOW(),
    locked_until = NOW() + p_lock_duration
  WHERE id = p_id
  AND (
      sync_status != 'running'
      OR locked_until IS NULL
      OR locked_until < NOW()
  )
  RETURNING id INTO v_result;

  -- Return true if lock acquired, false if rejected
  RETURN v_result IS NOT NULL;
END;
$$;

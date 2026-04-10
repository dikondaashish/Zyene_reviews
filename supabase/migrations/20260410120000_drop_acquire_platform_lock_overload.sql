-- PostgREST returns PGRST203 when both overloads exist and the client sends only p_id:
--   acquire_platform_lock(uuid)  vs  acquire_platform_lock(uuid, interval)
-- The single-arg version was superseded by TTL locking (20260406111000).
DROP FUNCTION IF EXISTS public.acquire_platform_lock(uuid);

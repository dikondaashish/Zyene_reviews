-- Harden SECURITY DEFINER functions that are reachable from PostgREST.
--
-- Problem
-- -------
-- bulk_add_customer_tags, bulk_remove_customer_tags and increment_ai_replies_used
-- are SECURITY DEFINER (owner: postgres), so they bypass RLS on customers and
-- organizations. None of them carried an authorization check, none set
-- search_path, and all three were EXECUTE-able by the `anon` role.
--
-- The application route (src/services/customers/bulk-api.ts) does call
-- userCanAccessBusiness() first, but PostgREST exposes the functions directly at
-- /rest/v1/rpc/<name>, so that check is bypassable with the public anon key.
-- Anyone holding customer UUIDs could rewrite tags across tenants, or inflate any
-- organization's AI reply counter.
--
-- Fix: scope the writes to businesses the caller can actually see, pin
-- search_path, and revoke anon EXECUTE. The service_role path is preserved so
-- background jobs keep working.
--
-- bulk_add_customer_tags / bulk_remove_customer_tags are recreated rather than
-- altered because they never existed in a migration — they were created directly
-- against the database and are being brought under version control here.

-- ---------------------------------------------------------------------------
-- 1. Tenant-scoped bulk tag functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bulk_add_customer_tags(
    customer_ids uuid[],
    new_tags text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE public.customers
    SET tags = ARRAY(
        SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || new_tags)
    ),
    updated_at = now()
    WHERE id = ANY(customer_ids)
      AND (
        auth.role() = 'service_role'
        OR business_id IN (SELECT public.get_user_business_ids())
      );
END;
$function$;

CREATE OR REPLACE FUNCTION public.bulk_remove_customer_tags(
    customer_ids uuid[],
    tags_to_remove text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE public.customers
    SET tags = ARRAY(
        SELECT t FROM unnest(tags) t WHERE NOT (t = ANY(tags_to_remove))
    ),
    updated_at = now()
    WHERE id = ANY(customer_ids)
      AND (
        auth.role() = 'service_role'
        OR business_id IN (SELECT public.get_user_business_ids())
      );
END;
$function$;

-- ---------------------------------------------------------------------------
-- 2. Org-scoped AI reply counter
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_ai_replies_used(org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.organizations
  SET ai_replies_used_this_month = COALESCE(ai_replies_used_this_month, 0) + 1
  WHERE id = org_id
    AND (
      auth.role() = 'service_role'
      OR id IN (SELECT public.get_user_org_ids())
    );
END;
$function$;

-- ---------------------------------------------------------------------------
-- 3. Revoke anonymous EXECUTE
-- ---------------------------------------------------------------------------
-- No caller relies on anonymous execution: bulk tag calls come from the
-- user-scoped client in bulk-api.ts, increment_ai_replies_used from the
-- user-scoped and service-role clients, and the competitor-watch locks from the
-- service-role client in services/cron/competitor-watch-run.ts.

REVOKE EXECUTE ON FUNCTION public.bulk_add_customer_tags(uuid[], text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_remove_customer_tags(uuid[], text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_ai_replies_used(uuid) FROM anon;

GRANT EXECUTE ON FUNCTION public.bulk_add_customer_tags(uuid[], text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bulk_remove_customer_tags(uuid[], text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_ai_replies_used(uuid) TO authenticated, service_role;

-- Cron-only advisory locks: service_role is the sole legitimate caller.
REVOKE EXECUTE ON FUNCTION public.acquire_competitor_watch_lock() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_competitor_watch_lock() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_competitor_watch_lock() TO service_role;
GRANT EXECUTE ON FUNCTION public.release_competitor_watch_lock() TO service_role;

-- ---------------------------------------------------------------------------
-- 4. Pin search_path on the remaining flagged function
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.increment_customer_requests(uuid, text, text, text)
    SET search_path = public;

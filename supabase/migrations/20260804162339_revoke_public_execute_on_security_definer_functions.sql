-- Corrects the REVOKE in 20260804162256_harden_security_definer_functions.sql.
--
-- That migration revoked EXECUTE from `anon` by name, which had no effect:
-- Postgres grants EXECUTE to PUBLIC on every new function, and `anon` inherits
-- that grant. Verification after applying showed the ACL still carried a leading
-- `=X/postgres` (PUBLIC) entry and has_function_privilege('anon', ...) was still
-- true.
--
-- Revoking from PUBLIC is what actually closes it. The resulting ACL matches
-- encrypt_token / decrypt_token, which were already locked down correctly.

REVOKE EXECUTE ON FUNCTION public.bulk_add_customer_tags(uuid[], text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bulk_remove_customer_tags(uuid[], text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_ai_replies_used(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.acquire_competitor_watch_lock() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_competitor_watch_lock() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.bulk_add_customer_tags(uuid[], text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bulk_remove_customer_tags(uuid[], text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_ai_replies_used(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.acquire_competitor_watch_lock() TO service_role;
GRANT EXECUTE ON FUNCTION public.release_competitor_watch_lock() TO service_role;

-- Deliberately NOT revoked: get_user_business_ids, get_user_org_ids and
-- get_user_store_role remain executable by anon/authenticated. 29 RLS policies
-- across 16 tables call them, so revoking would break RLS evaluation app-wide.
-- They are read-only and key off auth.uid(), which is NULL for anon, so an
-- anonymous caller gets an empty set.

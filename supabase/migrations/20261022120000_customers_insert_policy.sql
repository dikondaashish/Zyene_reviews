-- apply-plan: already-applied — applied to production 2026-10-22 via the Supabase MCP (recorded as version 20261022141326), before this PR merged.
-- 20260930145044 switched upsert_customer_by_identity and import_customers_by_identity
-- to SECURITY INVOKER so RLS is authoritative, but customers never had a permissive
-- INSERT policy (20260819230000 removed it), so every new customer failed with
-- "new row violates row-level security policy". Allow inserts for callers who can
-- write to the business; the restrictive business_scope_insert_guard still applies,
-- and the customers_prevent_identity_duplicates trigger still blocks duplicate
-- emails and phones on any insert path.
DROP POLICY IF EXISTS customers_insert_for_business_writers ON public.customers;

CREATE POLICY customers_insert_for_business_writers
ON public.customers FOR INSERT TO authenticated
WITH CHECK (business_id IN (SELECT public.authorized_business_ids(true)));

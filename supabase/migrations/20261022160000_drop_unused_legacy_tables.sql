-- apply-plan: already-applied — applied to production 2026-10-22 via the Supabase MCP (recorded as version 20261022220322), before this PR merged.
-- Drop three legacy tables that no code, function, trigger or view uses and that never held a row:
--   customer_contacts  superseded by customers (20260304201500_unify_crm_tables.sql)
--   opt_outs           superseded by sms_opt_outs (the 20260304202800 rename left both in place)
--   locations          created outside the migration chain; locations live on businesses
-- Ordering: no application code depends on these tables, so this can land before or after any deploy.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.customer_contacts)
     OR EXISTS (SELECT 1 FROM public.opt_outs)
     OR EXISTS (SELECT 1 FROM public.locations) THEN
    RAISE EXCEPTION 'Refusing to drop legacy tables: at least one contains rows';
  END IF;
END
$$;

DROP TABLE public.customer_contacts;
DROP TABLE public.opt_outs;
DROP TABLE public.locations;

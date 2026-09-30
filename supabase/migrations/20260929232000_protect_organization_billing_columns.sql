-- apply-plan: with-code - apply with the onboarding change that stops client entitlement writes.
-- RLS identifies the owner row, but does not restrict the columns an owner updates.
-- Only Stripe/service-role code may write billing and entitlement columns.
DO $$
DECLARE
  column_list TEXT;
BEGIN
  SELECT string_agg(quote_ident(attname), ', ') INTO column_list
    FROM pg_attribute WHERE attrelid = 'public.organizations'::regclass
      AND attnum > 0 AND NOT attisdropped;
  EXECUTE format('REVOKE INSERT (%1$s), UPDATE (%1$s) ON TABLE public.organizations FROM PUBLIC, anon, authenticated', column_list);
END;
$$;
REVOKE UPDATE ON public.organizations FROM PUBLIC, anon, authenticated;
GRANT UPDATE (name, slug, updated_at) ON public.organizations TO authenticated;

-- Client-side organization creation must use database defaults for entitlements.
REVOKE INSERT ON public.organizations FROM PUBLIC, anon, authenticated;
GRANT INSERT (name, slug, type) ON public.organizations TO authenticated;

ALTER TABLE public.organizations ALTER COLUMN plan SET DEFAULT 'none';

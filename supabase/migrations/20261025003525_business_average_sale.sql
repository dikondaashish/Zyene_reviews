-- apply-plan: already-applied — applied to production 2026-10-25 via the Supabase MCP (recorded as version 20261025003525), before the dashboard code that reads it merged.
-- Owner-entered average sale per customer, used only to estimate the dollar value of new
-- reviews on the dashboard results card ("16 new reviews x your $100 average sale").
-- Nullable: NULL falls back to a per-category default in src/lib/dashboard/review-value.ts.
-- Existing businesses RLS policies already cover reads and owner/admin/manager updates.
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS average_sale_cents integer
  CONSTRAINT businesses_average_sale_cents_range
  CHECK (average_sale_cents IS NULL OR (average_sale_cents > 0 AND average_sale_cents <= 100000000));

COMMENT ON COLUMN public.businesses.average_sale_cents IS
  'Owner-entered average sale per customer, in cents. Used only to estimate the value of new reviews on the dashboard. NULL means use the category default.';

-- Gradual campaign enrollment (CSV imports and invoice-copy email enrollment).
--
-- An import holds validated rows; a cron enrolls up to daily_limit rows per local day into
-- the campaign. Each enrolled row goes through the normal campaign worker, so channel
-- switches, opt-outs, unsubscribes, frequency caps and quiet hours all still apply.
-- Importing a contact is not consent: consent_confirmed_* records the owner's statement
-- that they may contact these customers, nothing more.

CREATE TABLE IF NOT EXISTS public.enrollment_imports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  campaign_id           UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  source                TEXT NOT NULL DEFAULT 'csv' CHECK (source IN ('csv', 'inbound_email')),
  file_name             TEXT CHECK (file_name IS NULL OR char_length(file_name) <= 255),
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  daily_limit           INT NOT NULL DEFAULT 25 CHECK (daily_limit BETWEEN 1 AND 500),
  total_rows            INT NOT NULL DEFAULT 0,
  valid_rows            INT NOT NULL DEFAULT 0,
  invalid_rows          INT NOT NULL DEFAULT 0,
  duplicate_rows        INT NOT NULL DEFAULT 0,
  enrolled_rows         INT NOT NULL DEFAULT 0,
  created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_confirmed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_confirmed_at  TIMESTAMPTZ,
  last_run_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enrollment_imports_active ON public.enrollment_imports (status, last_run_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS enrollment_imports_campaign ON public.enrollment_imports (campaign_id, created_at DESC);
-- At most one inbound-email enrollment stream per campaign.
CREATE UNIQUE INDEX IF NOT EXISTS enrollment_imports_one_inbound_per_campaign
  ON public.enrollment_imports (campaign_id) WHERE source = 'inbound_email';

CREATE TABLE IF NOT EXISTS public.enrollment_import_rows (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id          UUID NOT NULL REFERENCES public.enrollment_imports(id) ON DELETE CASCADE,
  business_id        UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  row_number         INT NOT NULL,
  customer_name      TEXT CHECK (customer_name IS NULL OR char_length(customer_name) <= 200),
  phone              TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
  email              TEXT CHECK (email IS NULL OR char_length(email) <= 320),
  identity_key       TEXT,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'invalid', 'duplicate', 'cancelled')),
  reason             TEXT,
  review_request_id  UUID REFERENCES public.review_requests(id) ON DELETE SET NULL,
  processed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (import_id, row_number)
);
CREATE INDEX IF NOT EXISTS enrollment_import_rows_queue ON public.enrollment_import_rows (import_id, status, row_number);
CREATE INDEX IF NOT EXISTS enrollment_import_rows_enrolled_today ON public.enrollment_import_rows (import_id, processed_at) WHERE status = 'enrolled';
-- No contact is enrolled twice from the same import.
CREATE UNIQUE INDEX IF NOT EXISTS enrollment_import_rows_identity
  ON public.enrollment_import_rows (import_id, identity_key) WHERE status IN ('pending', 'enrolled');

ALTER TABLE public.enrollment_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_import_rows ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['enrollment_imports', 'enrollment_import_rows'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_member_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (business_id IN (SELECT public.authorized_business_ids()))', t || '_member_read', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_backend', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t || '_backend', t);
  END LOOP;
END $$;
REVOKE INSERT, UPDATE, DELETE ON public.enrollment_imports, public.enrollment_import_rows FROM anon, authenticated;
REVOKE ALL ON public.enrollment_imports, public.enrollment_import_rows FROM anon;

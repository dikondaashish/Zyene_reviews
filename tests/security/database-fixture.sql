-- Synthetic database fixture. This file must only run in a disposable database.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE SCHEMA extensions;
CREATE SCHEMA internal;
CREATE SCHEMA test;
CREATE SCHEMA supabase_migrations;
CREATE TABLE supabase_migrations.schema_migrations (version text PRIMARY KEY);
CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '');
$$;
GRANT USAGE ON SCHEMA public, auth, test TO anon, authenticated, service_role;

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text, slug text, type text,
  plan text DEFAULT 'starter_monthly', plan_status text DEFAULT 'none',
  stripe_customer_id text, stripe_subscription_id text, referred_by_user_id uuid,
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.users (id uuid PRIMARY KEY);
INSERT INTO public.users (id)
  SELECT ('20000000-0000-4000-8000-' || lpad(id::text, 12, '0'))::uuid
  FROM generate_series(1, 8) AS id;
ALTER TABLE public.organizations ADD COLUMN trial_ends_at timestamptz,
  ADD COLUMN max_businesses integer, ADD COLUMN max_team_members integer,
  ADD COLUMN max_review_requests_per_month integer, ADD COLUMN max_ai_replies_per_month integer,
  ADD COLUMN max_email_requests_per_month integer, ADD COLUMN max_sms_requests_per_month integer,
  ADD COLUMN max_link_requests_per_month integer;
CREATE TABLE public.organization_members (
  organization_id uuid REFERENCES public.organizations, user_id uuid,
  role text, status text DEFAULT 'active', PRIMARY KEY (organization_id, user_id)
);
CREATE FUNCTION public.get_user_org_ids() RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND status = 'active';
$$;
CREATE TABLE public.aeo_samples (id uuid PRIMARY KEY);
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid REFERENCES public.organizations,
  name text, slug text, created_at timestamptz DEFAULT now()
);
CREATE TABLE public.business_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid REFERENCES public.businesses,
  user_id uuid, role text, status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE (business_id, user_id)
);
ALTER TABLE public.businesses ADD COLUMN auto_reply_enabled boolean DEFAULT true,
  ADD COLUMN auto_reply_enabled_at timestamptz;
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid REFERENCES public.organizations,
  business_id uuid REFERENCES public.businesses, email text, role text,
  -- Live baseline has no invited_by column; the forward migration must add it.
  token text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  accepted_at timestamptz, expires_at timestamptz DEFAULT now() + interval '7 days',
  created_at timestamptz DEFAULT now()
);
CREATE TABLE public.events (
  id uuid DEFAULT gen_random_uuid(), organization_id uuid, business_id uuid, user_id uuid,
  event_type text, entity_type text, entity_id uuid, metadata jsonb
);
CREATE TABLE public.review_platforms (
  id uuid PRIMARY KEY, business_id uuid REFERENCES public.businesses, platform text,
  external_id text, external_url text, google_account_id text, google_location_id text,
  granted_scopes text, sync_status text DEFAULT 'idle', last_synced_at timestamptz,
  google_listing_synced_at timestamptz, google_lodging_available boolean,
  google_lodging_health_score int, google_lodging_synced_at timestamptz,
  google_performance_synced_at timestamptz, google_place_actions_synced_at timestamptz,
  google_profile_health_score int, google_qa_synced_at timestamptz, google_qa_unavailable boolean,
  last_review_update_time timestamptz, average_rating numeric, total_reviews int,
  created_at timestamptz, updated_at timestamptz, token_expires_at timestamptz,
  access_token text, refresh_token text, sync_state jsonb, locked_until timestamptz
);
CREATE TABLE public.integrations (id uuid PRIMARY KEY, access_token text, refresh_token text);
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY, business_id uuid NOT NULL REFERENCES public.businesses,
  platform_id uuid REFERENCES public.review_platforms ON DELETE SET NULL
);
CREATE TABLE public.stripe_webhook_events (event_id text PRIMARY KEY, received_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), referrer_user_id uuid NOT NULL,
  referee_organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations,
  referee_user_id uuid, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
  created_at timestamptz DEFAULT now(), converted_at timestamptz, rewarded_at timestamptz
);
CREATE TABLE internal.vault_config (id text PRIMARY KEY, key_val text);
INSERT INTO internal.vault_config VALUES ('primary', repeat('synthetic-test-key-', 3));

INSERT INTO public.organizations (id, name, slug, plan, plan_status) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Tenant A', 'a', 'starter_monthly', 'active'),
  ('10000000-0000-4000-8000-000000000002', 'Tenant B', 'b', 'starter_monthly', 'active');
INSERT INTO public.organization_members VALUES
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'owner', 'active'),
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'manager', 'active'),
  ('10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000004', 'owner', 'active');
INSERT INTO public.referral_conversions (referrer_user_id, referee_organization_id, status) VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'converted');
INSERT INTO public.businesses (id, organization_id, name, slug) VALUES
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Business A', 'a'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Business B', 'b');
INSERT INTO public.business_members (business_id, user_id, role) VALUES
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'owner'),
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'manager'),
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'viewer');
INSERT INTO public.review_platforms (id, business_id, platform) VALUES
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'google'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'google');

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE internal.vault_config TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA internal TO anon, authenticated, service_role;
-- Simulate old explicit column grants as well as ordinary table grants.
GRANT SELECT (access_token), UPDATE (access_token) ON public.review_platforms TO authenticated;
GRANT SELECT (refresh_token) ON public.review_platforms TO anon;
GRANT UPDATE (plan), INSERT (plan) ON public.organizations TO authenticated;
GRANT SELECT (name) ON public.businesses TO anon;
GRANT SELECT (status), UPDATE (status) ON public.referral_conversions TO authenticated;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY old_org_reviews ON public.reviews FOR ALL TO authenticated USING (
  business_id IN (SELECT id FROM public.businesses)
);
CREATE POLICY tenant_invites ON public.invitations FOR ALL TO authenticated USING (
  business_id IN (SELECT id FROM public.businesses)
);
CREATE POLICY "Allow public read access" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.review_platforms FOR SELECT USING (true);
CREATE POLICY tenant_businesses ON public.businesses FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = businesses.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
);
CREATE POLICY tenant_platforms ON public.review_platforms FOR ALL TO authenticated USING (
  business_id IN (SELECT id FROM public.businesses)
);
CREATE POLICY tenant_members ON public.business_members FOR ALL TO authenticated USING (
  business_id IN (SELECT id FROM public.businesses)
);
CREATE POLICY tenant_organizations ON public.organizations FOR ALL TO authenticated USING (
  id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);
CREATE POLICY create_organization ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);

CREATE FUNCTION test.assert_true(value boolean, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF value IS DISTINCT FROM true THEN RAISE EXCEPTION 'Assertion failed: %', label; END IF;
END;
$$;
CREATE FUNCTION test.expect_denied(command text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN EXECUTE command;
  EXCEPTION WHEN insufficient_privilege THEN RETURN;
  END;
  RAISE EXCEPTION 'Expected permission denial: %', command;
END;
$$;
CREATE FUNCTION test.expect_retryable(command text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN EXECUTE command;
  EXCEPTION WHEN serialization_failure THEN RETURN;
  END;
  RAISE EXCEPTION 'Expected retryable conflict';
END;
$$;

CREATE TABLE test.policy_rows (id int PRIMARY KEY, tenant_id uuid, value text);
INSERT INTO test.policy_rows VALUES (1, '20000000-0000-4000-8000-000000000001', 'original');
GRANT SELECT, UPDATE ON test.policy_rows TO authenticated;
ALTER TABLE test.policy_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_read ON test.policy_rows FOR SELECT TO authenticated USING (tenant_id = auth.uid());
-- No WITH CHECK: PostgreSQL implicitly applies USING to the updated row.
CREATE POLICY tenant_update ON test.policy_rows FOR UPDATE TO authenticated USING (tenant_id = auth.uid());

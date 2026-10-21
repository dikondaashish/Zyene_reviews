-- Synthetic baseline for review-automation migrations (disposable database only).
-- Mirrors the live shape of the tables these migrations touch, including the constraints
-- production had before 2026-10-20, plus a stuck 'processing' campaign and email switches
-- left at the old FALSE default.
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
INSERT INTO auth.users (id, email)
  SELECT ('20000000-0000-4000-8000-' || lpad(id::text, 12, '0'))::uuid, 'user' || id || '@example.test'
  FROM generate_series(1, 8) AS id;

ALTER TABLE public.businesses
  ADD COLUMN timezone text NOT NULL DEFAULT 'America/New_York',
  ADD COLUMN email text,
  ADD COLUMN review_request_sms_enabled boolean NOT NULL DEFAULT TRUE,
  ADD COLUMN review_request_email_enabled boolean NOT NULL DEFAULT FALSE,
  ADD COLUMN review_request_frequency_cap_days int DEFAULT 30;

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Campaign',
  status varchar(20) NOT NULL DEFAULT 'active',
  channel varchar(10) NOT NULL DEFAULT 'sms',
  follow_up_enabled boolean NOT NULL DEFAULT false,
  follow_up_delay_hours int NOT NULL DEFAULT 48,
  total_sent int NOT NULL DEFAULT 0, total_opened int NOT NULL DEFAULT 0, total_clicked int NOT NULL DEFAULT 0,
  total_reviews_received int NOT NULL DEFAULT 0, total_completed int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_status_check CHECK (status IN ('active','paused','completed','processing'))
);

CREATE TABLE public.review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  customer_name text, customer_phone text, customer_email text, channel text NOT NULL DEFAULT 'sms',
  status text NOT NULL DEFAULT 'queued', error_message text,
  sent_at timestamptz, delivered_at timestamptz, opened_at timestamptz, clicked_at timestamptz, completed_at timestamptz,
  review_left boolean NOT NULL DEFAULT false, scheduled_for timestamptz,
  drip_status text NOT NULL DEFAULT 'idle', drip_terminated_reason text,
  sms_status text, email_status text, created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_requests_status_check CHECK (status IN ('queued','sending','processing','sent','delivered','opened',
    'clicked','review_left','failed','skipped','completed','feedback_left','rated_positive','rated_negative')),
  CONSTRAINT review_requests_drip_terminated_reason_check CHECK (drip_terminated_reason IS NULL OR drip_terminated_reason IN
    ('clicked','review_left','opted_out','manual_stop','exhausted')),
  CONSTRAINT review_requests_sms_status_check CHECK (sms_status IS NULL OR sms_status IN ('sent','failed')),
  CONSTRAINT review_requests_email_status_check CHECK (email_status IS NULL OR email_status IN ('sent','failed'))
);

-- Team invites always create an org membership too (viewer of Business A).
INSERT INTO public.organization_members VALUES
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'member', 'active');

-- Live-like data before the migrations run.
INSERT INTO public.campaigns (id, business_id, status, follow_up_enabled) VALUES
  ('50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'processing', true),
  ('50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'paused', true),
  ('50000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', 'active', false);
INSERT INTO public.review_requests (id, business_id, campaign_id, status, sent_at, clicked_at, drip_status, customer_email) VALUES
  ('70000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'sent', now() - interval '20 days', NULL, 'active', 'a@example.test'),
  ('70000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'clicked', now() - interval '20 days', now() - interval '19 days', 'terminated', 'b@example.test'),
  ('70000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'failed', NULL, NULL, 'idle', 'c@example.test');

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
-- Supabase grants new public tables to these roles by default; the migrations must revoke
-- what clients should not have (RLS + REVOKE are what is under test).
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

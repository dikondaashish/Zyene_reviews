-- Invoice-copy email enrollment: a unique inbound address per business. The business CCs or
-- BCCs it on invoices/receipts; the customer recipient is enrolled into a chosen campaign
-- through the gradual-enrollment queue (daily limit + every send-time eligibility check).
--
-- Safety: only allow-listed senders are accepted, staff / business / sender-domain
-- addresses are never enrolled, every provider event is processed at most once, and we
-- store only addresses and the outcome (no subject, body or attachments).

CREATE TABLE IF NOT EXISTS public.business_inbound_addresses (
  business_id      UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  address_token    TEXT NOT NULL UNIQUE CHECK (address_token ~ '^[a-z0-9]{16,40}$'),
  enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  campaign_id      UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  allowed_senders  TEXT[] NOT NULL DEFAULT '{}',
  updated_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (cardinality(allowed_senders) <= 25)
);

CREATE TABLE IF NOT EXISTS public.inbound_email_events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_event_id  TEXT NOT NULL UNIQUE CHECK (char_length(provider_event_id) <= 200),
  business_id        UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  from_address       TEXT CHECK (from_address IS NULL OR char_length(from_address) <= 320),
  status             TEXT NOT NULL CHECK (status IN ('received', 'enrolled', 'ignored', 'rejected')),
  reason             TEXT,
  candidates         INT NOT NULL DEFAULT 0,
  enrolled           INT NOT NULL DEFAULT 0,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inbound_email_events_business_recent ON public.inbound_email_events (business_id, received_at DESC);

ALTER TABLE public.business_inbound_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_email_events ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['business_inbound_addresses', 'inbound_email_events'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_member_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (business_id IN (SELECT public.authorized_business_ids()))', t || '_member_read', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_backend', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t || '_backend', t);
  END LOOP;
END $$;
REVOKE INSERT, UPDATE, DELETE ON public.business_inbound_addresses, public.inbound_email_events FROM anon, authenticated;
REVOKE ALL ON public.business_inbound_addresses, public.inbound_email_events FROM anon;

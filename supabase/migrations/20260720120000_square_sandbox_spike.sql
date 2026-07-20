-- Square POS sandbox spike: OAuth connection + payment event audit log
-- Phase 1 logs resolved contact only — no review sends.

CREATE TABLE IF NOT EXISTS square_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  access_token_expires_at TIMESTAMPTZ,
  auto_send_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  environment TEXT NOT NULL DEFAULT 'sandbox'
    CHECK (environment IN ('sandbox', 'production')),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  disconnected_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT square_connections_business_unique UNIQUE (business_id),
  CONSTRAINT square_connections_merchant_env_unique UNIQUE (merchant_id, environment)
);

CREATE TABLE IF NOT EXISTS square_payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL
    CHECK (status IN ('received', 'resolved', 'skipped_no_contact', 'error')),
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT square_payment_events_unique UNIQUE (merchant_id, payment_id, event_type)
);

CREATE INDEX IF NOT EXISTS square_payment_events_business_created_idx
  ON square_payment_events (business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS square_payment_events_payment_idx
  ON square_payment_events (merchant_id, payment_id);

ALTER TABLE square_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE square_payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY square_connections_select_member ON square_connections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM businesses b
      JOIN organization_members om ON om.organization_id = b.organization_id
      WHERE b.id = square_connections.business_id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM business_members bm
      WHERE bm.business_id = square_connections.business_id
        AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY square_payment_events_select_member ON square_payment_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM businesses b
      JOIN organization_members om ON om.organization_id = b.organization_id
      WHERE b.id = square_payment_events.business_id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM business_members bm
      WHERE bm.business_id = square_payment_events.business_id
        AND bm.user_id = auth.uid()
    )
  );

COMMENT ON TABLE square_connections IS
  'Square OAuth tokens per Zyene business; Phase 1 sandbox + production-ready schema';
COMMENT ON TABLE square_payment_events IS
  'Idempotent log of Square payment webhooks; Phase 1 logs resolved contact only (no send)';

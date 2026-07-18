-- Clover POS sandbox spike: OAuth connection + payment event audit log
-- No review sends in Phase 1 — events only store resolved contact for verification.

CREATE TABLE IF NOT EXISTS clover_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  auto_send_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  environment TEXT NOT NULL DEFAULT 'sandbox'
    CHECK (environment IN ('sandbox', 'production')),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT clover_connections_business_unique UNIQUE (business_id),
  CONSTRAINT clover_connections_merchant_env_unique UNIQUE (merchant_id, environment)
);

CREATE TABLE IF NOT EXISTS clover_payment_events (
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
  CONSTRAINT clover_payment_events_unique UNIQUE (merchant_id, payment_id, event_type)
);

CREATE INDEX IF NOT EXISTS clover_payment_events_business_created_idx
  ON clover_payment_events (business_id, created_at DESC);

ALTER TABLE clover_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE clover_payment_events ENABLE ROW LEVEL SECURITY;

-- Org members can read their business Clover connection (no token columns exposed via views later).
CREATE POLICY clover_connections_select_member ON clover_connections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM businesses b
      JOIN organization_members om ON om.organization_id = b.organization_id
      WHERE b.id = clover_connections.business_id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM business_members bm
      WHERE bm.business_id = clover_connections.business_id
        AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY clover_payment_events_select_member ON clover_payment_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM businesses b
      JOIN organization_members om ON om.organization_id = b.organization_id
      WHERE b.id = clover_payment_events.business_id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM business_members bm
      WHERE bm.business_id = clover_payment_events.business_id
        AND bm.user_id = auth.uid()
    )
  );

COMMENT ON TABLE clover_connections IS
  'Clover OAuth tokens per Zyene business; Phase 1 sandbox + production-ready schema';
COMMENT ON TABLE clover_payment_events IS
  'Idempotent log of Clover payment webhooks; Phase 1 logs resolved contact only (no send)';

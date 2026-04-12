-- Idempotent Stripe webhook processing (one row per Stripe event id)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE stripe_webhook_events IS 'Dedupes Stripe webhook deliveries; insert before handling each event.';

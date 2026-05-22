-- Phase 6: Newsletter subscribers + growth email sequence idempotency

CREATE TABLE IF NOT EXISTS marketing_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'newsletter',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT marketing_subscribers_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_marketing_subscribers_active
    ON marketing_subscribers (subscribed_at DESC)
    WHERE unsubscribed_at IS NULL;

ALTER TABLE marketing_subscribers ENABLE ROW LEVEL SECURITY;

-- Public insert via service role only (API route)
CREATE POLICY "Service role manages marketing_subscribers"
    ON marketing_subscribers
    FOR ALL
    USING (false)
    WITH CHECK (false);

COMMENT ON TABLE marketing_subscribers IS 'Phase 6 newsletter and lead capture emails';

CREATE TABLE IF NOT EXISTS growth_email_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_key TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'canceled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT growth_email_runs_unique UNIQUE (sequence_key, recipient_email, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_growth_email_runs_email ON growth_email_runs (recipient_email);

ALTER TABLE growth_email_runs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE growth_email_runs IS 'Prevents duplicate Inngest growth email sequences per org/user';

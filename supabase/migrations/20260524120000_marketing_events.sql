-- Marketing site event log (lead magnets, resource pages). Service role inserts via API routes.

CREATE TABLE IF NOT EXISTS marketing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    page_path TEXT,
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_events_name_created
    ON marketing_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_source_created
    ON marketing_events (source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_page_created
    ON marketing_events (page_path, created_at DESC);

ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages marketing_events"
    ON marketing_events
    FOR ALL
    USING (false)
    WITH CHECK (false);

COMMENT ON TABLE marketing_events IS 'Append-only marketing funnel events (template pack, tools, etc.)';

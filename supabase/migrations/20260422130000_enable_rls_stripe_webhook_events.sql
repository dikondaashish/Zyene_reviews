-- Security hardening: this table is only used by server-side webhook code.
-- Enable RLS so anonymous/public PostgREST access cannot read or mutate it.
ALTER TABLE IF EXISTS public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

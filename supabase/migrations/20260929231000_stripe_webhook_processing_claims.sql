-- apply-plan: with-code - apply before deploying the webhook claim handler; reconcile legacy rows separately.
-- Existing dedupe rows predate processing status. Keep them distinguishable so
-- operators can reconcile historical deliveries before treating them as done.
ALTER TABLE public.stripe_webhook_events
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'legacy_unknown',
    ADD COLUMN IF NOT EXISTS claim_token UUID,
    ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

ALTER TABLE public.stripe_webhook_events
    ADD CONSTRAINT stripe_webhook_events_status_check
    CHECK (status IN ('legacy_unknown', 'processing', 'failed', 'processed'));

ALTER TABLE public.stripe_webhook_events
    ALTER COLUMN status SET DEFAULT 'processing';

CREATE OR REPLACE FUNCTION public.claim_stripe_webhook_event(
    p_event_id TEXT, p_claim_token UUID
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
DECLARE
    v_status TEXT;
BEGIN
    INSERT INTO public.stripe_webhook_events (event_id, status, claim_token, claimed_at)
    VALUES (p_event_id, 'processing', p_claim_token, now())
    ON CONFLICT (event_id) DO UPDATE
    SET status = 'processing', claim_token = EXCLUDED.claim_token, claimed_at = now()
    WHERE public.stripe_webhook_events.status = 'failed'
       OR (public.stripe_webhook_events.status = 'processing'
           AND public.stripe_webhook_events.claimed_at < now() - INTERVAL '15 minutes')
    RETURNING status INTO v_status;

    IF FOUND THEN RETURN 'claimed'; END IF;
    SELECT status INTO v_status FROM public.stripe_webhook_events WHERE event_id = p_event_id;
    RETURN v_status;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.finish_stripe_webhook_event(
    p_event_id TEXT, p_claim_token UUID, p_succeeded BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
BEGIN
    UPDATE public.stripe_webhook_events
    SET status = CASE WHEN p_succeeded THEN 'processed' ELSE 'failed' END,
        processed_at = CASE WHEN p_succeeded THEN now() ELSE NULL END,
        claim_token = NULL,
        claimed_at = NULL
    WHERE event_id = p_event_id AND status = 'processing' AND claim_token = p_claim_token;
    RETURN FOUND;
END;
$fn$;

REVOKE ALL ON FUNCTION public.claim_stripe_webhook_event(TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finish_stripe_webhook_event(TEXT, UUID, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_stripe_webhook_event(TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_stripe_webhook_event(TEXT, UUID, BOOLEAN) TO service_role;

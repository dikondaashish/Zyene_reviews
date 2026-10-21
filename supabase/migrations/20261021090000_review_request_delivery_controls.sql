-- Review-request delivery controls.
--
-- * Quiet hours per business (evaluated in businesses.timezone at send time).
-- * review_request_messages: one row per intended message (request x step x channel).
--   The unique key is the send claim that stops retries / overlapping workers from
--   sending the same message twice, and it stores provider ids + delivery callbacks.
-- * review_request_email_unsubscribes: per-business opt-out from review-request email.
-- * Review confirmation kept separate from clicks / finishing the review page.
-- * Campaign reminder settings: stop-on-click is now explicit (default keeps old behaviour).
-- * Campaign stats trigger: only recount when a funnel field actually changes, and count
--   confirmed reviews separately from "finished the review page".

-- Channel switches -----------------------------------------------------------------------
-- The SMS / Email switches are now enforced at send time. review_request_email_enabled was
-- created with DEFAULT FALSE, but no send path ever read it and the settings form could not
-- save it (fixed 2026-10-20), so every FALSE is the column default, not an owner's choice.
-- Turn email on to keep today's behaviour before enforcement starts.
ALTER TABLE public.businesses ALTER COLUMN review_request_email_enabled SET DEFAULT TRUE;
UPDATE public.businesses SET review_request_email_enabled = TRUE WHERE review_request_email_enabled = FALSE;

-- Quiet hours -------------------------------------------------------------------------
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS review_request_quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS review_request_quiet_start TIME NOT NULL DEFAULT '21:00',
  ADD COLUMN IF NOT EXISTS review_request_quiet_end TIME NOT NULL DEFAULT '08:00';

-- Request facts -------------------------------------------------------------------------
ALTER TABLE public.review_requests
  ADD COLUMN IF NOT EXISTS review_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_confirmation_source TEXT,
  ADD COLUMN IF NOT EXISTS review_confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deferred_reason TEXT;

ALTER TABLE public.review_requests DROP CONSTRAINT IF EXISTS review_requests_confirmation_source_check;
ALTER TABLE public.review_requests ADD CONSTRAINT review_requests_confirmation_source_check
  CHECK (review_confirmation_source IS NULL OR review_confirmation_source IN ('manual', 'matched'));

ALTER TABLE public.review_requests DROP CONSTRAINT IF EXISTS review_requests_drip_terminated_reason_check;
ALTER TABLE public.review_requests ADD CONSTRAINT review_requests_drip_terminated_reason_check
  CHECK (drip_terminated_reason IS NULL OR drip_terminated_reason IN (
    'clicked', 'review_left', 'opted_out', 'manual_stop', 'exhausted', 'expired', 'unsubscribed'
  ));

-- Per-channel delivery facts (sent stays distinct from delivered / not delivered).
ALTER TABLE public.review_requests DROP CONSTRAINT IF EXISTS review_requests_sms_status_check;
ALTER TABLE public.review_requests ADD CONSTRAINT review_requests_sms_status_check
  CHECK (sms_status IS NULL OR sms_status IN ('sent', 'failed', 'delivered', 'undelivered', 'skipped'));
ALTER TABLE public.review_requests DROP CONSTRAINT IF EXISTS review_requests_email_status_check;
ALTER TABLE public.review_requests ADD CONSTRAINT review_requests_email_status_check
  CHECK (email_status IS NULL OR email_status IN ('sent', 'failed', 'delivered', 'bounced', 'complained', 'skipped'));

-- Campaign reminder settings -------------------------------------------------------------
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS stop_on_click BOOLEAN NOT NULL DEFAULT TRUE;
COMMENT ON COLUMN public.campaigns.stop_on_click IS
  'Stop reminders once the customer opens the review link (a click is not proof of a review).';
COMMENT ON COLUMN public.campaigns.follow_up_delay_hours IS
  'Hours between reminder steps (step 2 after step 1, step 3 after step 2). Read live by the reminder worker.';

-- Message ledger ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_request_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_request_id   UUID NOT NULL REFERENCES public.review_requests(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  step                SMALLINT NOT NULL DEFAULT 1 CHECK (step BETWEEN 1 AND 3),
  channel             TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  status              TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN (
                        'claimed', 'sent', 'delivered', 'failed', 'undelivered', 'bounced',
                        'complained', 'skipped')),
  status_rank         SMALLINT NOT NULL DEFAULT 0,
  provider_message_id TEXT,
  reason              TEXT,
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  last_event_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_request_id, step, channel)
);
CREATE UNIQUE INDEX IF NOT EXISTS review_request_messages_provider_id_key
  ON public.review_request_messages (channel, provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS review_request_messages_business_recent
  ON public.review_request_messages (business_id, created_at DESC);

-- Email unsubscribes --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_request_email_unsubscribes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email       TEXT NOT NULL CHECK (email = lower(btrim(email))),
  source      TEXT NOT NULL CHECK (source IN ('link', 'one_click', 'bounce', 'complaint', 'manual')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, email)
);

-- RLS: members of the business can read; all writes are server-side (service role).
ALTER TABLE public.review_request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_request_email_unsubscribes ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['review_request_messages', 'review_request_email_unsubscribes'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_member_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (business_id IN (SELECT public.authorized_business_ids()))', t || '_member_read', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_backend', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t || '_backend', t);
  END LOOP;
END $$;
REVOKE INSERT, UPDATE, DELETE ON public.review_request_messages, public.review_request_email_unsubscribes FROM anon, authenticated;

-- Campaign stats: recount only on real changes; confirmed reviews counted separately -----
CREATE OR REPLACE FUNCTION public.refresh_campaign_stats(p_campaign_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.campaigns c
  SET
    total_sent             = s.sent,
    total_opened           = s.opened,
    total_clicked          = s.clicked,
    total_completed        = s.completed,
    total_reviews_received = s.confirmed,
    updated_at             = now()
  FROM (
    SELECT
      count(*) FILTER (WHERE rr.sent_at IS NOT NULL)::int AS sent,
      count(*) FILTER (WHERE rr.opened_at IS NOT NULL OR rr.clicked_at IS NOT NULL
                          OR rr.completed_at IS NOT NULL)::int AS opened,
      count(*) FILTER (WHERE rr.clicked_at IS NOT NULL OR rr.completed_at IS NOT NULL)::int AS clicked,
      count(*) FILTER (WHERE rr.completed_at IS NOT NULL
                          OR rr.status IN ('completed', 'feedback_left', 'rated_positive', 'rated_negative'))::int AS completed,
      count(*) FILTER (WHERE rr.review_confirmed_at IS NOT NULL)::int AS confirmed
    FROM public.review_requests rr
    WHERE rr.campaign_id = p_campaign_id
  ) s
  WHERE c.id = p_campaign_id;
$$;
REVOKE ALL ON FUNCTION public.refresh_campaign_stats(uuid) FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS review_requests_campaign_stats ON public.review_requests;
DROP TRIGGER IF EXISTS review_requests_campaign_stats_write ON public.review_requests;
DROP TRIGGER IF EXISTS review_requests_campaign_stats_change ON public.review_requests;

CREATE TRIGGER review_requests_campaign_stats_write
  AFTER INSERT OR DELETE ON public.review_requests
  FOR EACH ROW EXECUTE FUNCTION public.review_requests_refresh_campaign_stats();

CREATE TRIGGER review_requests_campaign_stats_change
  AFTER UPDATE OF campaign_id, status, sent_at, opened_at, clicked_at, completed_at, review_confirmed_at
  ON public.review_requests
  FOR EACH ROW
  WHEN (OLD.campaign_id IS DISTINCT FROM NEW.campaign_id
     OR OLD.status IS DISTINCT FROM NEW.status
     OR OLD.sent_at IS DISTINCT FROM NEW.sent_at
     OR OLD.opened_at IS DISTINCT FROM NEW.opened_at
     OR OLD.clicked_at IS DISTINCT FROM NEW.clicked_at
     OR OLD.completed_at IS DISTINCT FROM NEW.completed_at
     OR OLD.review_confirmed_at IS DISTINCT FROM NEW.review_confirmed_at)
  EXECUTE FUNCTION public.review_requests_refresh_campaign_stats();

SELECT public.refresh_campaign_stats(id) FROM public.campaigns;

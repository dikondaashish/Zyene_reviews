-- apply-plan: with-code — additive; apply to production before the deploy of the PR that reads these columns.
-- Newsletter double opt-in. Between 2026-10-27 and 2026-11-07 bots submitted 65 addresses
-- (mostly real people's work emails) through the public review-request-templates form,
-- and every one received the template pack, the nurture sequence and the monthly newsletter.
-- Public-form sign-ups now stay pending (confirmed_at IS NULL) until the owner of the address
-- presses Confirm on the page linked from the confirmation email; only confirmed, subscribed
-- rows receive marketing mail.
ALTER TABLE public.marketing_subscribers
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS marketing_subscribers_confirmation_token_key
  ON public.marketing_subscribers (confirmation_token);

-- Subscribers who are active today keep receiving mail. The bot sign-ups were
-- unsubscribed by hand on 2026-11-08 and stay unconfirmed.
UPDATE public.marketing_subscribers
  SET confirmed_at = subscribed_at
  WHERE confirmed_at IS NULL AND unsubscribed_at IS NULL;

COMMENT ON COLUMN public.marketing_subscribers.confirmed_at IS
  'When the address owner confirmed the subscription. NULL = pending; no marketing mail is sent.';
COMMENT ON COLUMN public.marketing_subscribers.confirmation_token IS
  'Opaque token in the confirmation email link. Rotated whenever a sign-up returns to pending.';

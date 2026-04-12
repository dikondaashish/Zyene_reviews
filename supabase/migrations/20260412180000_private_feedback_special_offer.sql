-- Optional “special offer” banner on the public private-feedback step (1–3 stars)
ALTER TABLE public.businesses
    ADD COLUMN IF NOT EXISTS private_feedback_offer_mode text NOT NULL DEFAULT 'hidden',
    ADD COLUMN IF NOT EXISTS private_feedback_offer_message text;

ALTER TABLE public.businesses
    DROP CONSTRAINT IF EXISTS businesses_private_feedback_offer_mode_check;
ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_private_feedback_offer_mode_check
    CHECK (private_feedback_offer_mode IN ('hidden', 'visible'));

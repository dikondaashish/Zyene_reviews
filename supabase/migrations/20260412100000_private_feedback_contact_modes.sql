-- How email/phone appear on the public negative-feedback step: hidden | optional | required
ALTER TABLE public.businesses
    ADD COLUMN IF NOT EXISTS private_feedback_email_mode text NOT NULL DEFAULT 'optional',
    ADD COLUMN IF NOT EXISTS private_feedback_phone_mode text NOT NULL DEFAULT 'hidden';

ALTER TABLE public.businesses
    DROP CONSTRAINT IF EXISTS businesses_private_feedback_email_mode_check;
ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_private_feedback_email_mode_check
    CHECK (private_feedback_email_mode IN ('hidden', 'optional', 'required'));

ALTER TABLE public.businesses
    DROP CONSTRAINT IF EXISTS businesses_private_feedback_phone_mode_check;
ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_private_feedback_phone_mode_check
    CHECK (private_feedback_phone_mode IN ('hidden', 'optional', 'required'));

ALTER TABLE public.private_feedback
    ADD COLUMN IF NOT EXISTS customer_phone text;

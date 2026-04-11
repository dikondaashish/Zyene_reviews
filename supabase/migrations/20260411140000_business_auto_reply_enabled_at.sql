-- Only auto-reply to Google reviews created at/after the user turned the feature on
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS auto_reply_enabled_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.businesses.auto_reply_enabled_at IS 'When auto_reply_enabled was last turned on; reviews older than this (on Google) are not auto-replied.';

UPDATE public.businesses
SET auto_reply_enabled_at = now()
WHERE auto_reply_enabled IS TRUE AND auto_reply_enabled_at IS NULL;

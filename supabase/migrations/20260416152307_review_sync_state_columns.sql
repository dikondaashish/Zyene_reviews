-- Add incremental sync tracking fields for GBP review imports.

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS last_review_update_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_state JSONB DEFAULT NULL;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS google_update_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);


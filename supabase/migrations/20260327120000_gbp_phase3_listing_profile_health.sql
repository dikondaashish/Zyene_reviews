-- Phase 3: Google Business Information (listing) + profile health cache on platform

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_profile_health_score INT;

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_listing_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN public.review_platforms.google_profile_health_score IS '0–100 completeness score from Business Information API (Phase 3 cron/sync)';
COMMENT ON COLUMN public.review_platforms.google_listing_synced_at IS 'Last successful Google listing fetch for profile health';

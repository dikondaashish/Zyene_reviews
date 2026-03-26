-- Phase 4: Google My Business Lodging API (hotels / lodging categories)

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_lodging_synced_at TIMESTAMPTZ;

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_lodging_health_score INT;

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_lodging_available BOOLEAN;

COMMENT ON COLUMN public.review_platforms.google_lodging_synced_at IS 'Last lodging API probe or successful sync';
COMMENT ON COLUMN public.review_platforms.google_lodging_health_score IS '0–100 lodging section completeness (Phase 4)';
COMMENT ON COLUMN public.review_platforms.google_lodging_available IS 'False when Google returns no lodging resource (404) for this location';

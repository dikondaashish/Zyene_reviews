-- Add review_platforms.updated_at for sync lock TTL and stale-lock detection.
-- Used with acquire_platform_lock (see 20260219010000 and 20260406111000).
-- Idempotent: safe if the column already exists from a prior partial deploy.

ALTER TABLE review_platforms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

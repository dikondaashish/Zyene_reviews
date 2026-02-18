-- Add updated_at column for stale lock handling
ALTER TABLE review_platforms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

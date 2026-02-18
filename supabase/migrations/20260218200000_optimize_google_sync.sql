-- Add columns for static Google hierarchy IDs
ALTER TABLE review_platforms ADD COLUMN IF NOT EXISTS google_account_id TEXT;
ALTER TABLE review_platforms ADD COLUMN IF NOT EXISTS google_location_id TEXT;

-- Ensure sync_status has a default of 'idle'
ALTER TABLE review_platforms ALTER COLUMN sync_status SET DEFAULT 'idle';

-- Add index on google_account_id/location_id if needed for lookups (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_review_platforms_google_ids ON review_platforms(google_account_id, google_location_id);

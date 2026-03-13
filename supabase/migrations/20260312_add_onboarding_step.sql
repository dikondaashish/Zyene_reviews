-- Add onboarding_step column to users table
ALTER TABLE users ADD COLUMN onboarding_step INTEGER NOT NULL DEFAULT 0;

-- Comment for clarity
COMMENT ON COLUMN users.onboarding_step IS 'Tracks current step in onboarding wizard (0-4). 0 = not started, 1-3 = in progress, 4 = completed';

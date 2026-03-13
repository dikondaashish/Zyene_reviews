-- Add email_frequency and sms_phone_number to notification_preferences
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_frequency TEXT NOT NULL DEFAULT 'daily_digest',
ADD COLUMN IF NOT EXISTS sms_phone_number TEXT,
ADD COLUMN IF NOT EXISTS min_rating_threshold INT NOT NULL DEFAULT 1;

-- Add comment for clarity
COMMENT ON COLUMN notification_preferences.email_frequency IS 'Email notification frequency: immediately, daily_digest, or weekly_summary';
COMMENT ON COLUMN notification_preferences.sms_phone_number IS 'Phone number for SMS alerts (stored plaintext for Twilio integration)';
COMMENT ON COLUMN notification_preferences.min_rating_threshold IS 'Minimum star rating to trigger alerts: 1 (all), 2 (2 stars or below), 3 (3 stars or below)';

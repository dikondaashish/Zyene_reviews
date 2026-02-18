-- Migration: 011_add_google_review_url
-- Description: Add google_review_url to businesses table to allow overriding the platform URL.

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS google_review_url TEXT;

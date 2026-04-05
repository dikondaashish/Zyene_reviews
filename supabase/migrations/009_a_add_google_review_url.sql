-- Migration: 009_add_google_review_url
-- Description: Add google_review_url column to businesses table for storing the direct review link.

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS google_review_url TEXT;

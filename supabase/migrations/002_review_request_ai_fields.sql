-- Migration: Add AI review generation tracking fields to review_requests
-- These columns track the customer's rating, selected tags, and the AI-generated review text

-- Add new columns
ALTER TABLE review_requests
  ADD COLUMN IF NOT EXISTS rating_given      INTEGER,
  ADD COLUMN IF NOT EXISTS tags_selected     TEXT[],
  ADD COLUMN IF NOT EXISTS ai_review_text    TEXT,
  ADD COLUMN IF NOT EXISTS completed_at      TIMESTAMPTZ;

-- Drop old status constraint and add expanded one
ALTER TABLE review_requests DROP CONSTRAINT IF EXISTS review_requests_status_check;
ALTER TABLE review_requests ADD CONSTRAINT review_requests_status_check
  CHECK (status IN ('queued','sent','delivered','opened','clicked','review_left','failed','completed','feedback_left'));

-- Allow anonymous inserts for public review flow (customers aren't authenticated)
CREATE POLICY review_requests_anon_insert ON review_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous updates for tracking completion
CREATE POLICY review_requests_anon_update ON review_requests
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

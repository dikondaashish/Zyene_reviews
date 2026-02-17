-- Migration: Extend campaigns table with delay, follow-up, and draft status
-- -----------------------------------------------

-- 1. Expand status CHECK to include 'draft'
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('active', 'paused', 'completed', 'draft'));

-- 2. Expand trigger_type CHECK (manual → manual_batch, keep others)
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_trigger_type_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_trigger_type_check
  CHECK (trigger_type IN ('manual_batch', 'manual', 'scheduled', 'pos_payment'));

-- 3. Add new columns for delay and follow-up
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS delay_minutes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS follow_up_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_delay_hours INT NOT NULL DEFAULT 48,
  ADD COLUMN IF NOT EXISTS follow_up_template TEXT;

-- 4. Add total_completed (replaces total_reviews_received conceptually)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS total_completed INT NOT NULL DEFAULT 0;

-- 5. Expand review_requests status to include 'sending', 'completed', 'feedback_left'
--    (002 migration may have already added 'completed' and 'feedback_left')
ALTER TABLE review_requests DROP CONSTRAINT IF EXISTS review_requests_status_check;
ALTER TABLE review_requests ADD CONSTRAINT review_requests_status_check
  CHECK (status IN ('queued','sending','sent','delivered','opened',
                    'clicked','review_left','failed','completed','feedback_left'));

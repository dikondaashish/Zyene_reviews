-- Phase 1 drip campaigns: lean columns on campaigns + review_requests
-- Fixed timing (7d / 7d) lives in application code, not follow_up_delay_hours.

-- campaigns ---------------------------------------------------------------
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS drip_step3_template TEXT,
  ADD COLUMN IF NOT EXISTS drip_channel_alternate BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN campaigns.drip_step3_template IS
  'Optional Step 3 copy; if null, worker falls back to follow_up_template';
COMMENT ON COLUMN campaigns.drip_channel_alternate IS
  'When true, prefer opposite channel of last send if contact exists';

-- review_requests ---------------------------------------------------------
ALTER TABLE review_requests
  ADD COLUMN IF NOT EXISTS drip_status TEXT NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS drip_terminated_reason TEXT,
  ADD COLUMN IF NOT EXISTS drip_steps_sent INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_drip_channel TEXT,
  ADD COLUMN IF NOT EXISTS step2_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS step3_sent_at TIMESTAMPTZ;

ALTER TABLE review_requests
  DROP CONSTRAINT IF EXISTS review_requests_drip_status_check;
ALTER TABLE review_requests
  ADD CONSTRAINT review_requests_drip_status_check
  CHECK (drip_status IN ('idle', 'active', 'completed', 'terminated'));

ALTER TABLE review_requests
  DROP CONSTRAINT IF EXISTS review_requests_drip_terminated_reason_check;
ALTER TABLE review_requests
  ADD CONSTRAINT review_requests_drip_terminated_reason_check
  CHECK (
    drip_terminated_reason IS NULL
    OR drip_terminated_reason IN (
      'clicked', 'review_left', 'opted_out', 'manual_stop', 'exhausted'
    )
  );

ALTER TABLE review_requests
  DROP CONSTRAINT IF EXISTS review_requests_drip_steps_sent_check;
ALTER TABLE review_requests
  ADD CONSTRAINT review_requests_drip_steps_sent_check
  CHECK (drip_steps_sent BETWEEN 1 AND 3);

ALTER TABLE review_requests
  DROP CONSTRAINT IF EXISTS review_requests_last_drip_channel_check;
ALTER TABLE review_requests
  ADD CONSTRAINT review_requests_last_drip_channel_check
  CHECK (
    last_drip_channel IS NULL
    OR last_drip_channel IN ('sms', 'email')
  );

CREATE INDEX IF NOT EXISTS idx_review_requests_drip_due
  ON review_requests (campaign_id, drip_status, drip_steps_sent, sent_at)
  WHERE drip_status = 'active' AND review_left = false;

-- Backfill active drip from existing follow-up campaigns -------------------
UPDATE review_requests rr
SET
  drip_status = 'active',
  drip_steps_sent = CASE WHEN COALESCE(rr.is_follow_up_sent, false) THEN 2 ELSE 1 END,
  step2_sent_at = CASE
    WHEN COALESCE(rr.is_follow_up_sent, false) THEN rr.follow_up_sent_at
    ELSE NULL
  END,
  last_drip_channel = CASE
    WHEN rr.channel IN ('sms', 'email') THEN rr.channel
    ELSE NULL
  END
FROM campaigns c
WHERE rr.campaign_id = c.id
  AND c.follow_up_enabled = true
  AND c.status = 'active'
  AND rr.sent_at IS NOT NULL
  AND COALESCE(rr.review_left, false) = false
  AND rr.clicked_at IS NULL
  AND rr.completed_at IS NULL
  AND rr.status NOT IN ('failed', 'skipped');

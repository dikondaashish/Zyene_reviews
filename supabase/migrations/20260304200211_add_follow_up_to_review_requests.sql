-- Add follow_up_sent column to review_requests table
ALTER TABLE review_requests
ADD COLUMN is_follow_up_sent BOOLEAN DEFAULT false,
ADD COLUMN follow_up_sent_at TIMESTAMPTZ;

-- Add an index to speed up the cron job query for pending follow-ups
CREATE INDEX IF NOT EXISTS idx_review_requests_follow_up 
ON review_requests(status, review_left, is_follow_up_sent) 
WHERE status = 'delivered' AND review_left = false AND is_follow_up_sent = false;

-- Add 'processing' to review_requests.status enum-like CHECK constraint.
-- Used for scheduled sends (queued → processing → sent/failed).

ALTER TABLE "public"."review_requests" DROP CONSTRAINT IF EXISTS review_requests_status_check;
ALTER TABLE "public"."review_requests"
  ADD CONSTRAINT review_requests_status_check
  CHECK (status IN (
    'queued',
    'sending',
    'processing',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'review_left',
    'failed',
    'skipped',
    'completed',
    'feedback_left'
  ));


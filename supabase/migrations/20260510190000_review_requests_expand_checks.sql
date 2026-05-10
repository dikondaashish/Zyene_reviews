-- Align review_requests CHECK constraints with application usage:
-- - channel 'link' (v1 API, public review flow)
-- - trigger_source 'public_link' (anonymous / link tracking inserts)
-- - status rated_positive / rated_negative (review-flow rating step → /api/track/review)

ALTER TABLE "public"."review_requests" DROP CONSTRAINT IF EXISTS review_requests_channel_check;
ALTER TABLE "public"."review_requests"
  ADD CONSTRAINT review_requests_channel_check
  CHECK (channel IN ('sms', 'email', 'link'));

ALTER TABLE "public"."review_requests" DROP CONSTRAINT IF EXISTS review_requests_trigger_source_check;
ALTER TABLE "public"."review_requests"
  ADD CONSTRAINT review_requests_trigger_source_check
  CHECK (trigger_source IN ('manual', 'campaign', 'pos_square', 'zapier', 'public_link'));

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
    'feedback_left',
    'rated_positive',
    'rated_negative'
  ));

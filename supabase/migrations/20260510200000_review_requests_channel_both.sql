-- Manual send dialog: channel "both" sends SMS + email on one review_request row.

ALTER TABLE "public"."review_requests" DROP CONSTRAINT IF EXISTS review_requests_channel_check;
ALTER TABLE "public"."review_requests"
  ADD CONSTRAINT review_requests_channel_check
  CHECK (channel IN ('sms', 'email', 'link', 'both'));

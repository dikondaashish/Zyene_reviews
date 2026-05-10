-- Per-channel send result for review_requests rows.
--
-- The single `status` column already encodes the row-level lifecycle
-- (queued -> sent -> delivered -> clicked -> completed). For channel="both"
-- we lose visibility into which leg actually went out vs failed, and even
-- for single-channel rows we sometimes need to know "did SMS go through?"
-- without parsing `error_message`.
--
-- Both columns are nullable: NULL means "this leg was not used on this row"
-- (e.g. sms_status is NULL when channel='email' or channel='link').

ALTER TABLE "public"."review_requests"
  ADD COLUMN IF NOT EXISTS "email_status" TEXT NULL,
  ADD COLUMN IF NOT EXISTS "sms_status" TEXT NULL;

ALTER TABLE "public"."review_requests"
  DROP CONSTRAINT IF EXISTS review_requests_email_status_check;
ALTER TABLE "public"."review_requests"
  ADD CONSTRAINT review_requests_email_status_check
  CHECK (email_status IS NULL OR email_status IN ('sent', 'failed'));

ALTER TABLE "public"."review_requests"
  DROP CONSTRAINT IF EXISTS review_requests_sms_status_check;
ALTER TABLE "public"."review_requests"
  ADD CONSTRAINT review_requests_sms_status_check
  CHECK (sms_status IS NULL OR sms_status IN ('sent', 'failed'));

-- Helpful indexes for stats queries on the requests page (filter outbound +
-- per-channel state). Partial indexes keep them small.
CREATE INDEX IF NOT EXISTS idx_review_requests_email_status
  ON "public"."review_requests" (business_id, email_status)
  WHERE email_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_review_requests_sms_status
  ON "public"."review_requests" (business_id, sms_status)
  WHERE sms_status IS NOT NULL;

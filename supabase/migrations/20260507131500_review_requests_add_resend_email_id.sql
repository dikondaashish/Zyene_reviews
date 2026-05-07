-- Track Resend email id for delivery/open/click/bounce webhooks.

ALTER TABLE "public"."review_requests"
  ADD COLUMN IF NOT EXISTS "resend_email_id" TEXT;

CREATE INDEX IF NOT EXISTS idx_review_requests_resend_email_id
  ON "public"."review_requests" ("resend_email_id")
  WHERE "resend_email_id" IS NOT NULL;


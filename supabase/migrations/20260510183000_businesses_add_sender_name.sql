-- Adds an optional per-business "sender name" used as the From display
-- in review request emails (e.g. "Sam <hello@zyenereviews.com>").
-- When NULL, the From line falls back to the business name.

ALTER TABLE "public"."businesses"
  ADD COLUMN IF NOT EXISTS "sender_name" TEXT;

COMMENT ON COLUMN "public"."businesses"."sender_name" IS
  'Optional human-friendly first name used as the From display name and email signoff for review requests. Falls back to businesses.name when null.';

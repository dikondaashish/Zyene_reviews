-- Alter private_feedback to add new service recovery columns
ALTER TABLE "public"."private_feedback"
ADD COLUMN IF NOT EXISTS "customer_email" text,
ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'open'::text,
ADD COLUMN IF NOT EXISTS "category" text;

-- Add a check constraint to ensure status is one of the allowed values
ALTER TABLE "public"."private_feedback"
ADD CONSTRAINT "private_feedback_status_check" CHECK (status IN ('open', 'contacted', 'resolved'));

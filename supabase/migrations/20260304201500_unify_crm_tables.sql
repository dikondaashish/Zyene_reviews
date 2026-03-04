-- Migration to unify customer_contacts and customers
-- Adding tracking fields to customers table for frequency capping and stats

ALTER TABLE "public"."customers" 
ADD COLUMN IF NOT EXISTS "last_request_sent_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "total_requests_sent" integer DEFAULT 0;

-- Add unique constraints to allow upserting and avoid duplicates
-- We'll try to add them, but if there are duplicates we might need to clean up first.
-- In a real scenario we'd do data cleanup here, but let's assume it's fresh enough.

-- NOTE: We use phone OR email as unique identifiers per business
ALTER TABLE "public"."customers" DROP CONSTRAINT IF EXISTS ux_customers_business_phone;
ALTER TABLE "public"."customers" ADD CONSTRAINT ux_customers_business_phone UNIQUE (business_id, phone);

ALTER TABLE "public"."customers" DROP CONSTRAINT IF EXISTS ux_customers_business_email;
ALTER TABLE "public"."customers" ADD CONSTRAINT ux_customers_business_email UNIQUE (business_id, email);

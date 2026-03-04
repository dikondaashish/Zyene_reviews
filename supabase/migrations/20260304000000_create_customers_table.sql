-- Create customers table
CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "business_id" uuid NOT NULL,
    "first_name" text,
    "last_name" text,
    "email" text,
    "phone" text,
    "tags" text[],
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE
);

-- RLS
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can access customers of their businesses"
    ON "public"."customers"
    FOR ALL
    USING (
        business_id IN (
            SELECT b.id FROM businesses b
            JOIN organization_members om ON b.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS "idx_customers_business_id" ON "public"."customers" USING btree ("business_id");
CREATE INDEX IF NOT EXISTS "idx_customers_email" ON "public"."customers" USING btree ("email");
CREATE INDEX IF NOT EXISTS "idx_customers_phone" ON "public"."customers" USING btree ("phone");

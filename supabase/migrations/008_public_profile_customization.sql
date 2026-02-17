-- Migration: 008_public_profile_customization
-- Description: Add columns for public profile customization and create storage bucket for logos.

-- 1. Add columns to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_color VARCHAR(50) DEFAULT '#0f172a', -- Default slate-900
ADD COLUMN IF NOT EXISTS min_stars_for_google INT DEFAULT 4 CHECK (min_stars_for_google BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS welcome_message TEXT,
ADD COLUMN IF NOT EXISTS apology_message TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- 2. Create storage bucket for business logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies for business-logos
-- Allow public access to view logos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'business-logos' );

-- Allow authenticated users to upload logos (RLS will be handled by application logic or stricter policies if needed)
-- For now, allow any authenticated user to insert/update, assuming app logic filters by business ownership
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'business-logos' );

CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'business-logos' );

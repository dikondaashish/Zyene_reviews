-- Migration: 013_footer_defaults
-- Description: Set default values for footer_link and footer_logo_url.

ALTER TABLE businesses
ALTER COLUMN footer_link SET DEFAULT 'https://zyene.com',
ALTER COLUMN footer_logo_url SET DEFAULT 'https://snielpllhrppdqzkzjwf.supabase.co/storage/v1/object/public/business-logos/footer-70267922-4c2c-4083-97f5-29e95dadfac5-1771443334179-Untitled%20design%20(4).png';

-- Backfill existing NULL values
UPDATE businesses
SET footer_link = 'https://zyene.com'
WHERE footer_link IS NULL;

UPDATE businesses
SET footer_logo_url = 'https://snielpllhrppdqzkzjwf.supabase.co/storage/v1/object/public/business-logos/footer-70267922-4c2c-4083-97f5-29e95dadfac5-1771443334179-Untitled%20design%20(4).png'
WHERE footer_logo_url IS NULL;

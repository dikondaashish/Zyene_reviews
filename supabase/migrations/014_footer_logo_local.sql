-- Migration: 014_footer_logo_local
-- Description: Update default footer_logo_url to use local asset path for better performance.

ALTER TABLE businesses
ALTER COLUMN footer_logo_url SET DEFAULT '/zyene-footer.png';

-- Update existing records that were using the old default URL
UPDATE businesses
SET footer_logo_url = '/zyene-footer.png'
WHERE footer_logo_url = 'https://snielpllhrppdqzkzjwf.supabase.co/storage/v1/object/public/business-logos/footer-70267922-4c2c-4083-97f5-29e95dadfac5-1771443334179-Untitled%20design%20(4).png';

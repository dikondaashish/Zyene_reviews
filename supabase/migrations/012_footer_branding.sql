-- Migration: 012_footer_branding
-- Description: Add columns for detailed footer customization (company name, link, and logo).

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS footer_company_name TEXT DEFAULT 'Zyene',
ADD COLUMN IF NOT EXISTS footer_link TEXT,
ADD COLUMN IF NOT EXISTS footer_logo_url TEXT;

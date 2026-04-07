-- Add rating_style to businesses table to support different rating UI variants

ALTER TABLE businesses
ADD COLUMN rating_style TEXT DEFAULT 'emoji' NOT NULL;

-- Validate allowed styles if needed
ALTER TABLE businesses
ADD CONSTRAINT check_rating_style 
CHECK (rating_style IN ('emoji', 'stars', 'number', 'slider', 'radio'));

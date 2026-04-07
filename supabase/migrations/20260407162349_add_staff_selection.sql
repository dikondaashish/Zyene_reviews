-- Add staff selection feature
ALTER TABLE businesses
ADD COLUMN enable_staff_selection BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN staff_names TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

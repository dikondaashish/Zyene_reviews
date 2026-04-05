-- Expand review_platforms.platform CHECK constraint to include 'api' (for Developer API keys)
-- 'yelp' was already included in the original schema

ALTER TABLE review_platforms DROP CONSTRAINT IF EXISTS review_platforms_platform_check;
ALTER TABLE review_platforms ADD CONSTRAINT review_platforms_platform_check
  CHECK (platform IN ('google', 'yelp', 'facebook', 'api'));

-- Migration: 009_fix_slug_unique
-- Description: Enforce global uniqueness on businesses.slug to support /r/[slug] routing.

-- 1. Add UNIQUE constraint to businesses(slug)
-- Note: This might fail if there are duplicates, but we verified there are none.
ALTER TABLE businesses
ADD CONSTRAINT businesses_slug_key UNIQUE (slug);

-- 2. Drop the old composite index if it exists (optional, but good for cleanup)
DROP INDEX IF EXISTS idx_businesses_slug;

-- 3. Create a new simple index on slug (Postgres creates minimal index for UNIQUE, but explicit index is fine too)
-- Actually, UNIQUE constraint creates an index automatically.

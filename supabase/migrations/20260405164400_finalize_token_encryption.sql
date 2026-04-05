-- ============================================================
-- Migration: Finalize Token Encryption
-- Drop plaintext columns and rename encrypted ones
-- ============================================================

-- 1. Final check: confirm zero rows have plaintext without encrypted
DO $$
DECLARE unencrypted_count INT;
BEGIN
  -- Check integrations
  SELECT COUNT(*) INTO unencrypted_count
  FROM integrations
  WHERE (access_token IS NOT NULL AND access_token_encrypted IS NULL)
     OR (refresh_token IS NOT NULL AND refresh_token_encrypted IS NULL);

  IF unencrypted_count > 0 THEN
    RAISE EXCEPTION 'Cannot drop plaintext columns in integrations: % rows still unencrypted', unencrypted_count;
  END IF;

  -- Check review_platforms
  SELECT COUNT(*) INTO unencrypted_count
  FROM review_platforms
  WHERE (access_token IS NOT NULL AND access_token_encrypted IS NULL)
     OR (refresh_token IS NOT NULL AND refresh_token_encrypted IS NULL);

  IF unencrypted_count > 0 THEN
    RAISE EXCEPTION 'Cannot drop plaintext columns in review_platforms: % rows still unencrypted', unencrypted_count;
  END IF;
END;
$$;

-- 2. Drop and Rename: integrations
ALTER TABLE integrations
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token;

ALTER TABLE integrations
  RENAME COLUMN access_token_encrypted  TO access_token;
ALTER TABLE integrations
  RENAME COLUMN refresh_token_encrypted TO refresh_token;

-- 3. Drop and Rename: review_platforms
ALTER TABLE review_platforms
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token;

ALTER TABLE review_platforms
  RENAME COLUMN access_token_encrypted  TO access_token;
ALTER TABLE review_platforms
  RENAME COLUMN refresh_token_encrypted TO refresh_token;

-- 4. Verify final state
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('integrations', 'review_platforms')
  AND column_name IN ('access_token', 'refresh_token')
ORDER BY table_name;

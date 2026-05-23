-- OAuth token encryption (step 2): batch backfill plaintext → access_token_encrypted columns.
-- Uses encrypt_token on integrations and review_platforms where encrypted values are still NULL.
-- Run before finalize_token_encryption (20260405164400) drops plaintext columns.

-- 1. Create a helper function to backfill tokens in batches
-- This handles both integrations and review_platforms tables
CREATE OR REPLACE FUNCTION backfill_tokens(t_name TEXT, batch_size INT DEFAULT 100)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated INT;
BEGIN
  LOOP
    EXECUTE format('
      UPDATE %I
      SET
        access_token_encrypted  = CASE
          WHEN access_token IS NOT NULL AND access_token_encrypted IS NULL
          THEN encrypt_token(access_token)
          ELSE access_token_encrypted
        END,
        refresh_token_encrypted = CASE
          WHEN refresh_token IS NOT NULL AND refresh_token_encrypted IS NULL
          THEN encrypt_token(refresh_token)
          ELSE refresh_token_encrypted
        END
      WHERE id IN (
        SELECT id FROM %I
        WHERE (access_token IS NOT NULL AND access_token_encrypted IS NULL)
           OR (refresh_token IS NOT NULL AND refresh_token_encrypted IS NULL)
        ORDER BY id
        LIMIT %L
      )', t_name, t_name, batch_size);

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    RAISE NOTICE 'Backfilled % rows in table %', rows_updated, t_name;
    PERFORM pg_sleep(0.01); -- prevent blocking
  END LOOP;
END;
$$;

-- 2. Run backfill for both tables
DO $$ BEGIN
  PERFORM backfill_tokens('integrations');
  PERFORM backfill_tokens('review_platforms');
END $$;

-- 3. Cleanup: Drop helper function
DROP FUNCTION IF EXISTS backfill_tokens(TEXT, INT);

-- 4. Verification queries
SELECT
  'integrations' AS table_name,
  COUNT(*) FILTER (WHERE access_token IS NOT NULL AND access_token_encrypted IS NULL) AS access_pending,
  COUNT(*) FILTER (WHERE refresh_token IS NOT NULL AND refresh_token_encrypted IS NULL) AS refresh_pending
FROM integrations;

SELECT
  'review_platforms' AS table_name,
  COUNT(*) FILTER (WHERE access_token IS NOT NULL AND access_token_encrypted IS NULL) AS access_pending,
  COUNT(*) FILTER (WHERE refresh_token IS NOT NULL AND refresh_token_encrypted IS NULL) AS refresh_pending
FROM review_platforms;


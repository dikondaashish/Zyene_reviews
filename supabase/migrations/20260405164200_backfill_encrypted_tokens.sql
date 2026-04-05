-- ============================================================
-- Migration: Backfill existing plaintext tokens (Batched)
-- ============================================================

-- Function to backfill a table in batches
CREATE OR REPLACE FUNCTION backfill_tokens(table_name TEXT, batch_size INT DEFAULT 100)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated  INT;
  encryption_key TEXT;
BEGIN
  encryption_key := current_setting('app.token_encryption_key', true);

  IF encryption_key IS NULL OR length(encryption_key) < 32 THEN
    RAISE EXCEPTION 'token_encryption_key is missing or too short (min 32 chars)';
  END IF;

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
      )', table_name, table_name, batch_size);

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    RAISE NOTICE 'Backfilled % rows in table %', rows_updated, table_name;
    PERFORM pg_sleep(0.01); -- small pause
  END LOOP;
END;
$$;

-- Run backfill for both tables
DO $$ BEGIN
  PERFORM backfill_tokens('integrations');
  PERFORM backfill_tokens('review_platforms');
END $$;

-- Drop backfill helper function once finished
DROP FUNCTION IF EXISTS backfill_tokens(TEXT, INT);

-- Verification
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

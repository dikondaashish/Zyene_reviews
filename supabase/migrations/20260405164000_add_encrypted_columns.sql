-- ============================================================
-- Migration: Add Encrypted Token Columns & RPC Functions
-- ============================================================

-- 1. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add columns to integrations
ALTER TABLE integrations
  ADD COLUMN IF NOT EXISTS access_token_encrypted  TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- 3. Add columns to review_platforms
ALTER TABLE review_platforms
  ADD COLUMN IF NOT EXISTS access_token_encrypted  TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- 4. Create/Refine RPC Functions
-- Using 'app.token_encryption_key' as requested by user
CREATE OR REPLACE FUNCTION encrypt_token(plaintext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  encryption_key := current_setting('app.token_encryption_key', true);

  IF encryption_key IS NULL OR length(encryption_key) < 32 THEN
    RAISE EXCEPTION 'token_encryption_key is missing or too short (min 32 chars)';
  END IF;

  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;

  RETURN encode(pgp_sym_encrypt(plaintext, encryption_key)::bytea, 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_token(ciphertext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  encryption_key := current_setting('app.token_encryption_key', true);

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'token_encryption_key is not configured';
  END IF;

  IF ciphertext IS NULL OR ciphertext = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    RETURN pgp_sym_decrypt(decode(ciphertext, 'base64')::bytea, encryption_key);
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails, it might be due to a key change or it was plaintext.
    -- Returning NULL is safer for the transition period.
    RETURN NULL;
  END;
END;
$$;

-- 5. Revoke/Grant
REVOKE EXECUTE ON FUNCTION encrypt_token(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION decrypt_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION encrypt_token(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION decrypt_token(TEXT) TO service_role;

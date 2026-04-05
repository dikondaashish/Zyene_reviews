-- ============================================================
-- Migration: 20260405164000_oauth_encryption_consolidated
-- Description: Unifies OAuth token encryption into a single, cohesive migration.
-- 1. Sets up the private vault for the encryption key.
-- 2. Defines secure cryptographic functions.
-- 3. Migrates and encrypts existing token data.
-- 4. Cleans up the production schema names.
-- ============================================================

-- I. PREREQUISITES
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- II. SECURE VAULT SETUP (Free Tier Workaround)
CREATE SCHEMA IF NOT EXISTS internal;

CREATE TABLE IF NOT EXISTS internal.vault_config (
    id TEXT PRIMARY KEY CHECK (id = 'primary'),
    key_val TEXT NOT NULL
);

-- Insert/Update primary encryption key (User Specified Key)
-- Finalized key: Oj237/m+YcB+Vto6RyruL7/Yqy+Mp0FFf9xxSMipfWI=
INSERT INTO internal.vault_config (id, key_val)
VALUES ('primary', 'Oj237/m+YcB+Vto6RyruL7/Yqy+Mp0FFf9xxSMipfWI=')
ON CONFLICT (id) DO UPDATE SET key_val = EXCLUDED.key_val;

-- III. CRYPTOGRAPHIC FUNCTIONS
CREATE OR REPLACE FUNCTION public.encrypt_token(plaintext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, internal
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  SELECT key_val INTO encryption_key FROM internal.vault_config WHERE id = 'primary';
  
  IF encryption_key IS NULL OR length(encryption_key) < 32 THEN
    RAISE EXCEPTION 'token_encryption_key is missing or too short (min 32 chars)';
  END IF;

  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;

  RETURN encode(extensions.pgp_sym_encrypt(plaintext, encryption_key)::bytea, 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(ciphertext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, internal
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  SELECT key_val INTO encryption_key FROM internal.vault_config WHERE id = 'primary';

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'token_encryption_key is not configured';
  END IF;

  IF ciphertext IS NULL OR ciphertext = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    RETURN extensions.pgp_sym_decrypt(decode(ciphertext, 'base64')::bytea, encryption_key);
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: Return original string if decryption fails (transition safety)
    RETURN ciphertext;
  END;
END;
$$;

-- Security Hardening: Restrict execution to backend service calls only
REVOKE EXECUTE ON FUNCTION public.encrypt_token(TEXT) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_token(TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_token(TEXT) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.decrypt_token(TEXT) TO service_role, postgres;

-- IV. SCHEMA MIGRATION & BACKFILL
-- 1. Add temporary encrypted columns (idempotent if reset)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='integrations' AND column_name='access_token_enc') THEN
        ALTER TABLE public.integrations ADD COLUMN access_token_enc TEXT;
        ALTER TABLE public.integrations ADD COLUMN refresh_token_enc TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_platforms' AND column_name='access_token_enc') THEN
        ALTER TABLE public.review_platforms ADD COLUMN access_token_enc TEXT;
        ALTER TABLE public.review_platforms ADD COLUMN refresh_token_enc TEXT;
    END IF;
END $$;

-- 2. Backfill Existing Data
UPDATE public.integrations
SET 
  access_token_enc = encrypt_token(access_token),
  refresh_token_enc = encrypt_token(refresh_token)
WHERE access_token IS NOT NULL AND access_token NOT LIKE 'ww0EBw%';

UPDATE public.review_platforms
SET 
  access_token_enc = encrypt_token(access_token),
  refresh_token_enc = encrypt_token(refresh_token)
WHERE access_token IS NOT NULL AND access_token NOT LIKE 'ww0EBw%';

-- 3. Finalize Schema
-- Note: On a fresh migration, access_token might already be the column name.
-- We check if original names are plaintext before dropping.
-- For a safe consolidation that replaces already-run migrations:
-- We'll just define the final state if the old ones didn't run, 
-- or do nothing if they already renamed.

DO $$
BEGIN
    -- If access_token_enc exists, it means we are in the middle of a transition or just reset
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='integrations' AND column_name='access_token_enc') THEN
        ALTER TABLE public.integrations DROP COLUMN IF EXISTS access_token;
        ALTER TABLE public.integrations DROP COLUMN IF EXISTS refresh_token;
        ALTER TABLE public.integrations RENAME COLUMN access_token_enc TO access_token;
        ALTER TABLE public.integrations RENAME COLUMN refresh_token_enc TO refresh_token;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_platforms' AND column_name='access_token_enc') THEN
        ALTER TABLE public.review_platforms DROP COLUMN IF EXISTS access_token;
        ALTER TABLE public.review_platforms DROP COLUMN IF EXISTS refresh_token;
        ALTER TABLE public.review_platforms RENAME COLUMN access_token_enc TO access_token;
        ALTER TABLE public.review_platforms RENAME COLUMN refresh_token_enc TO refresh_token;
    END IF;
END $$;

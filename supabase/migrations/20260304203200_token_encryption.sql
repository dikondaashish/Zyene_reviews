-- ============================================================
-- FIX 5.1: OAuth Token Encryption via pgcrypto
-- Enables encryption of access_token and refresh_token columns
-- ============================================================

-- Enable pgcrypto extension (may already be enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create helper functions that use a Supabase vault secret or pg setting
-- The encryption key should be set via: ALTER DATABASE postgres SET app.encryption_key = 'your-strong-key-here';
-- Or stored in Supabase Vault and referenced here.

-- Encrypt function
CREATE OR REPLACE FUNCTION encrypt_token(plain_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    key TEXT;
BEGIN
    IF plain_text IS NULL THEN RETURN NULL; END IF;
    key := current_setting('app.encryption_key', true);
    IF key IS NULL OR key = '' THEN
        -- If no encryption key is set, store plaintext (graceful degradation)
        RETURN plain_text;
    END IF;
    RETURN encode(pgp_sym_encrypt(plain_text, key), 'base64');
END;
$$;

-- Decrypt function
CREATE OR REPLACE FUNCTION decrypt_token(encrypted_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    key TEXT;
BEGIN
    IF encrypted_text IS NULL THEN RETURN NULL; END IF;
    key := current_setting('app.encryption_key', true);
    IF key IS NULL OR key = '' THEN
        -- If no encryption key, assume plaintext
        RETURN encrypted_text;
    END IF;
    BEGIN
        RETURN pgp_sym_decrypt(decode(encrypted_text, 'base64'), key);
    EXCEPTION WHEN OTHERS THEN
        -- If decryption fails (e.g., key was changed, or plaintext stored before encryption was enabled)
        RETURN encrypted_text;
    END;
END;
$$;

-- NOTE: Existing tokens remain in plaintext until re-saved.
-- The encrypt/decrypt functions gracefully handle plaintext values.
-- To encrypt all existing tokens, run:
--   UPDATE review_platforms SET access_token = encrypt_token(access_token), refresh_token = encrypt_token(refresh_token) WHERE access_token IS NOT NULL;
--   UPDATE integrations SET access_token = encrypt_token(access_token), refresh_token = encrypt_token(refresh_token) WHERE access_token IS NOT NULL;

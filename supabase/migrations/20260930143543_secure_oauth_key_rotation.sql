-- apply-plan: with-code - deploy function protections; invoke rotation only after credential reconciliation.
-- Protect the private key store and provide an operator-only, atomic rotation.
-- Rotation is intentionally explicit: operators must first verify the active key
-- can decrypt every stored token and pause provider writers during maintenance.
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE internal.vault_config FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.encrypt_token(plaintext TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT (session_user = 'postgres' AND current_setting('role') IN ('none', 'postgres')) THEN
    RAISE EXCEPTION 'Token encryption denied' USING ERRCODE = '42501';
  END IF;
  IF plaintext IS NULL OR plaintext = '' THEN RETURN NULL; END IF;
  SELECT key_val INTO encryption_key FROM internal.vault_config
    WHERE id = 'primary' FOR SHARE;
  IF encryption_key IS NULL OR length(encryption_key) < 32 THEN
    RAISE EXCEPTION 'OAuth encryption key unavailable';
  END IF;
  RETURN encode(extensions.pgp_sym_encrypt(plaintext, encryption_key), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(ciphertext TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT (session_user = 'postgres' AND current_setting('role') IN ('none', 'postgres')) THEN
    RAISE EXCEPTION 'Token decryption denied' USING ERRCODE = '42501';
  END IF;
  IF ciphertext IS NULL OR ciphertext = '' THEN RETURN NULL; END IF;
  SELECT key_val INTO encryption_key FROM internal.vault_config
    WHERE id = 'primary' FOR SHARE;
  IF encryption_key IS NULL OR length(encryption_key) < 32 THEN
    RAISE EXCEPTION 'OAuth encryption key unavailable';
  END IF;
  BEGIN
    RETURN extensions.pgp_sym_decrypt(decode(ciphertext, 'base64'), encryption_key);
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Stored OAuth credential cannot be decrypted' USING ERRCODE = '22000';
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.rotate_oauth_encryption_key()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  old_key TEXT;
  new_key TEXT;
BEGIN
  IF session_user <> 'postgres' OR current_setting('role') NOT IN ('none', 'postgres') THEN
    RAISE EXCEPTION 'OAuth key rotation denied' USING ERRCODE = '42501';
  END IF;
  LOCK TABLE public.review_platforms, public.integrations IN ACCESS EXCLUSIVE MODE;
  SELECT key_val INTO old_key FROM internal.vault_config
    WHERE id = 'primary' FOR UPDATE;
  IF old_key IS NULL OR length(old_key) < 32 THEN
    RAISE EXCEPTION 'OAuth encryption key unavailable';
  END IF;
  new_key := encode(extensions.gen_random_bytes(32), 'base64');
  BEGIN
    UPDATE public.review_platforms SET
      access_token = CASE WHEN NULLIF(access_token, '') IS NULL THEN NULL ELSE
        encode(extensions.pgp_sym_encrypt(
          extensions.pgp_sym_decrypt(decode(access_token, 'base64'), old_key), new_key), 'base64') END,
      refresh_token = CASE WHEN NULLIF(refresh_token, '') IS NULL THEN NULL ELSE
        encode(extensions.pgp_sym_encrypt(
          extensions.pgp_sym_decrypt(decode(refresh_token, 'base64'), old_key), new_key), 'base64') END;
    UPDATE public.integrations SET
      access_token = CASE WHEN NULLIF(access_token, '') IS NULL THEN NULL ELSE
        encode(extensions.pgp_sym_encrypt(
          extensions.pgp_sym_decrypt(decode(access_token, 'base64'), old_key), new_key), 'base64') END,
      refresh_token = CASE WHEN NULLIF(refresh_token, '') IS NULL THEN NULL ELSE
        encode(extensions.pgp_sym_encrypt(
          extensions.pgp_sym_decrypt(decode(refresh_token, 'base64'), old_key), new_key), 'base64') END;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'OAuth rotation aborted; credentials require reconciliation' USING ERRCODE = '22000';
  END;
  UPDATE internal.vault_config SET key_val = new_key WHERE id = 'primary';
END;
$$;

REVOKE ALL ON FUNCTION public.encrypt_token(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decrypt_token(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_token(TEXT), public.decrypt_token(TEXT) TO service_role, postgres;
REVOKE ALL ON FUNCTION public.rotate_oauth_encryption_key() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rotate_oauth_encryption_key() TO postgres;

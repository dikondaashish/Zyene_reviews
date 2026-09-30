-- Compatible with deployed writers. Reject encryption from an obsolete key
-- instead of persisting an unreadable token across separate RPC/write requests.
CREATE OR REPLACE FUNCTION internal.guard_oauth_ciphertext_write()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  active_key TEXT;
  credentials TEXT[];
  credential TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    credentials := ARRAY[
      CASE WHEN NEW.access_token IS DISTINCT FROM OLD.access_token THEN NEW.access_token END,
      CASE WHEN NEW.refresh_token IS DISTINCT FROM OLD.refresh_token THEN NEW.refresh_token END
    ];
  ELSE
    credentials := ARRAY[NEW.access_token, NEW.refresh_token];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM unnest(credentials) value WHERE NULLIF(value, '') IS NOT NULL) THEN
    RETURN NEW;
  END IF;
  SELECT key_val INTO active_key FROM internal.vault_config WHERE id = 'primary' FOR SHARE;
  IF active_key IS NULL OR length(active_key) < 32 THEN
    RAISE EXCEPTION 'OAuth encryption key unavailable';
  END IF;
  FOREACH credential IN ARRAY credentials LOOP
    IF NULLIF(credential, '') IS NULL THEN CONTINUE; END IF;
    BEGIN
      PERFORM extensions.pgp_sym_decrypt(decode(credential, 'base64'), active_key);
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'OAuth credential encryption is stale or invalid; encrypt again before retrying'
        USING ERRCODE = '40001';
    END;
  END LOOP;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION internal.guard_oauth_ciphertext_write() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER guard_oauth_ciphertext_write
BEFORE INSERT OR UPDATE OF access_token, refresh_token ON public.review_platforms
FOR EACH ROW EXECUTE FUNCTION internal.guard_oauth_ciphertext_write();
CREATE TRIGGER guard_oauth_ciphertext_write
BEFORE INSERT OR UPDATE OF access_token, refresh_token ON public.integrations
FOR EACH ROW EXECUTE FUNCTION internal.guard_oauth_ciphertext_write();

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
  SELECT key_val INTO old_key FROM internal.vault_config WHERE id = 'primary' FOR UPDATE;
  IF old_key IS NULL OR length(old_key) < 32 THEN
    RAISE EXCEPTION 'OAuth encryption key unavailable';
  END IF;
  new_key := encode(extensions.gen_random_bytes(32), 'base64');
  BEGIN
    -- The new key and rewritten ciphertext become visible in the same commit.
    -- Write triggers validate against this transaction's new key.
    UPDATE internal.vault_config SET key_val = new_key WHERE id = 'primary';
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
END;
$$;
REVOKE ALL ON FUNCTION public.rotate_oauth_encryption_key() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rotate_oauth_encryption_key() TO postgres;

-- Store all Zapier/developer credentials as scoped hashes and prevent legacy
-- plaintext columns from being used for API-key authentication again.

ALTER TABLE public.aeo_public_api_keys
  DROP CONSTRAINT IF EXISTS aeo_public_api_keys_scopes_check;

ALTER TABLE public.aeo_public_api_keys
  ADD CONSTRAINT aeo_public_api_keys_scopes_check
  CHECK (scopes <@ ARRAY[
    'review_requests:write', 'reviews:read', 'analytics:read',
    'prompts:read', 'results:read', 'citations:read', 'scores:read'
  ]::TEXT[]);

ALTER TABLE public.aeo_public_api_keys
  ADD COLUMN created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN revoked_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN rotated_from_id UUID REFERENCES public.aeo_public_api_keys(id) ON DELETE SET NULL,
  ADD COLUMN revocation_reason TEXT
    CHECK (revocation_reason IN ('manual', 'rotated', 'legacy_migration'));

CREATE INDEX aeo_public_api_keys_created_by_idx
  ON public.aeo_public_api_keys (created_by_user_id)
  WHERE created_by_user_id IS NOT NULL;
CREATE INDEX aeo_public_api_keys_revoked_by_idx
  ON public.aeo_public_api_keys (revoked_by_user_id)
  WHERE revoked_by_user_id IS NOT NULL;
CREATE INDEX aeo_public_api_keys_rotated_from_idx
  ON public.aeo_public_api_keys (rotated_from_id)
  WHERE rotated_from_id IS NOT NULL;

-- Preserve existing legacy keys by hashing them in-database before removing
-- every plaintext copy. Existing clients can then move the key into a header.
INSERT INTO public.aeo_public_api_keys (
  organization_id,
  business_id,
  name,
  key_prefix,
  key_hash,
  scopes,
  rate_limit_per_minute
)
SELECT
  b.organization_id,
  rp.business_id,
  'Migrated Developer API key',
  LEFT(rp.external_id, 14),
  ENCODE(extensions.digest(rp.external_id::BYTEA, 'sha256'), 'hex'),
  ARRAY['review_requests:write', 'reviews:read', 'analytics:read']::TEXT[],
  60
FROM public.review_platforms rp
JOIN public.businesses b ON b.id = rp.business_id
WHERE rp.platform = 'api'
  AND rp.external_id IS NOT NULL
  AND LENGTH(rp.external_id) >= 35
ON CONFLICT (key_hash) DO NOTHING;

UPDATE public.review_platforms
SET external_id = NULL,
    sync_status = 'disconnected'
WHERE platform = 'api';

ALTER TABLE public.review_platforms
  ADD CONSTRAINT review_platforms_api_external_id_must_be_null
  CHECK (platform <> 'api' OR external_id IS NULL);

UPDATE public.integrations
SET api_key = NULL
WHERE platform = 'zapier';

ALTER TABLE public.integrations
  ADD CONSTRAINT integrations_zapier_api_key_must_be_null
  CHECK (platform <> 'zapier' OR api_key IS NULL);

CREATE OR REPLACE FUNCTION public.audit_api_key_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.events (
      organization_id, business_id, user_id, event_type,
      entity_type, entity_id, metadata
    ) VALUES (
      NEW.organization_id,
      NEW.business_id,
      NEW.created_by_user_id,
      CASE WHEN NEW.rotated_from_id IS NULL
        THEN 'api_key.created' ELSE 'api_key.rotated' END,
      'api_key',
      NEW.id,
      jsonb_build_object(
        'key_prefix', NEW.key_prefix,
        'name', NEW.name,
        'scopes', NEW.scopes,
        'rotated_from_id', NEW.rotated_from_id
      )
    );
  ELSIF TG_OP = 'UPDATE'
    AND OLD.revoked_at IS NULL
    AND NEW.revoked_at IS NOT NULL THEN
    INSERT INTO public.events (
      organization_id, business_id, user_id, event_type,
      entity_type, entity_id, metadata
    ) VALUES (
      NEW.organization_id,
      NEW.business_id,
      NEW.revoked_by_user_id,
      'api_key.revoked',
      'api_key',
      NEW.id,
      jsonb_build_object(
        'key_prefix', NEW.key_prefix,
        'reason', COALESCE(NEW.revocation_reason, 'manual')
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_api_key_lifecycle() FROM PUBLIC;

CREATE TRIGGER audit_api_key_lifecycle_trigger
AFTER INSERT OR UPDATE OF revoked_at ON public.aeo_public_api_keys
FOR EACH ROW EXECUTE FUNCTION public.audit_api_key_lifecycle();

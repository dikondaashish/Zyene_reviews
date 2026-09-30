-- Optional operator review only. This script performs no data/configuration writes.
-- Do not select credential values or function definitions while investigating.
BEGIN TRANSACTION READ ONLY;
SELECT current_setting('server_version_num')::integer AS server_version_num;

SELECT version FROM supabase_migrations.schema_migrations
WHERE version IN ('20260929230000', '20260929231000', '20260929232000',
  '20260929233000', '20260929234000', '20260929235000', '20260929235100',
  '20260929235200', '20260929235300', '20260929235400', '20260929235500', '20260929235600')
ORDER BY version;

SELECT role_name,
  has_any_column_privilege(role_name, 'public.businesses', 'SELECT') AS business_read,
  has_any_column_privilege(role_name, 'public.review_platforms', 'SELECT') AS platform_metadata_read,
  has_column_privilege(role_name, 'public.review_platforms', 'access_token', 'SELECT') AS access_token_read,
  has_column_privilege(role_name, 'public.review_platforms', 'refresh_token', 'SELECT') AS refresh_token_read,
  has_any_column_privilege(role_name, 'public.review_platforms', 'INSERT,UPDATE') AS platform_write,
  has_table_privilege(role_name, 'public.review_platforms', 'DELETE') AS platform_delete,
  has_any_column_privilege(role_name, 'public.integrations', 'SELECT') AS legacy_integration_read,
  has_column_privilege(role_name, 'public.organizations', 'plan', 'INSERT,UPDATE') AS plan_write,
  has_column_privilege(role_name, 'public.organizations', 'plan_status', 'INSERT,UPDATE') AS entitlement_write
FROM (VALUES ('anon'), ('authenticated')) roles(role_name);

SELECT table_schema, table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema IN ('public', 'internal')
  AND table_name IN ('businesses', 'review_platforms', 'integrations', 'organizations', 'vault_config')
ORDER BY table_name, grantee, privilege_type;

SELECT table_schema, table_name, column_name, grantee, privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND ((table_name IN ('review_platforms', 'integrations') AND column_name IN ('access_token', 'refresh_token'))
    OR (table_name = 'organizations' AND column_name IN ('plan', 'plan_status', 'stripe_customer_id', 'stripe_subscription_id')))
ORDER BY table_name, column_name, grantee, privilege_type;

SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public'
  AND tablename IN ('businesses', 'review_platforms', 'organizations', 'business_members',
    'invitations', 'reviews', 'stripe_webhook_events', 'stripe_credit_grant_receipts', 'referral_conversions')
ORDER BY tablename, policyname;

SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('businesses', 'review_platforms', 'organizations', 'business_members',
    'invitations', 'reviews', 'stripe_webhook_events', 'stripe_credit_grant_receipts', 'referral_conversions');

-- The scope guard migration intentionally covers existing RLS tables only.
-- Any business_id table without RLS needs separate review before release.
SELECT c.relname AS business_table_without_rls
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'business_id' AND NOT a.attisdropped
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity;

SELECT role_name, signature, to_regprocedure(signature) IS NOT NULL AS function_present,
  has_function_privilege(role_name, to_regprocedure(signature), 'EXECUTE') AS executable
FROM (VALUES ('anon'), ('authenticated'), ('service_role')) roles(role_name)
CROSS JOIN (VALUES
  ('public.encrypt_token(text)'), ('public.decrypt_token(text)'),
  ('public.rotate_oauth_encryption_key()'), ('public.acquire_platform_lock(uuid,interval)'),
  ('public.claim_stripe_webhook_event(text,uuid)'),
  ('public.finish_stripe_webhook_event(text,uuid,boolean)'),
  ('public.authorized_business_ids(boolean,boolean)'),
  ('public.accept_business_invitation(uuid,uuid,text)'),
  ('public.apply_stripe_subscription_projection(text,text,jsonb,boolean,uuid,text,timestamptz)'),
  ('public.apply_stripe_credit_grant(text,uuid,text,text,text,timestamptz,bigint)'),
  ('public.claim_referral_conversion_reward(uuid,bigint)'),
  ('public.finish_referral_conversion_reward(uuid,uuid)')
) functions(signature);

SELECT t.tgname, t.tgenabled FROM pg_trigger t
WHERE t.tgrelid = 'public.business_members'::regclass AND NOT t.tgisinternal;

SELECT conname, convalidated FROM pg_constraint
WHERE conrelid = 'public.reviews'::regclass AND conname = 'reviews_platform_tenant_fk';
SELECT count(*) AS mismatched_review_platform_tenants
FROM public.reviews r JOIN public.review_platforms p ON p.id = r.platform_id
WHERE p.business_id IS DISTINCT FROM r.business_id;
SELECT status, count(*) FROM public.stripe_webhook_events GROUP BY status ORDER BY status;
-- Do not reissue ambiguous rewards: compare the stable provider key and private
-- Stripe balance transaction before any coordinated operator write.
SELECT count(*) AS referral_rewards_requiring_reconciliation FROM public.referral_conversions
WHERE status = 'converted' AND reward_started_at <= now() - interval '23 hours';
SELECT count(*) AS mismatched_invitation_tenants FROM public.invitations i
JOIN public.businesses b ON b.id = i.business_id
WHERE b.organization_id IS DISTINCT FROM i.organization_id;
SELECT om.role, count(*) AS accepted_business_invitees_with_org_management
FROM public.organization_members om WHERE om.role IN ('admin', 'manager', 'ORG_ADMIN', 'ORG_MANAGER')
  AND EXISTS (SELECT 1 FROM public.business_members bm JOIN public.invitations i
    ON i.business_id = bm.business_id AND i.organization_id = om.organization_id
    WHERE bm.user_id = om.user_id AND i.accepted_at IS NOT NULL)
GROUP BY om.role;
-- This aggregate is a review lead, not proof of escalation. Compare authorized
-- org-manager assignments with private audit history; do not auto-demote users.

COMMIT;

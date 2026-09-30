-- These execute the new migrations, not a duplicate of their implementation.
SET ROLE anon;
SET request.jwt.claim.role = 'anon';
SELECT test.expect_denied('SELECT id FROM public.businesses');
SELECT test.expect_denied('SELECT name FROM public.businesses');
SELECT test.expect_denied('SELECT refresh_token FROM public.review_platforms');
SELECT test.expect_denied('SELECT access_token FROM public.integrations');
SELECT test.expect_denied($cmd$SELECT public.decrypt_token('synthetic')$cmd$);
SELECT test.expect_denied($cmd$SELECT public.acquire_platform_lock('40000000-0000-4000-8000-000000000001')$cmd$);
SELECT test.expect_denied($cmd$SELECT public.claim_stripe_webhook_event('evt', gen_random_uuid())$cmd$);
SELECT test.expect_denied('SELECT event_id FROM public.stripe_webhook_events');
SELECT test.expect_denied('SELECT receipt_id FROM public.stripe_credit_grant_receipts');

RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
SELECT test.expect_denied('SELECT status FROM public.stripe_webhook_events');
SELECT test.expect_denied($cmd$UPDATE public.stripe_webhook_events SET status = 'processed'$cmd$);
SELECT test.expect_denied('SELECT receipt_id FROM public.stripe_credit_grant_receipts');
SELECT test.assert_true(EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
  AND tablename = 'stripe_credit_grant_receipts' AND roles = ARRAY['service_role']::name[]),
  'credit receipts have an explicit backend-only RLS policy');
SELECT test.expect_denied($cmd$UPDATE test.policy_rows
  SET tenant_id = '20000000-0000-4000-8000-000000000002' WHERE id = 1$cmd$);
SELECT test.assert_true((SELECT tenant_id = auth.uid() FROM test.policy_rows WHERE id = 1), 'implicit WITH CHECK prevented reparenting');
SELECT test.assert_true((SELECT count(*) = 1 FROM public.businesses), 'business tenant isolation');
SELECT test.assert_true((SELECT count(*) = 1 FROM public.review_platforms), 'platform tenant isolation');
SELECT test.expect_denied('SELECT access_token FROM public.review_platforms');
SELECT test.expect_denied('SELECT refresh_token FROM public.review_platforms');
SELECT test.expect_denied($cmd$UPDATE public.review_platforms SET external_url = 'https://attacker.test'$cmd$);
SELECT test.expect_denied('DELETE FROM public.review_platforms');
SELECT test.expect_denied('TRUNCATE public.review_platforms');
SELECT test.expect_denied($cmd$INSERT INTO public.review_platforms (id) VALUES (gen_random_uuid())$cmd$);
SELECT test.expect_denied('SELECT key_val FROM internal.vault_config');
SELECT test.expect_denied('SELECT public.rotate_oauth_encryption_key()');
SELECT test.expect_denied($cmd$UPDATE public.organizations SET plan = 'enterprise_yearly'$cmd$);
SELECT test.expect_denied($cmd$INSERT INTO public.organizations (name, plan) VALUES ('Forgery', 'enterprise_yearly')$cmd$);
UPDATE public.organizations SET name = 'Updated A' WHERE id = '10000000-0000-4000-8000-000000000001';
SELECT test.assert_true((SELECT name = 'Updated A' FROM public.organizations
  WHERE id = '10000000-0000-4000-8000-000000000001'), 'owner may update safe organization fields');
UPDATE public.organizations SET name = 'Foreign changed' WHERE id = '10000000-0000-4000-8000-000000000002';
SELECT test.assert_true((SELECT count(*) = 0 FROM public.organizations
  WHERE id = '10000000-0000-4000-8000-000000000002'), 'foreign organization invisible');

SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000002';
SELECT test.expect_denied($cmd$UPDATE public.business_members SET role = 'owner'
  WHERE user_id = '20000000-0000-4000-8000-000000000002'$cmd$);
SELECT test.expect_denied($cmd$UPDATE public.business_members SET role = 'admin'
  WHERE user_id = '20000000-0000-4000-8000-000000000003'$cmd$);
SELECT test.expect_denied($cmd$INSERT INTO public.business_members (business_id, user_id, role) VALUES
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005', 'owner')$cmd$);
SELECT test.expect_denied($cmd$DELETE FROM public.business_members
  WHERE user_id = '20000000-0000-4000-8000-000000000001'$cmd$);
UPDATE public.business_members SET role = 'member'
  WHERE user_id = '20000000-0000-4000-8000-000000000003';
SELECT test.assert_true((SELECT role = 'member' FROM public.business_members
  WHERE user_id = '20000000-0000-4000-8000-000000000003'), 'manager may change a nonprivileged role');

RESET ROLE;
SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
SELECT test.assert_true(public.claim_stripe_webhook_event('evt_retry', '50000000-0000-4000-8000-000000000001') = 'claimed', 'first claim');
SELECT test.assert_true(public.claim_stripe_webhook_event('evt_retry', '50000000-0000-4000-8000-000000000002') = 'processing', 'concurrent claim blocked');
SELECT test.assert_true(NOT public.finish_stripe_webhook_event('evt_retry', '50000000-0000-4000-8000-000000000002', true), 'wrong claim token cannot finish');
SELECT test.assert_true(public.finish_stripe_webhook_event('evt_retry', '50000000-0000-4000-8000-000000000001', false), 'failure released');
SELECT test.assert_true(public.claim_stripe_webhook_event('evt_retry', '50000000-0000-4000-8000-000000000002') = 'claimed', 'failed event retry');
SELECT test.assert_true(public.finish_stripe_webhook_event('evt_retry', '50000000-0000-4000-8000-000000000002', true), 'successful completion');
SELECT test.assert_true(public.claim_stripe_webhook_event('evt_retry', gen_random_uuid()) = 'processed', 'processed duplicate blocked');
INSERT INTO public.stripe_webhook_events (event_id, status) VALUES ('evt_legacy', 'legacy_unknown');
SELECT test.assert_true(public.claim_stripe_webhook_event('evt_legacy', gen_random_uuid()) = 'legacy_unknown', 'legacy state preserved');
SELECT test.assert_true(public.acquire_platform_lock('40000000-0000-4000-8000-000000000001'), 'authorized sync lock');
SELECT test.assert_true(NOT public.acquire_platform_lock('40000000-0000-4000-8000-000000000001'), 'duplicate lock blocked');
SELECT test.expect_denied('SELECT public.rotate_oauth_encryption_key()');
UPDATE public.review_platforms SET access_token = public.encrypt_token('synthetic-access'),
  refresh_token = public.encrypt_token('synthetic-refresh');
INSERT INTO public.integrations VALUES (gen_random_uuid(), public.encrypt_token('synthetic-integration'), NULL);
SELECT test.assert_true((SELECT bool_and(public.decrypt_token(access_token) = 'synthetic-access')
  FROM public.review_platforms), 'service token round trip');

RESET ROLE;
SET request.jwt.claim.role = '';
INSERT INTO public.reviews VALUES (
  '60000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001'
);
DO $$
BEGIN
  BEGIN
    UPDATE public.reviews SET platform_id = '40000000-0000-4000-8000-000000000002';
  EXCEPTION WHEN foreign_key_violation THEN RETURN;
  END;
  RAISE EXCEPTION 'Cross-tenant platform link must be denied';
END;
$$;
SELECT test.assert_true((SELECT platform_id = '40000000-0000-4000-8000-000000000001'
  FROM public.reviews WHERE id = '60000000-0000-4000-8000-000000000001'), 'platform link retained');
CREATE TEMP TABLE previous_key AS SELECT key_val FROM internal.vault_config;
CREATE TEMP TABLE stale_credentials AS SELECT access_token, refresh_token FROM public.review_platforms LIMIT 1;
SELECT public.rotate_oauth_encryption_key();
SELECT test.assert_true((SELECT v.key_val <> p.key_val FROM internal.vault_config v CROSS JOIN previous_key p), 'key changed');
SELECT test.assert_true((SELECT bool_and(public.decrypt_token(access_token) = 'synthetic-access'
  AND public.decrypt_token(refresh_token) = 'synthetic-refresh') FROM public.review_platforms), 'platform tokens survived rotation');
SELECT test.assert_true((SELECT public.decrypt_token(access_token) = 'synthetic-integration'
  FROM public.integrations), 'legacy integration token survived rotation');
SELECT test.expect_retryable($cmd$UPDATE public.review_platforms SET access_token =
  (SELECT access_token FROM stale_credentials)$cmd$);
SELECT test.expect_retryable($cmd$INSERT INTO public.integrations VALUES
  (gen_random_uuid(), (SELECT access_token FROM stale_credentials), NULL)$cmd$);
SELECT test.assert_true((SELECT bool_and(public.decrypt_token(access_token) = 'synthetic-access')
  FROM public.review_platforms), 'stale in-flight write cannot corrupt rotated credentials');
SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
UPDATE public.review_platforms SET access_token = public.encrypt_token('synthetic-access');
RESET ROLE;
SET request.jwt.claim.role = '';
UPDATE previous_key SET key_val = (SELECT key_val FROM internal.vault_config);
-- Deliberate corruption fixture bypasses the guard only in this disposable database.
ALTER TABLE public.integrations DISABLE TRIGGER guard_oauth_ciphertext_write;
UPDATE public.integrations SET access_token = 'invalid-ciphertext';
ALTER TABLE public.integrations ENABLE TRIGGER guard_oauth_ciphertext_write;
DO $$
BEGIN
  BEGIN PERFORM public.rotate_oauth_encryption_key();
  EXCEPTION WHEN SQLSTATE '22000' THEN RETURN;
  END;
  RAISE EXCEPTION 'Corrupt token must abort key rotation';
END;
$$;
SELECT test.assert_true((SELECT v.key_val = p.key_val FROM internal.vault_config v CROSS JOIN previous_key p), 'failed rotation kept key');
SELECT test.assert_true((SELECT bool_and(public.decrypt_token(access_token) = 'synthetic-access')
  FROM public.review_platforms), 'failed rotation rolled back earlier token writes');
DO $$
BEGIN
  BEGIN PERFORM public.decrypt_token('not-ciphertext');
  EXCEPTION WHEN SQLSTATE '22000' THEN RETURN;
  END;
  RAISE EXCEPTION 'Decrypt must fail closed';
END;
$$;
DELETE FROM public.review_platforms WHERE id = '40000000-0000-4000-8000-000000000001';
SELECT test.assert_true((SELECT platform_id IS NULL AND business_id = '30000000-0000-4000-8000-000000000001'
  FROM public.reviews WHERE id = '60000000-0000-4000-8000-000000000001'), 'disconnect preserves review tenant');

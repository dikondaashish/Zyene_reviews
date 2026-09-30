BEGIN;
SET request.jwt.claim.role = 'service_role';
UPDATE public.organizations SET stripe_customer_id = 'cus_a', stripe_subscription_id = 'sub_a',
  referred_by_user_id = '20000000-0000-4000-8000-000000000004'
  WHERE id = '10000000-0000-4000-8000-000000000001';
UPDATE public.organizations SET stripe_customer_id = 'cus_b', stripe_subscription_id = 'sub_b',
  referred_by_user_id = '20000000-0000-4000-8000-000000000001'
  WHERE id = '10000000-0000-4000-8000-000000000002';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT test.expect_denied($cmd$SELECT public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 2999)$cmd$);
SELECT test.expect_denied($cmd$SELECT public.finish_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001')$cmd$);
SELECT test.expect_denied('SELECT * FROM public.referral_conversions');
SELECT test.assert_true(NOT has_column_privilege('authenticated', 'public.referral_conversions', 'status', 'UPDATE'),
  'explicit column grants cannot change reward state');
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
UPDATE public.organization_members SET status = 'inactive'
  WHERE user_id = '20000000-0000-4000-8000-000000000004';
SELECT test.assert_true(public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 2999) IS NULL, 'inactive referrer owner cannot receive credit');
UPDATE public.organization_members SET status = 'active'
  WHERE user_id = '20000000-0000-4000-8000-000000000004';
UPDATE public.organizations SET plan_status = 'trialing' WHERE id = '10000000-0000-4000-8000-000000000001';
SELECT test.assert_true(public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 2999) IS NULL, 'trial is not a paid conversion');
UPDATE public.organizations SET plan_status = 'active' WHERE id = '10000000-0000-4000-8000-000000000001';
CREATE TABLE test.referral_claims (n integer, value jsonb);
INSERT INTO test.referral_claims VALUES (1, public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 2999));
SELECT test.assert_true((SELECT value->>'customerId' = 'cus_b' AND (value->>'cents')::bigint = 2999
  FROM test.referral_claims WHERE n = 1), 'credit recipient resolved from stored active owner');
SELECT test.expect_retryable($cmd$SELECT public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 2999)$cmd$);
SELECT test.assert_true(NOT public.finish_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001'), 'wrong token cannot complete');
UPDATE public.referral_conversions SET reward_lease_until = now() - interval '1 minute'
  WHERE referee_organization_id = '10000000-0000-4000-8000-000000000001';
UPDATE public.organizations SET stripe_customer_id = 'cus_b_changed' WHERE id = '10000000-0000-4000-8000-000000000002';
INSERT INTO test.referral_claims VALUES (2, public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 7000));
SELECT test.assert_true((SELECT value->>'customerId' = 'cus_b' AND (value->>'cents')::bigint = 2999
  AND value->>'idempotencyKey' = (SELECT value->>'idempotencyKey' FROM test.referral_claims WHERE n = 1)
  FROM test.referral_claims WHERE n = 2), 'retry freezes customer, amount and provider key');
SELECT test.assert_true(NOT public.finish_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', (SELECT (value->>'claimToken')::uuid FROM test.referral_claims WHERE n = 1)),
  'expired claim cannot complete after replacement');
SELECT test.assert_true(public.finish_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', (SELECT (value->>'claimToken')::uuid FROM test.referral_claims WHERE n = 2)),
  'current claim completes');
SELECT test.assert_true(public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 7000) IS NULL, 'completed referral never grants again');
CREATE FUNCTION test.expect_reconciliation(command text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN EXECUTE command;
  EXCEPTION WHEN SQLSTATE '55000' THEN RETURN;
  END;
  RAISE EXCEPTION 'Expected manual Stripe reconciliation';
END;
$$;
UPDATE public.referral_conversions SET status = 'converted', reward_started_at = now() - interval '24 hours',
  reward_lease_until = now() - interval '23 hours'
  WHERE referee_organization_id = '10000000-0000-4000-8000-000000000001';
SELECT test.expect_reconciliation($cmd$SELECT public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 2999)$cmd$);
SELECT test.expect_reconciliation($cmd$SELECT public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000002', 2999)$cmd$);
UPDATE public.organizations SET plan_status = NULL WHERE id = '10000000-0000-4000-8000-000000000001';
SELECT test.assert_true(public.claim_referral_conversion_reward(
  '10000000-0000-4000-8000-000000000001', 2999) IS NULL, 'unknown plan status cannot authorize credit');
ROLLBACK;
SET request.jwt.claim.role = '';

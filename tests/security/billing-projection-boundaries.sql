BEGIN;
SET request.jwt.claim.role = 'service_role';
UPDATE public.organizations SET stripe_customer_id = 'cus_a', stripe_subscription_id = 'sub_current'
  WHERE id = '10000000-0000-4000-8000-000000000001';
CREATE TABLE test.projection (value jsonb);
INSERT INTO test.projection VALUES ('{"plan":"free","plan_status":"canceled","trial_ends_at":null,
  "max_businesses":1,"max_team_members":1,"max_review_requests_per_month":0,"max_ai_replies_per_month":0,
  "max_email_requests_per_month":0,"max_sms_requests_per_month":0,"max_link_requests_per_month":0}');
GRANT SELECT ON test.projection TO authenticated, service_role;
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT test.expect_denied($cmd$SELECT public.apply_stripe_subscription_projection(
  'cus_a', 'sub_current', (SELECT value FROM test.projection), true)$cmd$);
SELECT test.expect_denied($cmd$SELECT public.apply_stripe_credit_grant('in_a',
  '10000000-0000-4000-8000-000000000001', 'cus_a', 'sub_current', 'starter_monthly', now(), 100)$cmd$);
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
SELECT test.assert_true(public.apply_stripe_subscription_projection('cus_a', 'sub_old',
  (SELECT value FROM test.projection), true) IS NULL, 'late deletion cannot cancel replacement');
SELECT test.assert_true((SELECT stripe_subscription_id = 'sub_current' FROM public.organizations
  WHERE id = '10000000-0000-4000-8000-000000000001'), 'current subscription intact');
UPDATE public.organizations SET stripe_subscription_observed_at = now();
SELECT test.assert_true(public.apply_stripe_subscription_projection('cus_a', 'sub_current',
  (SELECT value FROM test.projection), false, NULL, NULL, '2000-01-01') IS NULL,
  'older concurrent live read cannot overwrite a newer projection');
SELECT test.expect_denied($cmd$SELECT public.apply_stripe_subscription_projection('cus_foreign', 'sub_old',
  (SELECT value FROM test.projection), false, '10000000-0000-4000-8000-000000000001', 'sub_current')$cmd$);
SELECT test.expect_retryable($cmd$SELECT public.apply_stripe_subscription_projection('cus_a', 'sub_other',
  (SELECT value FROM test.projection), false, '10000000-0000-4000-8000-000000000001', 'sub_stale')$cmd$);
CREATE FUNCTION test.fail_feature_shutdown() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Synthetic feature write failure' USING ERRCODE = '42501'; END;
$$;
CREATE TRIGGER fail_feature_shutdown BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION test.fail_feature_shutdown();
SELECT test.expect_denied($cmd$SELECT public.apply_stripe_subscription_projection('cus_a', 'sub_current',
  (SELECT value FROM test.projection), true)$cmd$);
SELECT test.assert_true((SELECT stripe_subscription_id = 'sub_current' AND plan_status = 'active'
  FROM public.organizations WHERE id = '10000000-0000-4000-8000-000000000001'), 'failed feature shutdown rolls billing back');
DROP TRIGGER fail_feature_shutdown ON public.businesses;
SELECT test.assert_true(public.apply_stripe_subscription_projection('cus_a', 'sub_current',
  (SELECT value FROM test.projection), true) IS NOT NULL, 'retry commits cancellation');
SELECT test.assert_true((SELECT NOT auto_reply_enabled FROM public.businesses WHERE id =
  '30000000-0000-4000-8000-000000000001'), 'cancellation disables dependent feature');
UPDATE public.organizations SET stripe_subscription_id = 'sub_current', plan = 'starter_monthly', plan_status = 'active'
  WHERE id = '10000000-0000-4000-8000-000000000001';
SELECT test.assert_true(public.apply_stripe_credit_grant('in_a', '10000000-0000-4000-8000-000000000001',
  'cus_a', 'sub_current', 'starter_monthly', '2030-02-01', 100), 'first grant commits');
UPDATE public.aeo_credit_balances SET balance_micro_usd = 17, cycle_reset_at = now() - interval '2 days';
SELECT test.assert_true(NOT public.apply_stripe_credit_grant('in_a', '10000000-0000-4000-8000-000000000001',
  'cus_a', 'sub_current', 'starter_monthly', '2030-02-01', 100), 'cross-day invoice replay denied');
SELECT test.assert_true(NOT public.apply_stripe_credit_grant('in_same_period', '10000000-0000-4000-8000-000000000001',
  'cus_a', 'sub_current', 'starter_monthly', '2030-02-01', 100), 'different event for same cycle denied');
SELECT test.assert_true(NOT public.apply_stripe_credit_grant('in_old', '10000000-0000-4000-8000-000000000001',
  'cus_a', 'sub_current', 'starter_monthly', '2030-01-01', 100), 'old cycle cannot refill current balance');
SELECT test.assert_true(NOT public.apply_stripe_credit_grant('in_foreign', '10000000-0000-4000-8000-000000000001',
  'cus_foreign', 'sub_current', 'starter_monthly', '2030-03-01', 100), 'foreign customer cannot grant credits');
SELECT test.assert_true((SELECT balance_micro_usd = 17 FROM public.aeo_credit_balances), 'spent balance preserved');
CREATE FUNCTION test.fail_credit_receipt() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Synthetic receipt failure' USING ERRCODE = '42501'; END;
$$;
CREATE TRIGGER fail_credit_receipt BEFORE INSERT ON public.stripe_credit_grant_receipts
  FOR EACH ROW EXECUTE FUNCTION test.fail_credit_receipt();
SELECT test.expect_denied($cmd$SELECT public.apply_stripe_credit_grant('in_retry',
  '10000000-0000-4000-8000-000000000001', 'cus_a', 'sub_current', 'starter_monthly', '2030-03-01', 100)$cmd$);
SELECT test.assert_true((SELECT balance_micro_usd = 17 FROM public.aeo_credit_balances),
  'failed receipt rolls credit reset back');
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.stripe_credit_grant_receipts WHERE receipt_id = 'in_retry'),
  'failed grant does not consume receipt');
DROP TRIGGER fail_credit_receipt ON public.stripe_credit_grant_receipts;
SELECT test.assert_true(public.apply_stripe_credit_grant('in_retry',
  '10000000-0000-4000-8000-000000000001', 'cus_a', 'sub_current', 'starter_monthly', '2030-03-01', 100),
  'failed grant retry completes once');
ROLLBACK;
SET request.jwt.claim.role = '';

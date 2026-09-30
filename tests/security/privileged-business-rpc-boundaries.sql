-- Execute real historical customer RPCs against the new security policies.
BEGIN;
CREATE FUNCTION test.expect_not_found(command text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN EXECUTE command;
  EXCEPTION WHEN no_data_found THEN RETURN;
  END;
  RAISE EXCEPTION 'Expected hidden or non-writable customer';
END;
$$;
SET request.jwt.claim.role = 'service_role';
INSERT INTO public.businesses (id, organization_id, name) VALUES
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Sibling');
INSERT INTO public.organization_members VALUES
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'ORG_EMPLOYEE', 'active');
INSERT INTO public.business_members (business_id, user_id, role) VALUES
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'viewer');
INSERT INTO public.customers (id, business_id, first_name, email, tags) VALUES
  ('90000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Original', 'one@example.test', ARRAY['original']),
  ('90000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'Duplicate', 'two@example.test', ARRAY['original']),
  ('90000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'Sibling', 'sibling@example.test', ARRAY['original']),
  ('90000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', 'Foreign', 'foreign@example.test', ARRAY['original']);
INSERT INTO public.aeo_alerts (id, business_id, organization_id, alert_type, severity, title, detail) VALUES
  ('a0000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'run_failure', 'low', 'Own', 'Synthetic'),
  ('a0000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'run_failure', 'low', 'Sibling', 'Synthetic'),
  ('a0000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'run_failure', 'low', 'Foreign', 'Synthetic');
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000006';
SELECT public.bulk_add_customer_tags(ARRAY['90000000-0000-4000-8000-000000000001'::uuid], ARRAY['forbidden']);
SELECT test.assert_true((SELECT tags = ARRAY['original'] FROM public.customers WHERE id = '90000000-0000-4000-8000-000000000001'), 'viewer tag writes blocked');
SELECT public.bulk_remove_customer_tags(ARRAY['90000000-0000-4000-8000-000000000001'::uuid], ARRAY['original']);
SELECT test.assert_true((SELECT tags = ARRAY['original'] FROM public.customers WHERE id = '90000000-0000-4000-8000-000000000001'), 'viewer tag removal blocked');
SELECT test.expect_denied($cmd$SELECT public.upsert_customer_by_identity(
  '30000000-0000-4000-8000-000000000001', NULL, 'Forged', NULL, 'forged@example.test')$cmd$);
-- FOR UPDATE cannot lock a viewer-only row, so the RPC returns not-found.
SELECT test.expect_not_found($cmd$SELECT public.upsert_customer_by_identity('30000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000001', 'Forged')$cmd$);
SELECT test.assert_true((SELECT first_name = 'Original' FROM public.customers WHERE id = '90000000-0000-4000-8000-000000000001'), 'viewer identity update blocked');
SELECT test.expect_denied($cmd$SELECT public.import_customers_by_identity(
  '30000000-0000-4000-8000-000000000001', '[{"email":"import-forged@example.test"}]'::jsonb)$cmd$);
SELECT test.expect_not_found($cmd$SELECT public.merge_customers('30000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000002')$cmd$);
SELECT test.assert_true((SELECT count(*) = 2 FROM public.customers), 'viewer merge cannot delete customers');
SELECT public.mute_aeo_alert('a0000000-0000-4000-8000-000000000003');
SELECT public.mute_aeo_alert('a0000000-0000-4000-8000-000000000001');
SELECT test.expect_denied($cmd$SELECT public.claim_review_milestone('30000000-0000-4000-8000-000000000003')$cmd$);
SELECT test.expect_denied($cmd$SELECT public.claim_review_milestone('30000000-0000-4000-8000-000000000002')$cmd$);
SELECT public.claim_review_milestone('30000000-0000-4000-8000-000000000001');
RESET ROLE;
SELECT test.assert_true((SELECT muted_at IS NULL FROM public.aeo_alerts WHERE id = 'a0000000-0000-4000-8000-000000000003'), 'sibling alert unchanged');
SELECT test.assert_true((SELECT muted_at IS NULL FROM public.aeo_alerts WHERE id = 'a0000000-0000-4000-8000-000000000001'), 'viewer own alert mutation blocked');
SET request.jwt.claim.role = 'service_role';
UPDATE public.business_members SET role = 'member' WHERE user_id = '20000000-0000-4000-8000-000000000006';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT public.bulk_add_customer_tags(ARRAY['90000000-0000-4000-8000-000000000001'::uuid,
  '90000000-0000-4000-8000-000000000003'::uuid, '90000000-0000-4000-8000-000000000004'::uuid], ARRAY['allowed']);
SELECT public.bulk_remove_customer_tags(ARRAY['90000000-0000-4000-8000-000000000001'::uuid], ARRAY['original']);
SELECT public.upsert_customer_by_identity('30000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000001', 'Allowed');
SELECT test.assert_true((SELECT first_name = 'Allowed' AND tags = ARRAY['allowed'] FROM public.customers WHERE id = '90000000-0000-4000-8000-000000000001'), 'member identity and tags still work');
SELECT public.import_customers_by_identity('30000000-0000-4000-8000-000000000001', '[{"email":"allowed@example.test"}]'::jsonb);
SELECT public.merge_customers('30000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000002');
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.customers WHERE id = '90000000-0000-4000-8000-000000000002'), 'member merge still works');
SELECT public.mute_aeo_alert('a0000000-0000-4000-8000-000000000001');
SELECT public.mute_aeo_alert('a0000000-0000-4000-8000-000000000003');
SELECT public.mute_aeo_alert('a0000000-0000-4000-8000-000000000004');
SELECT test.expect_denied($cmd$SELECT public.import_customers_by_identity(
  '30000000-0000-4000-8000-000000000003', '[{"email":"sibling-forged@example.test"}]'::jsonb)$cmd$);
SELECT test.expect_denied($cmd$SELECT public.upsert_customer_by_identity(
  '30000000-0000-4000-8000-000000000002', NULL, 'Foreign')$cmd$);
RESET ROLE;
SELECT test.assert_true((SELECT bool_and(tags = ARRAY['original']) FROM public.customers
  WHERE business_id <> '30000000-0000-4000-8000-000000000001'), 'sibling and other tenant tags unchanged');
SELECT test.assert_true((SELECT muted_at IS NOT NULL FROM public.aeo_alerts WHERE id = 'a0000000-0000-4000-8000-000000000001'), 'member own alert mute works');
SELECT test.assert_true((SELECT bool_and(muted_at IS NULL) FROM public.aeo_alerts WHERE id <> 'a0000000-0000-4000-8000-000000000001'), 'foreign alert mutes blocked');
SET request.jwt.claim.role = 'service_role';
UPDATE public.organization_members SET status = 'suspended' WHERE user_id = '20000000-0000-4000-8000-000000000006';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT public.bulk_add_customer_tags(ARRAY['90000000-0000-4000-8000-000000000001'::uuid], ARRAY['suspended']);
SELECT test.expect_denied($cmd$SELECT public.upsert_customer_by_identity(
  '30000000-0000-4000-8000-000000000001', NULL, 'Suspended', NULL, 'suspended@example.test')$cmd$);
SELECT test.expect_denied($cmd$SELECT public.claim_review_milestone('30000000-0000-4000-8000-000000000001')$cmd$);
RESET ROLE;
SELECT test.assert_true((SELECT NOT ('suspended' = ANY(tags)) FROM public.customers WHERE id = '90000000-0000-4000-8000-000000000001'), 'org suspension overrides stale business membership');
SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
SELECT public.upsert_customer_by_identity('30000000-0000-4000-8000-000000000002', NULL, 'Backend', NULL, 'backend@example.test');
SELECT public.claim_review_milestone('30000000-0000-4000-8000-000000000002');
RESET ROLE;
ROLLBACK;
SET request.jwt.claim.role = '';

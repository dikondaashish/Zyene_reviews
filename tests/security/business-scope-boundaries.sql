-- Additional businesses within one tenant must remain isolated for employees.
BEGIN;
SET request.jwt.claim.role = 'service_role';
INSERT INTO public.businesses (id, organization_id, name) VALUES
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Sibling business');
INSERT INTO public.organization_members VALUES
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'ORG_EMPLOYEE', 'active');
INSERT INTO public.business_members (business_id, user_id, role) VALUES
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'viewer');
INSERT INTO public.reviews VALUES
  ('80000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', NULL),
  ('80000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', NULL);
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000006';
SELECT test.assert_true((SELECT count(*) = 1 FROM public.businesses), 'employee cannot read sibling business');
SELECT test.assert_true((SELECT count(*) = 1 FROM public.reviews), 'broad old review policy constrained');
SELECT test.expect_denied($cmd$INSERT INTO public.reviews VALUES
  ('80000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', NULL)$cmd$);
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
UPDATE public.business_members SET role = 'manager' WHERE user_id = '20000000-0000-4000-8000-000000000006';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
INSERT INTO public.invitations (organization_id, business_id, email, role) VALUES
  ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'scoped@example.test', 'member');
SELECT test.expect_denied($cmd$INSERT INTO public.invitations (organization_id, business_id, email, role) VALUES
  ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', 'sibling@example.test', 'member')$cmd$);
SELECT test.expect_denied($cmd$UPDATE public.businesses SET organization_id =
  '10000000-0000-4000-8000-000000000002' WHERE id = '30000000-0000-4000-8000-000000000001'$cmd$);
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
DELETE FROM public.business_members WHERE user_id = '20000000-0000-4000-8000-000000000006';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.businesses), 'removed member cannot regain org fallback access');
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.reviews), 'removed member cannot read reviews');
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
SELECT test.assert_true((SELECT count(*) = 2 FROM public.businesses), 'org manager retains all own businesses');
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
UPDATE public.organization_members SET status = 'suspended' WHERE user_id = '20000000-0000-4000-8000-000000000001';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.businesses), 'org suspension overrides active business role');
RESET ROLE;
ROLLBACK;
SET request.jwt.claim.role = '';

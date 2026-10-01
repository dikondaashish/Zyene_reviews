-- Synthetic fixtures only, run after the existing security assertions.
BEGIN;
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
INSERT INTO public.businesses (id, organization_id, name) VALUES
 ('30000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000001', 'Developer sibling');
INSERT INTO public.organization_members (organization_id,user_id,role,status,role_label) VALUES
 ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000007','ORG_OWNER','active','developer'),
 ('10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000007','ORG_OWNER','active','developer'),
 ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000008','ORG_OWNER','active','developer');
INSERT INTO public.business_members (id,business_id,user_id,role,status,role_label) VALUES
 ('90000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000007','owner','active','developer'),
 ('90000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000007','owner','active','developer'),
 ('90000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000007','owner','active',NULL),
 ('90000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000008','owner','active','developer');
SET ROLE anon;
SET request.jwt.claim.role = 'anon';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001')$cmd$);
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
-- Manager cannot remove developer, either by RPC or direct table access.
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000002';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001')$cmd$);
SELECT test.expect_denied($cmd$DELETE FROM public.organization_members WHERE user_id='20000000-0000-4000-8000-000000000007'$cmd$);
-- Developer cannot delete self, another developer, or clear their designation.
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000007';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001')$cmd$);
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000004')$cmd$);
SELECT test.expect_denied($cmd$UPDATE public.organization_members SET role_label=NULL WHERE user_id='20000000-0000-4000-8000-000000000007'$cmd$);
SELECT test.expect_denied($cmd$UPDATE public.business_members SET role='admin' WHERE id='90000000-0000-4000-8000-000000000004'$cmd$);
-- A foreign owner and a forged business/member pairing are denied.
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000004';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001')$cmd$);
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002')$cmd$);
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
UPDATE public.organization_members SET status='suspended' WHERE user_id='20000000-0000-4000-8000-000000000001';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001')$cmd$);
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
SELECT test.assert_true((SELECT count(*)=4 FROM public.business_members WHERE user_id IN ('20000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000008')), 'denied requests had no side effects');
UPDATE public.organization_members SET status='active' WHERE user_id='20000000-0000-4000-8000-000000000001';
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001');
RESET ROLE;
SELECT test.assert_true((SELECT count(*)=1 FROM public.business_members WHERE user_id='20000000-0000-4000-8000-000000000007'), 'all selected org businesses removed, foreign business preserved');
SELECT test.assert_true((SELECT count(*)=1 FROM public.organization_members WHERE user_id='20000000-0000-4000-8000-000000000007' AND organization_id='10000000-0000-4000-8000-000000000002'), 'foreign org preserved');
SELECT test.assert_true(NOT EXISTS(SELECT 1 FROM public.organization_members WHERE user_id='20000000-0000-4000-8000-000000000007' AND organization_id='10000000-0000-4000-8000-000000000001'), 'selected org access removed');
SELECT test.assert_true(EXISTS(SELECT 1 FROM public.events WHERE entity_id='90000000-0000-4000-8000-000000000001' AND metadata->>'removed_role'='developer'), 'removal audited atomically');
ROLLBACK;

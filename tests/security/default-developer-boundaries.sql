-- Exercise actual triggers, grants, creator onboarding and persistent removal.
BEGIN;
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
SELECT test.assert_true((SELECT count(*) FROM internal.default_business_developers) = 1,
 'verified support identity configured once');
SELECT test.assert_true(NOT EXISTS (
 SELECT 1 FROM public.businesses b WHERE NOT EXISTS (
  SELECT 1 FROM public.business_members bm WHERE bm.business_id=b.id
   AND bm.user_id='20000000-0000-4000-8000-000000000007'
   AND bm.role='owner' AND bm.role_label='developer' AND bm.status='active')),
 'existing businesses receive labelled developer access');
SELECT test.assert_true(NOT has_function_privilege('authenticated',
 'internal.provision_business_developer(uuid)', 'EXECUTE'), 'no public provisioning RPC');
SELECT test.assert_true(NOT has_table_privilege('authenticated',
 'internal.default_business_developers', 'SELECT'), 'support configuration is private');
SELECT test.assert_true(NOT has_table_privilege('authenticated',
 'internal.business_developer_opt_outs', 'INSERT'), 'customers cannot forge removal records');

-- Normal authenticated onboarding: developer insertion must not prevent the
-- customer's first owner membership from being created.
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
INSERT INTO public.businesses (id, organization_id, name) VALUES
 ('30000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', 'New owner business');
INSERT INTO public.business_members (business_id,user_id,role,status) VALUES
 ('30000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000001','owner','active');
SELECT test.assert_true((SELECT count(*) FROM public.business_members
 WHERE business_id='30000000-0000-4000-8000-000000000011')=2,
 'new business has its customer owner and default developer');
SELECT test.expect_denied($cmd$UPDATE public.business_members SET role_label=NULL
 WHERE business_id='30000000-0000-4000-8000-000000000011'
 AND user_id='20000000-0000-4000-8000-000000000007'$cmd$);
SELECT test.expect_denied($cmd$INSERT INTO public.business_members
 (business_id,user_id,role,status,role_label) VALUES
 ('30000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000008','owner','active','developer')$cmd$);

-- The owner removes the developer from this organization only.
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000002';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000011',
 (SELECT id FROM public.business_members WHERE business_id='30000000-0000-4000-8000-000000000011'
 AND user_id='20000000-0000-4000-8000-000000000007'))$cmd$);
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000007';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000011',
 (SELECT id FROM public.business_members WHERE business_id='30000000-0000-4000-8000-000000000011'
 AND user_id='20000000-0000-4000-8000-000000000007'))$cmd$);
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000004';
SELECT test.expect_denied($cmd$SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000011',
 '90000000-0000-4000-8000-000000000011')$cmd$);
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
SELECT public.delete_organization_developer('30000000-0000-4000-8000-000000000011',
 (SELECT id FROM public.business_members WHERE business_id='30000000-0000-4000-8000-000000000011'
 AND user_id='20000000-0000-4000-8000-000000000007'));
SELECT test.assert_true(NOT EXISTS(SELECT 1 FROM public.business_members bm
 JOIN public.businesses b ON b.id=bm.business_id
 WHERE b.organization_id='10000000-0000-4000-8000-000000000001'
 AND bm.user_id='20000000-0000-4000-8000-000000000007'), 'owner revokes all organization access');
INSERT INTO public.businesses (id,organization_id,name) VALUES
 ('30000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000001','After opt out');
INSERT INTO public.business_members (business_id,user_id,role,status) VALUES
 ('30000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000001','owner','active');
SELECT test.assert_true(NOT EXISTS(SELECT 1 FROM public.business_members
 WHERE business_id='30000000-0000-4000-8000-000000000012'
 AND user_id='20000000-0000-4000-8000-000000000007'), 'new businesses respect owner removal');
RESET ROLE;
SELECT test.assert_true(EXISTS(SELECT 1 FROM internal.business_developer_opt_outs
 WHERE organization_id='10000000-0000-4000-8000-000000000001'
 AND user_id='20000000-0000-4000-8000-000000000007'), 'removal creates durable opt out');
SELECT test.assert_true(EXISTS(SELECT 1 FROM public.organization_members
 WHERE organization_id='10000000-0000-4000-8000-000000000002'
 AND user_id='20000000-0000-4000-8000-000000000007' AND role_label='developer'),
 'removal preserves another organization');

-- OAuth registration creates the business before the human org owner.
SET request.jwt.claim.role = 'service_role';
INSERT INTO public.organizations(id,name,slug) VALUES
 ('10000000-0000-4000-8000-000000000011','OAuth signup','oauth-signup');
INSERT INTO public.businesses(id,organization_id,name) VALUES
 ('30000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000011','OAuth business');
INSERT INTO public.organization_members(organization_id,user_id,role,status) VALUES
 ('10000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000008','ORG_OWNER','active');
SELECT test.assert_true(EXISTS(SELECT 1 FROM public.business_members
 WHERE business_id='30000000-0000-4000-8000-000000000013'
 AND user_id='20000000-0000-4000-8000-000000000007' AND role_label='developer'),
 'late organization owner provisions OAuth business');

-- A suspended support account's membership is never reactivated by defaults.
UPDATE public.organization_members SET status='suspended'
 WHERE organization_id='10000000-0000-4000-8000-000000000011'
 AND user_id='20000000-0000-4000-8000-000000000007';
INSERT INTO public.businesses(id,organization_id,name) VALUES
 ('30000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000011','Suspended support');
SELECT test.assert_true(NOT EXISTS(SELECT 1 FROM public.business_members
 WHERE business_id='30000000-0000-4000-8000-000000000014'
 AND user_id='20000000-0000-4000-8000-000000000007'), 'defaults preserve suspended access');
ROLLBACK;

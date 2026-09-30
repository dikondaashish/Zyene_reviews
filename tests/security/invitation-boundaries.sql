SELECT test.assert_true(EXISTS (SELECT 1 FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
  WHERE c.conrelid = 'public.invitations'::regclass AND c.confrelid = 'public.users'::regclass
    AND c.contype = 'f' AND a.attname = 'invited_by'), 'missing inviter audit column added with user reference');
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000002';
SELECT test.expect_denied($cmd$INSERT INTO public.invitations (organization_id, business_id, email, role)
  VALUES ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
  'synthetic@example.test', 'admin')$cmd$);
SELECT test.expect_denied($cmd$INSERT INTO public.invitations (organization_id, business_id, email, role)
  VALUES ('10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001',
  'synthetic@example.test', 'member')$cmd$);
INSERT INTO public.invitations (id, organization_id, business_id, email, role, invited_by) VALUES
  ('70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001', 'synthetic@example.test', 'manager',
  '20000000-0000-4000-8000-000000000008');
SELECT test.assert_true((SELECT invited_by = auth.uid() FROM public.invitations
  WHERE id = '70000000-0000-4000-8000-000000000001'), 'client cannot spoof invitation creator');
SELECT test.expect_denied($cmd$UPDATE public.invitations SET role = 'admin'$cmd$);
SELECT test.expect_denied($cmd$SELECT public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000001', auth.uid(), 'synthetic@example.test')$cmd$);
RESET ROLE;
SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
SELECT test.assert_true(public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005',
  'wrong@example.test') IS NULL, 'wrong identity cannot accept');
SELECT test.assert_true(public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005',
  'synthetic@example.test') = '30000000-0000-4000-8000-000000000001', 'valid invite accepted');
SELECT test.assert_true((SELECT role = 'ORG_EMPLOYEE' FROM public.organization_members
  WHERE user_id = '20000000-0000-4000-8000-000000000005'), 'business manager is not an org manager');
SELECT test.assert_true((SELECT role = 'manager' FROM public.business_members
  WHERE user_id = '20000000-0000-4000-8000-000000000005'), 'business role preserved');
SELECT test.assert_true(public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005',
  'synthetic@example.test') IS NOT NULL, 'active member replay is harmless');
SELECT test.assert_true((SELECT count(*) = 1 FROM public.events WHERE user_id =
  '20000000-0000-4000-8000-000000000005'), 'consumed invite has one audit event');
DELETE FROM public.business_members WHERE user_id = '20000000-0000-4000-8000-000000000005';
SELECT test.assert_true(public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005',
  'synthetic@example.test') IS NULL, 'consumed link cannot recreate membership');
INSERT INTO public.invitations (id, organization_id, business_id, email, role) VALUES
  ('70000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001', 'owner@example.test', 'viewer'),
  ('70000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000001', 'synthetic@example.test', 'admin');
SELECT test.assert_true(public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000005',
  'synthetic@example.test') IS NULL, 'legacy mismatched business/org denied');
SELECT test.assert_true(public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001',
  'owner@example.test') IS NOT NULL, 'existing owner accepts without downgrade');
SELECT test.assert_true((SELECT role = 'owner' FROM public.organization_members
  WHERE user_id = '20000000-0000-4000-8000-000000000001'), 'org owner is never downgraded');
SELECT test.assert_true((SELECT role = 'owner' FROM public.business_members
  WHERE user_id = '20000000-0000-4000-8000-000000000001'), 'business owner is never downgraded');
RESET ROLE;
SET request.jwt.claim.role = '';
CREATE FUNCTION test.deny_synthetic_member() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_id = '20000000-0000-4000-8000-000000000008' THEN
    RAISE EXCEPTION 'Synthetic membership failure' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER deny_synthetic_member BEFORE INSERT ON public.business_members
  FOR EACH ROW EXECUTE FUNCTION test.deny_synthetic_member();
SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
INSERT INTO public.invitations (id, organization_id, business_id, email, role) VALUES
  ('70000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001', 'rollback@example.test', 'member');
SELECT test.expect_denied($cmd$SELECT public.accept_business_invitation(
  '70000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000008', 'rollback@example.test')$cmd$);
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id =
  '20000000-0000-4000-8000-000000000008'), 'failed acceptance rolls back first membership');
SELECT test.assert_true((SELECT accepted_at IS NULL FROM public.invitations WHERE id =
  '70000000-0000-4000-8000-000000000004'), 'failed acceptance does not consume invite');
RESET ROLE;
SET request.jwt.claim.role = '';
DROP TRIGGER deny_synthetic_member ON public.business_members;
DROP FUNCTION test.deny_synthetic_member();

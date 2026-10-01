-- Synthetic identity for the default developer; disposable PostgreSQL only.
RESET ROLE;
SET request.jwt.claim.role = 'service_role';
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz);
INSERT INTO auth.users VALUES
 ('20000000-0000-4000-8000-000000000007', 'karthik.reddy@zyene.com', now());
-- Match the live baseline's permissive policy alongside the restrictive guard.
CREATE POLICY businesses_insert ON public.businesses FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.organization_members om
 WHERE om.organization_id=businesses.organization_id AND om.user_id=auth.uid()
 AND om.status='active' AND om.role IN ('owner','admin','manager','ORG_OWNER','ORG_ADMIN','ORG_MANAGER')));

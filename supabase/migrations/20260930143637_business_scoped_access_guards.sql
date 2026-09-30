-- apply-plan: with-code - apply with live business membership authorization helpers.
-- Org employees are scoped to explicit business memberships, not every business
-- in their organization. Org managers retain their intended org-wide access.
CREATE OR REPLACE FUNCTION public.authorized_business_ids(
  p_write boolean DEFAULT false, p_manage boolean DEFAULT false
) RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT b.id FROM public.businesses b
    JOIN public.organization_members om ON om.organization_id = b.organization_id
      AND om.user_id = auth.uid() AND om.status = 'active'
    LEFT JOIN public.business_members bm ON bm.business_id = b.id
      AND bm.user_id = auth.uid() AND bm.status = 'active'
  WHERE om.role IN ('owner', 'admin', 'manager', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER')
    OR (bm.role IN ('owner', 'admin', 'manager', 'member', 'viewer')
      AND (NOT p_write OR bm.role <> 'viewer')
      AND (NOT p_manage OR bm.role IN ('owner', 'admin', 'manager')));
$$;
REVOKE ALL ON FUNCTION public.authorized_business_ids(boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.authorized_business_ids(boolean, boolean) TO authenticated, service_role;

-- Restrictive guards also constrain any older permissive policies that remain.
-- Cover every existing RLS-protected business_id table (including AEO tables).
DO $$
DECLARE table_name text;
BEGIN
  FOR table_name IN
    SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'business_id' AND NOT a.attisdropped
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
  LOOP
    EXECUTE format('CREATE POLICY business_scope_read_guard ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (business_id IN (SELECT public.authorized_business_ids()))', table_name);
    EXECUTE format('CREATE POLICY business_scope_insert_guard ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (business_id IN (SELECT public.authorized_business_ids(true)))', table_name);
    EXECUTE format('CREATE POLICY business_scope_update_guard ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (business_id IN (SELECT public.authorized_business_ids(true))) WITH CHECK (business_id IN (SELECT public.authorized_business_ids(true)))', table_name);
    EXECUTE format('CREATE POLICY business_scope_delete_guard ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (business_id IN (SELECT public.authorized_business_ids(true)))', table_name);
  END LOOP;
END;
$$;

CREATE POLICY businesses_scope_read_guard ON public.businesses AS RESTRICTIVE
  FOR SELECT TO authenticated USING (id IN (SELECT public.authorized_business_ids()));
DROP POLICY IF EXISTS businesses_update ON public.businesses;
CREATE POLICY businesses_update ON public.businesses FOR UPDATE TO authenticated
  USING (id IN (SELECT public.authorized_business_ids(true, true)))
  WITH CHECK (id IN (SELECT public.authorized_business_ids(true, true)));
CREATE POLICY businesses_scope_update_guard ON public.businesses AS RESTRICTIVE
  FOR UPDATE TO authenticated USING (id IN (SELECT public.authorized_business_ids(true, true)))
  WITH CHECK (id IN (SELECT public.authorized_business_ids(true, true)));
CREATE POLICY businesses_scope_delete_guard ON public.businesses AS RESTRICTIVE
  FOR DELETE TO authenticated USING (id IN (SELECT public.authorized_business_ids(true, true)));
CREATE POLICY businesses_scope_insert_guard ON public.businesses AS RESTRICTIVE
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM public.organization_members om WHERE om.organization_id = businesses.organization_id
      AND om.user_id = auth.uid() AND om.status = 'active'
      AND om.role IN ('owner', 'admin', 'manager', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER')
  ));

CREATE OR REPLACE FUNCTION public.guard_business_tenant_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'Business tenant change denied' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_business_tenant_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_business_tenant_change BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.guard_business_tenant_change();

-- Business-scoped managers must not need an org-wide management role to manage
-- their team; the prior role-transition trigger still limits the actual change.
DROP POLICY IF EXISTS business_members_update ON public.business_members;
DROP POLICY IF EXISTS business_members_delete ON public.business_members;
CREATE POLICY business_members_update ON public.business_members FOR UPDATE TO authenticated
  USING (business_id IN (SELECT public.authorized_business_ids(true, true)))
  WITH CHECK (business_id IN (SELECT public.authorized_business_ids(true, true)));
CREATE POLICY business_members_delete ON public.business_members FOR DELETE TO authenticated
  USING (business_id IN (SELECT public.authorized_business_ids(true, true)));

DROP POLICY IF EXISTS invitations_insert ON public.invitations;
DROP POLICY IF EXISTS invitations_delete ON public.invitations;
CREATE POLICY invitations_insert ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT public.authorized_business_ids(true, true)));
CREATE POLICY invitations_delete ON public.invitations FOR DELETE TO authenticated
  USING (business_id IN (SELECT public.authorized_business_ids(true, true)));

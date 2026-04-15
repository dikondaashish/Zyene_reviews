-- Only organization owners may update organizations (e.g. name/slug). Admins/managers must not rename the org.
DROP POLICY IF EXISTS "orgs_update_admin" ON public.organizations;

CREATE POLICY orgs_update_owner_only ON public.organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ORG_OWNER')
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ORG_OWNER')
    )
  );

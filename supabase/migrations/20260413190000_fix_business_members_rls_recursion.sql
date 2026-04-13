-- Fix 42P17: infinite recursion in business_members RLS.
-- Policies must not subquery business_members from within business_members policies.
-- Align with org access via get_user_org_ids() and organization_members (same as businesses/reviews).

-- ---------------------------------------------------------------------------
-- business_members
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS business_members_select ON public.business_members;
CREATE POLICY business_members_select ON public.business_members
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

DROP POLICY IF EXISTS business_members_insert ON public.business_members;
CREATE POLICY business_members_insert ON public.business_members
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT b.id
      FROM public.businesses b
      WHERE b.organization_id IN (
        SELECT om.organization_id
        FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN (
            'owner', 'admin', 'manager',
            'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
          )
      )
    )
  );

DROP POLICY IF EXISTS business_members_update ON public.business_members;
CREATE POLICY business_members_update ON public.business_members
  FOR UPDATE
  USING (
    business_id IN (
      SELECT b.id
      FROM public.businesses b
      WHERE b.organization_id IN (
        SELECT om.organization_id
        FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN (
            'owner', 'admin', 'manager',
            'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
          )
      )
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT b.id
      FROM public.businesses b
      WHERE b.organization_id IN (
        SELECT om.organization_id
        FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN (
            'owner', 'admin', 'manager',
            'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
          )
      )
    )
  );

DROP POLICY IF EXISTS business_members_delete ON public.business_members;
CREATE POLICY business_members_delete ON public.business_members
  FOR DELETE USING (
    business_id IN (
      SELECT b.id
      FROM public.businesses b
      WHERE b.organization_id IN (
        SELECT om.organization_id
        FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN (
            'owner', 'admin', 'manager',
            'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
          )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- invitations (avoid business_members subqueries here too)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS invitations_select ON public.invitations;
CREATE POLICY invitations_select ON public.invitations
  FOR SELECT USING (
    (
      business_id IS NOT NULL
      AND business_id IN (
        SELECT id FROM public.businesses
        WHERE organization_id IN (SELECT get_user_org_ids())
      )
    )
    OR organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS invitations_insert ON public.invitations;
CREATE POLICY invitations_insert ON public.invitations
  FOR INSERT WITH CHECK (
    (
      business_id IS NOT NULL
      AND business_id IN (
        SELECT b.id
        FROM public.businesses b
        WHERE b.organization_id IN (
          SELECT om.organization_id
          FROM public.organization_members om
          WHERE om.user_id = auth.uid()
            AND om.status = 'active'
            AND om.role IN (
              'owner', 'admin', 'manager',
              'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
            )
        )
      )
    )
    OR (
      business_id IS NULL
      AND organization_id IN (
        SELECT om.organization_id
        FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN (
            'owner', 'admin', 'manager',
            'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
          )
      )
    )
  );

DROP POLICY IF EXISTS invitations_delete ON public.invitations;
CREATE POLICY invitations_delete ON public.invitations
  FOR DELETE USING (
    (
      business_id IS NOT NULL
      AND business_id IN (
        SELECT b.id
        FROM public.businesses b
        WHERE b.organization_id IN (
          SELECT om.organization_id
          FROM public.organization_members om
          WHERE om.user_id = auth.uid()
            AND om.status = 'active'
            AND om.role IN (
              'owner', 'admin', 'manager',
              'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
            )
        )
      )
    )
    OR (
      business_id IS NULL
      AND organization_id IN (
        SELECT om.organization_id
        FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN (
            'owner', 'admin', 'manager',
            'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER'
          )
      )
    )
  );

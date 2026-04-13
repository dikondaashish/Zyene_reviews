-- Make Team module business-scoped.
-- Handles older invitations/business_members schema variants safely.

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, user_id)
);

ALTER TABLE public.business_members DROP CONSTRAINT IF EXISTS business_members_role_check;
ALTER TABLE public.business_members ADD CONSTRAINT business_members_role_check
  CHECK (role IN ('owner','admin','manager','member','viewer'));

ALTER TABLE public.business_members DROP CONSTRAINT IF EXISTS business_members_status_check;
ALTER TABLE public.business_members ADD CONSTRAINT business_members_status_check
  CHECK (status IN ('active','invited','suspended'));

CREATE INDEX IF NOT EXISTS idx_business_members_business_id ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_business_members_user_id ON public.business_members(user_id);

ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_members_select ON public.business_members;
CREATE POLICY business_members_select ON public.business_members
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS business_members_insert ON public.business_members;
CREATE POLICY business_members_insert ON public.business_members
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner','admin','manager')
        AND bm.status = 'active'
    )
  );

DROP POLICY IF EXISTS business_members_update ON public.business_members;
CREATE POLICY business_members_update ON public.business_members
  FOR UPDATE USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner','admin','manager')
        AND bm.status = 'active'
    )
  );

DROP POLICY IF EXISTS business_members_delete ON public.business_members;
CREATE POLICY business_members_delete ON public.business_members
  FOR DELETE USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner','admin','manager')
        AND bm.status = 'active'
    )
  );

UPDATE public.invitations i
SET business_id = b.id
FROM (
  SELECT DISTINCT ON (organization_id) id, organization_id
  FROM public.businesses
  ORDER BY organization_id, created_at ASC
) b
WHERE i.business_id IS NULL
  AND i.organization_id = b.organization_id;

DROP INDEX IF EXISTS public.invitations_org_email_pending_unique;
CREATE UNIQUE INDEX IF NOT EXISTS invitations_org_email_pending_unique
  ON public.invitations(organization_id, lower(email))
  WHERE accepted_at IS NULL AND business_id IS NULL;

DROP INDEX IF EXISTS public.invitations_business_email_pending_unique;
CREATE UNIQUE INDEX IF NOT EXISTS invitations_business_email_pending_unique
  ON public.invitations(business_id, lower(email))
  WHERE accepted_at IS NULL AND business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invitations_business ON public.invitations(business_id);

DROP POLICY IF EXISTS invitations_select ON public.invitations;
CREATE POLICY invitations_select ON public.invitations
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
    OR organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS invitations_insert ON public.invitations;
CREATE POLICY invitations_insert ON public.invitations
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner','admin','manager')
        AND bm.status = 'active'
    )
  );

DROP POLICY IF EXISTS invitations_delete ON public.invitations;
CREATE POLICY invitations_delete ON public.invitations
  FOR DELETE USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner','admin','manager')
        AND bm.status = 'active'
    )
  );

INSERT INTO public.business_members (business_id, user_id, role, status)
SELECT b.id, om.user_id,
  CASE
    WHEN om.role IN ('owner','ORG_OWNER') THEN 'owner'
    WHEN om.role IN ('admin','ORG_ADMIN') THEN 'admin'
    WHEN om.role IN ('manager','ORG_MANAGER') THEN 'manager'
    WHEN om.role = 'viewer' THEN 'viewer'
    ELSE 'member'
  END,
  CASE WHEN om.status = 'active' THEN 'active' ELSE 'invited' END
FROM public.organization_members om
JOIN public.businesses b ON b.organization_id = om.organization_id
ON CONFLICT (business_id, user_id) DO NOTHING;

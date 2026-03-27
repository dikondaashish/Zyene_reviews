-- ============================================================
-- Fix: RLS Role Alignment (owner/admin -> ORG_OWNER/ORG_ADMIN)
-- Migration: 20260327140000_fix_org_update_rls
-- ============================================================

-- 1. Update CHECK constraint on organization_members.role
-- Postgres doesn't allow direct ALTER COLUMN CHECK, so we drop and re-add.
ALTER TABLE "public"."organization_members" DROP CONSTRAINT IF EXISTS organization_members_role_check;
ALTER TABLE "public"."organization_members"
  ADD CONSTRAINT organization_members_role_check
  CHECK (role IN ('owner','admin','manager','member','viewer', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER', 'ORG_EMPLOYEE'));

-- 2. Update RLS policies for 'organizations'
DROP POLICY IF EXISTS "orgs_update_admin" ON organizations;
CREATE POLICY "orgs_update_admin" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin','ORG_OWNER','ORG_ADMIN')
        AND status = 'active'
    )
  );

-- 3. Update RLS policies for 'businesses'
DROP POLICY IF EXISTS "businesses_insert" ON businesses;
CREATE POLICY "businesses_insert" ON businesses
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin','manager','ORG_OWNER','ORG_ADMIN','ORG_MANAGER')
        AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "businesses_update" ON businesses;
CREATE POLICY "businesses_update" ON businesses
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin','manager','ORG_OWNER','ORG_ADMIN','ORG_MANAGER')
        AND status = 'active'
    )
  );

-- 4. Update RLS policies for 'invitations'
DROP POLICY IF EXISTS "invitations_insert" ON invitations;
CREATE POLICY "invitations_insert" ON invitations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin','ORG_OWNER','ORG_ADMIN')
        AND status = 'active'
    )
  );

-- 5. Update RLS policies for 'organization_members' deletion
DROP POLICY IF EXISTS "org_members_delete" ON organization_members;
CREATE POLICY "org_members_delete" ON organization_members
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin','ORG_OWNER','ORG_ADMIN')
        AND status = 'active'
    )
  );

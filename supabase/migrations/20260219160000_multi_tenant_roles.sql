-- ============================================================
-- Migration: 20260219_multi_tenant_roles
-- Description: Introduce Multi-Tenant Roles (Org vs Store)
-- ============================================================

-- 1. Create business_members table
CREATE TABLE IF NOT EXISTS business_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL
                    CHECK (role IN ('STORE_OWNER','STORE_MANAGER','STORE_EMPLOYEE')),
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','invited','suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (business_id, user_id)
);

-- 2. Drop old constraint FIRST to allow new role values
ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;

-- 3. Migrate existing organization roles to new format
-- Map: owner -> ORG_OWNER, admin -> ORG_MANAGER, member -> ORG_EMPLOYEE, viewer -> ORG_EMPLOYEE
UPDATE organization_members SET role = 'ORG_OWNER' WHERE role = 'owner';
UPDATE organization_members SET role = 'ORG_MANAGER' WHERE role = 'admin' OR role = 'manager';
UPDATE organization_members SET role = 'ORG_EMPLOYEE' WHERE role = 'member' OR role = 'viewer';

-- 4. Add new constraint
ALTER TABLE organization_members ADD CONSTRAINT organization_members_role_check
  CHECK (role IN ('ORG_OWNER', 'ORG_MANAGER', 'ORG_EMPLOYEE'));

-- 5. Update invitations table
-- Add business_id to support store-level invites
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Drop old role check (if any) and add new one
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_role_check;
ALTER TABLE invitations ADD CONSTRAINT invitations_role_check
  CHECK (role IN ('ORG_OWNER', 'ORG_MANAGER', 'ORG_EMPLOYEE', 'STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE'));


-- 6. RLS Policies for business_members

ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;

-- Select: Users can see members of businesses they belong to' OR 'Users can see members if they are Org Admin/Owner of that business
DROP POLICY IF EXISTS business_members_select ON business_members;
CREATE POLICY business_members_select ON business_members
  FOR SELECT USING (
    -- Direct membership
    (user_id = auth.uid())
    OR
    -- Colleague in same business
    (business_id IN (
      SELECT business_id FROM business_members WHERE user_id = auth.uid()
    ))
    OR
    -- Org Owner/Manager of parent org
    (business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ORG_OWNER', 'ORG_MANAGER')
      )
    ))
  );

-- Insert/Update/Delete: Only Store Owner or Org Owner/Manager
DROP POLICY IF EXISTS business_members_manage ON business_members;
CREATE POLICY business_members_manage ON business_members
  FOR ALL USING (
    -- Store Owner
    (business_id IN (
      SELECT business_id FROM business_members
      WHERE user_id = auth.uid() AND role = 'STORE_OWNER'
    ))
    OR
    -- Org Owner/Manager
    (business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ORG_OWNER', 'ORG_MANAGER')
      )
    ))
  );

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_business_members_user_id ON business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business_id ON business_members(business_id);

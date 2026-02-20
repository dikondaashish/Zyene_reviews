-- Migration: 20260219160000_fix_rls_recursion
-- Description: Fix infinite recursion in business_members RLS policies by using SECURITY DEFINER functions

-- 1. Helper to get my businesses safely (BREAKS RECURSION)
CREATE OR REPLACE FUNCTION get_user_business_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT business_id
  FROM business_members
  WHERE user_id = auth.uid()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 2. Helper to get my role in a business safely (BREAKS RECURSION)
CREATE OR REPLACE FUNCTION get_user_store_role(lookup_business_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  found_role VARCHAR;
BEGIN
  SELECT role INTO found_role
  FROM business_members
  WHERE user_id = auth.uid()
    AND business_id = lookup_business_id
    AND status = 'active';
    
  RETURN found_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- 3. Update SELECT Policy
DROP POLICY IF EXISTS business_members_select ON business_members;
CREATE POLICY business_members_select ON business_members
  FOR SELECT USING (
    -- Direct membership
    (user_id = auth.uid())
    OR
    -- Colleague in same business (using function to avoid recursion)
    (business_id IN (
      SELECT get_user_business_ids()
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

-- 4. Update MANAGE Policy (Split into INSERT/UPDATE/DELETE to avoid recursion on SELECT)
DROP POLICY IF EXISTS business_members_manage ON business_members;

CREATE POLICY business_members_insert ON business_members
  FOR INSERT WITH CHECK (
    -- Store Owner
    (get_user_store_role(business_id) = 'STORE_OWNER')
    OR
    -- Org Owner/Manager
    (business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ORG_OWNER', 'ORG_MANAGER')
      )
    ))
  );

CREATE POLICY business_members_update ON business_members
  FOR UPDATE USING (
    -- Store Owner
    (get_user_store_role(business_id) = 'STORE_OWNER')
    OR
    -- Org Owner/Manager
    (business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ORG_OWNER', 'ORG_MANAGER')
      )
    ))
  );

CREATE POLICY business_members_delete ON business_members
  FOR DELETE USING (
    -- Store Owner
    (get_user_store_role(business_id) = 'STORE_OWNER')
    OR
    -- Org Owner/Manager
    (business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ORG_OWNER', 'ORG_MANAGER')
      )
    ))
  );

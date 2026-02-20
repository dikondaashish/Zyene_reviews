-- Migration: 20260219210000_fix_users_rls
-- Description: Allow viewing users who are members of same organization or business

-- Allow viewing users who are members of organizations I belong to
CREATE POLICY "view_org_colleagues" ON users
FOR SELECT USING (
  exists (
    select 1 from organization_members om_target
    join organization_members om_me on om_target.organization_id = om_me.organization_id
    where om_target.user_id = users.id
    and om_me.user_id = auth.uid()
  )
);

-- Allow viewing users who are members of businesses I own or work at
CREATE POLICY "view_business_colleagues" ON users
FOR SELECT USING (
  exists (
    select 1 from business_members bm_target
    where bm_target.user_id = users.id
    and (
        -- I am a member of the same business
        bm_target.business_id IN (select business_id from business_members where user_id = auth.uid())
        OR
        -- I am an owner/manager of the org that owns this business
        bm_target.business_id IN (
            select id from businesses where organization_id IN (
                select organization_id from organization_members 
                where user_id = auth.uid() and role IN ('ORG_OWNER', 'ORG_MANAGER')
            )
        )
    )
  )
);

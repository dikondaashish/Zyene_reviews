-- Team invitees had business_members rows but no organization_members row.
-- RLS (get_user_org_ids) hid businesses until org membership exists.
-- Safe to re-run: only inserts missing pairs.

INSERT INTO public.organization_members (organization_id, user_id, role, status)
SELECT DISTINCT b.organization_id,
  bm.user_id,
  CASE bm.role
    WHEN 'owner' THEN 'ORG_OWNER'
    WHEN 'admin' THEN 'ORG_ADMIN'
    WHEN 'manager' THEN 'ORG_MANAGER'
    WHEN 'viewer' THEN 'viewer'
    ELSE 'ORG_EMPLOYEE'
  END,
  'active'
FROM public.business_members bm
INNER JOIN public.businesses b ON b.id = bm.business_id
WHERE COALESCE(bm.status, 'active') = 'active'
  AND NOT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = b.organization_id
      AND om.user_id = bm.user_id
  )
ON CONFLICT (organization_id, user_id) DO NOTHING;

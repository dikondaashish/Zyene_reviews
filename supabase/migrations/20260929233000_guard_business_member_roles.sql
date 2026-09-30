-- apply-plan: with-code - apply in the security release after verifying current membership roles.
-- The existing RLS scopes rows to an org, but does not constrain role transitions.
-- This trigger is the final guard for direct PostgREST writes as well as API writes.
CREATE OR REPLACE FUNCTION public.guard_business_member_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_id uuid := auth.uid();
  actor_role text;
  target_org_id uuid;
BEGIN
  IF auth.role() = 'service_role' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Business membership change denied' USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT organization_id INTO target_org_id
    FROM public.businesses WHERE id = NEW.business_id;

    -- A signed-in org manager may establish their own first business membership.
    -- Invitation acceptance and all later member additions use the authorized server path.
    IF NEW.user_id = actor_id AND NEW.role = 'owner' AND NEW.status = 'active'
       AND EXISTS (
         SELECT 1 FROM public.organization_members om
         WHERE om.organization_id = target_org_id AND om.user_id = actor_id
           AND om.status = 'active'
           AND om.role IN ('owner', 'admin', 'manager', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER')
       )
       AND NOT EXISTS (
         SELECT 1 FROM public.business_members bm WHERE bm.business_id = NEW.business_id
       ) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Business membership creation denied' USING ERRCODE = '42501';
  END IF;

  SELECT bm.role INTO actor_role FROM public.business_members bm
  WHERE bm.business_id = OLD.business_id AND bm.user_id = actor_id
    AND bm.status = 'active';

  IF actor_role IS NULL OR actor_role NOT IN ('owner', 'admin', 'manager')
     OR OLD.user_id = actor_id THEN
    RAISE EXCEPTION 'Business membership change denied' USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'owner' OR (actor_role = 'manager' AND OLD.role = 'admin') THEN
      RAISE EXCEPTION 'Business membership removal denied' USING ERRCODE = '42501';
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.business_id IS DISTINCT FROM OLD.business_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR (OLD.role = 'owner' AND actor_role <> 'owner')
     OR (NEW.role = 'owner' AND actor_role <> 'owner')
     OR (actor_role = 'manager' AND (OLD.role = 'admin' OR NEW.role = 'admin')) THEN
    RAISE EXCEPTION 'Business membership role change denied' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_business_member_write() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_business_member_write ON public.business_members;
CREATE TRIGGER guard_business_member_write
BEFORE INSERT OR UPDATE OR DELETE ON public.business_members
FOR EACH ROW EXECUTE FUNCTION public.guard_business_member_write();

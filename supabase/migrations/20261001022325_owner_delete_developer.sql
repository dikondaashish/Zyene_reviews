-- apply-plan: before-code - owner-only, organization-scoped developer removal.
CREATE FUNCTION public.can_delete_developer(target_org uuid, target_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND auth.uid() <> target_user AND EXISTS (
    SELECT 1 FROM public.organization_members actor
    JOIN public.organization_members target ON target.organization_id = actor.organization_id
    WHERE actor.organization_id = target_org AND actor.user_id = auth.uid()
      AND actor.status = 'active' AND actor.role IN ('owner', 'ORG_OWNER')
      AND actor.role_label IS DISTINCT FROM 'developer'
      AND target.user_id = target_user AND target.role_label = 'developer'
  );
$$;
REVOKE ALL ON FUNCTION public.can_delete_developer(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_delete_developer(uuid, uuid) TO authenticated;

-- Labels must not be cleared to turn a developer into an unrestricted owner.
CREATE OR REPLACE FUNCTION public.guard_member_role_label() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE org_id uuid;
BEGIN
  IF auth.role() = 'service_role' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    IF TG_OP = 'UPDATE' AND NEW.role NOT IN ('owner', 'ORG_OWNER') THEN NEW.role_label := NULL; END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.role_label IS NOT NULL THEN
      RAISE EXCEPTION 'Role designation requires privileged management' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME = 'business_members' THEN
    SELECT organization_id INTO org_id FROM public.businesses WHERE id = OLD.business_id;
  ELSE
    org_id := OLD.organization_id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    IF OLD.role_label = 'developer' AND NOT public.can_delete_developer(org_id, OLD.user_id) THEN
      RAISE EXCEPTION 'Only organization owners can delete developers' USING ERRCODE = '42501';
    END IF;
    IF OLD.role IN ('owner', 'ORG_OWNER') AND OLD.role_label IS DISTINCT FROM 'developer'
       AND NOT (TG_TABLE_NAME = 'business_members' AND public.can_delete_developer(org_id, OLD.user_id)) THEN
      RAISE EXCEPTION 'Owner cannot be removed' USING ERRCODE = '42501';
    END IF;
    RETURN OLD;
  END IF;
  IF NEW.role_label IS DISTINCT FROM OLD.role_label
     OR (OLD.role_label = 'developer' AND NEW IS DISTINCT FROM OLD) THEN
    RAISE EXCEPTION 'Developer designation is protected; use Delete Developer' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER guard_member_role_label ON public.business_members;
CREATE TRIGGER guard_member_role_label BEFORE INSERT OR UPDATE OR DELETE ON public.business_members
FOR EACH ROW EXECUTE FUNCTION public.guard_member_role_label();
DROP TRIGGER guard_member_role_label ON public.organization_members;
CREATE TRIGGER guard_member_role_label BEFORE INSERT OR UPDATE OR DELETE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.guard_member_role_label();

CREATE FUNCTION public.delete_organization_developer(target_business uuid, target_member uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE org_id uuid; target_user uuid;
BEGIN
  SELECT organization_id INTO org_id FROM public.businesses WHERE id = target_business;
  -- Lock authorization rows before checking or changing access.
  PERFORM 1 FROM public.organization_members WHERE organization_id = org_id ORDER BY user_id FOR UPDATE;
  SELECT user_id INTO target_user FROM public.business_members
    WHERE id = target_member AND business_id = target_business AND role_label = 'developer' FOR UPDATE;
  IF target_user IS NULL OR NOT public.can_delete_developer(org_id, target_user) THEN
    RAISE EXCEPTION 'Only organization owners can delete developers' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.business_members bm USING public.businesses b
    WHERE bm.business_id = b.id AND b.organization_id = org_id AND bm.user_id = target_user;
  DELETE FROM public.organization_members WHERE organization_id = org_id AND user_id = target_user;
  INSERT INTO public.events(organization_id, business_id, user_id, event_type, entity_type, entity_id, metadata)
    VALUES (org_id, target_business, auth.uid(), 'team.member_removed', 'business_member', target_member,
      jsonb_build_object('removed_role', 'developer', 'target_user_id', target_user, 'scope', 'organization'));
END;
$$;
REVOKE ALL ON FUNCTION public.delete_organization_developer(uuid, uuid) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.delete_organization_developer(uuid, uuid) TO authenticated;

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

  IF TG_OP = 'DELETE' THEN
    SELECT organization_id INTO target_org_id FROM public.businesses WHERE id = OLD.business_id;
    IF public.can_delete_developer(target_org_id, OLD.user_id) THEN RETURN OLD; END IF;
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

-- apply-plan: with-code — database defaults are live once applied; deploy seat exclusion in the same release.
-- The account is pinned once by verified auth identity, never user-editable metadata.
CREATE TABLE internal.default_business_developers (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE TABLE internal.business_developer_opt_outs (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  removed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  removed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);
ALTER TABLE internal.default_business_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.business_developer_opt_outs ENABLE ROW LEVEL SECURITY;
-- No customer policies: configuration/removal records are maintained only by
-- private, scoped trigger functions. Both tables remain outside the Data API.
REVOKE ALL ON internal.default_business_developers, internal.business_developer_opt_outs
  FROM PUBLIC, anon, authenticated, service_role;
INSERT INTO internal.default_business_developers(user_id)
  SELECT u.id FROM auth.users u JOIN public.users p ON p.id = u.id
  WHERE lower(u.email) = 'karthik.reddy@zyene.com' AND u.email_confirmed_at IS NOT NULL;

CREATE FUNCTION internal.default_business_developer_enabled(target_org uuid, target_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM internal.default_business_developers WHERE user_id = target_user)
    AND NOT EXISTS (SELECT 1 FROM internal.business_developer_opt_outs
      WHERE organization_id = target_org AND user_id = target_user)
    AND EXISTS (SELECT 1 FROM public.organization_members
      WHERE organization_id = target_org AND status = 'active'
        AND role IN ('owner', 'ORG_OWNER') AND role_label IS DISTINCT FROM 'developer');
$$;
REVOKE ALL ON FUNCTION internal.default_business_developer_enabled(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;

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
    IF TG_TABLE_NAME = 'business_members' THEN
      SELECT organization_id INTO org_id FROM public.businesses WHERE id = NEW.business_id;
    ELSE
      org_id := NEW.organization_id;
    END IF;
    IF pg_trigger_depth() > 1 AND NEW.role_label = 'developer'
       AND NEW.role IN ('owner', 'ORG_OWNER') AND NEW.status = 'active'
       AND internal.default_business_developer_enabled(org_id, NEW.user_id) THEN
      RETURN NEW;
    END IF;
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

    -- Only nested provisioning triggers may insert the configured developer.
    IF pg_trigger_depth() > 1 AND NEW.role_label = 'developer'
       AND NEW.role = 'owner' AND NEW.status = 'active'
       AND internal.default_business_developer_enabled(target_org_id, NEW.user_id) THEN
      RETURN NEW;
    END IF;

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
           AND bm.role_label IS DISTINCT FROM 'developer'
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
CREATE OR REPLACE FUNCTION public.delete_organization_developer(target_business uuid, target_member uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE org_id uuid; target_user uuid;
BEGIN
  SELECT organization_id INTO org_id FROM public.businesses WHERE id = target_business;
  -- Serialize removal with default provisioning before locking memberships.
  PERFORM 1 FROM public.organizations WHERE id = org_id FOR NO KEY UPDATE;
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

CREATE FUNCTION internal.provision_business_developer(target_business uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE org_id uuid; developer_id uuid; added_member uuid;
BEGIN
  SELECT organization_id INTO org_id FROM public.businesses WHERE id = target_business;
  IF org_id IS NULL THEN RETURN; END IF;
  PERFORM 1 FROM public.organizations WHERE id = org_id FOR NO KEY UPDATE;
  FOR developer_id IN SELECT user_id FROM internal.default_business_developers LOOP
    IF NOT internal.default_business_developer_enabled(org_id, developer_id) THEN CONTINUE; END IF;
    INSERT INTO public.organization_members(organization_id,user_id,role,status,role_label)
      VALUES (org_id,developer_id,'ORG_OWNER','active','developer')
      ON CONFLICT (organization_id,user_id) DO NOTHING;
    -- Never reactivate suspended access or replace an existing customer owner.
    IF NOT EXISTS (SELECT 1 FROM public.organization_members
      WHERE organization_id=org_id AND user_id=developer_id AND status='active'
        AND role_label='developer') THEN CONTINUE; END IF;
    INSERT INTO public.business_members(business_id,user_id,role,status,role_label)
      VALUES (target_business,developer_id,'owner','active','developer')
      ON CONFLICT (business_id,user_id) DO NOTHING RETURNING id INTO added_member;
    IF added_member IS NOT NULL THEN
      INSERT INTO public.events(organization_id,business_id,user_id,event_type,entity_type,entity_id,metadata)
        VALUES (org_id,target_business,auth.uid(),'team.member_joined','business_member',added_member,
          jsonb_build_object('role','developer','automatic',true,'target_user_id',developer_id,
            'member_email',(SELECT email FROM auth.users WHERE id=developer_id)));
    END IF;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION internal.provision_business_developer(uuid)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION internal.provision_developer_on_business() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM internal.provision_business_developer(NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER provision_default_business_developer AFTER INSERT ON public.businesses
FOR EACH ROW EXECUTE FUNCTION internal.provision_developer_on_business();

-- OAuth creates its business before inserting the customer organization owner.
CREATE FUNCTION internal.provision_developer_on_owner() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE business_id uuid;
BEGIN
  IF NEW.status='active' AND NEW.role IN ('owner','ORG_OWNER')
     AND NEW.role_label IS DISTINCT FROM 'developer' THEN
    FOR business_id IN SELECT id FROM public.businesses WHERE organization_id=NEW.organization_id LOOP
      PERFORM internal.provision_business_developer(business_id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER provision_default_developer_on_owner
AFTER INSERT OR UPDATE OF role,status ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION internal.provision_developer_on_owner();

CREATE FUNCTION internal.remember_default_developer_removal() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF OLD.role_label='developer'
     AND EXISTS (SELECT 1 FROM internal.default_business_developers WHERE user_id=OLD.user_id)
     AND EXISTS (SELECT 1 FROM public.organizations WHERE id=OLD.organization_id) THEN
    INSERT INTO internal.business_developer_opt_outs(organization_id,user_id,removed_by)
      VALUES (OLD.organization_id,OLD.user_id,auth.uid()) ON CONFLICT DO NOTHING;
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER remember_default_developer_removal AFTER DELETE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION internal.remember_default_developer_removal();
REVOKE ALL ON FUNCTION internal.provision_developer_on_business(), internal.provision_developer_on_owner(),
  internal.remember_default_developer_removal() FROM PUBLIC, anon, authenticated, service_role;

-- One-time backfill only. Ordinary reads, logins and updates never restore access.
DO $$
DECLARE business_id uuid; previous_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  PERFORM set_config('request.jwt.claim.role','service_role',true);
  FOR business_id IN SELECT id FROM public.businesses ORDER BY organization_id,id LOOP
    PERFORM internal.provision_business_developer(business_id);
  END LOOP;
  PERFORM set_config('request.jwt.claim.role',coalesce(previous_role,''),true);
END;
$$;

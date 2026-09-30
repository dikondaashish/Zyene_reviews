-- apply-plan: with-code - deploy the RPC before the invitation acceptance caller.
-- Direct PostgREST writes enforce the team API's business scope and role ceiling.
-- Some deployed schemas predate the inviter audit column.
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS invited_by uuid
  REFERENCES public.users(id) ON DELETE SET NULL;
-- Older pending rows have no trustworthy role-bound initiation. Reissue or
-- renew them through the authorized resend endpoint after deployment.
UPDATE public.invitations SET expires_at = LEAST(expires_at, now()) WHERE accepted_at IS NULL;
CREATE OR REPLACE FUNCTION public.guard_business_invitation_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  actor_role text;
  target public.invitations;
BEGIN
  IF auth.role() = 'service_role' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  IF auth.uid() IS NULL OR TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Invitation change denied' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'DELETE' THEN target := OLD; ELSE target := NEW; END IF;
  SELECT bm.role INTO actor_role
    FROM public.business_members bm JOIN public.businesses b ON b.id = bm.business_id
    WHERE bm.business_id = target.business_id AND bm.user_id = auth.uid() AND bm.status = 'active'
      AND b.organization_id = target.organization_id
      AND EXISTS (SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = b.organization_id AND om.user_id = auth.uid() AND om.status = 'active');
  IF actor_role IS NULL OR actor_role NOT IN ('owner', 'admin', 'manager')
     OR target.role NOT IN ('admin', 'manager', 'member', 'viewer')
     OR (actor_role = 'manager' AND target.role NOT IN ('manager', 'member')) THEN
    RAISE EXCEPTION 'Invitation role or tenant denied' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  IF NEW.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation state denied' USING ERRCODE = '42501';
  END IF;
  NEW.invited_by := auth.uid();
  NEW.token := encode(extensions.gen_random_bytes(32), 'hex');
  NEW.created_at := now();
  NEW.expires_at := now() + interval '7 days';
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_business_invitation_write() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_business_invitation_write BEFORE INSERT OR UPDATE OR DELETE
  ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.guard_business_invitation_write();

REVOKE ALL ON public.invitations FROM PUBLIC, anon;
DO $$
DECLARE columns text;
BEGIN
  SELECT string_agg(quote_ident(attname), ', ') INTO columns FROM pg_attribute
    WHERE attrelid = 'public.invitations'::regclass AND attnum > 0 AND NOT attisdropped;
  EXECUTE format('REVOKE SELECT (%1$s), INSERT (%1$s), UPDATE (%1$s), REFERENCES (%1$s) ON public.invitations FROM PUBLIC, anon', columns);
END;
$$;
CREATE POLICY invitations_manager_read_guard ON public.invitations AS RESTRICTIVE
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.business_members bm JOIN public.businesses b ON b.id = bm.business_id
      WHERE bm.business_id = invitations.business_id AND bm.user_id = auth.uid()
        AND bm.status = 'active' AND bm.role IN ('owner', 'admin', 'manager')
        AND b.organization_id = invitations.organization_id)
  );

-- Commit the membership pair and consumed state atomically. Only the backend
-- may supply the identity/email verified by auth.getUser().
CREATE OR REPLACE FUNCTION public.accept_business_invitation(
  p_invitation_id uuid, p_user_id uuid, p_verified_email text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  invite public.invitations;
  target_business uuid;
  org_status text;
  business_status text;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Invitation acceptance denied' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO invite FROM public.invitations WHERE id = p_invitation_id FOR UPDATE;
  IF NOT FOUND OR p_user_id IS NULL OR p_verified_email IS NULL
     OR lower(trim(invite.email)) IS DISTINCT FROM lower(trim(p_verified_email))
     OR invite.role NOT IN ('admin', 'manager', 'member', 'viewer') THEN RETURN NULL; END IF;
  SELECT id INTO target_business FROM public.businesses
    WHERE organization_id = invite.organization_id
      AND (invite.business_id IS NULL OR id = invite.business_id)
    ORDER BY created_at, id LIMIT 1 FOR SHARE;
  IF target_business IS NULL THEN RETURN NULL; END IF;
  SELECT status INTO org_status FROM public.organization_members
    WHERE organization_id = invite.organization_id AND user_id = p_user_id FOR UPDATE;
  SELECT status INTO business_status FROM public.business_members
    WHERE business_id = target_business AND user_id = p_user_id FOR UPDATE;
  IF invite.accepted_at IS NOT NULL THEN
    IF org_status = 'active' AND business_status = 'active' THEN RETURN target_business; END IF;
    RETURN NULL;
  END IF;
  IF invite.expires_at IS NULL OR invite.expires_at <= now()
     OR (org_status IS NOT NULL AND org_status <> 'active')
     OR (business_status IS NOT NULL AND business_status <> 'active') THEN RETURN NULL; END IF;
  -- Business invitations never grant org-wide administration or overwrite
  -- existing org/business roles, including an existing organization's owner.
  INSERT INTO public.organization_members (organization_id, user_id, role, status)
    VALUES (invite.organization_id, p_user_id, 'ORG_EMPLOYEE', 'active')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  INSERT INTO public.business_members (business_id, user_id, role, status)
    VALUES (target_business, p_user_id, invite.role, 'active')
    ON CONFLICT (business_id, user_id) DO NOTHING;
  UPDATE public.invitations SET accepted_at = now() WHERE id = invite.id;
  INSERT INTO public.events (organization_id, business_id, user_id, event_type, entity_type, entity_id, metadata)
    VALUES (invite.organization_id, target_business, p_user_id, 'team.member_joined',
      'business_member', p_user_id, jsonb_build_object('member_email', p_verified_email, 'role', invite.role));
  RETURN target_business;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_business_invitation(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_business_invitation(uuid, uuid, text) TO service_role;

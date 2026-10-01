-- apply-plan: before-code - Developer uses the existing owner authorization tier.
ALTER TABLE public.business_members ADD COLUMN role_label text;
ALTER TABLE public.organization_members ADD COLUMN role_label text;
ALTER TABLE public.business_members ADD CONSTRAINT business_member_role_label_valid
  CHECK (role_label IS NULL OR (role_label = 'developer' AND role = 'owner'));
ALTER TABLE public.organization_members ADD CONSTRAINT organization_member_role_label_valid
  CHECK (role_label IS NULL OR (role_label = 'developer' AND role IN ('owner', 'ORG_OWNER')));

CREATE FUNCTION public.guard_member_role_label() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role NOT IN ('owner', 'ORG_OWNER') THEN
    NEW.role_label := NULL;
  END IF;
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin')
     AND NEW.role_label IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.role_label IS DISTINCT FROM OLD.role_label) THEN
    RAISE EXCEPTION 'Role designation requires privileged management' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_member_role_label() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_member_role_label BEFORE INSERT OR UPDATE ON public.business_members
FOR EACH ROW EXECUTE FUNCTION public.guard_member_role_label();
CREATE TRIGGER guard_member_role_label BEFORE INSERT OR UPDATE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.guard_member_role_label();

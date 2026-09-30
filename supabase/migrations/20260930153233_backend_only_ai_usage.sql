-- apply-plan: deferred - apply only after the authorized backend accounting callers are deployed and aliased.
CREATE OR REPLACE FUNCTION public.increment_ai_replies_used(org_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'AI usage accounting denied' USING ERRCODE = '42501';
  END IF;
  UPDATE public.organizations
    SET ai_replies_used_this_month = COALESCE(ai_replies_used_this_month, 0) + 1
    WHERE id = org_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'AI usage organization not found'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.increment_ai_replies_used(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ai_replies_used(UUID) TO service_role;

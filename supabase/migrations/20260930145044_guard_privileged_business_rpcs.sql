-- apply-plan: with-code - compatible with the deployed RPC signatures; apply after business scope guards.
-- These functions only mutate caller-writable customer rows. Invoker security
-- makes the restrictive RLS policies authoritative instead of bypassing them.
ALTER FUNCTION public.bulk_add_customer_tags(uuid[], text[]) SECURITY INVOKER;
ALTER FUNCTION public.bulk_remove_customer_tags(uuid[], text[]) SECURITY INVOKER;
ALTER FUNCTION public.merge_customers(uuid, uuid, uuid) SECURITY INVOKER;
ALTER FUNCTION public.upsert_customer_by_identity(uuid, uuid, text, text, text, text, text[], text, integer, timestamptz)
  SECURITY INVOKER;
ALTER FUNCTION public.import_customers_by_identity(uuid, jsonb) SECURITY INVOKER;

-- Alert mutation needs a narrow definer RPC because clients cannot UPDATE the
-- table directly. Require active organization AND writable business access.
CREATE OR REPLACE FUNCTION public.mute_aeo_alert(p_alert_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.aeo_alerts SET muted_at = now()
    WHERE id = p_alert_id AND business_id IN (SELECT public.authorized_business_ids(true));
END;
$$;
REVOKE ALL ON FUNCTION public.mute_aeo_alert(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mute_aeo_alert(uuid) TO authenticated;

-- Milestones are shown on read-only dashboards too. Read access is sufficient,
-- but unrelated businesses and suspended/removed members must remain denied.
CREATE OR REPLACE FUNCTION public.claim_review_milestone(p_business_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_current_count integer;
  v_last_count integer;
  v_claimed integer;
  v_inserted integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT EXISTS (SELECT 1 FROM public.authorized_business_ids() id WHERE id = p_business_id) THEN
    RAISE EXCEPTION 'Not authorized for this business' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('review-milestone:' || p_business_id::text, 0::bigint));
  SELECT count(*)::integer INTO v_current_count FROM public.reviews
    WHERE business_id = p_business_id AND is_visible = true;
  INSERT INTO public.business_milestones (business_id, last_milestone_reached)
    VALUES (p_business_id, v_current_count) ON CONFLICT (business_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 1 THEN RETURN NULL; END IF;
  SELECT last_milestone_reached INTO v_last_count FROM public.business_milestones
    WHERE business_id = p_business_id FOR UPDATE;
  SELECT max(milestone) INTO v_claimed
    FROM pg_catalog.unnest(ARRAY[10, 25, 50, 100, 250, 500, 1000, 2500]) AS milestone
    WHERE milestone > v_last_count AND milestone <= v_current_count;
  IF v_current_count > v_last_count THEN
    UPDATE public.business_milestones SET last_milestone_reached = v_current_count, updated_at = now()
      WHERE business_id = p_business_id;
  END IF;
  RETURN v_claimed;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_review_milestone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_review_milestone(uuid) TO authenticated, service_role;

-- Read-only preflight found no historical tenant mismatches. Validation also
-- fails the transaction if inconsistent rows appeared since that check.
ALTER TABLE public.reviews VALIDATE CONSTRAINT reviews_platform_tenant_fk;

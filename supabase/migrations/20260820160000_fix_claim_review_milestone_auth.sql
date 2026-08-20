-- Stop /api/milestones/reviews/claim from 500ing on every dashboard load.
--
-- The original function authorized only via get_user_business_ids(), which is
-- narrower than userCanAccessBusiness() (org membership). Org users passed the
-- API check, then the SECURITY DEFINER function raised 42501.
-- Also schema-qualify lock helpers so search_path = '' cannot miss them,
-- and create the table if the 20260819 bundled migration was not applied.

CREATE TABLE IF NOT EXISTS public.business_milestones (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  last_milestone_reached integer NOT NULL DEFAULT 0 CHECK (last_milestone_reached >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_milestones ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'business_milestones'
      AND policyname = 'business_milestones_select'
  ) THEN
    CREATE POLICY business_milestones_select
    ON public.business_milestones
    FOR SELECT TO authenticated
    USING (business_id IN (SELECT public.get_user_business_ids()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS business_milestones_updated_at_idx
ON public.business_milestones(updated_at DESC);

INSERT INTO public.business_milestones (business_id, last_milestone_reached)
SELECT
  b.id,
  count(r.id)::integer
FROM public.businesses b
LEFT JOIN public.reviews r
  ON r.business_id = b.id
 AND r.is_visible = true
GROUP BY b.id
ON CONFLICT (business_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.claim_review_milestone(p_business_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_count integer;
  v_last_count integer;
  v_claimed integer;
  v_inserted integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT EXISTS (
       SELECT 1
       FROM public.businesses b
       JOIN public.organization_members om
         ON om.organization_id = b.organization_id
        AND om.user_id = auth.uid()
       WHERE b.id = p_business_id
     )
     AND NOT EXISTS (
       SELECT 1
       FROM public.business_members bm
       WHERE bm.business_id = p_business_id
         AND bm.user_id = auth.uid()
     )
  THEN
    RAISE EXCEPTION 'Not authorized for this business' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('review-milestone:' || p_business_id::text, 0::bigint)
  );

  SELECT count(*)::integer
  INTO v_current_count
  FROM public.reviews
  WHERE business_id = p_business_id
    AND is_visible = true;

  INSERT INTO public.business_milestones (business_id, last_milestone_reached)
  VALUES (p_business_id, v_current_count)
  ON CONFLICT (business_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted = 1 THEN
    RETURN NULL;
  END IF;

  SELECT last_milestone_reached
  INTO v_last_count
  FROM public.business_milestones
  WHERE business_id = p_business_id
  FOR UPDATE;

  SELECT max(milestone)
  INTO v_claimed
  FROM pg_catalog.unnest(ARRAY[10, 25, 50, 100, 250, 500, 1000, 2500]) AS milestone
  WHERE milestone > v_last_count
    AND milestone <= v_current_count;

  IF v_current_count > v_last_count THEN
    UPDATE public.business_milestones
    SET last_milestone_reached = v_current_count,
        updated_at = now()
    WHERE business_id = p_business_id;
  END IF;

  RETURN v_claimed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_review_milestone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_review_milestone(uuid) TO authenticated, service_role;
GRANT SELECT ON TABLE public.business_milestones TO authenticated, service_role;

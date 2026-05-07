-- Allow organization members to UPDATE review_requests for their businesses.
-- Inserts used this check from day one; without UPDATE, post-send status patches
-- affected 0 rows under RLS while PostgREST still returned 204, leaving rows stuck on "sending".

DROP POLICY IF EXISTS review_requests_update ON review_requests;

CREATE POLICY review_requests_update ON review_requests
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

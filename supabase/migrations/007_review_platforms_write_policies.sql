-- Allow authenticated users to delete their own review_platforms
-- (via business → org membership check)
CREATE POLICY review_platforms_delete ON review_platforms
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- Also add INSERT and UPDATE policies while we're at it (needed for connecting)
CREATE POLICY review_platforms_insert ON review_platforms
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY review_platforms_update ON review_platforms
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

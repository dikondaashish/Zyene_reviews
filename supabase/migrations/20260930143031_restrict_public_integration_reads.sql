-- apply-plan: with-code - apply during the security release before switching application traffic.
-- Public review/widget routes use server-side, field-limited reads. Direct
-- PostgREST access must never expose tenant rows or OAuth credential columns.
DROP POLICY IF EXISTS "Allow public read access" ON public.businesses;
DROP POLICY IF EXISTS "Allow public read access" ON public.review_platforms;

-- Table-level revokes do not remove any previous column grants.
DO $$
DECLARE
  table_name TEXT;
  column_list TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['review_platforms', 'integrations'] LOOP
    SELECT string_agg(quote_ident(attname), ', ') INTO column_list
      FROM pg_attribute WHERE attrelid = format('public.%I', table_name)::regclass
        AND attnum > 0 AND NOT attisdropped;
    EXECUTE format('REVOKE SELECT (%1$s), INSERT (%1$s), UPDATE (%1$s), REFERENCES (%1$s) ON TABLE public.%2$I FROM PUBLIC, anon, authenticated',
      column_list, table_name);
  END LOOP;
  SELECT string_agg(quote_ident(attname), ', ') INTO column_list
    FROM pg_attribute WHERE attrelid = 'public.businesses'::regclass
      AND attnum > 0 AND NOT attisdropped;
  EXECUTE format('REVOKE SELECT (%s) ON TABLE public.businesses FROM PUBLIC, anon', column_list);
END;
$$;

REVOKE SELECT ON TABLE public.businesses FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.businesses TO authenticated, service_role;

REVOKE ALL ON TABLE public.review_platforms FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.review_platforms TO service_role;
GRANT SELECT (
    id, business_id, platform, external_id, external_url, google_account_id,
    google_location_id, granted_scopes, sync_status, last_synced_at,
    google_listing_synced_at, google_lodging_available,
    google_lodging_health_score, google_lodging_synced_at,
    google_performance_synced_at, google_place_actions_synced_at,
    google_profile_health_score, google_qa_synced_at, google_qa_unavailable,
    last_review_update_time, average_rating, total_reviews, created_at,
    updated_at, token_expires_at
) ON TABLE public.review_platforms TO authenticated;

-- Integration writes carry credentials and sync state. Only authorized server
-- paths using service_role may change them, regardless of older broad RLS.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.review_platforms FROM PUBLIC, anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.review_platforms TO service_role;

-- Legacy integration credential storage is also restricted to backend access.
REVOKE ALL ON TABLE public.integrations FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.integrations TO service_role;

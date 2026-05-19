-- Backfill Google Business Profile IDs for rows connected before onboarding stored them.
-- Safe when only `external_id` (location id) exists: sync can skip listAccounts when account id is still null.
-- Rows missing `google_account_id` should reconnect Google or run register-google-pubsub after account id is known.

UPDATE public.review_platforms
SET
    google_location_id = COALESCE(NULLIF(TRIM(google_location_id), ''), NULLIF(TRIM(external_id), '')),
    external_id = COALESCE(NULLIF(TRIM(external_id), ''), NULLIF(TRIM(google_location_id), '')),
    updated_at = NOW()
WHERE platform = 'google'
  AND (
      google_location_id IS NULL
      OR TRIM(google_location_id) = ''
      OR external_id IS NULL
      OR TRIM(external_id) = ''
  )
  AND (
      (external_id IS NOT NULL AND TRIM(external_id) <> '')
      OR (google_location_id IS NOT NULL AND TRIM(google_location_id) <> '')
  );

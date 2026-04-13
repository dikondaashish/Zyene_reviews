-- When first Q&A sync returns zero questions, we hide Q&A UI and skip future Google Q&A API calls for that platform.
ALTER TABLE review_platforms
  ADD COLUMN IF NOT EXISTS google_qa_unavailable boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN review_platforms.google_qa_unavailable IS
  'True after a successful Q&A sync returned no questions; suppresses Q&A UI and further Q&A fetches for this Google location.';

-- Backfill: platforms that already synced Q&A with no rows stored.
UPDATE review_platforms rp
SET google_qa_unavailable = true
WHERE rp.platform = 'google'
  AND rp.google_qa_synced_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM gbp_questions g WHERE g.review_platform_id = rp.id
  );

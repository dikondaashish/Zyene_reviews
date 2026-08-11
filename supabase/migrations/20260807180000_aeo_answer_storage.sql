-- apply-plan: with-code — the bucket is written by SupabaseAnswerStore on every
--   sampled unit and read by the provenance drawer. Applying it without the code
--   leaves an empty bucket; shipping the code without it makes every upload fail
--   and every answer_storage_path stay NULL. They must land together.
--
-- E-8: raw-answer object storage.
--
-- aeo_samples.answer_storage_path has existed since the E-4 schema and has never
-- been written — 0 of 40 successful samples carry one. Extraction reads the
-- answer text in memory, persists mentions and citations, and discards the text.
--
-- That is a provenance hole, not a storage optimisation. QA #35 requires every
-- metric tile to show what the engine actually said, and QA #44 requires every
-- alert to deep-link to the evidence that moved it. Neither is satisfiable from
-- derived rows alone: "trust the number, we discarded the proof" is the posture
-- this module spent Phase 0 dismantling.
--
-- Answers are stored out-of-row because they are large and read rarely — a
-- single grounded answer runs to several KB, and no visibility metric needs the
-- prose to compute.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aeo-answers',
  'aeo-answers',
  -- PRIVATE. business-logos is public because a logo is meant to be served to
  -- anonymous review visitors; a stored answer is customer intelligence and is
  -- readable only through an authenticated, org-scoped path.
  false,
  5242880, -- 5 MB. Two orders of magnitude above the largest answer observed.
  ARRAY['application/json']
)
ON CONFLICT (id) DO NOTHING;

/*
 * Read access: members of the owning organization only.
 *
 * The organization id is the FIRST PATH SEGMENT, which is what makes this policy
 * a single indexed comparison instead of a join back through samples and
 * businesses. Paths are written as
 *   {organization_id}/{run_id}/{prompt_id}__{engine_id}__{attempt}.json
 * and nothing else may write to this bucket, so the segment cannot be forged by
 * a client.
 *
 * Compared as text rather than cast to uuid on purpose: an object whose name is
 * not a uuid-prefixed path must fail to match, not raise 22P02 and take the
 * whole query with it.
 */
DROP POLICY IF EXISTS "aeo_answers_read_own_org" ON storage.objects;
CREATE POLICY "aeo_answers_read_own_org"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'aeo-answers'
    AND (storage.foldername(name))[1] IN (SELECT get_user_org_ids()::text)
  );

/*
 * No INSERT, UPDATE or DELETE policy is defined, and that is deliberate.
 *
 * RLS denies by default, so `authenticated` and `anon` cannot write here at all.
 * The only writer is the sampling worker, which holds the service role and
 * bypasses RLS. A stored answer is evidence: if a customer could overwrite one,
 * the provenance drawer would be citing a document its own subject can edit.
 */

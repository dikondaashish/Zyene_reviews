-- apply-plan: with-code — the column is read by grantIncludesSearchConsole()
--   and written on every Google connect. Applying it without the code leaves a
--   column nothing populates; shipping the code without it breaks the connect
--   flow's upsert. They must land together.
--
-- E-2: record WHICH scopes a stored Google grant actually carries.
--
-- Why this is needed at all. Google Search Console access is requested
-- INCREMENTALLY, not as part of the primary consent screen — webmasters.readonly
-- is a sensitive scope, and adding it to the main screen puts the whole screen
-- back through verification, during which the business.manage consent that the
-- core review product depends on can be shown as unverified or blocked.
--
-- The consequence is that two businesses can both have a healthy Google
-- connection while only one of them can read Search Console. Nothing in the
-- schema could previously tell them apart: `review_platforms` stores the tokens
-- but never recorded what those tokens were granted permission to do.
--
-- Without this column the only way to answer "can we read GSC for this
-- business" is to call the API and interpret a 403 — which is indistinguishable
-- from a revoked token, a disabled API, or a property we simply lack access to.
-- Guessing wrong in the optimistic direction means showing a customer an empty
-- Search Console panel that looks like "no data" rather than "not connected".

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS granted_scopes TEXT;

COMMENT ON COLUMN public.review_platforms.granted_scopes IS
  'Space-delimited scopes Google actually granted, taken verbatim from the token response. NULL means unknown — rows predating this column, not rows without scopes. Never infer capability from the presence of a token; read this.';

/*
 * Deliberately NOT backfilled.
 *
 * Every existing row was granted through a consent screen that requested only
 * identity + business.manage, so it would be technically correct to backfill
 * that value. It is left NULL anyway: NULL means "we did not observe what was
 * granted", and writing a value we inferred rather than observed is the same
 * class of error this module spent Phase 0 removing. Existing rows re-populate
 * naturally on their next token refresh or reconnect.
 *
 * Readers must therefore treat NULL as "unknown", not as "no scopes".
 */

# AEO Phase 1 Completion Record

**Completed:** 2026-08-18
**Production project:** `snielpllhrppdqzkzjwf` (`Zyene Reviews`, healthy)
**Status:** Phase 1 engineering and production-schema acceptance complete

This record supersedes the pending-work sections in the 2026-08-11 AEO
handoffs. It reports only work that was checked in code, tests, or production.

## What closed

1. **Cost accounting**
   - Engine-reported cost is persisted on every new sample.
   - The quota ledger is maintained from authoritative settled reservations.
   - Production backfill reconciled the historical samples and ledger.

2. **DataForSEO reliability**
   - Search locations use a fully qualified city, full region name, and country.
   - Unsupported countries fail closed instead of silently searching the US.
   - A live bounded smoke accepted the fixed payload on both affected surfaces:
     `google_serp=ok` and `google_ai_overview=no_answer`, with no
     `invalid_request` result. Two vendor units were consumed; no customer was
     billed and no database rows were written.

3. **Geo-grid**
   - A manager-authorized server action now creates and dispatches a run.
   - Starter/Professional/Enterprise limits are 5x5/7x7/9x9.
   - The UI shows exact request count and estimated cost before dispatch.
   - Matching uses the authoritative Google Place ID.
   - Failed searches are stored as failed cells, not misreported as rank misses.
   - Reservations, actual billed units, actual cost, and variance are persisted.

4. **Prompt limits**
   - Limits are 5/15/25 active prompts for Starter/Professional/Enterprise.
   - The application pre-checks the limit and links to billing.
   - A database trigger enforces the same limit atomically under concurrency.
   - Every prompt action now authenticates before any admin lookup and verifies
     tenant access.

5. **Alerts and evidence**
   - Citation gained/lost and rank-drop alert types are live in production.
   - Citation alerts carry their page URL.
   - Digest and dashboard links deep-link to the relevant prompt, engine,
     audit, geo-grid, or alert evidence.
   - Alert timestamps render deterministically in UTC.

6. **Content briefs**
   - A brief requires at least three concrete edit items.
   - The prompt forbids invented facts and requires placeholders where evidence
     is unavailable.

## Production migrations

Applied through the Supabase MCP server in dependency order:

- `20260818154353_aeo_alerts_citation_rank_types.sql`
- `20260818154408_aeo_phase1_launch_integrity.sql`

`src/lib/db/supabase/database.types.ts` was regenerated from the production
schema after application. The repository filenames match the versions recorded
by Supabase, so a future migration push will not treat them as pending.

## Production verification

After migration:

| Surface | Verified result |
|---|---:|
| Settled reservations | 60 |
| Sampled units in quota ledger | 60 |
| Billable units in quota ledger | 30 |
| Authoritative cost | 325,830 micro-USD |
| Samples with positive cost | 30 |
| Legitimate zero-cost/released samples | 31 |
| Quota-ledger buckets | 6 |
| Active prompts | 0 |

A production transaction then proved all three database invariants and rolled
back every smoke-test write:

- Starter prompt six is rejected atomically.
- A settlement cost change synchronizes to its sample.
- The quota ledger moves by the exact settlement delta.

The new trigger functions have no `PUBLIC`, `anon`, or `authenticated` execute
permission. Supabase security advisors reported no warning against them.

## Verification gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | Pass |
| `pnpm test` | 121 files, 1,036 tests passed |
| `pnpm build` | Pass, 250 static pages generated |
| `pnpm lint` | Pass, 0 errors (existing warnings remain) |
| React Doctor | 90/100; no auth or render correctness error |
| Phase 1 database acceptance | Pass in local Postgres and rolled-back production transaction |
| Live DataForSEO location smoke | Pass on SERP and AI Overview |

`pnpm check:sizes` still reports the unchanged, out-of-scope
`src/components/integrations/zapier-card.tsx` at 158 lines against a 150-line
limit. No AEO file violates its size limit. Per the user's scope instruction,
this Phase 1 task did not modify Zapier.

## Release boundary

No arbitrary customer prompt was activated, no customer website was crawled,
and no customer geo-grid was manufactured merely to make production row counts
nonzero. Those actions create customer-visible data and vendor spend, so they
remain deliberate product operations after a business and keyword are chosen.
They are not missing Phase 1 implementation.

At the time this completion audit was written, the release had not yet been
committed or deployed. Preserve unrelated user changes and stage Phase 1 files
explicitly when preparing the release.

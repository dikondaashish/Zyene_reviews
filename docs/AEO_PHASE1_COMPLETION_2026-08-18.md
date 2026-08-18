# AEO Phase 1 Completion Record

**Completed:** 2026-08-18
**Production project:** `snielpllhrppdqzkzjwf` (`Zyene Reviews`, healthy)
**Status:** Phase 1 is 100% complete and production-accepted

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
| Active prompts at migration acceptance | 0 |

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

`pnpm check:sizes` passed repository-wide on the final 2026-08-18 production
readiness rerun. No AEO file violates its size limit.

## Production release and pilot acceptance

The reviewed Phase 1 release was committed as `c29821af`, pushed to `main`, and
deployed successfully to Vercel production as
`dpl_EXxEmk2rWoyWC4TwJRfutRetqh94`.

Wolfpack BBQ & Burgers (`9fa5eb9e-a7cb-4d6f-bd2c-0308703cf0c7`) was selected
as the bounded pilot. Customer-wide crawl and alert flags remained off.

| Pilot operation | Production result |
|---|---|
| Active prompt | `best barbecue restaurant in Kansas City` |
| Fresh five-engine sampling run | `06d6f996-6b53-413d-98ec-1477be154b2b`, success |
| Engines persisted | 5 distinct engines; 4 `ok`, 1 observed `no_answer`, 0 failed |
| Evidence persisted | 4 answer objects, 41 citations, 4 brand mentions |
| Sampling cost | 34,350 micro-USD in samples and settled reservations |
| Sampling accounting | 5 reservations, 5 settlements, 5 matching per-engine costs |
| Crawl | `bb5f58e3-fa4b-4fb8-83b8-56f3ab076d1e`, 10/10 pages, success |
| Alert detection | Completed; 0 evidence-backed alerts met a threshold |
| Geo-grid | `feb0a087-459e-4ba3-bdf5-d32f8ad8ed42`, 25/25 cells, success |
| Geo-grid cost | 50,000 micro-USD, settled exactly once |

Every fresh sampling row is authoritative (`is_estimated=false`). The parent
run was closed as `success` only after a guarded production check confirmed
exactly five samples, no failed samples, and five settled reservations.

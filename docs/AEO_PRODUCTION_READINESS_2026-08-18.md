# AEO Phases 0-3 Production Readiness

**Audited:** 2026-08-18

**Production project:** `snielpllhrppdqzkzjwf`

**Pilot:** Wolfpack BBQ & Burgers (`9fa5eb9e-a7cb-4d6f-bd2c-0308703cf0c7`)

**Decision:** Engineering release approved; controlled rollout remains required

This record cross-checks the release-plan requirements against the codebase,
tests, production Supabase state, production environment, and prior acceptance
runs. It supersedes stale status sentences in the older handoff documents.

## Phase Verdicts

| Phase | Implementation | Production evidence | Verdict |
|---|---|---|---|
| 0 - integrity remediation | Complete | All 48 legacy AI visibility rows and all 48 legacy heatmap cells remain estimated; no measured AEO sample is estimated | Complete |
| 1 - usable at launch | Complete | Wolfpack run `06d6f996-6b53-413d-98ec-1477be154b2b`: 5/5 samples, 5 engines, 0 failed, 34,350 micro-USD in both samples and settled reservations | Complete and production-accepted |
| 2 - competitive parity | Complete | Wolfpack run `c342872e-4aa0-4a8f-bb80-49557223ddf4`: 21/21 samples, 7 engines, 0 failed, 182,567 micro-USD; report/crawl/recommendation acceptance already recorded | Complete and production-accepted |
| 3 - differentiation | 11/11 implemented | Durable volatility, demand, `llms.txt`, NAP, and anomaly records exist; webhook and BigQuery paths are shipped and hardened | Engineering complete; two integrations await customer/vendor credentials |

## Release Hardening

The final code review found and corrected four production-integrity risks:

1. Failed BigQuery exports no longer advance the export checkpoint and skip
   unexported samples.
2. Signed outbound webhooks now retry transient failures up to three times,
   retain identical signed bytes, and persist the real attempt count.
3. AEO dashboards and generated reports now fail explicitly when a required
   database query fails instead of displaying invented zero/empty states.
4. The Supabase advisor's 11 missing Phase 0/1 foreign-key indexes were added
   by migration `20260818225711_aeo_cross_phase_foreign_key_indexes`.

The final database review found 44 AEO/crawl tables, with RLS enabled and at
least one policy on all 44. Supabase no longer reports an unindexed foreign key
for an AEO/crawl table.

## Verification

| Gate | Result |
|---|---|
| TypeScript | Pass |
| Tests | 128 files, 1,080 tests passed |
| ESLint | Pass with 0 errors; existing warning backlog remains |
| Color guard | Pass |
| File-size ratchet | Pass |
| Migration guard | Pass |
| React Doctor | 93/100; only low-risk iteration/formatter/style diagnostics |
| Supabase migration | Applied successfully |
| Supabase RLS/policy check | 44/44 tables |

## Controlled Activation

Production has live sampling enabled. Global crawling, alerting, and content
brief generation remain intentionally fail-closed because enabling them fans
out customer-site fetches, alert writes/emails, and paid generation across
eligible accounts. The release does not change those customer-wide flags as a
side effect of code deployment.

Two Phase 3 provider-backed paths cannot be called operational without external
authorization:

- The configured Google OAuth client currently returns `invalid_client`, so
  citation/traffic correlation and Google-backed NAP comparisons remain honest
  unavailable states until the Google client credential is corrected and the
  account reconnects.
- Microsoft 365 Copilot Chat requires a licensed delegated access token. The
  preview flag and token remain absent, so the adapter correctly stays gated.

No code change can manufacture either authorization. These are activation
prerequisites, not missing feature implementations.

## Go-Live Decision

Approve the audited release for production deployment and continued Wolfpack
pilot use. Do not claim that every Phase 3 provider integration is live, and do
not enable customer-wide crawl, alert, or content-generation flags until their
operational owners approve the external traffic, email, and spend blast radius.

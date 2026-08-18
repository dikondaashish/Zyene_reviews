# AEO Phase 1 — Verified State Handoff

> **Superseded:** Phase 1 was completed and production-verified on 2026-08-18.
> Use `docs/AEO_PHASE1_COMPLETION_2026-08-18.md` for the current state. The
> remainder of this file is retained as the historical 2026-08-11 snapshot.

**Written:** 2026-08-11 · **Verified against:** live repo working tree + production Supabase `snielpllhrppdqzkzjwf`
**Everything below was checked against real files, real `git status`, and real SQL counts.** Nothing is quoted from a prior session's memory. Where something is unverified, it says so.

Master spec: `docs/GOOGLE_SEO_AEO_RELEASE_PLAN.md`. Read §2 (feature matrix), §5 (roadmap), §7 (acceptance criteria).

---

## 0. Read this first — three things that will mislead you

1. **Most Phase 1 work is UNCOMMITTED.** `git log` shows the last AEO commit as `8e398030` (Gemini adapter). That is *not* the state of the code. The working tree on `main` contains ~20 modified files and ~15 new files implementing F4.2, F1.12 UI, F6.6, F8.2/F8.3, and F5.10. If you run `git stash` or `git checkout .` you will destroy roughly three sessions of work.

2. **A concurrent Claude session shares this repo.** During this session files appeared and disappeared from `git status` (a stash was popped mid-session). There is a worktree at `.claude/worktrees/distracted-dhawan-24c117`. Stage explicit file lists — never `git add -A`.

3. **`pnpm typecheck` may fail on artifacts, not code.** macOS sync created duplicates like `.next/types/routes.d 2.ts`. Fix with `find .next/types -name "* 2.*" -delete`. After that, typecheck is clean.

---

## 1. Current gate status

| Check | Result |
|---|---|
| `pnpm typecheck` | ✅ clean (after deleting `.next/types/* 2.*`) |
| `pnpm test` | ✅ **1002 passed / 115 files** |
| `pnpm check:sizes` | ❌ **fails** — `src/components/integrations/zapier-card.tsx` 158 lines vs 150 limit |
| `pnpm build` | ✅ exit 0 (verified before the last few files landed; re-run) |

The `check:sizes` failure is **pre-existing and unrelated to AEO** — introduced by commit `aeb779c3` (integrations logo work). A background task was spawned to fix it. Do not let it block AEO work.

---

## 2. Production database — what has actually run

All AEO migrations applied **through `20260811130000`**. Verified row counts:

| Table | Rows | Meaning |
|---|---|---|
| `aeo_prompts` | **5 (0 active)** | Nothing will sample until a prompt is activated |
| `aeo_runs` | 4 | |
| `aeo_samples` | **61** | Real engine calls happened |
| `aeo_citations` | **510** | F2 extraction works |
| `aeo_brand_mentions` | 33 | |
| `aeo_quota_reservations` | 61 | E-5 works |
| `aeo_geo_grid_runs` / `_points` | **0 / 0** | Geo-grid never run |
| `crawl_runs` / `_pages` / `_findings` | **0 / 0 / 0** | Crawler never run in prod |
| `aeo_alerts` | 0 | |
| `aeo_content_briefs` | 0 | |
| `aeo_credit_balances` | **0** | ⚠️ see §5 billing |
| `aeo_credit_ledger_entries` | 0 | |
| `aeo_quota_ledger` | **0** | **Dead table — no writer exists in `src/`** |
| `aeo_prompt_clusters` | 0 | F4.3 has a table, no rows |
| `aeo_competitor_aliases` | 0 | |

### Samples by engine (all five engines produced real data)

| Engine | ok | failed | no_answer | Real cost |
|---|---|---|---|---|
| `gemini` | 20 | – | – | $0.00 (free tier) |
| `chatgpt` | 10 | – | – | $0.25 |
| `perplexity` | 10 | – | – | $0.054 |
| `google_serp` | 4 | **7** | – | $0.010 |
| `google_ai_overview` | 1 | **5** | 4 | $0.012 |

**Total real vendor spend to date: ~$0.33.**

Two findings from this data:

- **DataForSEO was broken**: 11 failures with `error_kind = invalid_request` (+1 `auth`). Cause: `location_name` was sent as a bare city; DataForSEO rejects it with code 40501 **while still consuming a unit**. **The fix is in the working tree, uncommitted** — `src/services/aeo/engines/adapters/dataforseo-serp-adapter.ts` now sends a fully-qualified `"Kansas City,Missouri,United States"` and prefers a coordinate when present. Not yet re-verified live.
- **`aeo_samples.cost_micro_usd` is 0 on every row.** This is *not* lost data — cost of record lives in `aeo_quota_reservations` and is correct. `dispatch-unit.ts` computes `costMicroUsd` and passes it to `reservations.settle()` but **never to `samples.persist()`**, and `SupabaseSampleStore` has no `cost` field at all. Either populate it or drop the column; today it is a trap for anyone who queries it.

---

## 3. Feature-by-feature status

Legend: ✅ done & committed · 🟡 done but **uncommitted** · ⚠️ built but unreachable/unverified · ❌ not built

### Enablers

| ID | Status | Where |
|---|---|---|
| E-1 adapter interface + registry | ✅ | `src/services/aeo/engines/engine-registry.ts`, `register-adapters.ts` |
| E-2 Search Console | ✅ | `src/services/google/verify-granted-scopes.ts`, `load-search-console-section.ts` |
| E-3 crawler | ✅ code, ⚠️ never run in prod | `src/services/aeo/crawler/` (20 files) |
| E-4 sampling schema | ✅ applied | `20260805230000_aeo_phase1_sampling_schema.sql` |
| E-5 quota/cost ledger | ✅ | `src/services/aeo/ledger/`, verified $0.33 captured |
| E-6 extraction eval harness | ✅ | `tests/unit/aeo-extraction-eval-harness.test.ts` |
| E-7 Inngest fan-out | ✅ | `aeo-run-planner.ts` → `aeo-dispatch-worker.ts` |
| E-8 raw answer storage | ✅ | `supabase-answer-store.ts`, `20260807180000` |
| E-9 Stripe metered billing | ✅ code | `bill-test.ts`, `stripe-overage-charge-gateway.ts` — **see §5** |
| E-10 sampling scheduler | ✅ live | cron `aeo-run-scheduler` registered, `0 1-8 * * *` |

### Pillar 1 — Multi-engine tracking

| ID | Status | Notes |
|---|---|---|
| F1.1 run orchestrator | ✅ | 4 real runs |
| F1.5 ChatGPT | ✅ | 10 real ok samples |
| F1.6 Perplexity | ✅ | 10 real ok samples |
| F1.7 Gemini | ✅ | 20 real ok samples |
| F1.2 Google SERP | 🟡 fix uncommitted | 7/11 failed pre-fix |
| F1.3 AI Overview | 🟡 fix uncommitted | 5/10 failed pre-fix |
| F1.10 coverage panel | ✅ | `prompts/engine-coverage-panel.tsx` |
| **F1.12 geo-grid** | 🟡 **UI uncommitted** | Worker `aeo-geo-grid-worker.ts` existed since earlier but **nothing sent `aeo/geo-grid.requested`** — it was orphaned. The new `src/app/(dashboard)/google-seo-aeo/geo-grid/run-geo-grid-action.ts:130` now sends it. **0 runs so far — never executed.** |

### Pillars 2–4

| ID | Status | Where |
|---|---|---|
| F2.1–F2.3, F2.5 citations | ✅ | `src/services/aeo/extraction/`, 510 rows |
| F3.1 competitor set | ✅ | `aeo_competitor_aliases` (0 rows — unused) |
| F3.2 share of voice | ✅ | `reporting/share-of-voice.ts` + section |
| F3.6 head-to-head | ✅ | `prompts/[promptId]/prompt-head-to-head.tsx` |
| F4.1 prompt library | ✅ | `prompts/page.tsx`, 5 prompts |
| **F4.2 prompt suggestions** | 🟡 **uncommitted** | `src/services/aeo/prompts/suggest-prompts.ts`, `store-suggested-prompts.ts`, `suggest-prompts-action.ts`, `suggest-prompts-button.tsx`, `tests/unit/aeo-suggest-prompts.test.ts` |
| **F4.3 clusters** | ⚠️ partial | `aeo_prompt_clusters` table exists, 0 rows; clustering referenced in `suggest-prompts.ts` + `prompt-list.tsx`. **Verify whether this actually satisfies F4.3 or is just a column.** |
| F4.5 trend chart | ✅ | `prompt-trend-chart.tsx` |
| F4.9 quota meter | ✅ | `billing/quota-meter.ts`, `quota-meter-panel.tsx` |

### Pillar 5 — Technical audit

| ID | Status | Where |
|---|---|---|
| F5.1–F5.4 | ✅ | `crawler/crawl-findings.ts`, `schema-validator.ts`, `extract-json-ld.ts` |
| F5.8 answerability | ✅ | `crawler/answerability.ts` + `-findings.ts` |
| F5.12 finding→prompt linkage | ✅ | `crawler/finding-prompt-linkage.ts` |
| **F5.10 GBP audit** | 🟡 **uncommitted — done this session** | See §4 |

### Pillars 6–8

| ID | Status | Where |
|---|---|---|
| F6.1, F6.2, F6.4, F6.5 briefs | ✅ | `src/services/aeo/content-briefs/` |
| **F6.6 GBP optimizer** | 🟡 **uncommitted** | `src/app/api/ai/optimize-gbp-content/route.ts`, `src/services/ai/gbp-content-{generators,prompts}.ts`, `optimize-gbp-content-api.ts`, `src/components/google-seo-aeo/gbp-content-optimizer-card.tsx`, `tests/unit/aeo-gbp-content-generators.test.ts` |
| F7.1 dashboard | ✅ | `page-view.tsx` |
| F7.2 CSV export | ✅ | `reporting/export-*.ts`, `data-exports-section.tsx` |
| F7.10 provenance | ✅ | `components/google-seo-aeo/metric-provenance.tsx` |
| F8.1 visibility alerts | ✅ | `alerting/detect-visibility-alerts.ts` |
| F8.4 technical alerts | ✅ | `alerting/detect-technical-alerts.ts` |
| **F8.2 citation alerts** | 🟡 **uncommitted** | `alerting/detect-citation-alerts.ts` |
| **F8.3 rank alerts** | 🟡 **uncommitted** | `alerting/detect-rank-alerts.ts`, `run-citation-rank-detection.ts` |
| F8.7 email/in-app | ✅ | `aeo-alert-digest-worker.ts`, `/google-seo-aeo/alerts` |
| F8.8 significance gate | ✅ | `alerting/significance.ts` (two-proportion z-test) |

---

## 4. F5.10 — completed this session (uncommitted)

**Problem it fixed:** five audit rows shipped as `status: "pending"` stubs, and `services-list` was scored from a **proxy** (`actionLinkCount >= 25` — place action links standing in for services). Acceptance criterion **#29a** fails while any proxy remains.

**New files**
- `src/services/google/media.ts` — GBP Media API (v4 `accounts/{a}/locations/{l}/media`), owner-vs-customer photo distinction via `attribution`, paginated with a runaway cap
- `src/services/google/local-posts.ts` — Local Posts API (v4), `PUBLISHED_POST_STATES = {LIVE, RECURRING}`
- `src/services/aeo/technical-audit/gbp-audit-thresholds.ts` — all pass/fail bars in one reviewable place
- `src/services/aeo/technical-audit/gbp-audit-signals.ts` — shapes raw payloads; `null` = unreadable, never 0
- `src/services/aeo/technical-audit/gbp-audit-checks.ts` — the six pure checks
- `src/services/aeo/technical-audit/fetch-gbp-audit-signals.ts` — `Promise.allSettled`, per-signal failure isolation
- `scripts/verify-gbp-audit-live.ts` — **read-only**, run against a real business you're authorized to inspect

**Modified**
- `src/services/google/listing-information.ts` — added `serviceItems`, `serviceArea` to `LOCATION_READ_MASK` + types
- `google-seo-aeo-audit-utils.ts` — `AuditStatus` widened; new `isScoredAudit()`
- `google-seo-aeo-build-audits.ts` — consumes real signals; proxy gone; `actionLinkCount` removed
- `load-google-seo-aeo-page-data.ts` — one location read serves description + 3 checks; dropped the now-unused `gbp_place_action_links` query; parallelised 4 independent awaits
- `google-seo-aeo-score-audit-section.tsx` — "Not scored" card with per-cause labels

**Deleted** (approved): `gbp-completeness.ts`, `gbp-completeness-section.tsx`, `aeo-gbp-completeness.test.ts` — duplicated `computeProfileHealth()` already shipped on `/dashboard`.

**Status model** — the important design decision:
`pending` = never built · `unavailable` = asked Google, got nothing · `not-applicable` = ran, doesn't apply (storefront has no service area). Only `pass`/`fail` are scored. `GbpCheckStatus` **cannot be `"pending"`** — tsc enforces criterion #29 structurally.

**API shapes were verified against Google's live published docs**, not memory. Note: Google's v1 API models service areas as **up to 20 place IDs, not a radius** — the PRD's "service-area radius" wording predates that model. Documented in the code.

**Tests added:** `aeo-gbp-audit-checks.test.ts`, `aeo-gbp-audit-signals.test.ts`, `aeo-gbp-build-audits.test.ts`, `google-media-local-posts.test.ts`. react-doctor: 100/100.

---

## 5. ⚠️ Billing — read before activating any prompt

The user has set, in **both local and production**:
```
AEO_LIVE_SAMPLING=true
AEO_METERED_BILLING_LIVE=true
```

Current safety position:

- The Stripe price `price_1U2HMAIiQQIaqDALvgvid1Us` ("AEO Test Overage", **$2.50 one-time**) was **verified ACTIVE in livemode on 2026-08-11**. It is no longer a gate.
- `billTest()` (`src/services/aeo/billing/bill-test.ts`) refuses to bill an org with **no `aeo_credit_balances` row** — logs a warning and returns. `aeo_credit_balances` currently has **0 rows**, so **nothing charges today.**
- `aeo_prompts` has **0 active prompts**, so the hourly scheduler produces no samples today.

**The two things that would start real charges:**
1. Activating a prompt (sampling begins), **and**
2. An org gaining a credit-grant row — written by `aeo_reset_credit_grant`, triggered on Stripe `invoice.payment_succeeded`.

Once both are true, every `status = "ok"` sample bills $2.50. Per the release plan's own economics note, one active prompt on one engine at the real weekly cadence projects to **~$10.83/month — over Professional's $10 included allowance.**

**Recommended before activating prompts:** confirm which orgs will get grants, and re-verify the DataForSEO fix, since 11 of its 22 samples previously failed *while still consuming a unit*.

Flags **not** set locally (all fail closed → off): `AEO_LIVE_CRAWLING`, `AEO_LIVE_ALERTING`, `AEO_LIVE_CONTENT_BRIEFS`. Production values for these were not verifiable from this machine.

---

## 6. What is pending — ordered

### P0 — do first
1. **Apply the unapplied migration** `supabase/migrations/20260811140000_aeo_alerts_citation_rank_types.sql`. It widens `aeo_alerts.alert_type` for `citation_lost`/`citation_gained`/`rank_drop` and adds `page_url`. **The F8.2/F8.3 detectors in the tree will fail against the live schema until this lands.** Per repo convention: dry-run in `BEGIN…ROLLBACK` with adversarial tests, apply via raw `execute_sql` (never the `apply_migration` MCP tool), then register the version explicitly in `supabase_migrations.schema_migrations`, then regenerate `database.types.ts`.
2. **Commit the working tree** in reviewable slices (F4.2 / F1.12 / F6.6 / F8.2–F8.3 / F5.10). It is currently one undifferentiated pile on `main` and a stray `git checkout` loses all of it.
3. **Re-verify DataForSEO live** after the `location_name` fix — it consumed units on every failure.

### P1
4. **Run the geo-grid once.** F1.12 has never executed (0 runs). The trigger only just started existing. Costs real DataForSEO calls.
5. **Run one crawl in prod.** `crawl_runs = 0`; the crawler has never run against a real customer domain outside a one-off script. Needs `AEO_LIVE_CRAWLING=true`.
6. **Decide `aeo_samples.cost_micro_usd`** — populate from `dispatch-unit.ts` or drop the column.
7. **Verify F4.3 clusters** genuinely meet the spec rather than being an unused column (`aeo_prompt_clusters` = 0 rows).
8. **`aeo_quota_ledger` is a dead table** — no writer anywhere in `src/`. Drop it or wire it.

### P2
9. `check:sizes` — `zapier-card.tsx` (background task spawned; unrelated to AEO).
10. **E-2 residual, unverifiable from code:** confirm in the Supabase Dashboard that Auth → Providers → Google uses the same Cloud Console client where the `webmasters.readonly` consent screen was configured.
11. SSRF guard DNS-rebinding TOCTOU is documented-but-open in `crawler/ssrf-guard.ts`.

### Explicitly out of Phase 1 — do not build
F1.4, F1.8, F1.9, F1.11, F1.13, F1.14 · F2.4, F2.6–F2.9 · F3.3–F3.5, F3.7–F3.9 · F4.4, F4.6–F4.8 · F5.5–F5.7, F5.9, F5.11 · F6.3, F6.7–F6.10 · F7.3–F7.9 · F8.5, F8.6, F8.9

---

## 7. Conventions that must be followed

- **Migrations:** dry-run in `BEGIN…ROLLBACK` with adversarial tests (invalid values must fail) before applying. Apply via raw `execute_sql`. **Never** the `apply_migration` MCP tool. Register the version explicitly. Regenerate types after.
- **Live flags:** every new automated capability gets an `AEO_LIVE_*` flag in `src/lib/features/aeo-surfaces.ts`, checked **first** in the worker, fails closed on anything but the literal `"true"`. Registering a cron does **not** turn a flag on — both are required, deliberately.
- **SECURITY DEFINER:** `search_path = ''`, `REVOKE ALL FROM PUBLIC, anon`, `GRANT EXECUTE TO authenticated` only for a real client action (e.g. `mute_aeo_alert`). Never a blanket client-writable UPDATE policy.
- **File sizes** (AGENTS.md §2): pages 100 · components 150 · lib/services 200.
- **Never fabricate missing infra.** When a PRD input doesn't exist (F1.13 repeat-sampling, embeddings, service-area *radius*), build a documented substitute or scope it out — never present the substitute as the original spec. This module exists because a prior version fabricated data.
- **Distinguish "no data" from "zero."** The `unavailable` / `not-applicable` / `pending` split in F5.10 is the pattern to copy.
- **Git:** stage explicit file lists, never `git add -A` — a concurrent session shares this repo.

---

## 8. Security note

`AEO_GEMINI_API_KEY` was inadvertently printed to a session transcript on 2026-08-11. **Rotate it.**

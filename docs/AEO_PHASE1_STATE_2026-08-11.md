# AEO Phase 1 — Verified State of the World (2026-08-11)

**Read this whole file before touching anything.** It was written by auditing the
running database and the actual files on disk, not by trusting the previous
session's handoff. Where something is unverified, it says so explicitly.

---

## 0. Orientation

| Thing | Value |
|---|---|
| Repo | Zyene Reviews (Next.js 15 App Router + Supabase + Inngest + Stripe) |
| Branch | `main` @ `aeb779c3` |
| Supabase project_id | `snielpllhrppdqzkzjwf` |
| Master spec | `docs/GOOGLE_SEO_AEO_RELEASE_PLAN.md` (1065 lines) |
| Phase 1 roadmap | §5 of that doc, line ~415 |
| QA acceptance criteria | §7 of that doc, line ~557 |
| Repo rules | `AGENTS.md` + `CLAUDE.md` + `.claude/rules/project-standards.md` |

**The founding rule of this module:** a prior version of this feature fabricated
data (AI-visibility scores derived from review ratings; heatmap cells built by
string-concatenating a city name). Every design decision since exists to prevent
that. **Never trust memory or docs alone — verify against real code and real DB
state.** Never present an estimate as a measurement. If a PRD input does not
exist, build a documented honest substitute or scope it out; never pretend the
substitute is the original spec.

---

## 1. ⚠️ CRITICAL — READ FIRST

### 1.1 Two agents are editing this repo simultaneously

A second Claude Code session has been writing to this working tree. Files
appeared *during* my audit. **Nothing from either session is committed.**

- 20 modified files, 20+ untracked files
- Two different agents' work is interleaved in one dirty tree
- There are `.claude/worktrees/` (`distracted-dhawan-24c117`, `exciting-perlman-5711fd`)

**Consequences for you:**
- `git status` may differ from this document within minutes
- **Never `git add -A`.** Stage explicit file lists only.
- Stale `.git/index.lock` files happen. Confirm with `ps aux | grep git` that no
  process holds it before removing.
- Re-run the verification commands in §9 before believing any of this.

### 1.2 Live flags are ON in production

The user has set, in **both local and Vercel production**:
- `AEO_LIVE_SAMPLING=true`
- `AEO_METERED_BILLING_LIVE=true`

This means real vendor calls can be made and real cards can be charged. Three
things currently prevent damage — do not remove any of them without thinking:

1. `aeo_prompts` has **0 active rows**, so the scheduler finds nothing to sample.
2. `aeo_credit_balances` has **0 rows**, so `billTest()` refuses to bill any org
   (see `hasGrantHistory` guard in `src/services/aeo/billing/bill-test.ts`).
3. `AEO_LIVE_CRAWLING`, `AEO_LIVE_ALERTING`, `AEO_LIVE_CONTENT_BRIEFS` are unset.

**The moment someone activates a prompt, real money starts moving.** See §4.1 —
cost capture is broken, so you will not see what you are spending.

### 1.3 There is an UNAPPLIED migration

`supabase/migrations/20260811140000_aeo_alerts_citation_rank_types.sql` exists on
disk but is **not applied** to the database. Last applied is `20260811130000`.
The concurrent session's citation/rank alert code expects types this migration
creates. **That code will fail at runtime against production until it is applied.**

---

## 2. Verified database state (queried 2026-08-11)

```
aeo_prompts                 5   (aeo_prompts WHERE is_active=true → 0)
aeo_prompt_clusters         0
aeo_runs                    4
aeo_samples                61
aeo_citations             510
aeo_brand_mentions         33
aeo_competitor_aliases      0
aeo_quota_reservations     61
aeo_quota_ledger            0   ← see §4.1
aeo_credit_balances         0
aeo_credit_ledger_entries   0
aeo_geo_grid_runs           0
aeo_geo_grid_points         0
crawl_runs                  0
crawl_pages                 0
crawl_findings              0
aeo_alerts                  0
aeo_content_briefs          0
```

### Sample breakdown by engine (this is the proof the engines are real)

| engine_id | status | n | total cost_micro_usd |
|---|---|---|---|
| chatgpt | ok | 10 | **0** |
| gemini | ok | 20 | **0** |
| perplexity | ok | 10 | **0** |
| google_serp | ok | 4 | **0** |
| google_serp | failed | 7 | 0 |
| google_ai_overview | ok | 1 | **0** |
| google_ai_overview | no_answer | 4 | 0 |
| google_ai_overview | failed | 5 | 0 |

All samples dated 2026-08-07 → 2026-08-08. Nothing has sampled since.

### Applied AEO migrations (all present, no drift)

```
20260805200155_add_aeo_estimated_provenance
20260805230000_aeo_phase1_sampling_schema
20260806010000_aeo_quota_reservations
20260807120000_add_google_granted_scopes
20260807180000_aeo_answer_storage
20260808200000_aeo_credit_ledger
20260809170000_aeo_crawler_schema
20260809190000_aeo_crawl_findings_schema_rules
20260811110000_aeo_crawl_findings_answerability_rules
20260811120000_aeo_alerts_schema
20260811130000_aeo_content_briefs_schema
20260811140000_aeo_alerts_citation_rank_types   ← ON DISK, NOT APPLIED
```

---

## 3. Verified infrastructure state

### 3.1 Feature flags — `src/lib/features/aeo-surfaces.ts`

| Flag | Function | Prod value | Guards |
|---|---|---|---|
| `AEO_SHOW_ESTIMATED_SURFACES` | `areEstimatedAeoSurfacesEnabled()` | unset | legacy fabricated surfaces |
| `AEO_LIVE_SAMPLING` | `isLiveSamplingEnabled()` | **true** | vendor engine calls |
| `AEO_METERED_BILLING_LIVE` | `isMeteredBillingLive()` | **true** | charging customer cards |
| `AEO_LIVE_CRAWLING` | `isLiveCrawlingEnabled()` | unset | crawling customer sites |
| `AEO_LIVE_ALERTING` | `isLiveAlertingEnabled()` | unset | creating alerts + emails |
| `AEO_LIVE_CONTENT_BRIEFS` | `isLiveContentBriefsEnabled()` | unset | Gemini brief generation |

All fail closed — anything but the literal string `"true"` is off. **Never flip
these yourself; that is the user's call.**

### 3.2 Cron registration — `vercel.json`

Committed state registers only 2 AEO crons:
- `/api/cron/aeo-yearly-credit-reset` — `0 6 * * *`
- `/api/cron/aeo-run-scheduler` — `0 1-8 * * *`

**Uncommitted (concurrent session) adds 3 more:**
- `/api/cron/aeo-crawl-scheduler` — `0 1-8 * * *`
- `/api/cron/aeo-alert-scheduler` — `0 9 * * *`
- `/api/cron/aeo-alert-digest` — `0 10 * * *`

### 3.3 Inngest event wiring — verified sender↔worker for every AEO event

| Event | Sender | Worker |
|---|---|---|
| `aeo/run.requested` | `api/cron/aeo-run-scheduler/route.ts:50` | `aeo-run-planner.ts` |
| `aeo/dispatch.requested` | `aeo-run-planner.ts:114` | `aeo-dispatch-worker.ts` |
| `aeo/crawl.requested` | `api/cron/aeo-crawl-scheduler/route.ts:40` **and** `google-seo-aeo/audit/run-audit-action.ts:85` | `aeo-crawl-worker.ts` |
| `aeo/alert-check.requested` | `api/cron/aeo-alert-scheduler/route.ts:51` | `aeo-alert-worker.ts` |
| `aeo/credit-reset.requested` | `api/cron/aeo-yearly-credit-reset/route.ts:35` | `aeo-yearly-credit-reset-worker.ts` |
| `aeo/geo-grid.requested` | **NO SENDER — orphaned** | `aeo-geo-grid-worker.ts` |

### 3.4 Engine registration — `src/services/aeo/engines/register-adapters.ts`

All 5 surfaces registered: `gemini`, `perplexity`, `chatgpt`, `google_serp`,
`google_ai_overview`. Three independent gates stand before any vendor call:
1. `AEO_LIVE_SAMPLING === "true"`
2. `adapter.isConfigured()` (its own API key present)
3. `cost.confidence !== "unverified"` (unpriced engines withheld)

Local `.env.local` has keys for all of them: `AEO_GEMINI_API_KEY`,
`OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `DATAFORSEO_LOGIN`/`_PASSWORD`,
`GOOGLE_VERTEX_*`.

---

## 4. DEFECTS — things that are wrong right now

### 4.1 🔴 Cost capture is dead (highest priority — billing is live)

**Evidence:** all 61 samples have `cost_micro_usd = 0`, including 10 ChatGPT and
10 Perplexity calls that certainly cost money. `aeo_quota_ledger` has **0 rows**
despite 61 rows in `aeo_quota_reservations`.

E-5 reserves quota but never writes consumption. With metered billing now live,
**you cannot see what you are spending.** I did not finish tracing the cause.
Start at:
- `src/services/aeo/ledger/quota-reservation.ts`
- `src/services/aeo/ledger/quota-rollup.ts`
- `src/services/aeo/ledger/quota-sweep.ts`
- `src/services/inngest/aeo/aeo-dispatch-worker.ts` (where a settled sample is written)
- `src/services/aeo/orchestration/supabase-sample-store.ts` (writes `cost_micro_usd`)
- Adapters that report real cost: `adapter-support.ts` → `reportedCost()`, `usdToMicroUsd()`

### 4.2 🔴 DataForSEO is mostly failing (F1.2 / F1.3)

`google_serp`: 7 failed / 4 ok. `google_ai_overview`: 5 failed / 4 no_answer / 1 ok.
Two of the five engines barely work. The previous session left
`src/services/aeo/engines/adapters/dataforseo-serp-adapter.ts` **modified and
uncommitted** — possibly a fix in progress. Diff it before changing anything.

Files: `dataforseo-serp-adapter.ts`, `dataforseo-client.ts`, `dataforseo-sample.ts`,
`dataforseo-serialize.ts`.

### 4.3 🟡 Geo-grid (F1.12) is orphaned

`aeo/geo-grid.requested` has a type declaration (`inngest/client.ts:167`) and a
worker (`aeo-geo-grid-worker.ts`) but **no sender anywhere in the codebase**.
Both grid tables are empty. The concurrent session added
`src/app/(dashboard)/google-seo-aeo/geo-grid/` — **unverified by me**; it may
supply the missing trigger. Check whether it sends the event.

Service code that already exists and looks complete:
`src/services/aeo/geo-grid/{geo-grid-runner,grid-geometry,local-rank,supabase-geo-grid-store}.ts`

### 4.4 🟡 Pre-existing file-size violation

`pnpm check:sizes` fails on `src/components/integrations/zapier-card.tsx`
(158 lines, limit 150). Introduced by commit `aeb779c3` (integrations logo work),
**not** by AEO work. A background task was spawned to fix it separately.

---

## 5. Feature-by-feature status

Legend: ✅ built & verified · 🟨 built, unverified by me (concurrent session) ·
⚠️ built but broken/unreachable · ❌ not built

### Enablers

| ID | What | Status | Where |
|---|---|---|---|
| E-1 | Engine adapter interface + registry | ✅ | `services/aeo/engines/{engine-types,engine-registry,engine-catalog,register-adapters}.ts` |
| E-2 | Google Search Console | ✅ | `services/google/{search-console,verify-granted-scopes,oauth-scopes}.ts`, `google-seo-aeo/load-search-console-section.ts` |
| E-3 | Crawler | ✅ code, **0 prod runs** | `services/aeo/crawler/*` (17 files) |
| E-4 | Sampling schema + RLS | ✅ | migration `20260805230000` |
| E-5 | Quota & cost ledger | ⚠️ **see §4.1** | `services/aeo/ledger/*` |
| E-6 | Extraction eval harness | ✅ | `tests/unit/aeo-extraction-eval-harness.test.ts` |
| E-7 | Inngest fan-out orchestration | ✅ 4 runs, 61 samples | `services/aeo/orchestration/*`, `inngest/aeo/aeo-{run-planner,dispatch-worker}.ts` |
| E-8 | Raw answer storage | ✅ | migration `20260807180000`, `orchestration/supabase-answer-store.ts` |
| E-9 | Stripe metered billing + credit packs | ✅ code, 0 balances | `services/aeo/billing/{bill-test,stripe-overage-charge-gateway,supabase-credit-ledger-store,renewal-credit-reset}.ts` |
| E-10 | Sampling scheduler | ✅ cron registered | `services/aeo/scheduler/*`, `api/cron/aeo-run-scheduler/` |

### Pillar 1 — Multi-engine tracking

| ID | What | Status | Where |
|---|---|---|---|
| F1.1 | Run orchestrator | ✅ | `inngest/aeo/aeo-run-planner.ts` |
| F1.2 | Classic SERP | ⚠️ **7/11 failed** | `adapters/dataforseo-serp-adapter.ts` |
| F1.3 | AI Overview | ⚠️ **5/10 failed** | same adapter, `engineId: google_ai_overview` |
| F1.5 | ChatGPT sampling | ✅ 10 ok | `adapters/chatgpt-engine-adapter.ts` |
| F1.6 | Perplexity sampling | ✅ 10 ok | `adapters/perplexity-engine-adapter.ts` |
| F1.7 | Gemini sampling | ✅ 20 ok | `adapters/gemini-engine-adapter.ts` |
| F1.10 | Engine coverage & freshness panel | ✅ | `google-seo-aeo/prompts/engine-coverage-panel.tsx` |
| F1.12 | Real geo-grid | ⚠️ **orphaned, §4.3** | `services/aeo/geo-grid/*` + 🟨 `google-seo-aeo/geo-grid/` |

### Pillar 2 — Citations

| ID | Status | Where |
|---|---|---|
| F2.1–F2.3, F2.5 | ✅ 510 citations, 33 brand mentions | `services/aeo/extraction/{extract-sample,citation-normalizer,brand-matcher,brand-text,supabase-extraction-store}.ts` |

### Pillar 3 — Competitors

| ID | Status | Where |
|---|---|---|
| F3.1 competitor set | ✅ | `aeo_competitor_aliases` (0 rows — none configured yet) |
| F3.2 share of voice | ✅ | `services/aeo/reporting/share-of-voice.ts`, `google-seo-aeo/{load-share-of-voice.ts,share-of-voice-section.tsx}` |
| F3.6 head-to-head | ✅ | `google-seo-aeo/prompts/[promptId]/prompt-head-to-head.tsx` |

**Honest scoping note:** SoV is computed against the business's *configured*
competitor set, not the PRD's "open/fuzzy-matched brand extraction". No such
extraction pipeline exists. This is a documented substitution.

### Pillar 4 — Prompts

| ID | What | Status | Where |
|---|---|---|---|
| F4.1 | Prompt library | ✅ | `google-seo-aeo/prompts/{page,prompt-list,prompt-create-form,prompt-actions}.tsx/ts` |
| F4.2 | Prompt suggestions | 🟨 **uncommitted** | `services/aeo/prompts/{suggest-prompts,store-suggested-prompts}.ts`, `prompts/suggest-prompts-{action.ts,button.tsx}` |
| F4.3 | Prompt clusters | 🟨 0 rows | `aeo_prompt_clusters` referenced in `prompts/load-prompts-page-data.ts`, `store-suggested-prompts.ts` |
| F4.5 | Trend chart | ✅ | `services/aeo/reporting/prompt-trend.ts`, `prompts/[promptId]/prompt-trend-chart.tsx` |
| F4.9 | Quota meter | ✅ | `services/aeo/billing/quota-meter.ts`, `prompts/{load-quota-meter.ts,quota-meter-panel.tsx}` |

### Pillar 5 — Technical audit

| ID | What | Status | Where |
|---|---|---|---|
| F5.1–F5.3 | Crawlability, canonical, thin content, AI-bot-blocked | ✅ | `crawler/crawl-findings.ts` |
| F5.4 | Schema / JSON-LD validation | ✅ | `crawler/{extract-json-ld,schema-validator}.ts` |
| F5.8 | Answerability heuristics | ✅ | `crawler/{answerability,answerability-findings}.ts` |
| F5.10 | **GBP completeness audit** | ✅ **DONE THIS SESSION — see §6** | `services/aeo/technical-audit/*`, `services/google/{media,local-posts}.ts` |
| F5.12 | Finding→prompt impact linkage | ✅ | `crawler/finding-prompt-linkage.ts` |

### Pillar 6 — Content engine

| ID | What | Status | Where |
|---|---|---|---|
| F6.1 | Citation-gap brief | ✅ | `content-briefs/{analyze-citation-gap,fetch-cited-source}.ts` |
| F6.2 | Prompt→page mapping | ✅ | `content-briefs/prompt-page-mapping.ts` |
| F6.4/F6.5 | FAQ + schema patch | ✅ | `content-briefs/{build-faq-schema,build-schema-patch,generate-content-brief}.ts` |
| F6.6 | GBP optimizer (services/posts/Q&A) | 🟨 **uncommitted** | `api/ai/optimize-gbp-content/route.ts`, `components/google-seo-aeo/gbp-content-optimizer-card.tsx`, `services/ai/{gbp-content-generators,gbp-content-prompts,optimize-gbp-content-api}.ts` |

**Honest scoping note:** F6.2 uses term-overlap scoring, not the PRD's "embedding
similarity" — no embedding model call exists anywhere in this codebase.

### Pillar 7 — Reporting

| ID | Status | Where |
|---|---|---|
| F7.1 dashboard | ✅ | `google-seo-aeo/page-view.tsx` |
| F7.2 CSV export | ✅ | `reporting/{export-prompts,export-citations}.ts`, `crawler/export-crawl-findings.ts`, `data-exports-section.tsx` |
| F7.10 provenance | ✅ | `components/google-seo-aeo/metric-provenance.tsx`, `reporting/visibility-metrics.ts` |

### Pillar 8 — Alerting

| ID | Status | Where |
|---|---|---|
| F8.1 visibility alerts | ✅ | `alerting/detect-visibility-alerts.ts` |
| F8.4 technical alerts | ✅ | `alerting/detect-technical-alerts.ts` |
| F8.7 email/in-app | ✅ | `inngest/aeo/aeo-alert-digest-worker.ts`, `google-seo-aeo/alerts/*` |
| F8.8 significance gate | ✅ | `alerting/significance.ts` (two-proportion z-test) |
| — | citation/rank alerts | 🟨 **needs migration `20260811140000`** | `alerting/{detect-citation-alerts,detect-rank-alerts,run-citation-rank-detection}.ts` |

**Spec gap note:** PRD F8.8 names "variance from repeat sampling (F1.13)" as its
input. F1.13 is a Phase 2 item and does not exist. A two-proportion z-test was
substituted, gated on both statistical significance and a ≥15-point practical
delta. Documented substitution, not fabrication.

---

## 6. What I completed this session — F5.10

**The problem:** F5.10 had shipped 5 rows as `status: "pending"` stubs, plus a
6th (`services-list`) scored from a **proxy** — `actionLinkCount >= 25`, i.e.
place action links standing in for a services list. QA criterion **#29a** fails
while any proxy remains. A previous session had also built
`gbp-completeness.ts`, a generic 7-field score that **duplicated the already
shipped `computeProfileHealth()`** in `services/google/profile-health.ts`.

**What I did — all API shapes verified against Google's live published docs, not memory:**

New files:
- `src/services/google/media.ts` — GBP Media API (v4 host; photos never migrated to v1). Owner-vs-customer photo distinction via the `attribution` field. Paged, capped at 4 pages, reports `truncated`.
- `src/services/google/local-posts.ts` — GBP Local Posts API (v4). `PUBLISHED_POST_STATES = {LIVE, RECURRING}` — the only two Google describes as appearing in search.
- `src/services/aeo/technical-audit/gbp-audit-thresholds.ts` — all pass/fail bars in one reviewable place.
- `src/services/aeo/technical-audit/gbp-audit-signals.ts` — shapes raw payloads into scoreable signals.
- `src/services/aeo/technical-audit/gbp-audit-checks.ts` — the six checks, pure functions.
- `src/services/aeo/technical-audit/fetch-gbp-audit-signals.ts` — `Promise.allSettled` so a Media outage cannot blank the services checks.
- `scripts/verify-gbp-audit-live.ts` — read-only live verifier: `pnpm exec tsx scripts/verify-gbp-audit-live.ts <businessId>`. **Never run against a business you are not authorized to inspect. Not yet run.**

Modified:
- `src/services/google/listing-information.ts` — added `serviceItems` + `serviceArea` to `LOCATION_READ_MASK` and typed them. **Critical detail:** a readMask omitting these makes Google return them *absent*, indistinguishable from "business has none" — so omitting them would report "no services" for every customer.
- `google-seo-aeo-audit-utils.ts` — widened `AuditStatus` to `pass|fail|pending|unavailable|not-applicable`; added `isScoredAudit()`.
- `google-seo-aeo-build-audits.ts` — now composes the 6 real checks; takes `gbpSignals` + `topKeywords` instead of `actionLinkCount`.
- `load-google-seo-aeo-page-data.ts` — one location read serves both the description check and the 3 location-backed checks; dropped the now-dead `gbp_place_action_links` query; parallelised 4 independent awaits.
- `google-seo-aeo-score-audit-section.tsx` — renders distinct reasons per unscored status.
- `audit/{load-audit-page-data,page}.ts(x)` — removed the redundant card (also removed a Google API call + a DB query from that page).

Deleted (user approved): `gbp-completeness.ts`, `gbp-completeness-section.tsx`, `tests/unit/aeo-gbp-completeness.test.ts`.

Tests added: `aeo-gbp-audit-checks.test.ts`, `aeo-gbp-audit-signals.test.ts`, `aeo-gbp-build-audits.test.ts`, `google-media-local-posts.test.ts`.

**The status model matters.** `pending` = never built. `unavailable` = built,
asked Google, got nothing. `not-applicable` = ran, genuinely doesn't apply (a
storefront that never travels has no service area). Only pass/fail are scored.
**Marking an unreachable API as `fail` would fabricate a failure** — that is the
whole point. `GbpCheckStatus` deliberately excludes `"pending"`, so **tsc now
enforces criterion #29** for these six rows.

**Verification:** typecheck clean · 970/970 tests pass (was 938) · `pnpm build`
exit 0 · react-doctor 100/100. **Not verified against a live Google account.**

---

## 7. What needs doing now — priority order

1. **Reconcile and commit the two sessions' work.** Everything is uncommitted.
   Stage explicit file lists. This is the highest priority because unapplied
   schema + uncommitted code from two agents + live flags is where damage happens.
2. **Apply `20260811140000_aeo_alerts_citation_rank_types.sql`.** Follow §8
   conventions exactly. Citation/rank alert code is broken against prod until then.
3. **Fix cost capture (§4.1).** Billing is live and spend reads as $0.
4. **Fix DataForSEO (§4.2).** Two of five engines are mostly failing.
5. **Resolve geo-grid (§4.3).** Verify whether the concurrent session's
   `geo-grid/` folder supplies the missing event sender. If not, add one.
6. **Verify F4.2/F4.3/F6.6** — built by the other session, unreviewed by me.
7. **Run `scripts/verify-gbp-audit-live.ts`** against an authorized business to
   confirm Google actually returns `serviceItems`/`serviceArea` under our readMask.
8. **Decide on the 3 unregistered crons** in the uncommitted `vercel.json`.
   Registering `aeo-crawl-scheduler` means crawling real customer sites — confirm
   who it affects first (check website URLs, active prompts, page caps).
9. `pnpm check:sizes` fails on `zapier-card.tsx` — pre-existing, separate task.

---

## 8. Conventions you must follow

**Migrations.** Dry-run inside `BEGIN...ROLLBACK` with adversarial tests (invalid
values must fail) *before* applying. Apply via the **`execute_sql`** MCP tool,
then register the version explicitly:
`INSERT INTO supabase_migrations.schema_migrations`. **Never use the
`apply_migration` MCP tool** — it causes version drift. Regenerate types after
(`generate_typescript_types`; response is large — save to file, extract
`data['types']`, write to `src/lib/db/supabase/database.types.ts`).

**Live flags.** Every new automated capability gets an `AEO_LIVE_*` flag in
`src/lib/features/aeo-surfaces.ts`, checked **first** in the worker, failing
closed on anything but literal `"true"`. **Never flip these yourself.**

**SECURITY DEFINER functions.** `search_path = ''`, explicit
`REVOKE ALL FROM PUBLIC, anon`, `GRANT EXECUTE TO authenticated` only when a real
client-facing action needs it (e.g. `mute_aeo_alert`). Never a blanket
client-writable UPDATE/INSERT RLS policy for a narrow action.

**File size caps** (AGENTS.md §2): pages 100 · components 150 · lib/services 200.
`pnpm check:sizes`.

**Never:** edit `database.types.ts` by hand · edit `src/components/ui/` · put
secrets in migrations · edit applied migrations · `console.log` on the client ·
auth via `getSession()` (use `getUser()`).

**Before you finish:**
```bash
pnpm typecheck && pnpm test && pnpm build
npx react-doctor@latest --verbose --diff   # if React/UI changed
```

**SSRF.** `businesses.website` and citation URLs are tenant-controlled and
externally fetched. `src/services/aeo/crawler/ssrf-guard.ts` does DNS resolution
+ private-IP rejection, enforced in the worker so every trigger path is covered.
**Documented residual risk:** DNS-rebinding TOCTOU is not closed — would need a
pinned resolved IP and a custom fetch dispatcher.

---

## 9. First commands to run

```bash
git log --oneline -10
git status --short          # expect a LOT; two agents are writing
ps aux | grep git           # check for a live lock holder before touching .git
pnpm typecheck && pnpm test && pnpm check:sizes
```

Then re-verify the DB, because §2 will have aged:

```sql
select 'prompts_active' t, count(*) n from aeo_prompts where is_active
union all select 'samples', count(*) from aeo_samples
union all select 'zero_cost_samples', count(*) from aeo_samples where coalesce(cost_micro_usd,0)=0
union all select 'quota_ledger', count(*) from aeo_quota_ledger
union all select 'credit_balances', count(*) from aeo_credit_balances;
```

And confirm the migration situation with the `list_migrations` MCP tool against
`snielpllhrppdqzkzjwf`.

---

## 10. Explicitly OUT of Phase 1 scope

Do not build unless asked. Phase 2/3 per §5 of the release plan:

F1.4 · F1.8 · F1.9 · F1.11 · F1.13 · F1.14 · F2.4 · F2.6–F2.9 · F3.3–F3.5 ·
F3.7–F3.9 · F4.4 · F4.6–F4.8 · F5.5–F5.7 · F5.9 · F5.11 · F6.3 · F6.7–F6.10 ·
F7.3–F7.9 · F8.5 · F8.6 · F8.9

**Phase 1 exit criterion:** the page contains zero estimated numbers and five
real engines. The five engines exist and have produced real samples. The
"zero estimated numbers" half is satisfied on the AEO surfaces; the legacy
fabricated surfaces remain behind `AEO_SHOW_ESTIMATED_SURFACES` (unset).

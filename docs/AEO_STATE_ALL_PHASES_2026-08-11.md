# Zyene Reviews — AEO Module — Complete State of All Phases
**Written 2026-08-11 by auditing the live database and the actual files on disk.**
**Updated 2026-08-15:** Phase 0 repository collateral audit completed; see
`docs/AEO_PHASE0_COLLATERAL_AUDIT_2026-08-15.md`.
**Updated 2026-08-18:** Phases 1, 2, and 3 completed and accepted in production;
see `docs/AEO_PHASE1_COMPLETION_2026-08-18.md`,
`docs/AEO_PHASE2_COMPLETION_2026-08-18.md`, and
`docs/AEO_PHASE3_COMPLETION_2026-08-18.md`. Those completion records supersede
historical status and defect notes below.

> **How to trust this document.** Every claim is tagged:
> **[DB]** verified by querying production Supabase · **[CODE]** verified by reading the file ·
> **[DOC]** stated in the release plan, not independently verified ·
> **[UNVERIFIED]** exists on disk but I did not read its contents.
> Nothing here is from memory or from a previous session's summary.

---

## PART A — ORIENTATION

| Thing | Value |
|---|---|
| Product | Zyene Reviews — Next.js 15 App Router, Supabase, Inngest, Stripe, Resend |
| Branch | `main` @ `aeb779c3` |
| Supabase project_id | `snielpllhrppdqzkzjwf` (us-west-2) |
| Master spec | `docs/GOOGLE_SEO_AEO_RELEASE_PLAN.md` — 1065 lines |
| Feature matrix | §2, line 73 |
| Roadmap (all phases) | §5, line 401 |
| QA acceptance criteria | §7, line 557 |
| Repo rules | `AGENTS.md`, `CLAUDE.md`, `.claude/rules/project-standards.md` |

### The founding rule of this module

A prior version of this feature **fabricated data**: AI-visibility scores were
derived from the business's own review rating compared to competitors, and
heatmap cells were string-built from the city name. Neither ever queried an AI
engine or a SERP. Both moved when a customer's review rating moved, which reads
as causation.

**Every design decision since exists to prevent that.** Verify against real code
and real DB state — never trust memory or docs alone. Never present an estimate
as a measurement. When a PRD input does not exist, build a documented honest
substitute or scope it out; **never pretend the substitute is the original spec.**

### How many phases are there?

**Four.** Phase 0, 1, 2, 3. [DOC §5]

| Phase | Name | Timeline | Effort | Status |
|---|---|---|---|---|
| **0** | Integrity remediation | Week 1–2 | 3 EW | ✅ **COMPLETE** — verified [DB] |
| **1** | Usable at launch | Week 3–14 | ~46 EW | ✅ **COMPLETE** - production accepted 2026-08-18 |
| **2** | Competitive parity | Week 15–24 | ~34 EW | ✅ **COMPLETE** - 31/31 items, production accepted 2026-08-18 |
| **3** | Differentiation | Week 25–34 | ~30 EW | ✅ **COMPLETE** - 11/11 items, production accepted 2026-08-18 |

### ⚠️ A documentation error you should know about

The release plan line 202 states: *"Totals: 62 features — 27 P1, 24 P2, 11 P3."*

**I counted the actual tables and this is wrong.** The eight pillar tables
contain **82 features**, of which **41 are P1**:

| Pillar | Features | P1 count |
|---|---|---|
| 1 Multi-engine tracking | F1.1–F1.14 (14) | 8 |
| 2 Citations | F2.1–F2.9 (9) | 4 |
| 3 Competitors | F3.1–F3.9 (9) | 3 |
| 4 Prompts | F4.1–F4.9 (9) | 5 |
| 5 Technical audit | F5.1–F5.12 (12) | 7 |
| 6 Content engine | F6.1–F6.10 (10) | 5 |
| 7 Reporting | F7.1–F7.10 (10) | 3 |
| 8 Alerting | F8.1–F8.9 (9) | 6 |
| **Total** | **82** | **41** |

Do not use the "62 / 27" figure for planning. Flag this to the doc owner.

---

## PART B — ⚠️ CRITICAL WARNINGS — READ BEFORE ANY EDIT

### B.1 Two agents are writing to this repo simultaneously

A second Claude Code session has been editing this working tree. Files appeared
**during** my audit. **Nothing from either session is committed.**

- 20 modified files + 20+ untracked files, two agents' work interleaved
- Worktrees exist: `.claude/worktrees/distracted-dhawan-24c117`, `.../exciting-perlman-5711fd`

**Rules for you:**
- **Never `git add -A`.** Stage explicit file lists only.
- `git status` may differ from this doc within minutes — re-verify (Part G).
- Stale `.git/index.lock` happens. Confirm with `ps aux | grep git` that nothing
  holds it before removing.

### B.2 Live money flags are ON in production

User set these in **both local `.env.local` and Vercel production**:
- `AEO_LIVE_SAMPLING=true` — real vendor API calls
- `AEO_METERED_BILLING_LIVE=true` — real customer card charges

**Three things currently prevent damage. Do not remove any without thinking:**

1. **[DB]** `aeo_prompts` has 5 rows, **0 active** → scheduler finds nothing to sample.
2. **[DB]** `aeo_credit_balances` has **0 rows** → `billTest()` refuses to bill any
   org (the `hasGrantHistory` guard in `src/services/aeo/billing/bill-test.ts`).
3. **[CODE]** `AEO_LIVE_CRAWLING`, `AEO_LIVE_ALERTING`, `AEO_LIVE_CONTENT_BRIEFS` unset.

**The moment someone activates a prompt, real money moves — and per Defect 1
below, you will not see what you are spending.**

### B.3 An unapplied migration will break alert code

`supabase/migrations/20260811140000_aeo_alerts_citation_rank_types.sql` exists on
disk. **[DB]** Last applied version is `20260811130000`. The concurrent session's
citation/rank alert code expects types this migration creates. **That code fails
at runtime against production until it is applied.**

---

## PART C — PHASE 0: INTEGRITY REMEDIATION ✅ COMPLETE

**Goal:** stop presenting fabricated data as measurement. [DOC §5, §10]

### Roadmap items and their real status

| Item | Status | Evidence |
|---|---|---|
| Flag off / relabel simulated AI-visibility + heatmap | ✅ | **[CODE]** `src/lib/features/aeo-surfaces.ts` — `areEstimatedAeoSurfacesEnabled()`, off unless literal `"true"` |
| Mark existing rows `is_estimated`, exclude from outputs | ✅ | **[DB]** verified below |
| Remove or implement the `pending` audit rows (interim: hide) | ✅ interim, ✅ **now fully implemented** | See Phase 1 → F5.10 |
| Audit marketing/sales collateral for unbackable claims | ✅ **COMPLETE 2026-08-15** | `docs/AEO_PHASE0_COLLATERAL_AUDIT_2026-08-15.md`; unsupported product and ranking claims corrected with regression coverage |
| Kick off Google OAuth scope change for GSC | ✅ complete | **[CODE]** `src/services/google/oauth-scopes.ts`; **[CONSOLE 2026-08-15]** Search Console scopes configured and no additional data-access verification required |

### [DB] Provenance boundary — verified working

| Table | Rows | `is_estimated = true` |
|---|---|---|
| `google_seo_ai_visibility_runs` | 8 | 8 |
| `google_seo_ai_visibility_results` | 48 | 48 |
| `google_seo_heatmap_runs` | 8 | 8 |
| `google_seo_heatmap_cells` | 48 | 48 |
| `aeo_samples` (Phase 1 real data) | 61 | **0** |

**This is the integrity boundary working exactly as designed.** All 112 legacy
fabricated rows are stamped estimated; all 61 real Phase 1 samples are stamped
measured. Columns default to `is_estimated = false` so a Phase 1 writer that
forgets the flag fails loudly in QA rather than silently mislabelling.

### Phase 0 deliberate non-actions [DOC §10]

- **No data purge.** The 112 fabricated rows reached **5 real customer
  businesses**, most recent run 2026-07-26. Marked, not deleted, pending the
  customer-notification decision. Purge remains a one-liner.
- Repository-controlled marketing and sales collateral audit completed on 2026-08-15.

### What remains for Phase 0

**No repository task remains.** Off-repository decks, CRM snippets, private
drafts, and recorded sales calls were not available and are explicitly outside
the certification boundary recorded in the collateral audit.

---

## PART D — PHASE 1: USABLE AT LAUNCH ✅ COMPLETE

> **Current status (2026-08-18):** The audit snapshot below is retained for
> provenance, but its blockers were resolved. Production acceptance is recorded
> in `docs/AEO_PHASE1_COMPLETION_2026-08-18.md`.

**Exit criterion [DOC §5]:** *"the page contains zero estimated numbers and five
real engines."*

**Historical standing on 2026-08-11:** ✅ five real engines exist and produced real samples
**[DB]**. ✅ zero estimated numbers on the AEO surfaces **[DB]** — legacy
fabricated surfaces sit behind an unset flag. ❌ **but four defects block launch**
(Part E). These defects are resolved in the 2026-08-18 completion record above.

### D.1 [DB] Production data — proof of what actually runs

```
aeo_prompts                 5    (is_active = true → 0)
aeo_prompt_clusters         0
aeo_runs                    4
aeo_samples                61
aeo_citations             510
aeo_brand_mentions         33
aeo_competitor_aliases      0
aeo_quota_reservations     61
aeo_quota_ledger            0    ← DEFECT 1
aeo_credit_balances         0
aeo_credit_ledger_entries   0
aeo_geo_grid_runs           0    ← DEFECT 3
aeo_geo_grid_points         0
crawl_runs                  0    ← never run in prod
crawl_pages                 0
crawl_findings              0
aeo_alerts                  0
aeo_content_briefs          0
```

### D.2 [DB] Per-engine sample breakdown — the five engines are real

| engine_id | status | n | Σ cost_micro_usd |
|---|---|---|---|
| chatgpt | ok | 10 | **0** ← DEFECT 1 |
| gemini | ok | 20 | **0** |
| perplexity | ok | 10 | **0** ← DEFECT 1 |
| google_serp | ok | 4 | 0 |
| google_serp | **failed** | **7** | 0 ← DEFECT 2 |
| google_ai_overview | ok | 1 | 0 |
| google_ai_overview | no_answer | 4 | 0 |
| google_ai_overview | **failed** | **5** | 0 ← DEFECT 2 |

All dated 2026-08-07 → 2026-08-08. **Nothing has sampled since.**

### D.3 Enablers (E-1 … E-10)

| ID | What | Status | Files |
|---|---|---|---|
| E-1 | Engine adapter interface + registry | ✅ | `services/aeo/engines/{engine-types,engine-registry,engine-catalog,engine-cost,engine-result,register-adapters}.ts` |
| E-2 | Google Search Console | ✅ | `services/google/{search-console,verify-granted-scopes,oauth-scopes}.ts`; `google-seo-aeo/{load-search-console-section.ts,search-console-section.tsx}` |
| E-3 | Crawler | ✅ code · **[DB] 0 prod runs** | `services/aeo/crawler/*` (17 files) |
| E-4 | Sampling schema + RLS | ✅ | migration `20260805230000` |
| E-5 | Quota & cost ledger | ⚠️ **DEFECT 1** | `services/aeo/ledger/{quota-reservation,quota-rollup,quota-sweep}.ts` |
| E-6 | Extraction eval harness | ✅ | `tests/unit/aeo-extraction-eval-harness.test.ts` |
| E-7 | Inngest fan-out orchestration | ✅ **[DB] 4 runs / 61 samples** | `services/aeo/orchestration/*`; `inngest/aeo/{aeo-run-planner,aeo-dispatch-worker}.ts` |
| E-8 | Raw answer storage | ✅ | migration `20260807180000`; `orchestration/supabase-answer-store.ts` |
| E-9 | Stripe metered billing + credit packs | ✅ code · **[DB] 0 balances** | `services/aeo/billing/{bill-test,stripe-overage-charge-gateway,supabase-credit-ledger-store,renewal-credit-reset,billing-constants,ports}.ts` |
| E-10 | Sampling scheduler | ✅ cron registered | `services/aeo/scheduler/*`; `api/cron/aeo-run-scheduler/` |

### D.4 Pillar 1 — Multi-engine tracking (8 P1 items)

| ID | Feature | Status | Files |
|---|---|---|---|
| F1.1 | Run orchestrator | ✅ | `inngest/aeo/aeo-run-planner.ts` |
| F1.2 | Classic SERP tracking | ⚠️ **7/11 failed** | `engines/adapters/dataforseo-serp-adapter.ts` |
| F1.3 | AI Overview | ⚠️ **5/10 failed** | same adapter, `engineId: google_ai_overview` |
| F1.5 | ChatGPT sampling | ✅ 10 ok | `adapters/chatgpt-engine-adapter.ts` |
| F1.6 | Perplexity sampling | ✅ 10 ok | `adapters/perplexity-engine-adapter.ts` |
| F1.7 | Gemini sampling | ✅ 20 ok | `adapters/gemini-engine-adapter.ts` |
| F1.10 | Engine coverage & freshness panel | ✅ | `google-seo-aeo/prompts/engine-coverage-panel.tsx` |
| F1.12 | **Real geo-grid** | ⚠️ **ORPHANED — DEFECT 3** | `services/aeo/geo-grid/*` + **[UNVERIFIED]** `google-seo-aeo/geo-grid/` |

### D.5 Pillar 2 — Citations (4 P1 items)

| ID | Status | Files |
|---|---|---|
| F2.1 extraction | ✅ **[DB] 510 rows** | `services/aeo/extraction/{extract-sample,citation-normalizer}.ts` |
| F2.2 own-domain rate + position | ✅ | `services/aeo/reporting/visibility-metrics.ts` |
| F2.3 cited-URL leaderboard | ✅ | `reporting/load-visibility-facts.ts` |
| F2.5 third-party source dependency | ✅ | `extraction/{brand-matcher,brand-text,supabase-extraction-store}.ts` — **[DB]** 33 brand mentions |

### D.6 Pillar 3 — Competitors (3 P1 items)

| ID | Status | Files |
|---|---|---|
| F3.1 competitor set | ✅ | **[DB]** `aeo_competitor_aliases` = 0 (none configured yet) |
| F3.2 share of voice | ✅ | `reporting/share-of-voice.ts`; `google-seo-aeo/{load-share-of-voice.ts,share-of-voice-section.tsx}` |
| F3.6 head-to-head drill-down | ✅ | `prompts/[promptId]/{load-prompt-detail.ts,prompt-head-to-head.tsx,view-answer-action.ts}` |

> **Honest scoping note [DOC].** SoV is computed against the business's
> *configured* competitor set, **not** the PRD's "open/fuzzy-matched brand
> extraction". No such extraction pipeline exists in this codebase. Documented
> substitution.

### D.7 Pillar 4 — Prompts (5 P1 items)

| ID | Feature | Status | Files |
|---|---|---|---|
| F4.1 | Prompt library CRUD | ✅ | `prompts/{page.tsx,prompt-list.tsx,prompt-create-form.tsx,prompt-actions.ts,prompts-sidebar.tsx}` |
| F4.2 | AI-suggested prompts | **[UNVERIFIED]** uncommitted | `services/aeo/prompts/{suggest-prompts,store-suggested-prompts}.ts`; `prompts/suggest-prompts-{action.ts,button.tsx}`; `tests/unit/aeo-suggest-prompts.test.ts` |
| F4.3 | Topic/cluster tagging | **[UNVERIFIED]** · **[DB] 0 rows** | referenced in `prompts/load-prompts-page-data.ts`, `store-suggested-prompts.ts` |
| F4.5 | Visibility trend chart | ✅ | `reporting/prompt-trend.ts`; `prompts/[promptId]/prompt-trend-chart.tsx` |
| F4.9 | Quota & cost meter | ✅ | `billing/quota-meter.ts`; `prompts/{load-quota-meter.ts,quota-meter-panel.tsx}` |

> **Real pricing finding [DOC].** At $2.50/test and the actual uniform weekly
> cadence, **a single active prompt on one engine projects to ~$10.83/month** —
> over Professional's $10 included allowance. **No nonzero real workload fits
> inside either plan's allowance today.** This is a pricing decision, not a bug.

### D.8 Pillar 5 — Technical audit (7 P1 items) — **F5.10 COMPLETED THIS SESSION**

| ID | Feature | Status | Files |
|---|---|---|---|
| F5.1 | Site crawler | ✅ | `crawler/{crawl-site,discover-urls,robots-parser,politeness-queue,crawl-plan-budget,safe-fetch,ssrf-guard}.ts` |
| F5.2 | Crawlability/indexability | ✅ | `crawler/crawl-findings.ts` |
| F5.3 | AI-crawler access audit | ✅ | `crawler/{robots-parser,crawl-findings}.ts` |
| F5.4 | Schema/JSON-LD validation | ✅ | `crawler/{extract-json-ld,schema-validator}.ts` |
| F5.8 | Answerability audit | ✅ | `crawler/{answerability,answerability-findings}.ts` |
| F5.10 | **GBP completeness audit** | ✅ **DONE — Part F** | `services/aeo/technical-audit/*`, `services/google/{media,local-posts}.ts` |
| F5.12 | Blocker severity triage + prompt linkage | ✅ | `crawler/finding-prompt-linkage.ts` |

### D.9 Pillar 6 — Content engine (5 P1 items)

| ID | Feature | Status | Files |
|---|---|---|---|
| F6.1 | Citation-gap brief | ✅ | `content-briefs/{analyze-citation-gap,fetch-cited-source,generate-content-brief,generate-and-store-brief}.ts` |
| F6.2 | Prompt → page mapping | ✅ | `content-briefs/prompt-page-mapping.ts` |
| F6.4 | FAQ/Q&A generator + FAQPage JSON-LD | ✅ | `content-briefs/build-faq-schema.ts` |
| F6.5 | Schema patch generator | ✅ | `content-briefs/build-schema-patch.ts` |
| F6.6 | **GBP optimizer (services/posts/Q&A)** | **[UNVERIFIED]** uncommitted | `api/ai/optimize-gbp-content/route.ts`; `components/google-seo-aeo/gbp-content-optimizer-card.tsx`; `services/ai/{gbp-content-generators,gbp-content-prompts,optimize-gbp-content-api}.ts` |

> **Honest scoping note [DOC].** F6.2 uses **term-overlap scoring**, not the PRD's
> "embedding similarity" — **no embedding model call exists anywhere in this
> codebase.** Documented substitution.
>
> **Anti-fabrication is structural here:** the schema patch substitutes
> `{{placeholder}}` tokens for any field without verified data, and Gemini is
> never asked for raw JSON-LD — only for qualitative Q&A text via a
> `Schema`-constrained JSON call.

### D.10 Pillar 7 — Reporting (3 P1 items)

| ID | Status | Files |
|---|---|---|
| F7.1 module dashboard | ✅ | `google-seo-aeo/page-view.tsx` |
| F7.2 CSV export | ✅ | `reporting/{export-prompts,export-citations}.ts`; `crawler/export-crawl-findings.ts`; `data-exports-section.tsx` |
| F7.10 methodology & provenance panel | ✅ | `components/google-seo-aeo/metric-provenance.tsx`; `reporting/visibility-metrics.ts` |

### D.11 Pillar 8 — Alerting (6 P1 items)

| ID | Feature | Status | Files |
|---|---|---|---|
| F8.1 | Visibility/SoV threshold alerts | ✅ | `alerting/detect-visibility-alerts.ts` |
| F8.2 | **Citation gained/lost alerts** | **[UNVERIFIED]** · needs migration | `alerting/detect-citation-alerts.ts` |
| F8.3 | **Rank movement alerts** | **[UNVERIFIED]** · needs migration | `alerting/detect-rank-alerts.ts` |
| F8.4 | Technical blocker alerts | ✅ | `alerting/detect-technical-alerts.ts` |
| F8.7 | Channels: in-app + email | ✅ | `inngest/aeo/aeo-alert-digest-worker.ts`; `google-seo-aeo/alerts/*` |
| F8.8 | Noise control / significance gate | ✅ | `alerting/significance.ts` |

> **Spec gap [DOC §13].** PRD F8.8 names *"variance from repeat sampling
> (F1.13)"* as its input. **F1.13 is a Phase 2 item and does not exist.** A
> hand-rolled **two-proportion z-test** was substituted (verified against the
> textbook z=1.96 / p=0.05 landmark), gated on **both** statistical significance
> **and** a ≥15-point practical delta. Documented substitution, not fabrication.
>
> **Security note.** `aeo_alerts` has **no client-writable UPDATE policy** — that
> would let any org member PATCH severity/title, not just mute. Muting goes
> through a narrow `mute_aeo_alert(uuid)` SECURITY DEFINER RPC instead.

### D.12 [CODE] Infrastructure wiring

**Feature flags** — `src/lib/features/aeo-surfaces.ts`. All fail closed on
anything but literal `"true"`.

| Flag | Function | Prod | Guards |
|---|---|---|---|
| `AEO_SHOW_ESTIMATED_SURFACES` | `areEstimatedAeoSurfacesEnabled()` | unset | legacy fabricated surfaces |
| `AEO_LIVE_SAMPLING` | `isLiveSamplingEnabled()` | **true** | vendor engine calls |
| `AEO_METERED_BILLING_LIVE` | `isMeteredBillingLive()` | **true** | customer card charges |
| `AEO_LIVE_CRAWLING` | `isLiveCrawlingEnabled()` | unset | crawling customer sites |
| `AEO_LIVE_ALERTING` | `isLiveAlertingEnabled()` | unset | alerts + emails |
| `AEO_LIVE_CONTENT_BRIEFS` | `isLiveContentBriefsEnabled()` | unset | Gemini brief generation |

**Cron registration** — `vercel.json`. Committed: only
`/api/cron/aeo-yearly-credit-reset` (`0 6 * * *`) and `/api/cron/aeo-run-scheduler`
(`0 1-8 * * *`). **Uncommitted diff adds three:** `aeo-crawl-scheduler`
(`0 1-8 * * *`), `aeo-alert-scheduler` (`0 9 * * *`), `aeo-alert-digest` (`0 10 * * *`).

**Inngest event map — I traced every sender and worker:**

| Event | Sender | Worker |
|---|---|---|
| `aeo/run.requested` | `api/cron/aeo-run-scheduler/route.ts:50` | `aeo-run-planner.ts` |
| `aeo/dispatch.requested` | `aeo-run-planner.ts:114` | `aeo-dispatch-worker.ts` |
| `aeo/crawl.requested` | `api/cron/aeo-crawl-scheduler/route.ts:40` **and** `audit/run-audit-action.ts:85` | `aeo-crawl-worker.ts` |
| `aeo/alert-check.requested` | `api/cron/aeo-alert-scheduler/route.ts:51` | `aeo-alert-worker.ts` |
| `aeo/credit-reset.requested` | `api/cron/aeo-yearly-credit-reset/route.ts:35` | `aeo-yearly-credit-reset-worker.ts` |
| `aeo/geo-grid.requested` | **NO SENDER — DEFECT 3** | `aeo-geo-grid-worker.ts` |

**Engine registration** — `services/aeo/engines/register-adapters.ts`. All five
registered. Three independent gates before any vendor call:
`AEO_LIVE_SAMPLING === "true"` → `adapter.isConfigured()` → `cost.confidence !== "unverified"`.

**[DB] Applied AEO migrations** (no drift except the last):
```
20260805200155  add_aeo_estimated_provenance
20260805230000  aeo_phase1_sampling_schema
20260806010000  aeo_quota_reservations
20260807120000  add_google_granted_scopes
20260807180000  aeo_answer_storage
20260808200000  aeo_credit_ledger
20260809170000  aeo_crawler_schema
20260809190000  aeo_crawl_findings_schema_rules
20260811110000  aeo_crawl_findings_answerability_rules
20260811120000  aeo_alerts_schema
20260811130000  aeo_content_briefs_schema
20260811140000  aeo_alerts_citation_rank_types   ← ON DISK, NOT APPLIED
```

---

## PART E — THE FOUR DEFECTS BLOCKING PHASE 1

### 🔴 DEFECT 1 — Cost capture is dead (highest priority; billing is live)

**[DB] Evidence.** All 61 samples have `cost_micro_usd = 0`, including 10 ChatGPT
and 10 Perplexity calls that certainly cost money. `aeo_quota_ledger` has **0
rows** despite **61** rows in `aeo_quota_reservations`.

E-5 reserves quota but never records consumption. **With metered billing live,
spend reads as $0.** I did not finish tracing the root cause. Start here:
- `services/aeo/ledger/{quota-reservation,quota-rollup,quota-sweep}.ts`
- `inngest/aeo/aeo-dispatch-worker.ts` (settles a sample)
- `services/aeo/orchestration/supabase-sample-store.ts` (writes `cost_micro_usd`)
- `engines/adapters/adapter-support.ts` → `reportedCost()`, `usdToMicroUsd()`
- Note: Perplexity is the only engine that reports its own per-request cost.

### 🔴 DEFECT 2 — DataForSEO mostly failing (F1.2 / F1.3)

**[DB]** `google_serp` 7 failed / 4 ok. `google_ai_overview` 5 failed / 4
no_answer / 1 ok. **Two of five engines barely work.**

`engines/adapters/dataforseo-serp-adapter.ts` is **modified and uncommitted** by
the concurrent session — possibly a fix in progress. **Diff it before changing
anything.** Related: `dataforseo-{client,sample,serialize}.ts`.

### 🟡 DEFECT 3 — Geo-grid (F1.12) orphaned

**[CODE]** `aeo/geo-grid.requested` has a type declaration
(`inngest/client.ts:167`) and a worker, but **no sender anywhere**. **[DB]** Both
grid tables empty. Service code looks complete:
`services/aeo/geo-grid/{geo-grid-runner,grid-geometry,local-rank,supabase-geo-grid-store}.ts`.

The concurrent session added `google-seo-aeo/geo-grid/` **[UNVERIFIED]** — it may
supply the missing trigger. **Check whether it sends the event.**

### 🟡 DEFECT 4 — Unapplied migration `20260811140000`

Breaks F8.2/F8.3 alert code against production. See B.3.

### Also outstanding (not defects, but Phase 1 scope)

- **[DB] Crawler has never run in production** — `crawl_runs` = 0.
- **[DB] 0 active prompts** — Phase 1 is not actually exercised end to end.
- **`pnpm check:sizes` fails** on `src/components/integrations/zapier-card.tsx`
  (158 lines, limit 150). Introduced by commit `aeb779c3`, **not** AEO work. A
  separate background task was spawned for it.
- **E-2 residual risk [DOC]:** Supabase Auth's Google provider may use a
  different Cloud Console client than the one where the `webmasters.readonly`
  consent screen was configured. **Cannot be verified from code** — needs a
  human to check the Supabase Dashboard.
- **SSRF residual risk [CODE]:** `crawler/ssrf-guard.ts` does DNS resolution +
  private-IP rejection, enforced in the worker so every trigger path is covered.
  **DNS-rebinding TOCTOU is documented and NOT closed** — would need a pinned
  resolved IP and a custom fetch dispatcher.

---

## PART F — WHAT I COMPLETED THIS SESSION: F5.10

### The problem

F5.10 had shipped **5 rows as `status: "pending"` stubs**, plus a 6th
(`services-list`) scored from a **proxy** — `actionLinkCount >= 25`, i.e. place
action links standing in for a services list. QA criterion **#29a** fails while
any proxy remains, and criterion #29 alone cannot detect it (the row is already
scored, so "finish the stubs" would leave it forever).

A previous session had also built `gbp-completeness.ts` — a generic 7-field score
that **duplicated the already-shipped `computeProfileHealth()`** in
`services/google/profile-health.ts`. User approved deleting it.

### What I built — API shapes verified against Google's **live published docs**, not memory

**New files:**
- `src/services/google/media.ts` — GBP Media API. Still on the **v4**
  `mybusiness.googleapis.com` host (media was never migrated to v1). Owner-vs-
  customer photos distinguished by the `attribution` field. Paged, capped at 4
  pages, reports `truncated` rather than implying a complete list.
- `src/services/google/local-posts.ts` — GBP Local Posts API (v4).
  `PUBLISHED_POST_STATES = {LIVE, RECURRING}` — the only two Google describes as
  "currently appearing in search results".
- `src/services/aeo/technical-audit/gbp-audit-thresholds.ts` — every pass/fail bar
  in one reviewable place.
- `src/services/aeo/technical-audit/gbp-audit-signals.ts` — shapes raw payloads
  into scoreable signals.
- `src/services/aeo/technical-audit/gbp-audit-checks.ts` — the six checks, pure functions.
- `src/services/aeo/technical-audit/fetch-gbp-audit-signals.ts` —
  `Promise.allSettled` so a Media outage cannot blank the services checks.
- `scripts/verify-gbp-audit-live.ts` — read-only live verifier.
  `pnpm exec tsx scripts/verify-gbp-audit-live.ts <businessId>`.
  **Takes no default business. Never run against one you are not authorized to
  inspect. NOT YET RUN.**

**Modified:**
- `services/google/listing-information.ts` — added `serviceItems` + `serviceArea`
  to `LOCATION_READ_MASK` and typed them. **Critical:** a readMask omitting these
  makes Google return them *absent*, which is indistinguishable from "the
  business has none" — omitting them would report "no services" for **every**
  customer.
- `google-seo-aeo-audit-utils.ts` — widened `AuditStatus` to
  `pass|fail|pending|unavailable|not-applicable`; added `isScoredAudit()`.
- `google-seo-aeo-build-audits.ts` — composes the six real checks; takes
  `gbpSignals` + `topKeywords` instead of `actionLinkCount`.
- `load-google-seo-aeo-page-data.ts` — one location read now serves both the
  description check and the three location-backed checks; dropped the dead
  `gbp_place_action_links` query; parallelised four independent awaits.
- `google-seo-aeo-score-audit-section.tsx` — renders a distinct reason per
  unscored status.
- `audit/{load-audit-page-data.ts,page.tsx}` — removed the redundant card (also
  removed one Google API call and one DB query from that page).

**Deleted (user approved):** `gbp-completeness.ts`,
`gbp-completeness-section.tsx`, `tests/unit/aeo-gbp-completeness.test.ts`.

**Tests added:** `aeo-gbp-audit-checks.test.ts`, `aeo-gbp-audit-signals.test.ts`,
`aeo-gbp-build-audits.test.ts`, `google-media-local-posts.test.ts`.

### The status model — why it matters

- `pending` = we never built the check
- `unavailable` = built it, asked Google, got nothing back
- `not-applicable` = ran it, genuinely doesn't apply (a storefront that never
  travels to customers has no service area)

Only pass/fail are scored. **Marking an unreachable API as `fail` would fabricate
a failure** — exactly what this module exists to prevent.
`GbpCheckStatus` deliberately **excludes** `"pending"`, so **tsc now enforces
criterion #29** for these six rows; reintroducing a stub fails the build.

### Honest substitution recorded

Google's v1 API models a service area as **up to 20 place IDs, not a radius.**
The PRD's wording "service-area radius" assumes a model that does not exist on
this API. The check measures **declared coverage areas** instead, and says so in
the code comment.

### Verification

`pnpm typecheck` clean · **970/970 tests pass** (was 938) · `pnpm build` exit 0 ·
`react-doctor` **100/100**. **NOT verified against a live Google account** — the
verify script exists but has not been run.

---

## PART G — WHAT TO DO NEXT, IN ORDER

1. **Reconcile and commit both sessions' work.** Everything is uncommitted.
   Stage explicit file lists. *Highest priority — unapplied schema + uncommitted
   code from two agents + live money flags is where real damage happens.*
2. **Apply `20260811140000`** using the Part H convention. Unblocks F8.2/F8.3.
3. **Fix DEFECT 1 (cost capture).** Billing is live and spend reads $0.
4. **Fix DEFECT 2 (DataForSEO).** Two of five engines mostly failing.
5. **Resolve DEFECT 3 (geo-grid).** Verify whether the new `geo-grid/` folder
   sends `aeo/geo-grid.requested`; if not, add a sender.
6. **Review F4.2, F4.3, F6.6, F8.2, F8.3** — built by the other agent, unread by me.
7. **Run `scripts/verify-gbp-audit-live.ts`** against an authorized business to
   confirm Google returns `serviceItems`/`serviceArea` under our readMask.
8. **Decide on the three unregistered crons.** Registering `aeo-crawl-scheduler`
   means crawling real customer sites — confirm who it affects first (website
   URLs set, active prompts, page caps).
9. **Activate at least one prompt** and watch one full cycle end to end. Phase 1
   has never actually been exercised.
10. ~~**Close Phase 0's open item:** the marketing collateral audit.~~ **Completed 2026-08-15.**

### Re-verify before trusting this doc (it will age)

```bash
git log --oneline -10
git status --short          # expect a lot; two agents are writing
ps aux | grep git           # check for a live lock holder
pnpm typecheck && pnpm test && pnpm check:sizes
```

```sql
select 'prompts_active' t, count(*) n from aeo_prompts where is_active
union all select 'samples', count(*) from aeo_samples
union all select 'zero_cost_samples', count(*) from aeo_samples where coalesce(cost_micro_usd,0)=0
union all select 'quota_ledger', count(*) from aeo_quota_ledger
union all select 'credit_balances', count(*) from aeo_credit_balances
union all select 'crawl_runs', count(*) from crawl_runs;
```

Then confirm migrations with the `list_migrations` MCP tool on `snielpllhrppdqzkzjwf`.

---

## PART H — CONVENTIONS YOU MUST FOLLOW

**Migrations.** Dry-run inside `BEGIN...ROLLBACK` with adversarial tests
(invalid values *must* fail) before applying. Apply via the **`execute_sql`** MCP
tool, then register the version explicitly:
`INSERT INTO supabase_migrations.schema_migrations`.
**Never use the `apply_migration` MCP tool** — it causes version drift.
Regenerate types afterwards (`generate_typescript_types`; the response is large —
save to file, extract `data['types']`, write to
`src/lib/db/supabase/database.types.ts`).

**Live flags.** Every new automated capability gets an `AEO_LIVE_*` flag in
`src/lib/features/aeo-surfaces.ts`, checked **first** in the worker, failing
closed on anything but literal `"true"`. **Never flip these yourself — user's call.**

**SECURITY DEFINER functions.** `search_path = ''`, explicit
`REVOKE ALL FROM PUBLIC, anon`, `GRANT EXECUTE TO authenticated` only when a real
client-facing action needs it. Never a blanket client-writable UPDATE/INSERT RLS
policy for a narrow action.

**File size caps** (AGENTS.md §2): pages **100** · components **150** ·
lib/services **200**. Check with `pnpm check:sizes`.

**Never:** hand-edit `database.types.ts` · edit `src/components/ui/` · put secrets
in migrations · edit applied migrations · `console.log` on the client · auth via
`getSession()` (use `getUser()`) · `git add -A` while another agent is active.

**Before you finish:**
```bash
pnpm typecheck && pnpm test && pnpm build
npx react-doctor@latest --verbose --diff   # if React/UI changed
```

**Verify against real data.** This project's convention is one-off
`scripts/verify-*-live.ts` scripts against authorized targets (`wolfpackkc.com`
has been the approved test site). **[DOC]** This caught 2 real bugs that unit
tests missed: schema subtype recognition, and CSS leaking into a content excerpt.

---

## PART I — PHASE 2 ✅ COMPLETE

**Completed and production-accepted 2026-08-18.** The roadmap summary says 24
items, but the explicit list contains 31 feature IDs. All 31 are complete. Full
implementation and acceptance evidence is in
`docs/AEO_PHASE2_COMPLETION_2026-08-18.md`.

| Pillar | Items |
|---|---|
| 1 | F1.4 AI Mode · F1.8 Claude · F1.11 geo/locale scoping · F1.13 repeat sampling + variance |
| 2 | F2.4 uncited-page gaps · F2.7 AI crawler log analytics (L) · F2.8 review-corpus citations · F2.9 citation history/diff |
| 3 | F3.3 sentiment · F3.4 prominence · F3.5 source overlap · F3.8 attribute extraction · F3.9 grid competitor overlay |
| 4 | F4.4 intent classification · F4.6 cluster SoV · F4.7 prompt discovery from real demand |
| 5 | F5.5 JS-render delta (L) · F5.6 Core Web Vitals · F5.7 GSC indexation join |
| 6 | F6.3 rewrite diffs · F6.7 review-mining briefs · F6.8 freshness/decay queue · F6.9 impact tracking · F6.10 GBP one-click publish |
| 7 | F7.3 PDF/HTML reports · F7.4 scheduled email reports · F7.6 public REST API (L) · F7.9 multi-location rollup |
| 8 | F8.5 competitor overtake · F8.6 negative sentiment spike · F8.7 Slack/webhook channels |

Production proof includes a successful 21/21 seven-engine repeated sampling run,
exact cost reconciliation at 182,567 micro-USD, persisted citation/review
analysis, a successful ten-page crawl, generated private PDF report, and alert
and recommendation evaluation. Global customer-wide flags were not changed.

---

## PART J — PHASE 3 ✅ COMPLETE

**Week 25–34 · ~30 EW.** 11 P3 features [DOC §5].

> **Current status (2026-08-18):** All 11 items below are implemented,
> migrated, deployed, and production-accepted with Wolfpack. Exact commit,
> deployment, schema, event, data, conditional-state, and quality evidence is
> recorded in `docs/AEO_PHASE3_COMPLETION_2026-08-18.md`.

| ID | Feature | Effort |
|---|---|---|
| F1.9 | Copilot sampling | M |
| F1.14 | Answer volatility index | S |
| F2.6 | Citation → organic traffic correlation | M |
| F3.7 | Competitor page tracking | L |
| F4.8 | Prompt demand/volume estimates | L |
| F5.9 | `llms.txt` presence + validity | XS |
| F5.11 | NAP consistency across directories | L |
| F7.5 | White-label | M |
| F7.7 | Outbound webhooks | S |
| F7.8 | Looker Studio / BigQuery export | L |
| F8.9 | Statistical anomaly detection | M |

**F8.9 note [DOC]:** only credible once there are **≥90 days of history**.
The implementation enforces that rule; Wolfpack's production evaluation is
stored as ineligible with 2 history days rather than producing a premature
anomaly claim. [DB]

---

## PART K — ONE-PARAGRAPH SUMMARY

All four rollout phases are complete. Phase 0's integrity boundary remains
intact, and Phases 1, 2, and 3 are production-accepted with the Wolfpack pilot.
See the dated completion records for immutable IDs, costs, migrations, tests,
deployment evidence, and honest unavailable/configuration-gated states.

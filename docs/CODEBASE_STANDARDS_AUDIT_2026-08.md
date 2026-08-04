# Codebase Standards Audit — August 2026

**Branch:** `chore/codebase-standards-audit` · 9 commits · 249 files changed
**Standard applied:** repo-native rules in [AGENTS.md §2](../AGENTS.md#2-code-standards-non-negotiable)

## Verification

Every batch was verified independently before the next began.

| Gate | Before | After |
|------|--------|-------|
| `pnpm typecheck` | pass | pass |
| `pnpm test` | 56 files / 210 tests pass | 56 files / 210 tests pass |
| `pnpm build` | pass | pass (245 pages) |
| `pnpm lint` | 0 errors, 860 warnings | 0 errors, **854** warnings |

The proxy refactor was additionally A/B tested against the original on a live dev
server: 13 path probes and 16 `Host`-header probes covering the auth, app,
review-capture, apex/www and localhost branches returned byte-identical status
codes and redirect targets, with `X-Robots-Tag` and CORS headers intact.

## Scope note

All 1,807 files in `src/` were mechanically scanned on every audit dimension
(size vs. category limit, filename convention, inbound references, import style,
`any`/`ts-ignore`, client `console.*`, leftover markers), with line-by-line reads
on everything the scans flagged. All 126,747 lines were **not** read individually.

---

## 1. Files removed

Nine files with zero inbound references, each verified by symbol-level grep across
`src/`, `tests/`, `scripts/`, `docs/`, and `supabase/`.

| File | Lines | Why |
|------|-------|-----|
| `app/(dashboard)/settings/integrations/actions.ts` | 39 | Superseded duplicate of `_actions.ts`; older version used `console.error` and skipped review hiding |
| `components/dashboard/ai-insights-card.tsx` | 117 | WIP scaffolding, never wired up |
| `components/dashboard/organization-display.tsx` | 24 | Orphaned by a react-doctor refactor |
| `components/growth/growth-dashboard-stat-lead-cards.tsx` | 13 | Self-marked `@deprecated`; consumers import `growth-dashboard-ui` directly |
| `components/integrations/webhook-card.tsx` | 87 | WIP scaffolding |
| `components/marketing/…/marketing-home-pricing-enterprise.tsx` | 47 | Orphaned |
| `components/settings/organization-name-form.tsx` | 83 | WIP scaffolding |
| `components/settings/profile-form.tsx` | 123 | WIP scaffolding |
| `services/google/webhook-qa.ts` | 70 | WIP scaffolding |

Also removed: empty `src/core/{api,config,errors,logger}` directories, and the
user-facing string `Debug Info: Review Flow 404` from the public
collectratings.com 404 page.

All recoverable from git history if a parked feature resumes.

## 2. Files renamed

`src/domains/ai/` was the only pocket of the repo not using kebab-case.

| Old | New |
|-----|-----|
| `adapters/VertexAdapter.ts` | `adapters/vertex-adapter.ts` |
| `services/AiAnalysisService.ts` | `services/ai-analysis-service.ts` |
| `schemas/ResponseSchemas.ts` | `schemas/response-schemas.ts` |
| `normalizeAnalysisForDb.ts` | `normalize-analysis-for-db.ts` |
| `services/generateCompetitorInsight.ts` | `services/generate-competitor-insight.ts` |
| `services/generateMarketPositioningBrief.ts` | `services/generate-market-positioning-brief.ts` |
| `services/generateReplyDraft.ts` | `services/generate-reply-draft.ts` |
| `components/tours/DashboardTourProvider.tsx` | `components/tours/dashboard-tour-provider.tsx` |
| `settings/integrations/_actions.ts` | `settings/integrations/actions.ts` |

Plus 6 `phaseN`-prefixed test files. Exported symbol names are unchanged — no
public API moved.

## 3. Structure — `lib/phaseN` → domain names

40 files were grouped by build-out milestone rather than content. Milestone
numbers stop carrying meaning the moment they ship.

| Old | New | Contents |
|-----|-----|----------|
| `lib/phase3/competitor-data` | `lib/comparisons/` | `/compare` landing pages |
| `lib/phase3/industry-*` | `lib/industries/` | `/industries` landing pages |
| `lib/phase8/localized-industries` | `lib/industries/` | `/es/industries` |
| `lib/phase4/*` (19) | `lib/content/` | blog posts, help centre, resources |
| `lib/phase5/*` (2) | `lib/social-proof/` | case studies, social proof |
| `lib/phase6/*` (5) | `lib/campaign-content/` | email sequences, ads, newsletter, partnerships |
| `lib/phase7/*` (4) | `lib/free-tools/` | marketing free tools |
| `lib/phase7/upgrade-modal-copy` | `lib/billing/` | product upgrade modal |
| `lib/phase8/*` (5) | `lib/enterprise/` | agency, enterprise, compliance, demo |

Updated alongside: 149 import sites across 109 files, 3 hardcoded filesystem
paths, 4 doc references.

**Deliberately left alone:** `services/google/phaseN-sync.ts` mirrors Google
Business Profile API tiers and the applied migration names
(`gbp_phase3_listing_profile_health`, `gbp_phase4_lodging`) — the terminology is
Google's, not ours. And `utm_campaign: "phase7_tools"` / `"phase8"` are live
values in the analytics tables; renaming them would break historical attribution.

## 4. Files split

| File | Before | After (largest) | Modules |
|------|--------|-----------------|---------|
| `src/proxy.ts` | 496 | 151 | 8 |
| `app/actions/onboarding/google-oauth.ts` | 509 | 178 | 5 |
| `settings/integrations/zapier/zapier-setup-client.tsx` | 433 | 146 | 7 |
| `services/stripe/webhook-handler.ts` | 397 | 151 | 6 |

Duplication removed in the process:

- **`CATEGORY_MAP`** (44 entries) appeared twice, byte-identical, in
  `google-oauth.ts` — two copies free to drift. Now one `mapGoogleCategory()`.
- **Plan-limits → organizations columns** was written out in both the Stripe
  checkout and cancellation handlers. Now one function.
- **RSC-request detection** appeared twice in the proxy. Now `isRscRequest()`.
- **Invoice currency formatting** appeared in both invoice handlers.
- Two dead locals in `initializeGoogleAuth` (`reviewData`, `locationInfo` —
  declared, never read) and a shadowed `googleAccountId`.
- `event.data.object as any` in the Stripe deleted-subscription branch replaced
  with a narrowed type; `createServerClient` in the proxy gained its missing
  `<Database>` generic.

Only the Zapier webhook-URL card needs interactivity, so its orchestrator and
three sibling cards dropped `"use client"` and now render as Server Components.

---

## 5. Open item — stale generated Supabase types

**This is the highest-value remaining fix and it needs schema access.**

`src/lib/db/supabase/database.types.ts` is out of date. Eight tables exist in
`supabase/migrations/` but are absent from the generated types:

`competitor_events` · `competitor_insights` · `competitor_snapshots` ·
`competitor_watch_runs` · `google_seo_ai_visibility_results` ·
`google_seo_ai_visibility_runs` · `google_seo_heatmap_cells` ·
`google_seo_heatmap_runs`

The code works around this with `supabase.from("table" as never) as any`, so
**every query against the competitor-watch and Google SEO/AEO features runs with
type checking switched off** — 43 casts across ~15 files. RLS *is* correctly
enabled on all eight tables, so this is a typing gap, not a security gap.

This audit removed the 4 casts that were simply stale (`competitor_market_briefs`,
`competitor_watch_settings`, `events`, `invitations` — already in the types).
The other 43 cannot go until the types are regenerated:

```bash
npx supabase gen types typescript --project-id snielpllhrppdqzkzjwf > src/lib/db/supabase/database.types.ts
```

Regenerating is the sanctioned way to change that file — the "never edit" rule
means never hand-edit it. Then delete the `as never` / `as any` pairs and let
typecheck confirm the column shapes.

## 6. Remaining over-limit files

39 files still exceed their `AGENTS.md` limit (down from 49, excluding the
never-edit `database.types.ts` and `components/ui/`).

**~6 are static content data and were left deliberately** — `blog-posts-month1.ts`
(639), `resource-data.ts` (505), `competitor-data.ts` (455), `industry-data.ts`
(454) and similar are single cohesive datasets. Splitting a 639-line array of blog
post objects buys nothing; the limits exist to enforce single responsibility, and
these already have one.

**The rest are logic files outside this pass's approved scope.** The largest are
`lib/growth/kpi-metrics.ts` (397), `services/google/business-profile.ts` (391),
`lib/analytics/build-analytics-range-payload.ts` (351),
`competitors/add-competitor-dialog.tsx` (326), `actions/onboarding/flow.ts` (317),
`app/sitemap.ts` (311). Each is a reasonable candidate for the same treatment.

## 7. Other flags, not acted on

- **`docs/FULL_FILE_USAGE_AUDIT.json` should not be trusted.** It marks all nine
  files deleted above as "✅ ACTIVELY USED — Referenced in repository"; its
  heuristic counted the audit file's own mention of each filename as a reference.
  It also holds 37 entries pointing at files that no longer exist, 22 of which
  were already stale before this branch. Worth deleting or regenerating.
- **4 raw `<img>` tags** remain, against the `next/image`-only rule in AGENTS.md
  §3. All four render user-uploaded logos or generated QR data URLs, where
  `next/image` is awkward — defensible, but they are the only exceptions left.

---

## Baseline that was already strong

Worth recording, because it is unusual: before this pass the repo already had
zero deep relative imports, zero `@ts-ignore`, zero `console.*` in client
components, zero TODO/FIXME/HACK markers, zero backup-file litter, RLS on every
recent table, 97% of files inside their size limits and 99.5% of filenames
on-convention. The findings above are the exceptions, not the rule.

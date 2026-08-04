# Codebase Standards Audit — August 2026

**Branch:** `chore/codebase-standards-audit` · 11 commits
**Standard applied:** repo-native rules in [AGENTS.md §2](../AGENTS.md#2-code-standards-non-negotiable)

## Verification

Every batch was verified independently before the next began.

| Gate | Before | After |
|------|--------|-------|
| `pnpm typecheck` | pass | pass |
| `pnpm test` | 56 files / 210 tests pass | 56 files / 210 tests pass |
| `pnpm build` | pass | pass (245 pages) |
| `pnpm lint` | 0 errors, 860 warnings | 0 errors, **853** warnings |

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

## 5. Supabase types regenerated — resolved

`database.types.ts` had drifted: eight tables existed in `supabase/migrations/`
but were missing from the generated types, so every competitor-watch and Google
SEO/AEO query ran with type checking switched off behind
`from("table" as never) as any`.

Regenerated from the live schema. The diff is purely additive — 41 → 49 tables,
none removed. Removed in consequence:

| Escape hatch | Count |
|---|---|
| `from("table" as never) as any` across 14 files | 34 |
| leftover `as any` wrappers | 4 |
| `(admin as any).rpc(...)` — both lock functions are in the generated `Functions` type | 2 |
| hand-written `as Promise<{…}>` annotations standing in for missing types | 2 |
| stale casts on tables already typed | 4 |

**`any` went 47 → 8; `as never` 56 → 22.** The 8 remaining are Inngest's own
`step` typing, a recharts formatter, and one comment — none Supabase-related.

### Latent bug the stale types were hiding

`businesses.rating_style` is `TEXT DEFAULT 'emoji' NOT NULL` (migration
`20260407160000`), but the PATCH schema in `business-by-id-api.ts` accepted
`null`. A request sending `rating_style: null` would have hit a NOT NULL
violation at update time. Dropped `.nullable()`, matching the sibling enum fields
in the same schema.

---

## 5b. Security — anonymous access to RLS-bypassing functions

**Found via Supabase's database linter, then confirmed directly against the
schema. A migration is written but NOT applied — see below.**

Three `SECURITY DEFINER` functions (owner `postgres`, so they bypass RLS) carried
no authorization check, no pinned `search_path`, and were `EXECUTE`-able by the
`anon` role:

| Function | Exposure |
|---|---|
| `bulk_add_customer_tags(uuid[], text[])` | Rewrites `customers.tags` for any UUID, any tenant |
| `bulk_remove_customer_tags(uuid[], text[])` | Same |
| `increment_ai_replies_used(uuid)` | Inflates any organization's AI reply counter |

Verified: `customers` and `organizations` both have RLS enabled with 2 policies
each; `has_function_privilege('anon', …, 'EXECUTE')` returns **true** for all
three; none of the function bodies reference `auth.uid()`.

The application route `src/services/customers/bulk-api.ts` *does* call
`userCanAccessBusiness()` before invoking the RPC — but PostgREST exposes the
functions directly at `/rest/v1/rpc/<name>`, so that check is bypassable with the
public anon key. The sibling `delete` branch in the same file scopes correctly
with `.eq("business_id", businessId)`; the tag branch delegates to a privileged
function that does neither.

Also: `acquire_competitor_watch_lock` / `release_competitor_watch_lock` are
granted to `authenticated`, so any signed-in user can hold the competitor-watch
cron's advisory lock. Their only caller is the service-role client.

**Schema drift:** `bulk_add_customer_tags` and `bulk_remove_customer_tags` appear
in no migration at all — they were created directly against the database.

The team clearly knows this pattern: `encrypt_token`, `decrypt_token` and
`acquire_platform_lock` are all correctly closed to `anon`. These are oversights,
not a missing convention.

**`supabase/migrations/20260804120000_harden_security_definer_functions.sql`**
scopes each function to the caller's own tenant, pins `search_path`, revokes
`anon` EXECUTE, restricts the locks to `service_role`, and brings the two
undeclared functions under version control. **It has not been applied** —
applying it changes a production database and is the owner's call.

Two lower-priority linter items left alone: leaked-password protection is
disabled in Supabase Auth (a dashboard toggle), and `opt_outs`, `sms_opt_outs`
and `stripe_webhook_events` have RLS on with no policies — which is the correct
deny-all posture for service-role-only tables, not a gap.

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

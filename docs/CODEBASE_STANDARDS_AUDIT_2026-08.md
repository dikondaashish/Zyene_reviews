# Codebase Standards Audit — August 2026

**Branch:** `chore/codebase-standards-audit` · 15 commits
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

### Applied — 2026-08-04

Two migrations, both applied and verified against the live schema:

| Version | Migration |
|---|---|
| `20260804162256` | `harden_security_definer_functions` |
| `20260804162339` | `revoke_public_execute_on_security_definer_functions` |

The first tenant-scopes each function (`auth.role() = 'service_role'` OR the
caller's own `get_user_business_ids()` / `get_user_org_ids()`), pins
`search_path`, restricts the locks to `service_role`, and brings the two
undeclared functions under version control.

**The second exists because the first one's REVOKE silently did nothing.** It
revoked EXECUTE from `anon` by name, but Postgres grants EXECUTE to `PUBLIC` on
every new function and `anon` inherits that. Post-apply verification showed the
ACL still carrying a leading `=X/postgres` entry and
`has_function_privilege('anon', …, 'EXECUTE')` still returning **true**.
Revoking from `PUBLIC` is what actually closes it.

Final state, confirmed by querying `pg_proc.proacl` directly:

| Function | anon | authenticated | service_role |
|---|---|---|---|
| `bulk_add_customer_tags` | ✗ | ✓ | ✓ |
| `bulk_remove_customer_tags` | ✗ | ✓ | ✓ |
| `increment_ai_replies_used` | ✗ | ✓ | ✓ |
| `acquire_competitor_watch_lock` | ✗ | ✗ | ✓ |
| `release_competitor_watch_lock` | ✗ | ✗ | ✓ |

No ACL retains a PUBLIC entry — matching `encrypt_token`/`decrypt_token`. Re-running
the linter confirms all five are gone from the anon-executable list and all four
`function_search_path_mutable` warnings have cleared.

Before applying, two assumptions were verified rather than assumed: `auth.role()`
reads `request.jwt.claim.role` (not `current_user`), so it returns the *caller's*
role inside a SECURITY DEFINER function — meaning the `service_role` bypass works
without silently granting everyone one; and both `get_user_*_ids()` helpers
return `SETOF uuid`.

**Deliberately not revoked:** `get_user_business_ids`, `get_user_org_ids` and
`get_user_store_role` stay executable by `anon`/`authenticated`. 29 RLS policies
across 16 tables call them, so revoking would break RLS evaluation app-wide.
They are read-only and key off `auth.uid()`, which is NULL for `anon`.

Two lower-priority linter items left alone: leaked-password protection is
disabled in Supabase Auth (a dashboard toggle), and `opt_outs`, `sms_opt_outs`
and `stripe_webhook_events` have RLS on with no policies — which is the correct
deny-all posture for service-role-only tables, not a gap.

---

## 5c. Migration drift — four repo migrations never applied

Comparing `supabase/migrations/` against the remote migration history, these
exist in the repo but have **not** been applied to the production database:

- `20260720120000_square_sandbox_spike.sql`
- `20260720163000_square_phase2_send.sql`
- `20260721160000_square_sending_claim.sql`
- `20260801190000_remove_public_review_write_policies.sql`

The last one looks security-relevant by name. Not applied here — that is a
separate decision from the SECURITY DEFINER hardening and needs its own review.

## 6. File sizes — enforced, then paid down selectively

The root cause was not the 39 oversized files. It was that **`AGENTS.md` called
the §2 limits "non-negotiable" while nothing enforced them** — CI ran typecheck,
colors, test and build only. Splitting every file without a guard would just let
them regrow.

### The guard

`pnpm check:sizes` ([scripts/check-file-sizes.mjs](../scripts/check-file-sizes.mjs)),
wired into CI, works as a **ratchet**:

- a file not in `BASELINE` must be under its category limit;
- a grandfathered file may shrink but never grow;
- one that drops under its limit must leave `BASELINE` — the guard says so.

Existing debt is frozen and can only pay down; no new oversized file can land.
34 entries are grandfathered, each with a stated reason.

### What was split, and why those five

Chosen by churn × size × blast radius from git history, not by line count:

| File | Before → after | Commits | Why it earned a split |
|---|---|---|---|
| `services/review-flow/generate-review-api.ts` | 270 → 152 | 32 | Highest-churn file in the repo; AI draft quota gate was buried in a 70-line try block |
| `services/google/business-profile.ts` | 391 → 137 | 25 | Most-edited service; five API surfaces in one file |
| `services/businesses/business-by-id-api.ts` | 306 → 166 | 22 | 67-line Zod schema + auth/plan/slug guards inline |
| `lib/auth/business-context.ts` | 274 → 153 | 19 | Tenancy resolution — highest incident blast radius |
| `services/stripe/plans.ts` | 303 → 187 | 18 | Pricing catalog and entitlement rules change for different reasons |

### What was deliberately left

Ten cohesive static datasets (`blog-posts-month1.ts` 639, `resource-data.ts` 505,
`industry-data.ts` 454, …). These are marketing copy, not logic; splitting one
array across files makes edits harder and buys nothing. The remaining entries are
marked `TODO: split` and can be worked top-down.

## 7. Sitemap coverage test

`sitemap.ts` is a hand-maintained 311-line route manifest on a product whose GTM
is SEO/GEO. Adding a marketing page without adding it there is silent — the page
simply never gets submitted for indexing, and nothing fails.

Splitting the file would not have helped; the risk is a *missing route*, not
length. [tests/unit/sitemap-coverage.test.ts](../tests/unit/sitemap-coverage.test.ts)
walks the marketing route tree and fails when an indexable page is absent from the
sitemap, or when a page that sets `robots: { index: false }` is listed anyway
(a contradictory crawler signal). It also catches duplicate URLs.

Coverage is currently complete — 115 URLs, no gaps. The two pages absent from the
sitemap (`/growth`, `/newsletter/unsubscribe`) both correctly set
`robots: { index: false }`. The test was verified to actually fail by removing
`/partners` from the sitemap.

## 8. Other flags, not acted on

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

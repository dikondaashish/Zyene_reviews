# Documentation vs Implementation Audit Report

**Date:** 2026-07-18  
**Scope:** All `*.md` files under the repo, excluding `node_modules`, `.git`, `.next`, `dist`, `vendor`, `coverage`, `test-results`, `playwright-report`.  
**Method:** Inventory → map live `src/` implementation → verify claims by reading source (not filenames alone) → classify → act.

---

## Summary

| Metric | Count |
|--------|------:|
| Total `.md` files scanned | 396 |
| Product / project docs (audited in depth) | 62 |
| Agent skill packs (instruction libraries, not product specs) | 334 |
| Deleted (FULLY IMPLEMENTED) | **0** |
| Needs attention — PARTIALLY IMPLEMENTED | 12 |
| Needs attention — NOT IMPLEMENTED | 3 |
| Retained as process / ops / agent guides | 47 |
| Ambiguous / out-of-scope for product delete rules | 334 (+ notes) |

**No `.md` files were deleted.** Under the audit rule (delete only when 100% of documented claims match code *and* the file is pure feature duplication), nothing qualified. Process docs (`README`, `AGENTS.md`, GEO ops, checklists) stay even when accurate. Feature docs that are mostly true still overstate POS, Zapier, Edge, Stripe Connect, or SSO.

**Preserve-as-is:** No `LICENSE`, `CONTRIBUTING.md`, or `CODE_OF_CONDUCT.md` found in the repo.

---

## Step 1 — Discovery buckets

| Bucket | Count | Role in audit |
|--------|------:|---------------|
| `.agents/skills/`, `.claude/skills/`, `.windsurf/skills/`, `.cursor/skills/` | — | Canonical skills in `.agents/`; IDE symlinks via `skills:sync`. `.goose/` and `.agent/skills/` removed 2026-07-18 as duplicates. |
| `docs/` | 34 | Product, growth, GEO, ops docs — primary audit set |
| `.agent/docs/` | 9 | Historical agent implementation notes |
| Root (`README.md`, `AGENTS.md`, `CLAUDE.md`) + IDE rule mirrors | ~10 | Process / agent runtime — retain |
| `content/repurpose/`, `reports/`, `design-system/`, `supabase/` | 11 | Marketing copy, GEO artifacts, design, migrations |

---

## Step 2 — Actual codebase (evidence)

**Stack (live):** Next.js 16 App Router, React 19, TypeScript, Supabase (Postgres + Auth + RLS), Inngest, Stripe, Twilio, Resend, Upstash Redis, Sentry, `@google/genai` for AI.

**Surfaces:** `(marketing)`, `(auth)`, `onboarding/` (5 steps: Organization → Business → Category → Plan → All Set — `src/app/onboarding/onboarding-types.ts`), `(dashboard)` (~26 pages), `/r/[slug]`, `/w/[slug]`, `src/app/api/` (~100 routes), `src/proxy.ts` host routing.

**Services with real implementations:** `src/services/{google,yelp,facebook,stripe,twilio,resend,campaigns,reviews,competitors,inngest,...}`; AI in `src/domains/ai/`.

**Confirmed stubs / partials (read in source):**

| Claim area | Code reality | Evidence |
|------------|--------------|----------|
| Square / Clover / Toast POS | UI placeholders only | `src/app/(dashboard)/settings/integrations/integrations-pos-developer-sections.tsx` + `placeholder-card.tsx` |
| TripAdvisor | Placeholder card | `integrations-review-platforms-section.tsx` |
| Campaign `pos_payment` trigger | `available: false` / Coming Soon | `new-campaign-basics-step.tsx` |
| Stripe Connect (marketplace) | Billing/subscriptions only; no Connect accounts API | `src/services/stripe/` (no `accounts.create`) |
| Edge runtime on tracking routes | No `export const runtime = 'edge'` under `src/app` | ripgrep across `route.ts` |
| SSO SAML/OIDC | Marketing/enterprise copy only | No SAML/OIDC impl in `src/` |
| Multi-step drip campaigns | Plan doc only; live growth = Inngest nurture + single follow-up worker | `docs/DRIP_CAMPAIGNS_PLAN.md`, `follow-up-worker.ts`, `growth-functions.ts` |
| Design system MASTER purple | Conflicts live tokens (`#ff4f00` warm system) | `design-system/zyene-reviews/MASTER.md` vs `src/app/globals.css` / `docs/DESIGN.md` |
| Yelp sync depth | Real but API-capped (~3 recent reviews) | `src/services/yelp/` |
| QR “order physical” | Generate API exists; order UI still “coming soon” | `api/businesses/[id]/qr-code`, QR card toasts |

**Core product that *is* implemented:** Google GBP sync/reply/Q&A/performance, Yelp + Facebook sync, review inbox/export/reply/auto-reply, private feedback shield (`private-feedback-api.ts` + `/r` negative steps), campaigns (manual + scheduled, SMS/email), competitors + cron watch, google-seo-aeo, Stripe billing, team invites/roles, public widget `/w`, AI analyze/drafts, Inngest workers (16 registered in `api/inngest/route.ts`).

---

## Step 3–4 — Classifications and actions

### Deleted (FULLY IMPLEMENTED)

*None.*

Justification: Every candidate feature doc either (a) overstates incomplete integrations, or (b) is a process/ops/agent guide that must remain even when accurate.

---

### Needs attention — PARTIALLY IMPLEMENTED

#### `docs/PLATFORM_FEATURES.md`
- **Documented:** Onboarding, sync, campaigns with triggers, shield, Stripe/Inngest/Redis, analytics.
- **Exists:** All major bullets have matching UI/services (see Step 2).
- **Gaps:** “Triggers” / automated workflows imply POS timing; `pos_payment` is disabled. Omits competitors, google-seo-aeo, widgets, AI analysis that *do* exist. Integrations section incomplete (Yelp/Facebook/Twilio/Resend live but not listed).

#### `docs/PROJECT_DEEP_DIVE.md`
- **Documented:** Full architecture, POS webhooks (Square/Clover/Toast/Stripe), Stripe Connect, Edge runtime, Zapier CRM, domain tables, AI, shield.
- **Exists:** Stack, tables, AI, shield, GBP/Yelp/FB, Twilio/Resend, Inngest — largely real.
- **Gaps:**
  - POS triggers — stubs (`integrations-pos-developer-sections.tsx`).
  - “Stripe Connect” — billing only.
  - “Edge runtime” for tracking — not set on routes.
  - Zapier — API key + generic webhook, not a Zapier app.

#### `docs/ENTERPRISE_SALES_DECK.md`
- **Documented:** Enterprise positioning including SSO and deep integrations.
- **Exists:** Multi-location, team roles, Google/FB/Yelp, shield, competitors, plan limits.
- **Gaps:** SSO SAML/OIDC not in `src/`. POS discovery claims vs placeholder cards.

#### `docs/DEEP_CODEBASE_AUDIT_REPORT.md`
- **Documented:** Point-in-time cleanup (file removals, dependency purge, verification).
- **Exists:** Historical; many removals were real at the time.
- **Gaps:** Counts/paths may drift; treat as archive, not live structure SoT. Prefer `docs/CODEBASE_STRUCTURE.md` + tree.

#### `.agent/docs/TECHNICAL_OVERVIEW.md`
- **Documented:** Full product architecture (older “Zyene Ratings” branding, Anthropic Claude AI, POS notes).
- **Exists:** Overlaps current product in places; POS correctly called placeholder in sections.
- **Gaps:** AI provider is `@google/genai`, not Anthropic. Paths/dates stale. Do not use as current architecture SoT — prefer `README.md` / `docs/PROJECT_DEEP_DIVE.md` (after fixes).

#### `.agent/docs/ONBOARDING_FLOW.md`
- **Documented:** Multi-step onboarding ending in notifications.
- **Exists:** Onboarding under `src/app/onboarding/`.
- **Gaps:** Live UI is **5 steps** (Organization, Business, Category, Plan, All Set) — `onboarding-types.ts`. Doc describes older 4-step shape.

#### `.agent/docs/FLOWY_STEP_ONBOARDING_IMPLEMENTATION.md`
- **Documented:** Flowy 4-step implementation.
- **Exists:** Partial overlap with current onboarding components/actions.
- **Gaps:** Superseded by current 5-step + Plan step. Historical.

#### `.agent/docs/INTEGRATION_VERIFICATION.md`
- **Documented:** Mar 2026 integration PASS checklist.
- **Exists:** Google/Yelp/Facebook/Stripe paths still real.
- **Gaps:** Line references and “PASS” narrative are a snapshot; re-verify before trusting.

#### `.agent/docs/TEST_FLOWS.md`
- **Documented:** Manual test flows for onboarding/dashboard.
- **Exists:** Many flows still valid conceptually.
- **Gaps:** Paths like `src/app/(onboarding)/onboarding/` outdated vs `src/app/onboarding/`.

#### `.agent/docs/DATABASE_VALIDATION_REPORT.md`
- **Documented:** Schema readiness for onboarding (locations table, RLS).
- **Exists:** Tables/RLS patterns remain; `locations` appears in types.
- **Gaps:** Product model is primarily `businesses`-centric today. Point-in-time (Mar 2026), not live schema guide.

#### `README.md` (feature claims only)
- **Classification note:** Retained as process SoT, but **partial** on product wording.
- **Gaps:** “API/Zapier” reads like a full Zapier product; code is developer API + generic webhook (`zapier-card.tsx`, `api/v1/*`, `api/webhooks/generic`).

#### `docs/GROWTH_BLUEPRINT.md` (feature claims only)
- **Classification note:** Retained as growth plan, but **partial** where it promises Zapier marketplace / POS as shipped.
- **Gaps:** Same POS/Zapier gaps as above; many Phase deliverables (marketing pages, lead magnets, nurture) *are* live.

---

### Needs attention — NOT IMPLEMENTED

#### `docs/DRIP_CAMPAIGNS_PLAN.md`
- **Documented:** Multi-step drip campaign product (workers, tables, POS drip phases); status says proposal.
- **Exists:** Single follow-up worker + growth nurture sequences — not multi-step drip tables/UI described in the plan.
- **Missing:** `dripStepWorker`, drip step schema/UI as specified in the plan. Campaign triggers remain `manual_batch` | `scheduled` (+ locked `pos_payment`).

#### `.agent/docs/ONBOARDING_2STEP_IMPLEMENTATION.md`
- **Documented:** Collapse onboarding to 2 steps.
- **Exists:** Still 5-step onboarding (`onboarding-types.ts`).
- **Missing:** 2-step flow never shipped; doc is an abandoned/unbuilt proposal.

#### `design-system/zyene-reviews/MASTER.md`
- **Documented:** Purple `#7C3AED` / Plus Jakarta Sans “Vibrant & Block-based” system.
- **Exists:** Live brand is warm/orange (see `docs/DESIGN.md`, `globals.css` primary around `#ff4f00`).
- **Missing:** MASTER tokens are not applied in the app. Treat as obsolete; do not drive UI from this file.

---

### Retained — process / ops / agent (do not delete)

These are accurate enough as *process* docs, or are checklists/templates that are the source of truth for ops—not redundant copies of application code.

| Path | Why retain |
|------|------------|
| `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` | Agent/engineer standards |
| `.claude/rules/project-standards.md`, `.windsurf/rules/project.md`, `.antigravity/rules.md`, `.cursor/rules/awesome-cursorrules.md` | IDE rule mirrors / index |
| `docs/INDEX.md` | Doc map |
| `docs/CODEBASE_STRUCTURE.md` | Placement rules |
| `docs/CRITICAL_FLOW_VERIFICATION.md` | Release gate (`pnpm verify:critical-flows`) |
| `docs/DESIGN.md`, `docs/DESIGN_UX_PHASES.md` | Design SoT / UX tracker (MASTER is wrong; DESIGN.md is right) |
| `docs/PRODUCTION_CHECKLIST.md` | Deploy checklist |
| `docs/GROWTH_OPERATIONS.md`, `docs/WELCOME_SEQUENCE.md`, `docs/LEAD_NURTURE_QA_RUNBOOK.md` | Ops / nurture (Inngest-backed sequences exist) |
| `docs/PHASE3_DISTRIBUTION_PACKAGE.md`, `docs/PHASE8_SALES_INBOUND.md` | Distribution / sales ops |
| `docs/TEMPLATE_PACK_LEAD_MAGNET.md`, `docs/LOCAL_SEO_CHECKLIST_LEAD_MAGNET.md` | Funnel measurement specs |
| `docs/competitor-watch-cursor-prompt.md` | Agent prompt; feature exists under `competitors/` + cron |
| All `docs/GEO_*.md` (14 files) | GEO ops/checklists/templates — owner workflows |
| `docs/GROWTH_BLUEPRINT.md` | Phased plan (keep; fix overclaims separately) |
| `.agent/docs/AGENTS.md` | Next.js agents-md index |
| `.agent/docs/GOOGLE_SYNC_TROUBLESHOOTING.md` | Ops for GBP API enablement |
| `content/repurpose/*.md` (5) | Distribution copy for live URLs |
| `reports/geo-weekly/*`, `reports/gsc/GSC_BASELINE_SUMMARY.md` | Generated/ops artifacts |
| `supabase/migrations/README.md` | Migration process |

---

## Ambiguous / could not treat as product-delete candidates

### Agent skill packs (334 files)
Paths under `.agents/skills/`, `.claude/skills/`, `.windsurf/skills/`, `.goose/skills/`, `.cursor/skills/`, `.agent/skills/`.

These document *how an agent should behave* (SEO audits, Vercel optimize, Impeccable, etc.), including template status tables with Pass/Fail markers. They are not claims about Zyene product APIs. Deleting them would break agent tooling. **Out of scope for FULLY IMPLEMENTED deletion.**

### Confidence notes
| Topic | Confidence | Why |
|-------|------------|-----|
| POS / TripAdvisor stubs | High | Read placeholder components and campaign trigger flags |
| No Edge runtime exports | High | Repo-wide search of `runtime =` in app routes |
| No Stripe Connect accounts | High | No Connect account APIs under `src/services/stripe/` |
| No SSO | High | No SAML/OIDC implementation found |
| Drip multi-step not shipped | High | Plan file + only follow-up/nurture workers found |
| Design MASTER obsolete | High | Token conflict with `globals.css` / `DESIGN.md` |
| Every GEO checklist item “done in the wild” | Medium | Ops docs; external posting/GSC state not fully verifiable from code alone |
| Historical `.agent/docs` line-level accuracy | Medium | Snapshots; some paths confirmed stale |

---

## Recommended follow-ups (not done in this audit)

1. Fix overclaims in `docs/PROJECT_DEEP_DIVE.md` and `docs/PLATFORM_FEATURES.md` (POS, Connect, Edge, Zapier, triggers).
2. Archive or banner `.agent/docs/*` historical onboarding/integration reports as “superseded”.
3. Delete or replace `design-system/zyene-reviews/MASTER.md` with a pointer to `docs/DESIGN.md` (separate cleanup; not deleted here because the file is NOT_IMPLEMENTED, and Step 4 says do not delete those).
4. Soften Zapier/SSO wording in `README.md` / enterprise/growth docs.

---

## Deleted files

*(empty)*


---

## Follow-up applied (2026-07-18, post-audit)

Documentation reconciliation continued after this report:

- Overclaim fixes: `PLATFORM_FEATURES`, `PROJECT_DEEP_DIVE`, `ENTERPRISE_SALES_DECK`, `GROWTH_BLUEPRINT`, design MASTER
- Roadmap consolidation: `docs/ROADMAP.md`; removed `DRIP_CAMPAIGNS_PLAN.md` and `ONBOARDING_2STEP_IMPLEMENTATION.md` stubs
- Archives moved to `docs/archive/` (`TECHNICAL_OVERVIEW`, `INTEGRATION_VERIFICATION`, `DATABASE_VALIDATION_REPORT`, `TEST_FLOWS`)
- Live onboarding SoT: `.agent/docs/ONBOARDING_FLOW.md` (5 steps)

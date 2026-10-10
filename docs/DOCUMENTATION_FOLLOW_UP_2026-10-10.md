# Documentation review and active follow-up — October 10, 2026

The owner approved the document-review plan for [PR #11](https://github.com/dikondaashish/Zyene_reviews/pull/11):
restore five useful references, retain ten historical records, correct conflicting
guidance, and commit/push/merge after verification. This review concerns documentation;
it does not attest current production data, credential revocation or paid-provider QA.

Evidence: the original archive commit `a7cb1acb`, baseline `7d45ba75`, actual
document contents and introducing Git commits, the [cleanup manifest](REPO_CLEANUP_MANIFEST_2026-10-10.json),
and the [cleanup record](DEEP_CODEBASE_AUDIT_REPORT.md). The first archive operation
moved 15 files. Five were restored following review; ten remain archived. The
additional preserved August deep-audit report is not one of those 15 moves.

## Document dispositions

| Document | Final location | Reason and current replacement |
|---|---|---|
| AUDIT_REPORT.md | `docs/archive/2026-07/AUDIT_REPORT.md` | July reconciliation history; current capabilities, architecture and proposed work are in [docs/PLATFORM_FEATURES.md](PLATFORM_FEATURES.md), [docs/PROJECT_DEEP_DIVE.md](PROJECT_DEEP_DIVE.md) and [docs/ROADMAP.md](ROADMAP.md). |
| CONTENT_AUDIT_REPORT.md | `CONTENT_AUDIT_REPORT.md` | Active unresolved content audit. Restoration includes a current finding reconciliation; see CONTENT-1 through CONTENT-3. |
| CODEBASE_STANDARDS_AUDIT_2026-08.md | `docs/archive/2026-08/CODEBASE_STANDARDS_AUDIT_2026-08.md` | Completed August engineering/security evidence. Current rules: [AGENTS.md](../AGENTS.md), [docs/CODEBASE_STRUCTURE.md](CODEBASE_STRUCTURE.md) and [supabase/migrations/README.md](../supabase/migrations/README.md); historical ledger drift remains DB-1. |
| COLOR_CONSISTENCY_AUDIT_2026-09-12.md | `docs/archive/2026-09/COLOR_CONSISTENCY_AUDIT_2026-09-12.md` | Earlier palette and completed fixes; [docs/DESIGN.md](DESIGN.md), [docs/dashboard-color-audit.md](dashboard-color-audit.md) and [PRODUCT.md](../PRODUCT.md) carry current decisions. |
| TYPOGRAPHY_SPACING_AUDIT_2026-09-12.md | `docs/archive/2026-09/TYPOGRAPHY_SPACING_AUDIT_2026-09-12.md` | Implemented typography pass; its enduring dashboard rules are in [docs/DESIGN.md](DESIGN.md). |
| AUTO_REPLY_BUYER_JOURNEY_AUDIT_2026-09-12.md | `docs/archive/2026-09/AUTO_REPLY_BUYER_JOURNEY_AUDIT_2026-09-12.md` | Major changes implemented; current setup is in [src/lib/content/help-articles-reviews.ts](../src/lib/content/help-articles-reviews.ts). Unconfirmed competitor scope remains COMP-1. |
| analytics-presentation.md | `docs/analytics-presentation.md` | Active explanation of chart meaning, missing-data treatment and presentation invariants. |
| pricing-presentation.md | `docs/archive/2026-09/pricing-presentation.md` | Historical implementation; [PRODUCT.md](../PRODUCT.md) preserves the approved daily-price hierarchy and [src/services/stripe/plan-catalog.ts](../src/services/stripe/plan-catalog.ts) owns current amounts. |
| app-ux-audit.md | `docs/app-ux-audit.md` | Active keyboard follow-up and owner-approved dashboard arrangement; DESIGN now agrees. |
| dashboard-loading.md | `docs/dashboard-loading.md` | Active loading integration reference; authenticated navigation evidence remains LOAD-1. |
| marketing-redesign.md | `docs/archive/2026-09/marketing-redesign.md` | Completed redesign history; [docs/DESIGN.md](DESIGN.md), [PRODUCT.md](../PRODUCT.md), [docs/marketing-component-licenses.md](marketing-component-licenses.md) and [docs/marketing-photography.md](marketing-photography.md) replace its operational guidance. |
| marketing-redesign-first-pass.md | `docs/archive/2026-09/marketing-redesign-first-pass.md` | Superseded first pass; [the second-pass record](archive/2026-09/marketing-redesign.md) remains historical, with current rules in [docs/DESIGN.md](DESIGN.md) and [PRODUCT.md](../PRODUCT.md). |
| widget-reference-analysis-2026-09-30.md | `docs/widget-reference-analysis-2026-09-30.md` | Active implementation/security reference. The widget guide now agrees with current aggregate-summary behavior; live generation remains WIDGET-1. |
| AEO_PHASE1_HANDOFF.md | `docs/archive/2026-08/AEO_PHASE1_HANDOFF.md` | Explicitly superseded by [docs/AEO_PHASE1_COMPLETION_2026-08-18.md](AEO_PHASE1_COMPLETION_2026-08-18.md); the August credential incident remains SEC-1. |
| AEO_PHASE1_STATE_2026-08-11.md | `docs/archive/2026-08/AEO_PHASE1_STATE_2026-08-11.md` | Old database counts/pending work superseded by [docs/AEO_PHASE1_COMPLETION_2026-08-18.md](AEO_PHASE1_COMPLETION_2026-08-18.md). [docs/GOOGLE_SEO_AEO_RELEASE_PLAN.md](GOOGLE_SEO_AEO_RELEASE_PLAN.md) retains product scope. |

## Open work and completion evidence

Owner labels below identify the responsible role, not a fabricated assignment or
completion date. Keep an item open until its stated evidence is recorded.

| ID | Owner | Current status and next action | Evidence needed to close |
|---|---|---|---|
| CONTENT-1 | Marketing + product | Open. `src/lib/industries/industry-data.ts` still contains “#1 source” assertions for auto repair, home services, fitness and plumbing. Review all current industry wording; source each claim or replace it with a supported workflow. | Reviewed source/measurement for retained factual claims, or approved copy change with affected pages listed. |
| CONTENT-2 | Product + engineering | Open reconciliation. The September audit claims a reply/Q&A prompt rewrite that the committed prompt definitions do not support. The compact dashboard reply prompt differs from REPLY_PROMPT. Trace callers, distinguish customer reviews from business replies/Q&A, and preserve the owner's explicitly recorded customer-review prompt reversal. | Current caller map and approved prompt requirements; tests for any later behavior change. Do not infer approval to reapply the reversed edit. |
| CONTENT-3 | Marketing | Open. Recheck remaining editorial statistics, integration claims and repetitive content from the original audit. How It Works figures and case-study metrics were addressed in source; this is not a declaration that every other numeric claim was verified. | Current page/content inventory, evidence links, disposition for each claim and an owner review. Follow GEO_PROOF_COLLECTION_RUNBOOK. |
| UX-1 | Engineering + design | Open. Review `src/app/(dashboard)/competitors/add-competitor-dialog.tsx` by keyboard. Accessibility roles are present; selection, dismissal and focus behavior have not been established by this review. | Controlled Arrow/Enter/Escape/Tab and screen-reader checks, including slow/empty/error results, plus regression evidence for confirmed fixes. |
| LOAD-1 | Engineering | Open. September loading checks used a temporary component page and an expired local auth session. Verify authenticated route navigation and background refresh without customer mutations. | Environment/commit, routes and outcomes for loading-to-content, preserved existing content, narrow screens, light/dark and reduced motion. |
| WIDGET-1 | Product + engineering | Open. Existing summary handler tests mock the model; a live billable generation was not performed. Plan any later smoke against an authorized isolated business with an explicit spend bound. | Target environment/business, budget approval, generated summary/public cache behavior, review-change invalidation and observed cost. No customer sends are needed. |
| COMP-1 | Marketing | Open. Podium automatic-reply plan/platform scope was left unconfirmed in the September buyer-journey audit. Other competitor price/feature claims also need their own dated evidence. | Official vendor source, date checked and supported scope attached to the current comparison; remove unsupported absolutes. |
| SEC-1 | Platform owner | Open. The August 11 AEO handoff records AEO_GEMINI_API_KEY disclosure. The September follow-up tracks exposed Google/provider credentials but does not explicitly identify this as the same incident. Match incidents privately before closing or rotating anything. | Private incident mapping and revocation/rotation confirmation for the correct exposed credential, preserving the confirmed production credential. Record metadata/confirmation, never the key. |
| DB-1 | Platform owner + engineering | Open. Historical repo/applied migration versions differ. Current CI validates files; it does not apply migrations. Reconcile the correct project's ledger and exact applied SQL before choosing a future migration process. | Read-only ledger comparison, compatibility/recovery plan, agreed application procedure and documented handling of existing drift without replaying applied SQL. |

Other security operational work remains in [SECURITY-FOLLOW-UP-2026-09-30.md](SECURITY-FOLLOW-UP-2026-09-30.md):
recovery access, disabled leaked-password protection, provider/monitor rotation,
historical billing reconciliation and incomplete independent security coverage.
Moving documents or passing CI does not close these items.

## Corrections completed in this documentation change

- Restored the five documents at their original locations, retaining their original
  dated contents and distinguishing current rules from historical checks.
- Corrected DESIGN's dashboard order to match the owner's recorded request and current source.
- Linked current analytics and loading rules from DESIGN.
- Corrected the widget guide's aggregate AI-summary description and documented optional autoplay.
- Corrected the migration guide's claim that CI applies migrations, and made ledger reconciliation explicit.
- Indexed the restored documents and this tracker; updated the final manifest and archive index.

## Verification scope

The prior investigation checked all 15 contents and Git moves: no substantive text
was removed; all 60 local Markdown-link targets existed; no tracked clickable link
still targeted the old locations.

The correction checks preserved all five restored document bodies, confirmed the
final ten/five manifest split, checked all 125 local links in the 18 affected
Markdown files, and found no tracked Markdown reference to a former archive
location of the restored five. `git diff --check` passed. `pnpm verify:fast`
passed in an exact-base temporary checkout with these documentation changes
overlaid and fresh frozen-lockfile dependencies. The workspace attempt was stopped
after dependency-file reads stalled; repository dependencies were not changed.
GitHub's full checks on the pushed commit are required before merge.

The original 103 cleanup deletions and their gross 23,702,013 bytes are unchanged.
No application, dependency, SQL migration body, credential or paid-provider behavior
is changed by this documentation revision. Local checks and exact-head GitHub CI
results must be reported separately from historical tests quoted in restored files.

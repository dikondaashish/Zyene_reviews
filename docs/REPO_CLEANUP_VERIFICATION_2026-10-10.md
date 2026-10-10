> Pre-execution verification snapshot, October 10, 2026. For implemented changes and final checks, see [the execution record](DEEP_CODEBASE_AUDIT_REPORT.md). Statements that no changes were made refer to this earlier verification stage.

# Independent verification of the quoted cleanup and admin audit

Date: October 10, 2026. Scope: every named cleanup candidate and the architecture/admin conclusions in the supplied text. This is a claim-verification audit, not a line-by-line security certification of the entire product.


Checkpoint: `7d45ba755ebccde5c6c10b274761645bff9d82be`. Repository resolves to `/Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews`. Initial tracked working tree was clean. Inventory: 4,062 tracked entries, including 2,457 under `src/`. No application files, tracked documentation, migrations, assets, or settings were changed or deleted. This report and its evidence are outside the repository.

## Decision

Do not execute the quoted deletion list as written. It includes the live logo, test dependencies, active security handoff evidence, an actively referenced design note, and an attribution document for a component still in use. Many source cleanup candidates are credible, but “zero imports” was incorrectly equated with “no use.” The broad app-health, zero-risk, and disk/clone savings claims were not established.

The admin answer is narrowly correct about the absence of a dedicated `/admin` UI. It misses an implemented support-developer access model that grants owner-level memberships across businesses. This is material to any discussion of platform administration.

## Verification method and limits

- Inventoried Git-tracked paths and byte sizes; inspected named local directories separately, including dotfiles.
- Searched tracked text, including hidden skills/configuration, source, tests, scripts and documentation. Checked filename stems, exported symbols, encoded URL variants, and literal import/export/require paths.
- Resolved literal local imports against relative paths and the `@/` alias. No inbound literal import/export/require references were found for the 25 named source files or ten duplicate files. This was a static extraction/resolution check, not a successful TypeScript AST graph: loading the installed TypeScript runtime failed with `ECANCELED`.
- Read candidate implementations and inspected runtime directory scans, current page composition, actual test consumers, and byte comparisons. Similar symbol names in other files are not imports of the candidate.
- Used installed Next.js documentation for `route.ts`, public assets and routing conventions. No production requests, paid provider calls, scanner launch, database writes, or cleanup scripts were run.
- Unit checks are recorded at the end. No full typecheck/build, live RLS verification, production deployment attestation, CDN access-log inspection, external backlink inventory, or historical Git pack measurement was completed. External consumers and database-stored URLs cannot be ruled out by repository search.
- Document age, missing index entries, and lack of imports are signals for review, not proof of worthlessness. Dated documents can preserve unresolved work, decisions, provenance and recovery instructions.

## Most consequential corrections

| Claim | Verdict | Evidence and action |
|---|---|---|
| `Main logo.png` is an unused source asset | **False; keep** | `src/lib/brand/logo.ts:2` uses `/Main%20logo.png`. Shared logo, marketing mockups, review-flow branding and structured data consume it. |
| `run-strix-akashml.sh` is an orphan, personal-named script | **False; keep** | `tests/unit/strix-docker-context.test.ts` reads and exercises it. The script configures `https://api.akashml.com/v1`; the name describes the configured provider, not evidence of a person's private file. |
| `create-security-audit-snapshot.mjs` only appears in stale docs | **False; keep** | Executed by `tests/unit/security-audit-snapshot.test.ts` and the Strix runner. Deleting it breaks tests and the sanitized scanner workflow. |
| `test-security-redis.mjs` only appears in stale docs | **False; keep** | The active secure-SaaS skill explicitly prescribes it for atomic allowance verification. |
| Security reports and saved verification SQL are stale deletions | **False deletion inference; keep** | Active skill references all four and identifies unfinished operational work. Historical evidence is not current production proof, but is still needed. |
| `marketing-component-licenses.md` only covers dead components | **False; keep** | It also carries attribution/license text for live `animated-background.tsx`, imported by marketing navigation. Remove obsolete usage descriptions only after corresponding code removal. |
| `dashboard-color-audit.md` is disposable | **False deletion inference; keep** | Referenced by `PRODUCT.md` and `docs/DESIGN.md`. |
| All blog covers are active | **False** | 22 old JPEGs have only an image-optimization CSV reference, no source references, and existing WebP counterparts. Combined size: 9,628,142 bytes. Review separately. |
| Eight duplicate files differ and two are identical | **False today** | Seven are byte-identical; only three API copies differ. |
| File-usage JSON covers only `src` | **False** | 529 entries span source, docs, scripts, public, migrations, tests, configuration and agent directories. It is incomplete/outdated, not a current authority. |
| No admin functionality exists inside the product | **Misleading** | No dedicated global admin console found, but tenant admin and default owner-level support-developer memberships are implemented. |
| `docs/INDEX.md` is an exhaustive deletion allowlist | **Unsupported** | It calls itself a central index and gives KEEP categories. It does not authorize deletion of unlisted docs. |


## 1. Local files and caches

These measurements are logical file bytes, not allocated disk blocks. Git does not track empty directories. Their absence from `git status` is normal. Cache cleanup is optional housekeeping, not an application fix.

| Path | Current state | Action |
|---|---|---|

| `tsconfig.tsbuildinfo` | 7,857,196 bytes (7.857 MB; 7.493 MiB); exists=True | Regenerable TypeScript cache; removal can slow the next typecheck. |

| `output` | 1,884,717 bytes (1.885 MB; 1.797 MiB); exists=True | 32 files: screenshots, fixture text, CSS and HTML. Preserve useful evidence; regeneration is not guaranteed. |

| `tmp` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `test-results 2` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `tests/fixtures/aeo-extraction 2` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `.codex` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `src/app/color-preview` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `src/app/sidebar-preview` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `src/app/ux-proof` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `src/app/widget-preview-check` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

| `src/app/loading-proof` | 0 bytes (0.000 MB; 0.000 MiB); exists=True | Empty now; optional rmdir after checking no active task needs it. |

Combined non-empty local candidates: 9,741,913 bytes (9.742 MB / 9.291 MiB). The quoted 7.5 MB cache was approximately 7.493 MiB; `output/` is now 1.885 MB / 1.797 MiB, not 1.6 MB.

`package.json` defines `clean` as `rm -rf .next .turbo node_modules/.cache *.tsbuildinfo tmp output`. Thus it removes more than the two named items, and it also removes `tmp`. It does not remove the duplicate fixture/result directories, `.codex`, or the empty preview directories. Do not describe this broad command as a zero-risk cleanup of screenshots. Prefer targeted cache removal and `rmdir` for verified empty directories. Empty directories reclaim negligible space.


## 2. Public assets

Public assets can be requested directly without any import. No source reference does not prove no external use. Nor does a file in `public/` automatically add its bytes to every page load. Repository/deployment footprint and browser transfer are separate metrics.

| File | Bytes | Verdict |
|---|---:|---|

| `public/Main logo.png` | 68,577 | KEEP: encoded URL is the canonical product logo. |

| `public/file.svg` | 391 | No source URL consumer found; review removal and external use. |

| `public/globe.svg` | 1,035 | No source URL consumer found; review removal and external use. |

| `public/icons.svg` | 1,269 | No source URL consumer found; review removal and external use. |

| `public/illustrations/zyene-five-mascot-3d.png` | 1,365,700 | No filename/URL references found; design exploration/archive candidate. |

| `public/illustrations/zyene-five-mascot-3d.prompt.txt` | 2,740 | No filename/URL references found; design exploration/archive candidate. |

| `public/illustrations/zyene-review-comet-3d-transparent.png` | 1,546,706 | No filename/URL references found; design exploration/archive candidate. |

| `public/illustrations/zyene-review-oracle-3d.png` | 1,821,358 | No filename/URL references found; design exploration/archive candidate. |

| `public/illustrations/zyene-review-orbit-guardian.png` | 1,876,413 | No filename/URL references found; design exploration/archive candidate. |

| `public/illustrations/zyene-ribbon-mascot-3d.png` | 1,040,253 | No filename/URL references found; design exploration/archive candidate. |

| `public/illustrations/zyene-ribbon-mascot-3d.prompt.txt` | 2,783 | No filename/URL references found; design exploration/archive candidate. |

| `public/images/blog/positive_review_reply.jpg` | 495,447 | No source URL consumer found; review removal and external use. |

| `public/marketing/home/customer-moment.webp` | 171,484 | No source URL consumer found; review removal and external use. |

| `public/marketing/home/local-owner-v2.webp` | 140,906 | No source consumer found; referenced by marketing-redesign-first-pass.md. |

| `public/marketing/interior/guidance-hero.webp` | 52,214 | No source consumer found; references occur in browser-audit.json, not only a photography inventory doc. |

| `public/marketing/interior/local-business-hero.webp` | 48,010 | No source consumer found; references occur in browser-audit.json, not only a photography inventory doc. |

| `public/marketing/interior/product-hero.webp` | 44,676 | No source consumer found; references occur in browser-audit.json, not only a photography inventory doc. |

| `public/next.svg` | 1,375 | No source URL consumer found; review removal and external use. |

| `public/vercel.svg` | 128 | No source URL consumer found; review removal and external use. |

| `public/widget-test.html` | 1,058 | Move to a test fixture or remove: public mock embeds localhost:3000/w/ashish-bar-grill. Historical docs reference it. |

| `public/window.svg` | 385 | No source URL consumer found; review removal and external use. |

The five starter SVGs are not referenced by app code, but several appear in old audit documents; “zero references anywhere” is inaccurate. The seven illustration files total 7,655,953 bytes (7.656 MB / 7.301 MiB). `zyene-five-mascot-3d.png` is byte-identical to the retained `public/brand/mascot/zyene-mascot-master-v1.png`; the deployed master must stay.

Keep the master and needs-help mascot images (live components consume them). Also keep the character sheet: it is explicitly the approved design reference in `docs/brand/zyene-mascot.md`, even though no app component imports it. This demonstrates why design assets need a different retention rule.

Keep `b72e9354a8674d819712a48dc7b06b52.txt`: the repository identifies it as the IndexNow verification key, a more precise description than generic domain verification. Keep the NFC card, all 12 NFC stand JPGs, the stand video and `google_review_link.jpg`; their live references are in the NFC catalog/components and blog image catalog.

`zyene-overview.pdf` is 23,736,932 bytes (23.737 MB / 22.637 MiB). Two source consumers are `home-lead-wizard.tsx` and `book-lead.ts`; additional historical docs mention it. Keep the URL functional. First investigate compression with legibility/link checks. A storage migration requires updating both delivery paths and preserving old links. It does not itself remove the old binary from Git history.


### Missed blog originals

All 22 files below have WebP counterparts and appear in `docs/seo-audit-2026-09-13/image-optimization.csv`; no current source reference was found. Do not delete all JPEGs: several newer JPEGs are live. Decide whether to retain these as original design assets outside `public/`, and check external URLs before removing public access.

| JPEG | Bytes |
|---|---:|

| `public/images/blog/covers/ai-review-reply-oversight.jpg` | 291,039 |

| `public/images/blog/covers/ai-visibility-audit.jpg` | 313,517 |

| `public/images/blog/covers/birdeye-alternatives-cost-comparison.jpg` | 303,909 |

| `public/images/blog/covers/delete-google-review-hero.jpg` | 741,432 |

| `public/images/blog/covers/dental-practice-reputation.jpg` | 253,044 |

| `public/images/blog/covers/fake-review-evidence.jpg` | 326,040 |

| `public/images/blog/covers/five-star-review-collection.jpg` | 781,316 |

| `public/images/blog/covers/google-business-profile-audit.jpg` | 327,379 |

| `public/images/blog/covers/google-review-policy-research.jpg` | 669,681 |

| `public/images/blog/covers/google-review-request-playbook.jpg` | 329,077 |

| `public/images/blog/covers/local-map-pack-visibility.jpg` | 360,748 |

| `public/images/blog/covers/online-reputation-business-impact.jpg` | 274,922 |

| `public/images/blog/covers/positive-google-review-response.jpg` | 305,119 |

| `public/images/blog/covers/private-feedback-service-recovery.jpg` | 298,638 |

| `public/images/blog/covers/reporting-google-review-laptop.jpg` | 647,414 |

| `public/images/blog/covers/reputation-dashboard-overview.jpg` | 703,983 |

| `public/images/blog/covers/responding-to-negative-review.jpg` | 762,507 |

| `public/images/blog/covers/responding-to-one-star-review.jpg` | 225,225 |

| `public/images/blog/covers/restaurant-review-management.jpg` | 375,726 |

| `public/images/blog/covers/review-software-pricing-comparison.jpg` | 265,071 |

| `public/images/blog/covers/team-review-management.jpg` | 760,645 |

| `public/images/blog/covers/why-google-reviews-matter.jpg` | 311,710 |

The 57 tracked files under `public/images/blog/covers/` split into these 22 without source filename references and 35 with source filename references. Dynamic catalog bases are used, so an exact full-path-only grep would be insufficient. Industry images also use a `${slug}.webp` fallback; they must not be bulk-deleted using filename counts.

## 3. All 25 source candidates

All 25 have zero inbound literal import/export/require edges in the completed local-path scan. Their exports were also searched. Non-import references, scanners, framework conventions and same-name symbols were examined. All remain included in TypeScript’s broad `**/*.ts` / `**/*.tsx` configuration even if absent from runtime bundles. This is a strong cleanup candidate list, not proof that deleting every file is behavior-neutral.

| File | Disposition | Other references |
|---|---|---|

| `src/app/(marketing)/about/about-hero-image-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/blog/blog-featured-post-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/case-studies/[slug]/case-studies-slug-quote-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/case-studies/case-studies-logo-bar-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/features/features-quick-feature-grid-section.tsx` | Not wholly unused: growth audit reads its text via directory scan. Check audit behavior first. | None by filename/stem |

| `src/app/(marketing)/partners/partners-agency-perks-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/partners/partners-channels-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/partners/partners-cta-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/partners/partners-logos-section.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/app/(marketing)/partners/partners-outreach-section.tsx` | Remove candidate after normal verification. | `docs/design-handoff-2026-09/PAGE_PLAN.md` |

| `src/components/dashboard/ai-insights-card.tsx` | Remove candidate after normal verification. | `docs/CODEBASE_STANDARDS_AUDIT_2026-08.md` |

| `src/components/dashboard/organization-display.tsx` | Remove candidate after normal verification. | `docs/CODEBASE_STANDARDS_AUDIT_2026-08.md`; `docs/FULL_FILE_USAGE_AUDIT.json` |

| `src/components/growth/growth-dashboard-stat-lead-cards.tsx` | Remove candidate after normal verification. | `docs/CODEBASE_STANDARDS_AUDIT_2026-08.md` |

| `src/components/integrations/webhook-card.tsx` | Remove candidate after normal verification. | `docs/CODEBASE_STANDARDS_AUDIT_2026-08.md`; `docs/FULL_FILE_USAGE_AUDIT.json` |

| `src/components/marketing/home-lead-wizard-persistence.ts` | Remove candidate after normal verification. | None by filename/stem |

| `src/components/marketing/marketing-tilt.tsx` | Unused component candidate; retain shared attribution doc. Tilt selector can be removed with tilt component. | `docs/marketing-component-licenses.md`; `src/app/(marketing)/marketing.css` |

| `src/components/marketing/transition-panel.tsx` | Unused component candidate; retain shared attribution doc. Tilt selector can be removed with tilt component. | `docs/marketing-component-licenses.md` |

| `src/components/settings/billing-plan-picker-backdrop.tsx` | Remove candidate after normal verification. | None by filename/stem |

| `src/components/settings/organization-name-form.tsx` | Remove candidate after normal verification. | `docs/CODEBASE_STANDARDS_AUDIT_2026-08.md`; `docs/FULL_FILE_USAGE_AUDIT.json` |

| `src/components/settings/profile-form.tsx` | Remove candidate after normal verification. | `docs/CODEBASE_STANDARDS_AUDIT_2026-08.md`; `docs/FULL_FILE_USAGE_AUDIT.json`; `docs/archive/TECHNICAL_OVERVIEW.md` |

| `src/components/ui/animated-number.tsx` | Unused custom-looking UI candidate; establish provenance under AGENTS no-edit rule before deletion. | `docs/FULL_FILE_USAGE_AUDIT.json` |

| `src/components/ui/pro-chart-container.tsx` | Unused custom-looking UI candidate; establish provenance under AGENTS no-edit rule before deletion. | `docs/FULL_FILE_USAGE_AUDIT.json` |

| `src/services/google/webhook-qa.ts` | Remove candidate after normal verification. | `docs/CODEBASE_STANDARDS_AUDIT_2026-08.md`; `docs/FULL_FILE_USAGE_AUDIT.json` |

| `src/services/review-requests/api/send-request-phone.ts` | Remove candidate after normal verification. | None by filename/stem |

| `src/types/member-context.ts` | Remove candidate after normal verification. | `docs/FULL_FILE_USAGE_AUDIT.json` |

`partners/page.tsx` delegates to `page-view.tsx`; that view renders the hero and inline content rather than the five old sections. The quoted redesign conclusion is supported.

`src/lib/growth/growth-blueprint-audit-read.ts:12–36` concatenates sibling section/data/content files regardless of imports. Current callers pass features, homepage and pricing pages. Among the 25 named candidates, only `features-quick-feature-grid-section.tsx` lies on those observed scan paths. The other nine old marketing sections match the scanner pattern but are not current inputs through these callers. The current feature checks look for `product-foundation` and `PlatformPillarsSection`; this candidate contains neither, so its removal is not shown to flip those specific checks. The broader audit design still risks counting unrendered code as page evidence.

`normalizePhone`, `MemberOrgContext`, `CustomerRecord` and `OrgWithPlan` have similarly named symbols elsewhere; the live files use other declarations/import paths, not these candidates. Do not remove those live declarations based on matching names.

The two `src/components/ui/` files look project-specific (Framer Motion number animation and a Recharts wrapper), but appearance is not a provenance check. Repository rules prohibit editing vendored primitives. Review their origin explicitly rather than treating this audit as an exception to that rule.

All 25 source files together are only 51,127 bytes. Their value is reduced maintenance noise, not a meaningful download-speed gain.


## 4. Ten tracked “ 2” copies

| Copy | Comparison with original |
|---|---|

| `src/app/(dashboard)/loading 2.tsx` | Byte-identical |

| `src/app/api/ai/analyze/route 2.ts` | Different; old implementation |

| `src/app/api/integrations/facebook/callback/route 2.ts` | Different; old implementation |

| `src/app/api/smart/analyze/route 2.ts` | Different; old implementation |

| `src/components/dashboard/customer-portal-loading 2.tsx` | Byte-identical |

| `src/components/dashboard/dashboard-loading 2.css` | Byte-identical |

| `src/components/dashboard/dashboard-skeleton 2.tsx` | Byte-identical |

| `src/components/dashboard/page-form-loading 2.tsx` | Byte-identical |

| `src/components/dashboard/panel-loading 2.tsx` | Byte-identical |

| `tests/unit/reviews-loading-state.test 2.ts` | Byte-identical |

Total: 13,205 bytes. Seven identical, three different. No incoming literal imports were found. `route 2.ts` and `loading 2.tsx` do not match the special Next.js route/loading filenames. However, the TypeScript include patterns still include these TS/TSX files. The duplicate test `reviews-loading-state.test 2.ts` does not match Vitest’s `tests/**/*.test.ts`, unlike the original.

Both AI API originals delegate to `handleReviewAnalysis`. The Facebook original is not just a thin shared-service wrapper: it validates user/state and integration permission and delegates OAuth completion. The old Facebook copy has materially different, obsolete state/token handling. Do not merge its logic back into the active route.

Git history shows the Facebook copy entered in `e098dbdb`; at least one loading copy entered in `46ad5111`. A filename suffix cannot establish that macOS or a particular merge created the copies. The active security handoff also says to investigate ownership of unexplained copies. Recommend removing identical copies first and reviewing the three differing API copies as a separate cleanup batch, preserving history.


## 5. Every named script

Package script wiring is not an exhaustive usage test. Direct invocation, tests, other scripts and active skills are valid consumers.

| Script | Verified consumers | Action |
|---|---|---|

| `scripts/audit-marketing-seo.mjs` | `CONTENT_AUDIT_REPORT.md` | Referenced by CONTENT_AUDIT_REPORT; read-only utility. Document or retire deliberately. |

| `scripts/collapse-tailwind-size-classes.mjs` | No other filename reference found | One-off source-rewriting codemod; credible archive/removal candidate. |

| `scripts/create-security-audit-snapshot.mjs` | `docs/SECURITY-FOLLOW-UP-2026-09-30.md`; `scripts/run-strix-akashml.sh`; `tests/unit/security-audit-snapshot.test.ts` | KEEP; operational/test consumer exists. |

| `scripts/prospecting/build_prospect_emails.py` | No other filename reference found | Owner workflow review. .gitignore mentions the prospecting directory, not this filename; that is not proof of current use. |

| `scripts/qa-lead-magnet-flow.mjs` | `docs/GEO_CLOSEOUT_STATUS.md`; `docs/GEO_OWNER_FINAL_ACTIONS.md`; `docs/GEO_OWNER_FINAL_CHECKLIST.md`; `docs/LEAD_NURTURE_QA_RUNBOOK.md` | KEEP; operational/test consumer exists. |

| `scripts/run-strix-akashml.sh` | `tests/unit/strix-docker-context.test.ts` | KEEP; operational/test consumer exists. |

| `scripts/security-billing-reconcile-readonly.mjs` | `docs/SECURITY-FOLLOW-UP-2026-09-30.md` | KEEP; operational/test consumer exists. |

| `scripts/seed-aeo-live-run.ts` | No other filename reference found | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

| `scripts/smoke-aeo-dispatch.ts` | `scripts/seed-aeo-live-run.ts` | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

| `scripts/test-analysis.ts` | `docs/FULL_FILE_USAGE_AUDIT.json` | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

| `scripts/test-security-redis.mjs` | `.agents/skills/secure-saas-change-workflow/references/zyene-reviews-context.md` | KEEP; operational/test consumer exists. |

| `scripts/verify-aeo-credentials.ts` | No other filename reference found | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

| `scripts/verify-answerability-live.ts` | No other filename reference found | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

| `scripts/verify-crawler-live.ts` | No other filename reference found | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

| `scripts/verify-fetch-cited-source-live.ts` | No other filename reference found | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

| `scripts/verify-template-pack-report-production.mjs` | No other filename reference found | Manual QA/ops utility; not package/CI-wired. Review capability and owner before retiring. |

The seed script refers to the smoke script, contradicting the claim that both have no references. The seed script can spend on live vendors and leave data; the smoke script writes/cleans real database fixtures; credential verification calls providers. They were inspected, not executed. Their absence from CI is sensible and does not establish obsolescence.

The GEO production/build validators are explicitly invoked in active GEO runbooks and share `scripts/lib/validate-geo-faq-core.mjs`. The standalone `validate-geo-faq-schema.mjs` has its own usage header; no other filename reference appeared in the focused scan. Keep runbook-backed validators; review the standalone older variant separately.


## 6. Documentation decisions

Do not treat “not indexed” as “delete.” `docs/INDEX.md` itself may need updating. A date is a checkpoint, not an expiration date. Keep linked operational dependencies and consolidate open tasks before archiving evidence.

| Document/group | Verified disposition |
|---|---|

| `AUDIT_REPORT.md` | Historical July audit; supports replacing/removing obsolete MASTER, but explicitly says it did not delete the docs. Archive candidate, not proof the whole report is junk. |

| `CONTENT_AUDIT_REPORT.md` | September content-audit evidence; references the SEO audit script. Review open findings, then archive if superseded. |

| `design-system/zyene-reviews/MASTER.md` | Obsolete design guidance per July audit; replace with a pointer to docs/DESIGN.md or retire after checking consumers. |

| `docs/SECURITY-REMEDIATION-2026-09-29.md` | KEEP: active secure-SaaS skill evidence. |

| `docs/SECURITY-DEPLOYMENT-2026-09-30.md` | KEEP historical rollout evidence; latest operational status is in FOLLOW-UP. |

| `docs/SECURITY-FOLLOW-UP-2026-09-30.md` | KEEP: active handoff with unresolved operational items. |

| `docs/security-readonly-verification-2026-09-29.sql` | KEEP: skill-linked reusable verification queries; not proof queries ran today. |

| `docs/dashboard-color-audit.md` | KEEP: PRODUCT.md and DESIGN.md references. |

| `docs/marketing-component-licenses.md` | KEEP: attribution/license text for live AnimatedBackground, as well as stale descriptions of two unused components. |

| `docs/developer-role-2026-09-30.md` | KEEP/update: describes implemented support designation, automatic grants, durable opt-outs and recovery. Historical deployment statements need a new attestation. |

| `docs/REVIEWS_WORKSPACE_IMPLEMENTATION_PLAN.md` | Planning document explicitly says implementation not started. Reconcile against current features before deciding what is obsolete. |

| `docs/SEO_BACKLINK_STRATEGY.md` | Forward 90-day execution plan, not merely audit debris. Reconcile unfinished work. |

| `docs/SEO_GROWTH_PLAN_2026-09-29.md` | Forward growth plan; review outstanding actions with owner before archive. |

| `docs/SEO_REMEDIATION_2026-09-13.md` | Historical release evidence; reconcile outdated local/deployed statements before archive. |

| `docs/GOOGLE_SEO_AEO_RELEASE_PLAN.md` | Large product plan with phase links; consolidate verified remaining work into roadmap before archive. |

| `docs/FULL_FILE_USAGE_AUDIT.json` | Retire as a current authority; 529 old entries, multiple directories, stale paths and misleading usage labels. Archive/regenerate with explicit method and date. |

| `docs/DEPENDENCY_AUDIT.json` | Retire as a current authority. It flags @types packages as unused candidates; lack of import is not a valid basis for deleting ambient type dependencies. |

| `PRODUCT.md` | KEEP: explicitly consumed by impeccable skill/loader. Not actually listed by name in INDEX. |

| Eight `AEO_*` documents | Phase/handoff/completion evidence. `AEO_PHASE1_HANDOFF.md` explicitly labels itself superseded and points to completion evidence. Archive superseded snapshots; preserve completion records and remaining plan links. |
| `COLOR_CONSISTENCY_AUDIT_2026-09-12`, `TYPOGRAPHY_SPACING_AUDIT_2026-09-12`, `AUTO_REPLY_BUYER_JOURNEY_AUDIT_2026-09-12`, `CODEBASE_STANDARDS_AUDIT_2026-08` | Dated audit records; consolidate active decisions/open tasks before archive. Absence from INDEX does not demonstrate all findings resolved. |
| `analytics-presentation.md`, `pricing-presentation.md`, `app-ux-audit.md`, `dashboard-loading.md` | Implementation and behavior notes; fold durable guidance into DESIGN/architecture docs, then archive redundant notes. |
| `ENTERPRISE_SALES_DECK.md`, `PHASE8_SALES_INBOUND.md` | Sales collateral and operational routing; human-use documents need not be imported. Review accuracy/ownership; do not auto-delete. |
| `marketing-redesign.md`, `marketing-redesign-first-pass.md` | Design decisions and verification history; consolidate current guidance, archive superseded history. |
| `widget-reference-analysis-2026-09-30.md` | Comparative design research; an owner retention decision, not compiler-dead code. |


| Directory | Tracked files | Bytes | Decision |
|---|---:|---:|---|

| `docs/design-handoff-2026-09/` | 39 | 5,607,399 | Separate plans/manifests from bulky screenshots/raw exports; archive by retention decision. |

| `docs/seo-audit-2026-09-29/` | 30 | 1,027,817 | Separate plans/manifests from bulky screenshots/raw exports; archive by retention decision. |

| `docs/seo-audit-2026-09-13/` | 3 | 81,634 | Separate plans/manifests from bulky screenshots/raw exports; archive by retention decision. |

| `docs/audits/` | 6 | 295,656 | Separate plans/manifests from bulky screenshots/raw exports; archive by retention decision. |

The handoff directory contains **39**, not 24, tracked files (5,607,399 bytes). It includes DESIGN_SPEC, PAGE_PLAN, TASKS and other planning material, not just screenshots. The September 29 SEO directory does contain 30 files, totaling 1,027,817 bytes. `docs/seo-audit-2026-13/` does not exist; the apparent intended directory is `docs/seo-audit-2026-09-13/`, with three CSVs totaling 81,634 bytes. `docs/audits/` has six tracked files totaling 295,656 bytes.

Moving files to `docs/archive/` within the same repository improves organization but saves no checked-out bytes. Deleting them in a normal commit reduces the current tree, not previous Git history. No exact clone/deploy savings should be promised from these file-size sums.

The INDEX-listed documents, skills, reports scaffolding, `content/repurpose/`, configurations and migrations are not blanket-certified as current or healthy by this audit. Their existence and intended purpose do not verify every statement, sync target, effective policy or deployment.


## 7. Administration: what the code actually implements


| Supplied claim | Finding |
|---|---|
| No `/admin` route or `superadmin` role | Supported for the inspected source/schema search. No dedicated global tenant-management or impersonation console found. |
| Customer dashboard is tenant scoped | Supported structurally. Layout authenticates via settings context; active business selection derives from the user’s accessible business set. This does not prove every API and RLS rule is secure. |
| Settings roles are owner/admin/manager/member | Incomplete: includes **viewer** and ORG_EMPLOYEE normalization too. |
| Only tenant owner can invite/manage team | Too narrow: owners/admins/managers can manage team; owner/admin can assign all invite roles, managers can invite manager/member. Billing settings require organization owner. |
| No internal support capability | Incorrect inference: developer-labelled owner/ORG_OWNER memberships are implemented. |
| `/growth` is secret gated and noindex | Supported. Cookie is **growth_dashboard_token**, not `growth-dashboard-auth`. Page shows a disabled message without configured secret; internal report APIs also accept bearer secret/token. |
| `/growth` cannot manage tenants/users | Its inspected UI/API surface is reporting/authentication, not a global tenant CRUD console. It accesses privileged KPI/lead reporting, so it still deserves protected ops treatment. |
| Supabase admin client is “admin in name only” | Only true regarding absence of a UI. It is a service-role client with real RLS-bypassing privileges, used by APIs/actions/jobs. |
| Platform administration happens only in provider dashboards | Not established from source and incomplete given the developer support model. Actual operator practice was not inspected. |
| Add a superadmin role and route group as the natural solution | Premature. First document and review the existing support grants; a route group is organization, not authorization. |

`supabase/migrations/20261001151611_default_business_developer.sql` provisions `ORG_OWNER` organization and `owner` business memberships with `role_label='developer'`. It includes business/owner provisioning triggers, one-time backfill, an internal configured identity table, and opt-out records. Its provisioning helper does not reactivate suspended memberships or overwrite an existing customer owner. Removal is organization-scoped through `delete_organization_developer`; the source includes protected designation checks and audit events. The accompanying developer document is therefore an important operational reference, not obviously disposable.

This establishes implemented behavior, not today's database state. Before designing a global admin panel, verify the deployed migration, current support memberships, trigger status, opt-outs, account recovery/MFA controls, and audit visibility. Decide what support operators should actually be able to do. A future console should use a distinct server-verified platform authorization policy, action-specific permissions and audit logging; tenant admin alone should not grant platform administration.

### Additional growth-auth findings from direct inspection

1. The auth endpoint parses JSON into a TypeScript annotation without runtime Zod validation. `{ "password": 123 }` reaches `password.trim()`; a `null` body reaches `body.password`. These shapes can cause an uncaught error rather than a structured 400. Repair with a bounded Zod object schema and structured error handling. This is an input-validation defect, not a demonstrated auth bypass.
2. The cookie carries a deterministic HMAC over a constant payload. Its seven-day browser `maxAge` is not a server-enforced token expiry: replay of a copied token remains valid while the secret is unchanged. Add server-validated expiry and a revocation strategy appropriate to this ops surface.
3. The endpoint is covered by the shared API limiter (which fails open on Redis errors); do not claim there is no rate limiting. Evaluate a dedicated login limiter and individual operator identity if this becomes a real administration surface.

These findings further invalidate an unconditional “the app is healthy” conclusion. No production attack or broad penetration test was performed.


## 8. Stack, tooling and methodology claims

- `package.json` confirms Next 16.3.8, React 19.2.8 and the named Supabase/Inngest/Stripe ecosystem. Installed package declaration is not a deployment attestation.
- CI configuration runs typecheck, color/size/migration guards, tests and build. Its presence does not prove the latest run passed.
- The quoted “four route groups” enumerates five surfaces; only parenthesized folders are Next.js route groups. `api`, `r/[slug]`, and `w/[slug]` are route paths.
- `.gitignore` supports intentional report/output workflows. A gitignore pattern proves ignore behavior, not ongoing utility of every script producing that output.
- The broken grep include pattern invalidates the original zero-reference counts. Corrected searches must also cover URL encoding, dynamic asset paths, runtime filesystem scans, tests, skills, typecheck inclusion and public direct URLs.
- The old JSON reports are evidence of past methodology, not reliable current reachability or dependency graphs.
- `dashboard-colors.css` stays: globals.css imports it and components use its attributes.
- OS duplicate origin and “all copies safe with no loss” require more than filename inspection. The three differing API copies deserve content/history review.

## 9. Recommended execution order

1. **Correct the cleanup manifest now.** Protect the live logo, brand references, tested security scripts, active security handoffs, developer-access documentation and shared license notice. Add evidence/disposition per path.
2. **Address growth-auth correctness separately.** Add JSON validation and behavioral malformed-input tests; add expiring session tokens and tests for expiry/replay/rotation. Run fast checks, relevant auth tests and build for API changes.
3. **Review support access before any admin-panel build.** Produce an owner-reviewed permission matrix and current read-only production attestation. Preserve historical evidence; track unresolved operational items separately.
4. **Small source cleanup batch.** Review the seven identical copies and three different API copies; remove unused modules with current page/source-scan dependencies understood. Preserve licenses and respect the UI primitive restriction. Run fast checks, relevant tests, required React/SEO checks, and a build where route/contract changes require it.
5. **Asset batch.** Prioritize unused illustration variants, unlinked starter files and the 22 JPEG originals. Preserve masters outside public deployment if needed; check external URLs/CDN requests and provide redirects where appropriate. Verify pages, image URLs, lead-magnet download and email links. Optimize the large PDF separately.
6. **Documentation batch.** Update INDEX to include real active references. Extract remaining AEO/security/SEO work into current trackers; archive snapshots with superseded notices and updated links. Separate human-owned source materials from truly regenerable raw exports.
7. **Operator-script inventory.** Give each manual tool an owner, purpose, safe environment, side effects and retirement status. Keep security regression tooling. Retire proven one-off codemods only after ownership review.
8. **Optional local housekeeping.** Remove caches or verified empty directories only as needed. Preserve current design-review evidence.

For an implemented cleanup, stage only its own files and follow the repository commit/push default. This request was for verification and a report, so no cleanup commit or push was made.

## 10. Size conclusions


- Original named public candidates excluding the live logo: 8,614,331 bytes (8.614 MB; 8.215 MiB), across 20 files. These remain conditional on public-link/design retention review.
- Additional old blog JPEG candidates: 9,628,142 bytes (9.628 MB; 9.182 MiB), 22 files.
- Named source and duplicate candidates: 64,332 bytes (0.064 MB; 0.061 MiB), 35 files; not all are behavior-neutral deletions.
- Four cited evidence directories at corrected paths: 7,012,506 bytes (7.013 MB; 6.688 MiB); retention decision, not approved junk.
- The quoted 14–15 MB / ~100-file estimate is not a verified safe-removal total. It mixes keep-required files, historical evidence and plausible candidates, while omitting 9.63 MB of JPEG originals.

## 11. Completed checks

- Git inventory, byte comparisons, literal-path import scan and whole-tracked-repository text-reference scan completed.
- `security-audit-snapshot.test.ts` and `strix-docker-context.test.ts`: **2 files, 6 tests passed** using explicit Node 22.14.0 after the initial runtime stalled.
- Growth auth, settings access, developer permissions/seats/API tests: **5 files, 30 tests passed**. Combined completed unit validation: **7 files, 36 tests passed**. These are focused existing regressions, not proof of live database state.
- TypeScript AST import analysis failed while loading the local TypeScript module (`ECANCELED`). Static literal-path resolution was used instead and is labelled accordingly.
- No deletion trial, full typecheck/build, live database verification or external-use verification was performed. This report does not claim those passed.

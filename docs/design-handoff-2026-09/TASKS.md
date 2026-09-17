# Implementation packets for smaller models

Execute one packet, or one named subpacket, per model task. Packet IDs are stable and appear in route-ledger.csv. This file is an implementation specification, not an instruction to execute the redesign during the planning handoff.

## Paste this launcher

```text
Implement packet [ID, including subpacket suffix when present] from
docs/design-handoff-2026-09/TASKS.md in the Zyene Reviews repository.
Read AGENTS.md, PRODUCT.md, the handoff README, DESIGN_SPEC, relevant
PAGE_PLAN and ASSETS sections, and VALIDATION before editing.
Inspect git status/diff; preserve all pre-existing work. Follow the packet's
dependencies and allowed file scope. Implement the concrete layout and states,
not a generic redesign. Preserve exact orange #ff4f00, homepage, dashboard,
customer portal, canonical URLs, real prices, backend behavior and claim limits.
No push/deploy, live booking, real messages, or real review publication.
Do not expand into another packet. If a shared dependency needs modification,
report the exact change and keep independently completable work moving.
Run the specified meaningful checks, capture desktop/mobile evidence, and
return changed files, verified behavior, remaining dependencies and check results.
```

All packets inherit the exact sizes, breakpoints, contrast treatment, motion, accessibility and file limits in DESIGN_SPEC. New file names below are proposals. Paths are relative to the repository root. An allowed directory does not authorize unrelated edits or backend changes. Extend tests only for the behavior in the packet; no new testing framework.

## Dependency and ownership rules

M00 → M01 → M02 → M03–M08 → M09 is the product chain. Directory/reading work can start after M01. M20 follows the finished English M19 template. M28 follows all completed packets.

The same file must have one writer at a time. M01 owns shared hero API/CSS. M02 owns the demo frame. M03–M08 own separate scene files and fixtures. M09 alone owns final feature registry wiring. M13 owns shared help article layout; its content batches follow sequentially. M14 owns shared article layout and must finish before M15 changes a reused reading component. Pricing, contact and demo packets are sequential if they share a CTA/form component. Never use parallel models to edit one giant file.

If an owner asset is absent, finish layout with a clearly documented existing illustration or omit optional media. Do not invent it. Review the first completed feature or Help page visually before applying the template everywhere.

## M00 — Establish the current baseline

Dependencies: none. Output only under `docs/design-handoff-2026-09/implementation-evidence/`.

Read the current diff and route ledgers. Record commit, existing uncommitted changes, date and preview URL. Capture `/`, `/help`, `/features/ai-replies`, `/pricing`, `/demo` at 1440 and 390. Record current primary CTAs and redirects. Rerun failed/pending browser audit URLs from AUDIT_FINDINGS before claiming complete visual coverage; use a stable preview if local compilation stalls.

Done: reproducible baseline manifest and screenshots; no source changes. This protects the user's already accepted work from being accidentally reverted.

## M01 — Scoped layout and typography foundations

Dependencies: M00. Allowed: `landing-hero.tsx`, `marketing-interior-hero.css`, narrowly scoped interior selectors in `marketing.css`, new `src/types/marketing-interior.ts`, and new `src/components/marketing/interior/{hero-media,directory-intro,reading-header}.tsx`. Existing component paths are under `src/components/marketing/`; CSS under `src/app/(marketing)/`.

Implement the six variants and explicit media union in DESIGN_SPEC. Preserve existing `image`/`visual` callers through a temporary compatibility adapter. Make `none` a compact single-column header. Keep server-renderable layout; eliminate style specificity conflicts only inside interior variants. Implement exact type/spacing tokens. No global font/header/dashboard restyling. Do not remove generic fallback until M09/M28 confirm all callers migrated.

Done: one existing interior route demonstrates each applicable variant without duplicating H1 or main; 320/390/768/1024/1440 screenshots show wrapping; homepage unchanged. Run fast checks and component-structure review. Report remaining legacy callers.

## M02 — Responsive demonstration frame

Dependencies: M01. Allowed: new `interior/feature-demo-frame.tsx`, scoped frame styles and narrowly required opt-in presentation props in existing demo leaves. Read existing `product-tour/tablet-demo.tsx` first.

Implement neutral tablet rim, accessible sample label, responsive content area and reset slot. Use CSS layout, not `transform: scale` to shrink desktop content. No forced device ratio that clips interactive panels. Mobile single-column scenes remain at >=14px body, 16px inputs. Existing homepage demo defaults stay unchanged.

Done: one real leaf scene fits at all widths, keyboard focus never clipped, reduced motion respected. No live dashboard container imported. Fast checks and visual comparison of homepage demo.

## M03–M08 — Six focused feature scenes

Dependencies: M02. Each is a separate assignment. Allowed: its new `src/components/marketing/interior/scenes/<name>.tsx`, focused helper/state modules, fictional fixture additions under `src/lib/marketing/`, and its behavioral tests. Read existing `product-tour/` and `feature-visual-data.ts`. Do not edit the shared registry; deliver the export and props to M09.

| ID / scene | Implement | Required evidence |
|---|---|---|
| M03 `monitoring-scene` | Three-review inbox, selected detail, rating/platform filters, clear filters, empty state; reuse existing review fixture | Selection and combined filters actually change list/details; reset restores state |
| M04 `ai-reply-scene` | Review, Friendly/Professional/Concise, editable sample draft, user-triggered typing, publish-in-demo/reset; reuse auto-reply example as separate clearly labeled section | Edits persist; reset cancels typing; enable/disable and threshold eligibility demonstrated; no real publish requests |
| M05 `request-scene` | SMS/email selector, editable sample request, customer preview, sample send feedback and reset | Both channels work; sample label; no network sends or selective positive-review routing |
| M06 `analytics-scene` | Range/platform controls, two or three readable metrics and trend, accessible text summary | Fixtures calculate consistent totals; keyboard/touch details; empty range handled |
| M07 `competitor-scene` | Own fictional business plus three competitors, selected comparison metric, accessible comparison table/chart | Values come from fixture; labels explain relative comparison; no invented rank guarantee |
| M08 `listing-scene` | Sample profile completeness and issue list, select issue for explanation, suggested next action | Read-only sample scope clear; action exposes useful detail; no fake live update or unsupported ranking claim |

Keep each scene focused on its own feature. For M04 reuse existing `automatic-reply-demo` and `use-auto-reply-demo` where possible. Expose a pure presentation API that M09 can compose; do not duplicate large demo engines. Test meaningful state transitions with existing test tools. Screenshot initial, changed and reduced-motion states at desktop/mobile. Keep components <=150 lines.

## M09 — Feature registry, six pages and feature overview

Dependencies: M03–M08. Allowed: `feature-visual-data.ts`, `feature-pillar-page.tsx`, new `interior/feature-scene.tsx`, focused feature content configuration, `src/app/(marketing)/features/` rendered sections. Catalog changes limited to page-specific explanatory copy with verified meaning.

Wire the six exports by actual pillar slug. Replace the shared generic supporting paragraph with specific capability/limitation copy per PAGE_PLAN. Overview has one demo, six destinations and clear next actions. Eliminate redundant mounted demos. Preserve aliases and AI/collection qualifiers. Prefer static explicit imports per route or deliberate on-demand loading; avoid eagerly mounting every scene.

Done: all six canonical pages and two aliases verified; correct scene per route; related links valid; homepage unchanged; no duplicate demo/H1. Run relevant demo/metadata tests and fast checks. List all remaining generic hero callers for later packets.

## M10 — How it works

Dependencies: M09. Allowed: rendered sections/data under `src/app/(marketing)/how-it-works/` and small presentation excerpts.

Replace generic hero media with compact intro and three stages from PAGE_PLAN. Use one relevant scene/excerpt per stage, semantic numbered order, related setup help links and a real next action. Use 4/8 desktop rows and stacked mobile; no scroll locking. No three full workspace instances.

Done: user can follow connection → request/reply → measurement; links land on matching help articles; one H1; screenshots and fast checks.

## M11 — Pricing decision layout

Dependencies: M01. Allowed: `src/components/marketing/pricing-client-*.tsx`, `pricing-price-display.tsx`, `pricing.module.css`; read-only authoritative `src/services/stripe/plan-catalog.ts`.

Remove pricing desk photo. Use compact intro, billing toggle and equal plan columns per PAGE_PLAN. Make the daily equivalent the large primary price; keep crossed-out and current monthly/annual charges small but clear. Preserve trial text, plan limits, discounts and checkout/signup destinations exactly as catalog dictates. Store approved display equivalents in the catalog and do not change Stripe billing logic.

Done: both intervals and every CTA checked against catalog, responsive stack, prices readable at mobile, plans appear promptly. Run existing pricing tests plus fast checks; no real checkout.

## M12 — Help hub with real local search

Dependencies: M01. Allowed: `/help` rendered hero/page-view, `help-hero-guide.tsx`, new focused help-search component/helper; `help-data.ts` read as source.

Put search into the support hero and popular tasks beside it. Pass only title/excerpt/category/canonical URL to the client. Implement trimmed case-insensitive matching, count, clear, no-result help and all-result access as specified. Do not build AI search or transmit bodies. Preserve all category navigation.

Done: search tests cover empty/match/no-match/case/clear; correct nested links; search visible before imagery on mobile; keyboard works. Fast checks and browser interaction evidence.

## M13 — Help reading layout and screenshots (run subpackets sequentially)

Dependencies: M12. Allowed: `help-category-view.tsx`, `help-article-view.tsx`, scoped reading styles, help content modules, proposed `/public/marketing/help/` assets. Preserve route handlers/redirects.

- **M13a:** Implement six category layouts and shared article header/TOC/reading width. Preserve body sections and 23 canonical/legacy mappings. Test longest title, table and mobile TOC.
- **M13b:** Add S01–S03 screenshots beside actual Google connection/first request/AI suggestion steps. Match slugs from content-inventory; safe capture protocol in ASSETS. If safe UI fixture unavailable, document pending asset with exact needed state.
- **M13c:** Add S04–S06 automatic reply/inbox/analytics screenshots. Verify labels match current UI and no private data. Review remaining articles for genuinely necessary action screenshots; do not invent a quota.

Done per subpacket: relevant article at 720px/mobile remains readable; actual instructions match screenshot; breadcrumbs/TOC/related links correct; legacy URLs resolve; fast checks and affected content tests.

## M14 — Editorial blog (run a then b)

Dependencies: M01. Allowed: `src/app/(marketing)/blog/` rendered sections, blog presentation components, existing cover mappings; no factual rewrites by default.

- **M14a:** Compact hub intro, one existing featured article component, existing filters/search, 3/2/1 grid. Remove generic notebook hero. Preserve newsletter capture.
- **M14b:** Apply reading layout to article template. Review all 17 real titles/covers, source captions, TOC, tables, authors/date/schema and related posts. Keep covers, URLs and claims. Add explanatory diagrams only if a passage requires one and its facts are verified.

Done: full article list reachable, no title truncation, every cover loads at suitable size, mobile tables scroll locally; existing search behavior and metadata preserved. Fast checks and affected blog tests.

## M15 — Resource library and usable templates

Dependencies: M14b. Allowed: resources rendered sections, `resource-imagery.ts`, specific resource content/presentation, E01 asset and copy helper.

Compact library with four guide destinations. Reading details expose existing useful output early. Generate/review E01 only for review-request-templates per ASSETS; reuse the other images. Template text stays selectable HTML; implement copy with success/failure feedback. Preserve existing delivery gates, consent, tracking and endpoints.

Done: all four guides and copy controls checked, actual download/email behavior retained with intercepted QA, no fake files/success. Fast checks and relevant content/helper tests.

## M16 — Tools directory

Dependencies: M01. Allowed: `/tools` page-view/rendered sections only.

Replace café hero with compact task directory. Show three real tool destinations, required input and a clearly sample output preview. Match actual capability, including template-based reply generation. Do not mount live tools or invent scores in the directory.

Done: all three links work, no decorative photo before tools, 390px layout readable; fast checks.

## M17 — Review link generator

Dependencies: M16. Allowed: presentation under `/tools/review-link-generator/`; backend read-only.

Move actual input/result ahead of supporting copy. Preserve place-search and generation contract. Implement/reuse clear loading/no-match/error/copy feedback; QR/download only where actually supported and encoding returned URL. Keep user input on errors.

Done: intercepted success/failure/empty search, copy uses returned URL, valid download if present, no live submission; fast checks and existing tool tests.

## M18 — Other tools (separate a and b)

Dependencies: M16. Allowed: each named tool's client/presentation files; API/services read-only unless a separate fix is justified and scoped.

- **M18a:** Reputation score checker: compact intro, input/result, truthful method and unavailable state. Preserve calculation. Zero is not missing data. Test intercepted responses.
- **M18b:** Response generator: input/editor/copy before explanation. Keep template-based description; do not imply actual AI comprehension. Verify generation failure prevents stale/empty optional bonus submission; fix locally only if reproduced and within existing client contract. Preserve consent/endpoints.

Done: every state in VALIDATION exercised without real sends; mobile input16px, results readable; existing tool tests and fast checks.

## M19 — English industries (three sequential assignments)

Dependencies: M01, M05 if reusing request example. Allowed: English industries rendered sections, `industry-imagery.ts`, focused fictional workflow display/data; do not rewrite substantive industry claims.

- **M19a:** Directory and shared detail template. One 4:3 sector photo in hero; remove lower duplicate in favor of workflow. Implement restaurants as the reference.
- **M19b:** Apply/review dental, auto-repair, salons, home-services. Match each workflow and crop to PAGE_PLAN. No public medical details.
- **M19c:** Apply/review medical, hotels, fitness; then verify all eight and hub. Asset replacements require ASSETS justification.

Done: industry-specific examples, one relevant hero photo, all8 links/slugs preserved, all crops at mobile/desktop, no unsupported integration promises. Fast checks and catalog tests.

## M20 — Spanish parity

Dependencies: M19c. Allowed: `es/industries/` presentation and `localized-industries.ts` localized UI copy.

Reuse English layout/photo mapping while preserving Spanish slugs, original meaning and hreflang. Localize all added buttons, captions, sample messages and states. Run as M20a hub + restaurantes/dental/servicios-hogar/salones, then M20b remaining4 + full locale audit. Do not let typography shrink to fit translated labels.

Done: all9 Spanish URLs checked against locale inventory, no accidental English defaults, longest text fits390px, alternates unchanged; fast checks and relevant localization tests.

## M21 — Integration capability directory

Dependencies: M01. Allowed: integrations rendered sections/status-filter component. Existing capability catalogs are authoritative.

Compact intro and useful connection filter. Show Sync/Publish/DIY webhook/Early access/Coming soon labels per actual implementation. Reuse provider logos. Do not introduce fake connect buttons. Preserve Google vs Facebook/Yelp distinction, DIY webhook qualification and Square status.

Done: filter results and all statuses correct; coming-soon item visibly unavailable; links work; no stock team hero; fast checks and filter behavior tests.

## M22 — Balanced comparison pages

Dependencies: M01. Allowed: compare presentation/sections; competitor data read-only unless separately sourced factual update.

M22a handles hub/shared matrix and Birdeye detail. M22b reviews Podium/NiceJob/GatherUp/Prosperly through that template. Put decision information before imagery; no generic hero photo. Add visible labels, mobile local scroll/details and source/checked-date presentation where existing evidence supports it. Never invent a checked date.

Done: all5 detail URLs and hub; no unsupported competitor claims, full table accessible on mobile, source links preserved; fast checks and comparison tests.

## M23 — Illustrative workflows

Dependencies: M01 and relevant feature scenes. Allowed: case-study presentation and explicitly illustrative sample blocks; preserve claims/disclaimers.

M23a handles hub/shared detail and one example; M23b reviews other4. Keep composite/illustrative disclaimer beside titles and on cards. Reframe sequence as context → workflow → sample messages → what to measure. Preserve historical slugs. Never present fictional numbers/photos as customer proof.

Done: all6 URLs reviewed, disclaimer visible before claimed results, samples labeled, related feature links work; fast checks/content tests.

## M24 — Company and audience pages (one subpacket per task)

Dependencies: M01. Allowed: only named route's rendered sections per assignment.

- **M24a /about:** Clear company/product context, working principles, actual contact. Owner photo optional; existing stock illustrative. No invented team/timeline.
- **M24b /agencies:** Available branding/service capabilities first, roadmap/waitlist distinctly future. Preserve agency form/plan sources.
- **M24c /enterprise:** Explain verified scope and inquiry path; preserve lead form and catalog. No invented roles/features in architecture illustration.
- **M24d /partners:** Three existing partner paths, inquiry guidance and contact; do not revive unused outreach/ad-playbook sections.

Done each: claims trace to actual source, real next action, desktop/mobile screenshot, forms intercepted if tested, fast checks. Shared components are changed sequentially.

## M25 — Contact and booking (separate a and b)

Dependencies: M01. Allowed: named route's rendered sections; existing calendar/appointment component only for required presentation/fallback fixes.

- **M25a /contact:** Put intent and actual form in first conversion section. Remove competing second hero/photo. Preserve validation, consent, honeypot and endpoint; no promised response time without evidence.
- **M25b /demo:** Agenda left, configured calendar right; alternate request clearly below. Preserve existing Cal.com destination and header overlay behavior. Add direct booking/email fallback on embed failure. Avoid duplicate active embeds.

Done: inputs, errors, intercepted success and embed failure checked; mobile form appears early; Escape/focus handling intact. Do not submit a live booking/contact. Fast checks and relevant dialog/form tests.

## M26 — Trust and policies (separate a and b)

Dependencies: M01. Allowed: security/terms/privacy/data-retention presentation only; legal/security substantive text protected.

- **M26a:** Security compact reading/evidence composition; preserve SOC2 readiness qualification; no invented seals. Architecture diagram only from verified implementation.
- **M26b:** Three policies: scoped heading/reading scale and useful TOC, exact legal text unchanged. Record runtime-generated updated-date concern for owner/legal decision; don't invent revision dates.

Done: four URLs readable on mobile, headings ordered, legal diff limited to presentation, no new claims; fast checks.

## M27 — Documentation readability

Dependencies: M01 reading decisions, not marketing shell imports. Allowed: docs presentation/components and scoped docs styles; API examples/config read-only.

M27a handles docs landing/reading shell/mobile navigation; M27b inspects all10 child definitions and host-level forwarding, code overflow/copy and suitable screenshot placement. Keep DocNavbar/Sidebar/Toc behavior; no lifestyle hero and no marketing container forced onto docs.

Done: all11 definitions resolve as expected; mobile browse/TOC accessible, code copy exact, no secrets in images/examples; fast checks and affected docs tests.

## M28 — Assemble and verify

Dependencies: completed packets. Allowed: focused integration corrections, scoped styles, tests and evidence. No unrelated redesign.

Inventory every LandingHero caller and remove transitional generic fallback only after intentional variants/media are supplied. Verify all route-ledger rows and protected-source regression. Perform the full VALIDATION matrix and record results, including not-applicable/pending states. Inspect all generated assets and crop variants. Run required repository checks appropriate to actual changes, a stable preview performance comparison and representative full keyboard flows.

Done: `implementation-results.md`, route evidence and checks, no orphan/duplicate demos or unexpected global style drift. Summarize remaining owner assets or external evidence separately. No deployment is authorized by this packet.

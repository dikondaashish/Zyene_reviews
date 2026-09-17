# Page-by-page plan

Read DESIGN_SPEC.md for numeric values. “Current” below means inspected source/current local preview; “Target” is planned. Do not interpret proposed copy as permission to change product claims without checking the cited catalog. The individual canonical URLs, including all dynamic pages, are in `route-ledger.csv`.

## A. Product and buying pages

### /features — M09

Current: café hero, followed by a full ProductShowcase, feature pillar list, integrations, CTA. The product is present, but it arrives after lifestyle imagery.

Target order: product hero (H1/lead/Start free trial + Try the demo) → one functional overview demo with six feature selectors → three concrete outcomes → available integration strip → pricing link/closing CTA. Keep a single demo instance; link the secondary CTA to its stable ID. If the overview scene needs >640px width, place it below a compact intro rather than squeezing it into a half-column.

Use existing `features/page-view.tsx`, `features-hero-section.tsx`, `features-feature-pillars-section.tsx`, `product-tour/product-showcase.tsx`. Preserve six feature destination links. Remove duplicate full demos only after parity is demonstrated. No new photo required.

### /features/[pillar] — M03–M09

Current: shared `feature-pillar-page.tsx`; four pillars already use ProductTour, selected by `feature-visual-data.ts`, while competitor/local SEO use photographs. Every pillar shares a generic supporting paragraph and lifestyle section. AI replies already has AutomaticRepliesFeature; collection has a private feedback explanation.

Target common order: focused product hero → one outcome explanation with 3 concrete capabilities → workflow/limitations → related feature/help links → one closing action. Each scene is relevant to the named feature, not the same three-tab workspace repeated unchanged.

| URL | Hero scene and meaningful action | Supporting section to add/refine | Required safety/accuracy |
|---|---|---|---|
| /features/review-monitoring | Inbox with 3 reviews, platform/rating filters and selected review details | Explain which connected sources sync and where replies publish | Filtering changes actual fictional results; empty state; no live sync action |
| /features/ai-replies | Selected review, 3 tones, editable draft, generate/typing, publish-in-demo/reset | Separate manual AI drafting from automatic publishing; reuse existing auto-reply panel | New unanswered Google reviews only; selected business; threshold; tones; toggle-off cancels pending demo; sample label |
| /features/review-collection | SMS/email selector, editable fictional request, sample customer preview | After-visit request → optional reminder → feedback destination | No real send; eligibility/consent wording retained; no review gating; public/private options represented fairly |
| /features/analytics | Date range + platform filters, review trend and sample response rate | Explain what the metric means and what to do next | Totals/charts computed from same fixture; keyboard/touch equivalent; no guaranteed uplift |
| /features/competitor-tracking | Fictional own business plus 3 competitors, compare metric/date range | What to monitor, limitations, link to analytics/local visibility | Fictional names; no fake local rank claim; changes driven by fixture, not random numbers |
| /features/local-seo | Profile completeness checklist + sample finding/details | Resolve a listing issue → verify change; distinguish observed metrics from estimates | No invented live map rankings or promise to rank first; do not depict unverified capabilities |

Reference real UI in `src/components/reviews/`, `src/components/analytics/`, `src/app/(dashboard)/competitors/`, `src/app/(dashboard)/google-seo-aeo/` and `src/components/google-seo-aeo/`. Reference only; importing live containers is prohibited. Registry wiring is M09 to avoid six models editing the same file.

### /how-it-works — M10

Current: generic scene hero; existing steps use actual demo components and photography. Target: compact product intro, then three numbered stages: Connect your profile → Invite and respond → Review your progress. Each stage has one screenshot or reusable demo excerpt, 2–3 lines of copy and a relevant help link. At >=1024 use three vertical rows with 4-column text/8-column visual; on mobile normal stacked rows. Do not introduce scroll locking or pinned 300vh storytelling on a setup explanation.

Use `how-it-works-steps-section.tsx`, `how-it-works-data.ts`, proof-points section. Reuse M03–M08 scenes where useful; do not mount the whole interactive workspace three times. No new lifestyle images.

### /pricing — M11

Current: compact intro with monthly/yearly control, plan cards, location scale, comparison, illustrative workflow grid, FAQ, closing CTA. Keep plan cards immediately visible. The daily equivalent is the dominant display price; crossed-out and current monthly/annual charges are small supporting billing details. Label the daily figure as an estimate and keep the billed amount clear.

Three equal columns >=1024, stacked below 1024. Same plan-card section ordering: plan/use case → daily equivalent with supporting billed amount → limits → CTA → included features. Do not make a carousel. Retain real catalog data and existing `PricingClient*` components. Show location/request limits from the authoritative plan catalog, never duplicate prices in image/copy. FAQ explains trial, billing and cancellation accurately. Preserve interval switching and signup URLs. Optional desktop sticky comparison label is secondary, not required.

### /compare and all five /compare/[competitor] — M22

Current: general scene in hero, comparison cards/matrices and detailed feature tables. Target hub: compact intro → choosing criteria → comparison links → matrix. Details: title/summary → short “best fit” explanation for each option → quick table → sourced detailed comparison → related links/CTA. No generic photo. Tables have visible text labels for yes/no/limited, mobile row details or locally scrollable table with cue; avoid page overflow.

Five slugs: birdeye, podium, nicejob, gatherup, prosperly. Read `src/lib/comparisons/competitor-data.ts` and imported data. Preserve balanced tradeoffs; any updated competitor price or capability needs fresh primary-source evidence and a visible checked date. A visual-only packet must not silently “refresh” prices. Keep rich summaries and metadata. Compact H1 scale, not a 500px photo hero before the answer.

## B. Industries and audience pages

### /industries — M19

Current: home-services photo hero plus industry directory; eight mapped industries. Target: compact directory intro and 8 photo links with real sector names. Desktop 4 columns, tablet 2, mobile 1; each image 4:3, each linked region >=44px, full name wraps. Existing approved photos from `src/lib/industries/industry-imagery.ts` are the first choice. No huge generic hero above a second photo grid.

### /industries/[industry] — M19

Keep one industry-specific photo in the hero, but replace the repeated reuse of that same photo lower down with a **sector-specific request/reply example**. Order: story hero → 3 real sector pain points → request/reply workflow → illustrative scenario → plan link → closing CTA. Never imply the person pictured is a customer.

| Industry | Photo subject | Fictional workflow detail |
|---|---|---|
| restaurants | Staff/customer service or dining scene | Post-visit request; queue/service-time review reply |
| dental | Reception or consultation with permission/context | Neutral appointment follow-up; no treatment/health details in public replies |
| auto-repair | Technician/service desk | Follow-up after completed service; clear communication example |
| salons | Stylist/client service | Request after appointment; personal but non-sensitive reply |
| home-services | Tradesperson and completed work context | Request after job completion, not an unverified estimate |
| medical | Reception/practice environment | General experience request; do not reveal patient relationship or medical facts |
| hotels | Reception/guest interaction | Post-stay feedback; service-recovery example |
| fitness | Coach/member environment | Request after a genuine visit/milestone, no promised health results |

Content source: `src/lib/industries/industry-data.ts`; layout sections in the dynamic industry folder. The workflow is illustrative, not a new integration promise. If an existing photo is technically adequate, reuse it. See the asset review criteria rather than automatically generating eight replacements.

### /es/industries and its eight localized URLs — M20

Current: separate Spanish implementation with lighter content, not full English visual parity; default scene can inherit English caption text. Target: same structure, component sizes and industry photo mapping as English; Spanish copy remains in the locale data. Read `localized-industries.ts`, preserve localized slugs and hreflang/alternates. Allow approximately 30% text expansion; test longest labels. No English captions, action labels or sample responses inside localized scenes. No mechanical translation of policy-sensitive claims.

### /agencies and /enterprise — M24

Current: shared team image, branding/plan sections, agency roadmap/waitlist or enterprise lead form. Target: audience-specific hero → deliverables available today → limits/rollout expectations → relevant plan or inquiry form. An agency fictional client/location summary may be shown only if it is clearly a conceptual workflow and existing capabilities support it. Keep `AGENCY_DASHBOARD_ROADMAP` clearly future/waitlist; do not dress it as a live agency dashboard. Enterprise hierarchy diagrams are accessible HTML lists, not an unverified permissions feature demo. Retain configured forms, plan sources and supported claims.

### /partners — M24

Current: general hero and three partner types with email CTA. Target: compact intro → three clearly differentiated partner paths → what to include in inquiry → contact action. Do not revive unused sections (`partners-outreach-section.tsx`, ad acquisition playbooks, etc.) simply because they exist on disk. Page-view imports define rendered scope. No invented commissions, partner logos, eligibility, or channel terms. No new image required.

## C. Learn and support

### /help — M12

Current: revised hero with three working guide shortcuts, then all article listings by category. No search. Target: support intro containing **search**, popular setup tasks, then categories and a support contact. Keep hero photography optional and secondary; the search and tasks must appear first on mobile.

Search indexes only title, excerpt, category and canonical path from `HELP_ARTICLES`; do not send entire article bodies to the browser. Case-insensitive matching with trimmed query; update visible result list, count and clear button. At empty query show the 3 existing popular tasks. At no results show the query, “Browse all help topics” and email support. Use normal search input + results list rather than an ARIA combobox unless full combobox behavior is implemented. 56px desktop/52px mobile input, max 600px width; at most 6 initial results with link to full visible list. Data is local, no API/new AI search.

### /help/[category] — M13

Six categories from the existing catalog. Compact reading header, category description, 4 or fewer current article entries as an ordered list with title/excerpt/read time. Keep breadcrumbs and a visible Help link. Avoid more stock photography. Preserve descriptions and canonical article links. Add search return link if the user arrived from the help search.

### /help/[category]/[article] — M13

23 current articles, legacy flat URLs continue redirecting. Target: breadcrumb/title/short summary/read time → prerequisites where relevant → numbered instructions with UI screenshots exactly at the relevant step → troubleshooting → related articles and support. Reading width 720; TOC 240 on desktop and collapsed on mobile. Existing `ContentRenderer` supports image sections, use it.

First screenshot batch: connecting Google, sending first request, using AI suggestions, automatic Google reply settings, reading inbox, analytics dashboard. These correspond to actual current article slugs; keep the legacy auto-commenter URL even though user-facing labels say automatic replies. Use fictional data and redact all identities/tokens. Screenshot captions describe the action, not just “Screenshot 1.” Remaining text-only articles get screenshots only if they explain an actual UI action; billing/policy explanations do not need decorative pictures.

### /blog — M14

Current: generic notebook hero, existing search/category catalog, newsletter; a separate featured-post component exists but is not rendered by the current page view. Target: compact journal intro → one featured current article (7 columns image + 5 title/excerpt/read time, whole CTA is a real article link) → existing search/categories → post grid → newsletter. Reuse the existing featured component where it fits. Do not add another large stock photo above article images. Grid: 3/2/1 columns; 16:10 covers; 24px gaps; cards no fixed title truncation that hides meaning.

### /blog/[slug] — M14

17 current posts already have concept-specific covers in BLOG_IMAGES. Reuse the individual post cover near the title when relevant, 16:9 up to 960px wide; no site-wide notebook image behind titles. Preserve author/date/Article schema, linked TOC, summaries, body tables and related posts. Add diagrams/screenshots only at passages that need explanation; 0–2 per article is a maximum guideline, not a quota. Keep dated competitor/ranking assertions out of visual-copy rewrites unless freshly verified. No title/slug changes for aesthetic reasons.

### /resources and /resources/[guide] — M15

Hub: compact library intro → one highlighted useful guide → 4 resource links with type/read time → links to shorter blog content. Reuse existing resource cover mapping for 3 guides; replace the unrelated café-service cover for `review-request-templates` with a purpose-built template cover. Detail: compact title/meta, downloadable asset or usable template near the opening, TOC, body, 1 relevant workflow diagram, related guides. Preserve existing newsletter/download gates, analytics and UTM capture; do not create fake download buttons.

Four guides: google-reviews-guide, negative-review-templates, local-seo-checklist, review-request-templates. For the two template guides, examples must be selectable real text, with a copy control and success/failure state; never bake template wording into generated artwork. Check existing delivery behavior before moving forms.

## D. Utility and conversion

### /tools — M16

Current: café image hero and three tool links. Target: compact “Free review tools” intro → three task entries (“Create a review link”, “Draft a template reply”, “Check your reputation score”) with a small actual output example. No photo. Each entry names what input is needed and what the output does. Link to real tools; do not embed three running tools on the hub.

### /tools/review-link-generator — M17

Compact title → business selection/input → generated link/copy + valid QR/download if currently supported → short instructions/FAQ. Put the functional form before long SEO copy. Keep actual place search and existing request contract, loading/no-match/error states. Only show a QR code encoding the generated link, not a generated decorative QR. Never display a sample as the user's actual link.

### /tools/reputation-score-checker — M18

Compact title → business/input form → results with method/source/context → practical next steps → explanatory copy. Distinguish unavailable data from a zero score. Preserve calculation/service; no invented metric to fill an empty result. Input and result columns >=1024, stacked below. Do not promise a Google/AI ranking score. Display the existing method truthfully.

### /tools/review-response-generator — M18

Current copy correctly says template-based: the tool does not understand review meaning. Maintain that distinction. Form (rating, business name, review text where currently accepted) → generated editable template → copy → optional email bonus → supporting explanation. Preserve real API and error behavior. Do not add AI-typing animation that implies a model is analyzing input when this endpoint selects templates. If generation fails, do not attempt the bonus-send with stale/empty output. That existing flow needs focused behavior verification, not an assumed bug fix.

### /integrations — M21

Current: team photo hero; available/coming soon/developer sections already distinguish capability. Target: compact intro → connection finder/category filters → detailed supported connections → developer example → roadmap section. Use actual provider logos. Each item states Sync, Publish, DIY webhook, Early access or Coming soon; never treat favicon presence as integration status.

Google supports sync/publishing and optional automatic replies; Facebook/Yelp are sync-only and responses stay on those platforms; generic inbound webhook is DIY/Zapier-compatible, not a Zapier marketplace app; Square has its own early-access qualification. Preserve the complete live/soon data and its qualifiers. An optional three-node semantic HTML diagram shows source event → Zyene request → customer feedback, with its status text. No decorative connection graph that suggests every logo has native OAuth.

### /contact — M25

Current: a generic hero precedes a second team photograph and the actual form. Target: one compact conversion hero with “Sales / Product support / Partnerships” intent links and real contact form in the right column. On mobile form follows a <=100px intro; supporting photo is below or removed. Keep endpoint, consent, honeypot and validation. Set expectations only from verified support policy; no invented instant replies, fake staff avatars, or unsupplied phone number.

### /demo — M25

Current: generic hero, followed by calendar and alternate request form. Target: short outcome/agenda on left and booking calendar on right in the first main section. Agenda: your workflow → relevant product walkthrough → questions/next steps, without invented duration unless event config confirms it. Alternate request form sits below with a clear label. Preserve Cal.com URL/config; header appointment overlay stays behaviorally consistent. Embed failure has a direct booking link and email option. Do not load a second embed when an overlay already owns the same active interaction; do not submit a booking during QA.

## E. Evidence, company and trust

### /case-studies and five /case-studies/[slug] — M23

These are **illustrative/composite workflows**, not verified named customer wins. Keep the exact disclaimer visible near the title and on listing cards. Do not relabel generated photos as customer portraits or turn fictional numbers into testimonials. Hub shows an industry label, workflow challenge and “Explore workflow”; details show context → steps → example messages/screens → what to measure → related feature CTA. Existing industry images can support context. New screenshots use fictional data and no claimed uplift. Preserve canonical historical slugs even when displayed labels are clearer.

### /about — M24

Current: existing team image and text-heavy mission/values sections. Target: who the company helps → actual product/business context → concise working principles → company contact. Use real founder/team photo only when owner supplies it with names/roles/permission. Existing stock must be captioned as illustrative or replaced with a verified product photo; never caption it “our team.” Owner assets are optional and must not block layout work. No fabricated founding timeline, headcount, customer count or story.

### /security, /privacy, /terms, /data-retention — M26

Compact reading header, neutral background and useful TOC. Security can use a simple diagram of customer → application → protected storage if reviewed against actual architecture; no fake certification seals. Group security content by the buyer's question (data handling, access, integrations, reporting a concern). Preserve qualification around SOC 2 readiness; it is not certification. Legal pages retain exact legal content unless separately approved; this design task can move headings and layout without rewriting obligations. Current `new Date()` “Last Updated” labels must not be changed to invented revision dates; flag owner-supplied substantive dates as a content dependency. Remove giant marketing-scale H1 inheritance through the scoped reading variant. No photography budget.

### /docs and all ten child documentation pages — M27

Separate docs shell, not the marketing layout. Keep DocNavbar, DocSidebar, DocToc, copy controls and API host configuration. Improve task-based landing links (quickstart/API/cookbook), reading width, mobile browse affordance and code overflow. Add 1–2 verified setup screenshots where useful, no lifestyle hero. Child routes: api, changelog, content-types, cookbook, graph, how-it-works, install, plugins, quickstart, sync. All eleven currently have page implementations. Preserve any host-level forwarding (the app subdomain forwards docs to the marketing host); do not invent duplicate docs URLs. Code blocks scroll locally; copy must use the real visible example. Never show actual API keys in screenshots.

## F. Preservation-only routes

- `/`: keep the owner's home hero, product tour, orange, customer portal references and ordering. Regression-check only when shared code changes.
- `/growth`: internal operations workspace; no public marketing decoration or audit-driven exposure.
- `/newsletter/unsubscribe`: transactional intent; keep simple, accessible and functional. No conversion hero or extra friction.
- Auth/onboarding/dashboard/capture/widget URLs in `protected-routes.csv`: no redesign in these packets. If a problem is discovered, record it for a separate scoped brief.

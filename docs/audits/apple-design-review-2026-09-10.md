# Design review: Zyene Reviews

Review date: September 10, 2026. Method: the project’s installed **apple-design** skill, using its Apple HIG references and a separate design-craft judgment.

## Summary

**Overall rating: Critical issues.** The strongest product thesis is “help a local business turn customer feedback into a manageable daily routine.” The warm palette, local-business imagery, and tangible review examples support that thesis; the largest gaps are accessible interaction, trustworthy feedback, and preserving complete workflows on small screens.

The rating follows the skill’s severity scale, where accessibility failures are Critical. It is not a claim that the whole product is unusable, nor a formal accessibility certification. Keep the visual identity and repair the interaction foundation before a broad redesign.

### Scope and evidence

- Catalogued **88 page route files**: 37 marketing, 33 dashboard, 11 documentation, four authentication, onboarding, public review capture, and the embedded widget. Dynamic routes represent templates, not every individual published article or business.
- Reviewed shared design tokens, navigation, forms, and representative implementations across those product families. Traced the campaign handoff and bulk feedback into their request paths. The route appendix is an inventory; it does not imply every state of every route was visually tested.
- **Browser evidence:** local homepage at 1280 × 720 and 390 × 844, its timed guide dialog and keyboard behavior, computed primary CTA styles, and the login accessibility tree. The mobile homepage had a 390 px document width at a 390 px viewport.
- **Code evidence:** authenticated flows, public capture variants, widget behavior, responsive visibility, loading/error branches, and the remaining page families. Findings explicitly distinguish observed behavior from source-derived behavior.
- The local preview stopped responding during the review. Authenticated sessions, actual campaign delivery, billing transactions, Google publishing, VoiceOver speech output, all dynamic content, dark appearance, 200–400% zoom, and reduced-motion rendering were **not exercised end to end**. No business data was changed and no messages were sent.

## Critical

### C1 — Critical: primary colors fail normal-size text contrast

**What:** The homepage’s primary CTA was measured at **16 px, weight 600**, with white text on `#ff4f00`: **3.30:1**, below the 4.5:1 threshold for normal web text. Orange text on `#fffefb` is **3.27:1**; on the sidebar’s `#eceae3` active surface it is **2.74:1**. The shared light and dark primary tokens both pair orange with white. This affects more than the homepage. These ratios are calculated from actual color values, not screenshot estimates.

**Evidence:** [src/app/globals.css](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/globals.css:72>); [src/components/dashboard/app-sidebar-nav-utils.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/dashboard/app-sidebar-nav-utils.ts:5>). Public review buttons also combine a business-supplied color with the primary foreground in [src/app/r/[slug]/review-flow/steps/ai-review-step.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/r/[slug]/review-flow/steps/ai-review-step.tsx:75>); those custom combinations need their own validation.

**Why:** [accessibility.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/accessibility.md>) › Vision: “Strive to meet color contrast minimum standards.”

**Fix:** Separate decorative brand orange from accessible action text and button fills. For example, `#b93800` with white gives **5.79:1**, and as text on cream gives **5.74:1**. Alternatively retain the vivid fill with `#201515` text (**5.40:1**). Define and test semantic variants for light/dark surfaces and selected states. Evaluate customer-selected public colors and choose a readable foreground. Preserve the warm palette.

### C2 — Critical: public rating variants do not support equivalent keyboard and screen-reader interaction

**What:** Star buttons contain only an icon, have no accessible name, and remove the focus outline without adding a replacement. The slider advances through `onRate` only on mouse-up or touch-end; keyboard arrow changes only update hover state, leaving a keyboard user unable to complete that variant. The range itself has no associated label. These are source-confirmed, variant-specific failures; they are not claims that every rating style fails identically.

**Evidence:** [src/app/r/[slug]/review-flow/steps/rating-step-stars.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/r/[slug]/review-flow/steps/rating-step-stars.tsx:15>); [src/app/r/[slug]/review-flow/steps/rating-step-slider.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/r/[slug]/review-flow/steps/rating-step-slider.tsx:17>).

**Why:** [accessibility.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/accessibility.md>) › Speech: “Let people use the keyboard alone to navigate and interact with your app.”

**Fix:** Use a named radio group with labels such as “4 out of 5 stars,” expose the selected value, and add visible focus. Give the slider a persistent label, announced value, and explicit Continue action that works with keyboard and touch. Verify all five configurable rating styles.

### C3 — Critical: the guide dialog allows focus into the obscured page

**What:** Browser-confirmed: with the dialog open, Shift+Tab from “Close guide offer” moved focus to the background link “Make your next move” (`insideDialog: false`) and scrolled the page behind the overlay. Dismissal did not restore the prior focus. The implementation locks body scrolling and handles Escape, but does not contain focus or make the background inert.

**Evidence:** [src/components/marketing/home-lead-wizard.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/marketing/home-lead-wizard.tsx:48>); dialog semantics begin at line 100 of that file.

**Why:** [accessibility.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/accessibility.md>) › Speech: “Let people use the keyboard alone to navigate and interact with your app.”

**Fix:** Build the wizard on the existing Radix-backed Dialog component, retaining its close label and Escape support. Contain Tab/Shift+Tab, prevent interaction with background content, and restore focus to a meaningful element on dismissal. Verify both wizard steps and success/error states.

### C4 — Critical: accessible names and selection semantics are inconsistent across forms

**What:** The signup password visibility button has no name. Reset-password visibility buttons are also unnamed and removed from sequential keyboard navigation. CSV mapping controls show field names in adjacent divs without associating them with their select triggers. The campaign reminder switch has an unassociated label; delay and AI-tone choices expose no selected state. The public AI-review textarea has no associated label.

**Evidence:** [src/app/(auth)/signup/signup-form-fields.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(auth)/signup/signup-form-fields.tsx:98>); [src/app/(auth)/reset-password/reset-password-form.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(auth)/reset-password/reset-password-form.tsx:62>); [src/app/(dashboard)/customers/import/import-customers-map-step.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/customers/import/import-customers-map-step.tsx:63>); [src/app/(dashboard)/campaigns/new/new-campaign-timing-step.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/campaigns/new/new-campaign-timing-step.tsx:55>); [src/components/reviews/auto-reply-toolbar-controls.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/reviews/auto-reply-toolbar-controls.tsx:105>); [src/app/r/[slug]/review-flow/steps/ai-review-step.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/r/[slug]/review-flow/steps/ai-review-step.tsx:60>).

**Why:** [accessibility.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/accessibility.md>) › Vision: “Describe your app’s interface and content for VoiceOver.”

**Fix:** Associate persistent labels using `id`/`htmlFor` or `aria-labelledby`. Name visibility controls “Show password”/“Hide password” and keep them keyboard-reachable. Represent exclusive choices as radio groups, or expose `aria-pressed` where toggle buttons are appropriate. Apply the same audit to the free-tool forms: the response generator’s bonus-email input is also unnamed. Use the correctly associated Contact form and notification FormField patterns as internal examples.

### C5 — Critical: the embedded review marquee has no usable static reading mode

**What:** Source shows an infinite 40-second animation that pauses only on hover, inside an overflow-hidden container. There is no pause button or manual browsing control. The global reduced-motion rule shortens the animation, but does not turn the remaining offscreen reviews into a browsable list. Repeated reviews are exposed multiple times to assistive technology, and rating stars have no numeric text equivalent.

**Evidence:** [src/components/widgets/review-carousel-marquee.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/widgets/review-carousel-marquee.tsx:12>); [src/components/widgets/review-carousel.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/widgets/review-carousel.tsx:23>); [src/components/widgets/review-carousel-card.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/widgets/review-carousel-card.tsx:17>); [src/app/globals.css](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/globals.css:300>).

**Why:** [motion.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/motion.md>) › Best practices: “Make motion optional.”

**Fix:** Prefer a manually scrollable review list with optional animation. Add a persistent Pause/Play control if autoplay remains; pause on focus and touch interaction. Under reduced motion, render each review once with normal scrolling. Hide decorative duplicates from assistive technology and announce “4 out of 5 stars.” Add a way to read text currently truncated to four lines. The loop also assumes 250 px cards while actual widths are 280/320 px, so calculate travel from the rendered sequence to avoid a reset jump.

### C6 — Critical: compact dashboard layouts remove cross-organization switching

**What:** The only OrganizationSwitcher is inside `hidden sm:block`, so it disappears below the default 640 px breakpoint. The adjacent BusinessSwitcher receives businesses scoped to the current organization. No compact alternative was found in the shared dashboard navigation. Multi-organization users lose the organization-switching workflow at that width. This is source-confirmed visibility and data scoping, not a live multi-tenant test.

**Evidence:** [src/components/dashboard/dashboard-header-controls.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/dashboard/dashboard-header-controls.tsx:48>); [src/lib/auth/business-context.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/lib/auth/business-context.ts:102>).

**Why:** [layout.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/layout.md>) › Adaptability: “Design a layout that adapts gracefully to context changes while remaining recognizably consistent.”

**Fix:** Provide one compact “Organization / Location” chooser, or put the same organization action in the mobile navigation. Preserve current context and access to all authorized organizations at narrow widths and browser zoom.

## Improvements

### H1 — High: “Launch Campaign” drops the selected audience

**What:** Customers → bulk campaign passes selected IDs in `customerIds`. The builder reads that query parameter only to display a count. Saving sends `{ ...form, status }`; the create schema has no recipients and the handler only inserts the campaign. The UI then reports “Campaign launched!” and returns to the list. The selected audience is not carried through or enqueued by this path.

**Evidence:** [src/components/customers/use-customer-management-bulk-campaign.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/customers/use-customer-management-bulk-campaign.ts:67>); [src/app/(dashboard)/campaigns/new/use-new-campaign-form.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/campaigns/new/use-new-campaign-form.ts:19>); [src/app/(dashboard)/campaigns/new/use-new-campaign-form.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/campaigns/new/use-new-campaign-form.ts:90>); [src/services/campaigns/campaigns-list-api.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/services/campaigns/campaigns-list-api.ts:38>).

**Why:** [writing.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/writing.md>) › Best practices: “Give clear guidance and use consistent language throughout processes with multiple steps.”

**Fix:** Preserve and validate recipient selection through creation and launch. Show audience count, exclusions, channel, timing, and estimated usage in the final review. If this action only creates an active campaign, call it “Create campaign” and provide the explicit next step for adding and sending to recipients. Use “queued” or “sent” only when the corresponding operation succeeds.

### H2 — High: bulk actions celebrate failed requests

**What:** `toast.promise` receives raw `fetch`, which resolves on HTTP errors. Its success callback can announce “Review requests sent successfully!” with confetti after a 400/403/500 response. Delete/tag paths can clear the selection and claim completion under the same condition. This is a deterministic request-handling defect identified in code; no actual customer action was executed.

**Evidence:** [src/components/customers/use-customer-management-bulk-campaign.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/customers/use-customer-management-bulk-campaign.ts:26>).

**Why:** [writing.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/writing.md>) › Best practices: “Write clear error messages.”

**Fix:** Parse the response and reject non-success status codes before showing success. Reflect actual queued, skipped, and failed counts where supplied. Preserve failed selections and provide Retry. Do not use a transport response alone as proof of delivery.

### H3 — High: analytics can show old data under new filters without explanation

**What:** Range and platform update immediately, while the query retains previous data. The page reads only `data`, ignores loading/error state, and falls back to the initial payload. During a slow or failed request, the selected filters can disagree with the displayed metrics without an updating or failure notice.

**Evidence:** [src/components/analytics/analytics-page-client.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/analytics/analytics-page-client.tsx:32>); [src/hooks/use-range-queries.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/hooks/use-range-queries.ts:118>).

**Why:** [loading.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/loading.md>) › Showing progress: “Clearly communicate that content is loading and how long it might take to complete.”

**Fix:** Keep the previous content if useful, but mark it “Updating” with its actual date range and platform. Show an inline error and Retry if fetching fails. Enable exports only for a clearly identified dataset, and announce loading/completion without moving focus.

### H4 — High: automatic public AI replies need clearer setup before activation

**What:** “Auto commenter” immediately persists enablement. The fact that it posts replies to Google is explained in a help tooltip, while minimum stars and tone appear only after activation. The switch’s consequence is broader than its visible label suggests.

**Evidence:** [src/components/reviews/auto-reply-toolbar-controls.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/reviews/auto-reply-toolbar-controls.tsx:45>); [src/components/reviews/auto-reply-toolbar-types.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/reviews/auto-reply-toolbar-types.ts:15>); [src/components/reviews/use-auto-reply-toolbar.ts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/reviews/use-auto-reply-toolbar.ts:43>).

**Why:** [generative-ai.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/generative-ai.md>) › Best practices: “Keep people in control.”

**Fix:** Say “Automatically publish AI replies to Google” in persistent text. Before first enablement, let people choose minimum stars and tone, see a sample, and review the affected business and future-review scope. Make disabling immediate and easy. The recommendation is a transparent initial setup, not repeated confirmation for every generated draft.

### H5 — High: the public-profile editor removes preview and sharing below 1280 px

**What:** The entire preview/device and share/QR block sits inside `hidden xl:flex`. At tablet and ordinary laptop content widths, people can configure customer-facing review steps without seeing their live preview or accessing this editor’s share controls. A separate dashboard QR tool exists; this finding concerns the editor’s incomplete compact workflow.

**Evidence:** [src/components/settings/public-profile-editor-preview-column.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/settings/public-profile-editor-preview-column.tsx:43>).

**Why:** [layout.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/layout.md>) › Adaptability: “Design a layout that adapts gracefully to context changes while remaining recognizably consistent.”

**Fix:** Keep a compact “Preview” action and share link available at every width. Use an Edit/Preview switch or preview sheet on small screens; retain the two-column arrangement where space permits.

### M1 — Medium: documentation loses browse navigation on mobile

**What:** The sidebar disappears below 768 px, and the header navigation below 1024 px. Search remains, but there is no mobile section menu. Below 768 px its visible “Search docs…” label is also hidden, leaving the search button without an accessible name. The latter is another C4 instance; the navigation issue is discoverability, not a claim that pages are completely unreachable.

**Evidence:** [src/components/docs/doc-sidebar.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/docs/doc-sidebar.tsx:31>); [src/components/docs/doc-navbar.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/docs/doc-navbar.tsx:24>); [src/components/docs/doc-search.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/components/docs/doc-search.tsx:52>); [src/app/docs/layout.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/layout.tsx>).

**Why:** [layout.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/layout.md>) › Adaptability: “Design a layout that adapts gracefully to context changes while remaining recognizably consistent.”

**Fix:** Add a named “Browse documentation” menu using the same nav dataset, indicate the current page, and give the search trigger an always-present accessible name.

### M2 — Medium: the dashboard’s daily action queue is too far down the hierarchy

**What:** After the header/setup state, the dashboard renders Smart Insights and a large QR block, then statistics, Google health, performance, extended stats, charts, and finally the row containing Needs Attention. On a single-column layout this orders secondary reporting ahead of a concrete response queue. This is design judgment based on component order, not a measured scroll-depth study.

**Evidence:** [src/app/(dashboard)/dashboard/dashboard-view.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/dashboard/dashboard-view.tsx:64>); [src/app/(dashboard)/dashboard/dashboard-view-bottom-row.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/dashboard/dashboard-view-bottom-row.tsx:65>).

**Why:** [layout.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/layout.md>) › Best practices: “Make essential information easy to find by giving it sufficient space.”

**Fix:** Put urgent/unanswered reviews and failed requests immediately after the compact summary. Preserve the setup checklist for new accounts. Reduce the QR block to a secondary action for returning users, with the full printable card on demand.

### M3 — Medium: implementation language leaks into user workflows

**What:** The campaign selection banner discusses URL `customerIds`; visibility pages expose “Phase 2,” “Phase 3,” and “Refresh Phase 3.” These labels explain implementation stages instead of the outcome a business owner can expect.

**Evidence:** [src/app/(dashboard)/campaigns/new/new-campaign-form.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/campaigns/new/new-campaign-form.tsx:47>); [src/app/(dashboard)/google-seo-aeo/phase-2/phase2-page.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/phase-2/phase2-page.tsx:13>); [src/app/(dashboard)/google-seo-aeo/phase-3/phase3-page.tsx](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/phase-3/phase3-page.tsx:32>).

**Why:** [writing.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/writing.md>) › Getting started: “Be clear.”

**Fix:** Replace the campaign banner with a real audience summary. Use outcome labels such as “Refresh insights,” and explain what the competitive/differentiation view measures. Keep development phase names in internal documentation.

## Craft notes

### D1 — Medium: document a Zyene design system that matches the shipped product

**What:** [docs/DESIGN.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/docs/DESIGN.md>) describes Zapier, Degular Display, and GT Alpina. The runtime loads Syne and Inter, and the dashboard greeting uses Georgia. The warm palette itself fits local businesses, but the design document does not reliably describe the product engineers are extending.

**Why:** Design judgment. A shared specification should preserve Zyene’s identity and prevent each feature from choosing its own typography, corner shapes, and emphasis.

**Fix:** Define Syne for selected brand headings, Inter for product controls and content, a compact data type scale, semantic colors with contrast figures, and a small set of spacing/radius/elevation roles. Explicitly decide whether the Georgia greeting earns its exception. Ground examples in review queues, local businesses, and customer communication.

### D2 — Medium: reduce the homepage’s unsolicited interruption

**What:** The guide wizard opens after 12 seconds and was observed over the page while the cookie banner was also present. It competes with the primary trial/product-exploration task. Its focus bug is C3; the timing is a separate product judgment.

**Why:** [modality.md](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/.agents/skills/apple-design/references/hig/modality.md>) › Best practices: “Present content modally only when there’s a clear benefit.”

**Fix:** Keep the guide and its imagery, but offer it inline near relevant content or through an explicit “Get the guide” action. The trade-off is potentially fewer forced lead-form impressions in exchange for uninterrupted product evaluation. Measure completed, useful leads rather than popup opens.

## What works

- **Brand and homepage:** warm cream/orange, local-business imagery, an actual review workflow in the product tour, and clearly identified sample data give the page a reason to look this way. Keep these instead of adopting a generic native-Apple skin. The observed mobile homepage reflowed without horizontal overflow, with a 54 px primary CTA.
- **Authentication and onboarding:** core signup fields use autocomplete and persistent labels; phone entry is optional with separate SMS consent. Google connection and paid-plan selection have skip paths. The login view’s labeled password visibility control is a useful pattern to reuse.
- **Billing:** the plan-change dialog shows loading for proration, recurring-price context, trial-ending context where applicable, and a Cancel action. Confirm is disabled while the preview loads. Keep this transparent decision structure; payment outcomes were not executed.
- **Integrations:** Google disconnect explains that syncing will stop while existing reviews remain. Sync controls expose a busy state and disable conflicting actions.
- **Customers and team:** dedicated compact layouts, CSV mapping with a first-row preview, and confirmation patterns provide a good base. Repair the semantics and bulk outcome handling without removing those affordances.
- **Q&A and competitors:** explicit no-business and fetch-failure branches distinguish setup from errors and provide a next step. Apply that discipline to analytics filter refreshes.
- **AI and motion:** the public review editor identifies AI-generated text and permits editing before “Copy & Go to Google.” Global reduced-motion CSS already exists. Extend those foundations rather than starting over.

## Platform notes and completion criteria

This is a responsive Next.js/React web application. Apple’s principles and foundations apply; native menu-bar requirements, iOS tab placement, SF Symbols, mandatory system fonts, and native appearance-switch rules were not used as web requirements. Browser zoom, semantic HTML, ARIA, keyboard input, and CSS media preferences are the appropriate equivalents.

Prioritize work in this order:

1. **Accessible core paths:** C1–C6. Verify signup/reset, all capture variants, popup containment, organization switching, and static widget reading with keyboard and a screen reader.
2. **Reliable business actions:** H1–H4. Use controlled test data to verify recipient persistence, HTTP failures and partial outcomes, slow/failed analytics queries, and first-time AI publishing setup.
3. **Responsive completeness:** H5 and M1. Verify 320/390/768/1024/1280 px, browser zoom, long business/organization names, and loading/error states. Also inspect the seven-link SEO/AEO subnavigation: its flex-only layout has no explicit wrap/scroll treatment. Clipping is a verification risk, not a browser-confirmed finding in this review.
4. **Hierarchy and consistency:** M2–M3 and D1–D2. Preserve local-business character while making the next useful action easier to find.

Additional verification still required: dark-mode contrast for all semantic colors; small warning/helper text (including opacity variants); chart labels and non-color equivalents; touch target spacing; 200–400% zoom and text enlargement; reduced-motion behavior for JavaScript animations and confetti; empty, error, disabled and permission-limited states with realistic tenant data.

No product fixes were made as part of this review. Recommendations are an implementation backlog, not claims of completed remediation.

## Product coverage map

| Surface | Scope inspected | Evidence limits / principal findings |
|---|---|---|
| Marketing and pricing | Shared shell/navigation, homepage, guide wizard, plan cards, contact form, free-tool form patterns, content/template route inventory | Homepage browser inspection; other templates source review. C1, C3, C4, D1–D2 |
| Authentication and onboarding | Login, signup, recovery/reset, organization/business connection, plan choice | Login accessibility tree; remaining source. C1, C4 |
| Dashboard and business context | Shared sidebar/header, organization/location switching, setup and main dashboard ordering | Source. C1, C6, M2 |
| Reviews and Q&A | Reply editing, automatic replies, connection/demo/error branches, responsive views | Source; no public posts. C4, H4 |
| Customers and requests | List/compact layouts, selection, import mapping, bulk requests and campaign handoff | Source; no messages sent. C4, H1–H2 |
| Campaigns | List/detail route family, four-step builder, timing/review and create/send boundary | Source; no campaign launch. C4, H1 |
| Analytics and competitors | Filters/query state, charts, loading/no-business/error branches | Source; no authenticated dataset validation. H3, M2 |
| Google SEO/AEO | Shared subnavigation, overview/prompt/audit/geo-grid/alerts route family and competitive/differentiation pages | Source; compact overflow needs rendering. M3 |
| Settings | Public profile/branding, billing, team, notifications, integrations and general/business forms | Source; no billing or integration changes. C4, H4–H5 |
| Public review capture | Rating variants, editable AI review, feedback and success flow components | Source only. C1–C2, C4 |
| Embedded widget | Carousel, card, animation and empty state | Source only. C5 |
| Documentation/help | Shell, navigation/search, article/template route inventory | Source only. C1, C4, M1 |

## Appendix: page route inventory

This list records the complete discovered page-file inventory, not a visual pass on every route. Redirects, server data states, dynamic URL instances, API endpoints and non-page error/loading boundaries are not separate page entries.

### (marketing) — 37 page files

- [/about](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/about/page.tsx>)
- [/agencies](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/agencies/page.tsx>)
- [/blog/[slug]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/blog/[slug]/page.tsx>)
- [/blog](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/blog/page.tsx>)
- [/case-studies/[slug]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/case-studies/[slug]/page.tsx>)
- [/case-studies](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/case-studies/page.tsx>)
- [/compare/[competitor]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/compare/[competitor]/page.tsx>)
- [/compare](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/compare/page.tsx>)
- [/contact](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/contact/page.tsx>)
- [/data-retention](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/data-retention/page.tsx>)
- [/demo](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/demo/page.tsx>)
- [/enterprise](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/enterprise/page.tsx>)
- [/es/industries/[industry]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/es/industries/[industry]/page.tsx>)
- [/es/industries](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/es/industries/page.tsx>)
- [/features/[pillar]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/features/[pillar]/page.tsx>)
- [/features](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/features/page.tsx>)
- [/growth](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/growth/page.tsx>)
- [/help/[slug]/[article]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/help/[slug]/[article]/page.tsx>)
- [/help/[slug]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/help/[slug]/page.tsx>)
- [/help](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/help/page.tsx>)
- [/how-it-works](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/how-it-works/page.tsx>)
- [/industries/[industry]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/industries/[industry]/page.tsx>)
- [/industries](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/industries/page.tsx>)
- [/integrations](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/integrations/page.tsx>)
- [/newsletter/unsubscribe](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/newsletter/unsubscribe/page.tsx>)
- [/](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/page.tsx>)
- [/partners](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/partners/page.tsx>)
- [/pricing](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/pricing/page.tsx>)
- [/privacy](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/privacy/page.tsx>)
- [/resources/[guide]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/resources/[guide]/page.tsx>)
- [/resources](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/resources/page.tsx>)
- [/security](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/security/page.tsx>)
- [/terms](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/terms/page.tsx>)
- [/tools](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/tools/page.tsx>)
- [/tools/reputation-score-checker](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/tools/reputation-score-checker/page.tsx>)
- [/tools/review-link-generator](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/tools/review-link-generator/page.tsx>)
- [/tools/review-response-generator](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(marketing)/tools/review-response-generator/page.tsx>)

### (auth) — 4 page files

- [/forgot-password](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(auth)/forgot-password/page.tsx>)
- [/login](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(auth)/login/page.tsx>)
- [/reset-password](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(auth)/reset-password/page.tsx>)
- [/signup](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(auth)/signup/page.tsx>)

### onboarding — 1 page files

- [/onboarding](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/onboarding/page.tsx>)

### (dashboard) — 33 page files

- [/analytics](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/analytics/page.tsx>)
- [/businesses/add](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/businesses/add/page.tsx>)
- [/businesses](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/businesses/page.tsx>)
- [/campaigns/[id]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/campaigns/[id]/page.tsx>)
- [/campaigns/new](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/campaigns/new/page.tsx>)
- [/campaigns](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/campaigns/page.tsx>)
- [/competitors](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/competitors/page.tsx>)
- [/customers/[customerId]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/customers/[customerId]/page.tsx>)
- [/customers/import](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/customers/import/page.tsx>)
- [/customers](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/customers/page.tsx>)
- [/dashboard](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/dashboard/page.tsx>)
- [/google-seo-aeo/alerts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/alerts/page.tsx>)
- [/google-seo-aeo/audit](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/audit/page.tsx>)
- [/google-seo-aeo/geo-grid](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/geo-grid/page.tsx>)
- [/google-seo-aeo](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/page.tsx>)
- [/google-seo-aeo/phase-2](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/phase-2/page.tsx>)
- [/google-seo-aeo/phase-3](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/phase-3/page.tsx>)
- [/google-seo-aeo/prompts/[promptId]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/prompts/[promptId]/page.tsx>)
- [/google-seo-aeo/prompts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/google-seo-aeo/prompts/page.tsx>)
- [/questions](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/questions/page.tsx>)
- [/requests](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/requests/page.tsx>)
- [/review-requests](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/review-requests/page.tsx>)
- [/reviews](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/reviews/page.tsx>)
- [/settings/billing](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/billing/page.tsx>)
- [/settings/business-information](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/business-information/page.tsx>)
- [/settings/competitor-alerts](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/competitor-alerts/page.tsx>)
- [/settings/general](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/general/page.tsx>)
- [/settings/integrations](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/integrations/page.tsx>)
- [/settings/integrations/zapier](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/integrations/zapier/page.tsx>)
- [/settings/notifications](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/notifications/page.tsx>)
- [/settings](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/page.tsx>)
- [/settings/public-profile](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/public-profile/page.tsx>)
- [/settings/team](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/(dashboard)/settings/team/page.tsx>)

### r — 1 page files

- [/r/[slug]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/r/[slug]/page.tsx>)

### w — 1 page files

- [/w/[slug]](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/w/[slug]/page.tsx>)

### docs — 11 page files

- [/docs/api](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/api/page.tsx>)
- [/docs/changelog](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/changelog/page.tsx>)
- [/docs/content-types](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/content-types/page.tsx>)
- [/docs/cookbook](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/cookbook/page.tsx>)
- [/docs/graph](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/graph/page.tsx>)
- [/docs/how-it-works](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/how-it-works/page.tsx>)
- [/docs/install](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/install/page.tsx>)
- [/docs](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/page.tsx>)
- [/docs/plugins](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/plugins/page.tsx>)
- [/docs/quickstart](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/quickstart/page.tsx>)
- [/docs/sync](</Users/ashishdikonda/Documents/Office/ZYENE/Our Products/2. Zyene Reviews/Zyene Reviews/src/app/docs/sync/page.tsx>)


# Zyene Reviews design system

Zyene Reviews helps local businesses turn customer feedback into a manageable daily routine. The interface should feel warm, clear, and dependable: a business owner can see what needs attention, understand an action, and trust its result.

## Identity and restraint

Colours are matched to OptiMonk (colours only: no logo, copy or imagery). Marketing uses a warm paper canvas (`#f7f5f1`), white cards, slate ink (`#23262a`) and orange (`#ed5a29`) actions; it is light-only. The app uses white panels and sidebar on a cool `#f9fafb` canvas, slate ink, cool-grey borders and the same orange. Keep both light and dark modes in the app; dark values come from the same grey scale (`#1a1c1f` / `#23262a` / `#2e3237`). Product screens should prioritize customer content over large brand marks, decorative gradients, or animated panels.

Premium quality comes from complete workflows, readable typography, deliberate spacing, and useful feedback. Use one prominent action per decision area. Make supporting actions quiet but discoverable.

## Color roles

| Role | Light | Dark | Use |
|---|---|---|---|
| Background | `#ffffff` | `#1a1c1f` | Main surface |
| Canvas | `#f9fafb` | `#1a1c1f` | Workspace around panels |
| Card | `#ffffff` | `#23262a` | Solid content panels |
| Primary | `#ed5a29` | `#ed5a29` | Filled actions (hover `#dd4513`, pressed `#d14212`) |
| Primary foreground | `#ffffff` | `#ffffff` | Text on primary |
| Primary text | `#b8410f` | `#f17e58` | Small links and selected labels |
| Brand accent | `#ed5a29` | `#ed5a29` | App identity |
| Muted foreground | `#505763` | `#b9bec6` | Supporting text |
| Success | `#15803d` | `#2cc896` | Completed, sent, connected and positive states |
| Success foreground | `#ffffff` | `#111213` | Text on a filled success surface |
| Border | `#e3e5e8` | `#3a3e44` | Grouping and controls |

The app palette is defined in `src/app/dashboard-colors.css`; marketing tokens live in `src/app/(marketing)/marketing.css`. Text pairs meet WCAG AA; small orange text uses the darker `#b8410f`, and muted text uses `#505763` rather than the reference's `#8f97a4` (3:1). White on `#ed5a29` is 3.4:1, so filled-action labels stay bold, and hover darkens instead of lightening; see [dashboard color audit](dashboard-color-audit.md).

Use semantic tokens from `src/app/globals.css`. Do not use chart fill colors as text colors for status messages; use success, warning/destructive and their foreground roles. Success text uses `text-success` on neutral or lightly tinted surfaces; warning text uses `text-warning-foreground`. Keep chart series separate from status labels. The legacy sync-action token aliases primary, so AI and sync do not introduce another brand color. Custom business colors use `readableForeground` for filled controls so text remains readable. A color must not be the only indication of selection or status.

## Typography

- **Syne (`font-display`)**: brand headings, the business name on the dashboard, and selected large editorial moments.
- **Funnel Sans**: app sidebar and its settings flyout, matching the OptiMonk reference. Compact labels are 10 px/16 px, weight 500; expanded labels are 14 px/20 px.
- **Inter (`font-sans`)**: other navigation, forms, tables, body text, and supporting copy.
- **Geist Mono**: code examples and user-editable message variables; avoid using code styling for ordinary product explanations.
- Signed-in heading scale (dashboard shell and onboarding), fixed at every breakpoint and defined once in `src/app/product-typography.css`:

  | Role | Element | Hook | Size / leading / weight / tracking |
  |---|---|---|---|
  | Page title | the page's only `h1` | `PageHeader` (`@/components/dashboard/page-header`) or `.ui-page-title` | 24 px / 1.2 / 600 / -0.022em |
  | Section heading | `h2` | `.ui-section-title` | 18 px / 1.35 / 600 / -0.018em |
  | Card heading | `h3` or `CardTitle` | `.ui-card-title` | 16 px / 1.4 / 600 / -0.011em |

  `PageHeader` fixes the header rhythm: 4 px title → description, 16 px between the text block and the actions, actions stacked under the title on phones. It carries no outer margin; the shell's 16/20 px section gap sets the space below. Inside the dashboard shell and onboarding every `h1` and `h2` is also pinned by an unlayered element rule, so headings that come from `src/components/ui` (such as the review spotlight) follow the scale; dialogs portal outside the shell and keep their own title size. Do not add `text-*`, `font-*`, `tracking-*` or `leading-*` utilities to signed-in headings; `tests/unit/app-heading-scale.test.ts` fails if you do. Display text that is not a heading (KPI values, print-card previews, insight headlines) uses `p`, and compact KPI labels keep `CardTitle className="text-sm font-medium"`.
- Body and controls: 14–16 px. Supporting text: 12–14 px with sufficient contrast.
- Allow headings, business names and labels to wrap. Avoid all-caps paragraphs and unnecessary text truncation. Maintain usable layouts under browser zoom and text enlargement.

The shared dashboard shell enforces the 24 px page-title scale, 14 px body rhythm, and 12 px metadata rhythm across every dashboard route. Route-level classes may still size intentional microcopy (badges, chart labels, and legal notes), but page titles should not introduce a second scale. The shell uses 16 px gutters on compact screens, 20 px at the small breakpoint, and 24 px on wide screens; marketing pages retain their larger responsive editorial headings and section spacing.

## Layout and hierarchy

Use a 4 px spacing base, with 12–16 px inside compact controls and 20–24 px inside content panels. Separate related sections with 24–32 px, rather than nesting many card borders.

Dashboard order: business context and primary action, setup guidance when needed, the Smart Insights / Customer Portal row, metric cards, Google profile health/performance, extended metrics, charts, and the bottom row. This preserves the owner's September 28 request and the current `dashboard-view.tsx` arrangement. Do not reorder Insights or Customer Portal as incidental polish. See the decision and open keyboard review in [app-ux-audit.md](app-ux-audit.md).

On compact layouts, preserve the same capabilities. Organization switching remains reachable. The public-profile editor has an explicit Preview control and always-visible sharing actions. Documentation has a browse menu. Wide secondary navigation scrolls within its own region.

## Components

Use existing Radix/shadcn primitives for dialogs, selects, menus and toggles. Keep vendored primitives unchanged; compose product components around them.

- Controls: comfortable targets, explicit labels, visible keyboard focus, and clear disabled/busy states.
- Corners: approximately 8 px for product controls, 12–16 px for panels, rounded pills only for compact statuses or deliberate marketing CTAs.
- Elevation: solid cards, thin borders, and restrained shadows. Reserve translucency for chrome layered over scrolling content.
- Dialogs: opened for a user task; contain focus, allow Escape and visible dismissal, and restore focus to the trigger.
- Exclusive choices: native radios when practical; otherwise labeled toggle buttons with selected state. Never rely on color alone.
- Data states: distinguish loading, empty, unavailable, error, stale and complete. Preserve work on failure and provide a useful next step.

Analytics must distinguish star-rating distribution from AI sentiment, keep ratings
on a fixed 0–5 scale, preserve UTC calendar dates, separate Google views from actions,
and avoid reporting missing data as a measured zero or decline. The current chart
rules and their rationale are in [analytics-presentation.md](analytics-presentation.md).

Dashboard loading uses shared neutral placeholders and a 1.6-second shimmer.
Use `DashboardSkeleton` in dialog portals, preserve loaded content during background
refreshes, and use static placeholders for reduced motion. Follow
[dashboard-loading.md](dashboard-loading.md) for boundaries and integration details.

## Writing and trust

Use business language: “Refresh insights,” “Request review,” “Queue for 12 customers.” Keep internal phase names and URL parameters out of interface copy.

“Created” means a record was saved. “Queued” means background processing accepted recipients. “Sent” requires a delivery outcome. Show skipped and failed counts honestly; preserve unsuccessful selections. Do not celebrate failed or uncertain actions.

Explain automatic public AI publishing before activation. Show its scope, rating threshold, tone and an example. Keep manual editing and disabling easy.

## Motion

Use brief transitions to clarify hover, selection and navigation. Content should be readable without movement. No timed marketing interruptions. Embedded reviews default to manual scrolling with keyboard-accessible controls. The widget builder also supports explicitly enabled autoplay, which pauses for hover/focus, hidden pages and the pause control and is disabled under reduced motion. Do not duplicate reviews merely to create movement. See [review-widget-builder.md](review-widget-builder.md).

Honor reduced motion in both CSS and JavaScript. Avoid confetti for routine business actions. Motion must never determine whether information can be reached.

## Verification

Check the affected flows at 320, 390, 768, 1024 and 1280 px, with long names and actual error states. Verify keyboard order, visible focus, accessible names, text contrast, dark appearance, browser zoom, and reduced motion. Test workflow failures with controlled data; never use real customer sends or billing changes for visual QA.

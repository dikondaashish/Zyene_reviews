# Zyene Reviews design system

Zyene Reviews helps local businesses turn customer feedback into a manageable daily routine. The interface should feel warm, clear, and dependable: a business owner can see what needs attention, understand an action, and trust its result.

## Identity and restraint

Marketing preserves the cream canvas and original orange (`#ff4f00`). The app uses the user's requested OptiMonk palette: white panels, a cool gray canvas, charcoal text, and orange (`#ed5a29`) actions. Keep both light and dark modes. Product screens should prioritize customer content over large brand marks, decorative gradients, or animated panels.

Premium quality comes from complete workflows, readable typography, deliberate spacing, and useful feedback. Use one prominent action per decision area. Make supporting actions quiet but discoverable.

## Color roles

| Role | Light | Dark | Use |
|---|---|---|---|
| Background | `#ffffff` | `#17191c` | Main surface |
| Canvas | `#f9fafb` | `#17191c` | Workspace around panels |
| Card | `#ffffff` | `#23262a` | Solid content panels |
| Primary | `#ed5a29` | `#ed5a29` | Filled actions |
| Primary foreground | `#ffffff` | `#ffffff` | Text on primary |
| Primary text | `#ba3a10` | `#ff9b79` | Small links and selected labels |
| Brand accent | `#ed5a29` | `#ed5a29` | App identity |
| Muted foreground | `#6c757d` | `#b9bec6` | Supporting text |
| Success | `#28a745` | `#71d58a` | Completed, sent, connected and positive states |
| Success foreground | `#ffffff` | `#17191c` | Text on a filled success surface |
| Border | `#e3e5e8` | `#3c424b` | Grouping and controls |

The app palette was measured in OptiMonk's signed-in Chrome dashboard and is defined in `src/app/dashboard-colors.css`. Dark mode is adapted for Zyene. The reference's white-on-orange small button labels remain below WCAG AA contrast; see [dashboard color audit](dashboard-color-audit.md). Marketing keeps its original brand colors.

Use semantic tokens from `src/app/globals.css`. Do not use chart fill colors as text colors for status messages; use success, warning/destructive and their foreground roles. Success text uses `text-success` on neutral or lightly tinted surfaces; warning text uses `text-warning-foreground`. Keep chart series separate from status labels. The legacy sync-action token aliases primary, so AI and sync do not introduce another brand color. Custom business colors use `readableForeground` for filled controls so text remains readable. A color must not be the only indication of selection or status.

## Typography

- **Syne (`font-display`)**: brand headings, the business name on the dashboard, and selected large editorial moments.
- **Inter (`font-sans`)**: navigation, forms, tables, body text, and supporting copy.
- **Geist Mono**: code examples and user-editable message variables; avoid using code styling for ordinary product explanations.
- Product page titles: 24 px in the dashboard shell and 24–32 px in editorial or onboarding surfaces, 600 weight, tight tracking.
- Section headings: 18–20 px, 600 weight. Body and controls: 14–16 px. Supporting text: 12–14 px with sufficient contrast.
- Allow headings, business names and labels to wrap. Avoid all-caps paragraphs and unnecessary text truncation. Maintain usable layouts under browser zoom and text enlargement.

The shared dashboard shell now enforces one 24 px page-title scale, 14 px body rhythm, and 12 px metadata rhythm across every dashboard route. Route-level classes may still size intentional microcopy (badges, chart labels, and legal notes), but page titles should not introduce a second scale. The shell uses 16 px gutters on compact screens, 20 px at the small breakpoint, and 24 px on wide screens; marketing pages retain their larger responsive editorial headings and section spacing.

## Layout and hierarchy

Use a 4 px spacing base, with 12–16 px inside compact controls and 20–24 px inside content panels. Separate related sections with 24–32 px, rather than nesting many card borders.

Dashboard order: business context and primary action, setup guidance when needed, compact metrics, reviews needing attention and recent feedback, insights, deeper reporting, and optional sharing tools. Do not place decorative analytics or a large QR code ahead of the actionable review queue.

On compact layouts, preserve the same capabilities. Organization switching remains reachable. The public-profile editor has an explicit Preview control and always-visible sharing actions. Documentation has a browse menu. Wide secondary navigation scrolls within its own region.

## Components

Use existing Radix/shadcn primitives for dialogs, selects, menus and toggles. Keep vendored primitives unchanged; compose product components around them.

- Controls: comfortable targets, explicit labels, visible keyboard focus, and clear disabled/busy states.
- Corners: approximately 8 px for product controls, 12–16 px for panels, rounded pills only for compact statuses or deliberate marketing CTAs.
- Elevation: solid cards, thin borders, and restrained shadows. Reserve translucency for chrome layered over scrolling content.
- Dialogs: opened for a user task; contain focus, allow Escape and visible dismissal, and restore focus to the trigger.
- Exclusive choices: native radios when practical; otherwise labeled toggle buttons with selected state. Never rely on color alone.
- Data states: distinguish loading, empty, unavailable, error, stale and complete. Preserve work on failure and provide a useful next step.

## Writing and trust

Use business language: “Refresh insights,” “Request review,” “Queue for 12 customers.” Keep internal phase names and URL parameters out of interface copy.

“Created” means a record was saved. “Queued” means background processing accepted recipients. “Sent” requires a delivery outcome. Show skipped and failed counts honestly; preserve unsuccessful selections. Do not celebrate failed or uncertain actions.

Explain automatic public AI publishing before activation. Show its scope, rating threshold, tone and an example. Keep manual editing and disabling easy.

## Motion

Use brief transitions to clarify hover, selection and navigation. Content should be readable without movement. No timed marketing interruptions. Embedded reviews use manual scrolling with keyboard-accessible controls; they do not autoplay or duplicate content.

Honor reduced motion in both CSS and JavaScript. Avoid confetti for routine business actions. Motion must never determine whether information can be reached.

## Verification

Check the affected flows at 320, 390, 768, 1024 and 1280 px, with long names and actual error states. Verify keyboard order, visible focus, accessible names, text contrast, dark appearance, browser zoom, and reduced motion. Test workflow failures with controlled data; never use real customer sends or billing changes for visual QA.

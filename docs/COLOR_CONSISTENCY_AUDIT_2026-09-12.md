# Zyene Reviews color consistency audit

**Date:** September 12, 2026  
**Scope:** current working tree; 33 dashboard route templates, 37 marketing route templates, auth/onboarding, public review capture/widget surfaces, shared dashboard/marketing components, charts, exports, and theme tokens.

## Verdict

The foundation is consistent: Zyene orange is `#ff4f00`, the main canvas is warm cream, cards and borders use the shared warm neutrals, and the light/dark themes both preserve the same primary action color. The standard marketing pages and most dashboard CRUD pages therefore feel like the same product.

The whole product is not yet color-consistent. Four visible parallel systems are competing with the orange brand:

1. A purple `sync-action` accent is used for both synchronization controls and AI reply controls.
2. Smart Insights has a separate forest-green, terracotta, beige, slate, and navy palette written directly in components.
3. The demo banner blends orange into blue and purple.
4. The customer portal/NFC area uses a dark forest-green surface, coral controls, and a bright blue purchase CTA.

There are also a few color implementation bugs: invalid Tailwind opacity utilities and an undefined `success` token. These can make the intended color disappear or fall back differently between routes.

## Current palette inventory

| Role | Current value | Assessment |
|---|---|---|
| Primary / brand / CTA / focus ring | `#ff4f00` | Correct and consistently defined in `globals.css` and the marketing override. |
| Light background | `#fffefb` | Consistent warm canvas. |
| Dashboard canvas | `#f7f5ef` | Consistent with the warm product direction. |
| Dark background | `#201515` | Consistent warm dark theme. |
| Card | `#fffefb` / `#2a2222` | Consistent light/dark pairing. |
| Positive chart/status | `--chart-2` (teal/green) | Used widely, but also used as status text despite the design-system rule against chart colors as status text. |
| Warning/rating chart/status | `--chart-4` (yellow/amber) | Useful for ratings and caution, but mixed with raw amber/yellow utilities. |
| AI/sync accent | `--sync-action`: `#695be8` light, `#8b7cf6` dark | The largest brand-hierarchy deviation. |
| Platform colors | Google blue/multicolor, Facebook blue, Yelp red, Zapier orange, Square blue, Clover green, HubSpot purple | Appropriate when identifying an external platform. |
| Public review flow | Custom business color plus navy/sky/teal defaults | Appropriate for a public, customer-facing capture surface. |

The source of truth already says to preserve the orange and to use semantic tokens: [docs/DESIGN.md:5](../docs/DESIGN.md#L5)–[docs/DESIGN.md:26](../docs/DESIGN.md#L26).

## Findings that should be addressed

### High: purple is doing two unrelated jobs

`--sync-action` is purple in [src/app/globals.css:131](../src/app/globals.css#L131) and changes to a brighter purple in dark mode at [src/app/globals.css:225](../src/app/globals.css#L225). It styles the main Sync button ([src/components/dashboard/sync-button.tsx:119](../src/components/dashboard/sync-button.tsx#L119)), AI composer labels and typing state ([src/components/reviews/review-card-composer.tsx:42](../src/components/reviews/review-card-composer.tsx#L42), [src/components/reviews/review-card-composer.tsx:81](../src/components/reviews/review-card-composer.tsx#L81)), dashboard AI drafting, and analytics metrics.

Users can read this as a second brand or as a separate AI product. The demo banner makes the split more prominent by blending orange into blue and purple at [src/components/dashboard/demo-mode-banner.tsx:14](../src/components/dashboard/demo-mode-banner.tsx#L14).

**Recommendation:** keep platform colors for platform identity, but use `--primary` for product actions, AI reply tone selection, and sync buttons. If purple is kept for AI, formalize it as a documented secondary AI token and use it only for non-action decoration or chart series.

### High: Smart Insights is a separate visual language

The Smart Insights card contains many one-off RGB values and hardcoded dark-mode surfaces: [src/components/dashboard/smart-insights-card.tsx:20](../src/components/dashboard/smart-insights-card.tsx#L20), [src/components/dashboard/smart-insights-card-header.tsx:21](../src/components/dashboard/smart-insights-card-header.tsx#L21)–[src/components/dashboard/smart-insights-card-header.tsx:74](../src/components/dashboard/smart-insights-card-header.tsx#L74), [src/components/dashboard/smart-insights-card-themes-tab.tsx:27](../src/components/dashboard/smart-insights-card-themes-tab.tsx#L27)–[src/components/dashboard/smart-insights-card-themes-tab.tsx:81](../src/components/dashboard/smart-insights-card-themes-tab.tsx#L81), and [src/components/dashboard/smart-insights-card-suggestions-tab.tsx:41](../src/components/dashboard/smart-insights-card-suggestions-tab.tsx#L41)–[src/components/dashboard/smart-insights-card-suggestions-tab.tsx:101](../src/components/dashboard/smart-insights-card-suggestions-tab.tsx#L101).

It introduces forest green, terracotta red, tan, pale sage, slate-blue, and navy surfaces that do not appear in the rest of the dashboard. It looks designed as a separate editorial/AI panel instead of a Zyene product surface.

**Recommendation:** replace the hardcoded values with `background`, `card`, `muted`, `foreground`, `primary`, `destructive`, `warning`, and a documented success token. Keep sentiment meaning in the token, not in a second palette.

### High: invalid color utilities can silently remove colors

The scan found invalid or ambiguous opacity syntax in dashboard components:

- `chart-4/120` and `chart-4/120/…` at [src/components/analytics/engagement-funnel-card.tsx:46](../src/components/analytics/engagement-funnel-card.tsx#L46), [src/app/(dashboard)/competitors/competitors-chart-legend.tsx:4](../src/app/(dashboard)/competitors/competitors-chart-legend.tsx#L4), [src/app/(dashboard)/competitors/competitors-list-empty-state.tsx:43](../src/app/(dashboard)/competitors/competitors-list-empty-state.tsx#L43), [src/components/analytics/zyene-platform-low-rating-alerts-card.tsx:32](../src/components/analytics/zyene-platform-low-rating-alerts-card.tsx#L32), and [src/components/analytics/zyene-platform-review-request-funnel-card.tsx:87](../src/components/analytics/zyene-platform-review-request-funnel-card.tsx#L87).
- Chained opacity such as `chart-4/18/10`, `chart-1/15/10`, and `border-chart-2/30/70` at [src/app/(dashboard)/competitors/competitors-list-empty-state.tsx:17](../src/app/(dashboard)/competitors/competitors-list-empty-state.tsx#L17), [src/app/(dashboard)/campaigns/campaigns-empty-state.tsx:11](../src/app/(dashboard)/campaigns/campaigns-empty-state.tsx#L11), and [src/components/integrations/google-integration-card-connected.tsx:69](../src/components/integrations/google-integration-card-connected.tsx#L69).

`/100` is valid Tailwind opacity; `/120` and multiple slash modifiers are not. Depending on the generated CSS, these classes may produce no color at all.

**Recommendation:** use one valid modifier (`bg-chart-4/15`, `bg-chart-4`, `border-chart-2/30`) and add a lint/guard rule for opacity values above 100 and multiple slash modifiers.

### High: an undefined success token appears in a dashboard page

[src/app/(dashboard)/google-seo-aeo/prompts/[promptId]/content-rewrite-diff.tsx:14](../src/app/(dashboard)/google-seo-aeo/prompts/[promptId]/content-rewrite-diff.tsx#L14) uses `border-success/60` and `bg-success/5`, but `--success` is not defined in [src/app/globals.css](../src/app/globals.css). The “After” panel therefore does not have a reliable success color.

**Recommendation:** add a semantic success token in both themes, or use the existing documented status token consistently.

### Medium: user-visible surfaces use one-off color systems

- The customer portal card is forest green with coral and green controls at [src/components/dashboard/customer-portal-card.tsx:29](../src/components/dashboard/customer-portal-card.tsx#L29) and [src/components/dashboard/customer-portal-card-actions-footer.tsx:35](../src/components/dashboard/customer-portal-card-actions-footer.tsx#L35)–[src/components/dashboard/customer-portal-card-actions-footer.tsx:103](../src/components/dashboard/customer-portal-card-actions-footer.tsx#L103). This is acceptable for a branded public-portal preview, but it reads as a separate product inside the dashboard.
- The NFC upsell is bright Google blue (`rgb(0,82,204)`) at [src/components/dashboard/customer-portal-card-nfc-upsell.tsx:16](../src/components/dashboard/customer-portal-card-nfc-upsell.tsx#L16). The Google mark explains the blue, but the purchase action should use Zyene orange if it is a Zyene action.
- Request metrics use `emerald-500`, `amber-600`, and `yellow-500` at [src/app/(dashboard)/requests/requests-stats-section.tsx:42](../src/app/(dashboard)/requests/requests-stats-section.tsx#L42), [src/app/(dashboard)/requests/requests-stats-section.tsx:58](../src/app/(dashboard)/requests/requests-stats-section.tsx#L58), and [src/app/(dashboard)/requests/requests-stats-section.tsx:74](../src/app/(dashboard)/requests/requests-stats-section.tsx#L74). This duplicates the semantic green/yellow system with raw Tailwind colors and uses two different yellows for adjacent metrics.
- The homepage simulated dashboard uses a parallel palette for selected navigation, star ratings, status chips, blue links, and green success states at [src/app/(marketing)/marketing-home-scene.css:21](../src/app/(marketing)/marketing-home-scene.css#L21)–[src/app/(marketing)/marketing-home-scene.css:48](../src/app/(marketing)/marketing-home-scene.css#L48). A demo can have platform/status colors, but matching the real dashboard tokens would make the demo more trustworthy.
- Onboarding uses `rgba(249,115,22,…)` at [src/app/onboarding/onboarding-content.tsx:23](../src/app/onboarding/onboarding-content.tsx#L23) and gold `rgba(212,160,84,…)` at [src/app/onboarding/onboarding-step-two-section.tsx:58](../src/app/onboarding/onboarding-step-two-section.tsx#L58), instead of the brand-orange token.

### Medium: primary orange has a known contrast limitation

White text on `#ff4f00` is approximately 3.30:1. The design system already records this at [docs/DESIGN.md:24](../docs/DESIGN.md#L24). That is below the 4.5:1 WCAG AA threshold for normal-sized text, so small text inside orange buttons, badges, and tabs can be hard to read even though the orange itself is correct.

**Recommendation:** preserve `#ff4f00` as requested, but use dark foreground text for normal-size filled controls where possible, or reserve white-on-orange for large/bold labels and increase the control's text size/weight. Keep a visible border, icon, or text state so color is never the only selection signal.

### Low: marketing content has intentional multi-color exceptions

These are not bugs, but they should stay bounded:

- Blog pillar chips use six colors at [src/app/(marketing)/blog.css:32](../src/app/(marketing)/blog.css#L32) to distinguish editorial categories.
- Open Graph/social preview images use a green `#4ade80` highlight and dark red/brown backgrounds across the OG modules, beginning at [src/app/(marketing)/opengraph-image-content.tsx:11](../src/app/(marketing)/opengraph-image-content.tsx#L11) and [src/app/(marketing)/opengraph-image-content.tsx:100](../src/app/(marketing)/opengraph-image-content.tsx#L100). These are not in-page UI, but they create a different brand impression when shared.
- Google, Facebook, Yelp, Zapier, Square, Clover, HubSpot, and user-selected business colors are correctly allowed to retain their own identity.
- Public review capture pages intentionally support a custom business color and a separate navy/sky/teal fallback so a customer-facing review flow can be branded independently.

## What is already consistent

- `--primary`, `--brand-accent`, `--brand-orange`, `--ring`, and CTA tokens all resolve to `#ff4f00` in both themes.
- Marketing pages use the same warm light canvas and orange CTA treatment.
- Dashboard shell/sidebar surfaces use shared background, card, border, and sidebar tokens.
- Platform logo colors are isolated to platform identity, rather than being used as generic actions.
- Custom public-page colors are passed through `readableForeground` in the review flow so user-supplied colors do not automatically create unreadable text.

## Recommended target hierarchy

| Priority | Token/role | Use |
|---|---|---|
| 1 | `--primary` / `--brand-orange` | Zyene actions, links, active tabs, AI reply controls, sync controls, demo CTAs |
| 2 | `--success` (add in both themes) | Completed/sent/connected states and positive insight labels |
| 3 | `--warning` / `--warning-foreground` | Caution, pending, medium rating, quota notices |
| 4 | `--destructive` / `--destructive-foreground` | Failed, negative, destructive, low-rating alerts |
| Separate | platform tokens | Google/Facebook/Yelp/etc. logos and platform identifiers only |
| Separate | customer-brand tokens | Public review flows and downloadable branded assets only |

## Audit method and limits

This was a static full-repository color audit plus representative rendered checks of the local marketing product tour and pricing page. It covered all route templates and shared components currently under `src/app`, `src/components`, and `src/lib`. It did not submit forms, connect external accounts, send reviews, or inspect production data. Authenticated dashboard screens were assessed from their route templates and component graph because an authenticated local dashboard session was not verified.


## Implementation follow-up

Implemented locally after the audit, preserving the exact orange `#ff4f00`:

- AI/sync token now follows primary in both themes; negative trends, failed audits and sync errors use destructive instead.
- Added theme-aware success colors. Status text across dashboard, integrations, billing, requests and reporting no longer uses bright chart green/yellow. Actual chart series remain distinct.
- Replaced the rainbow demo banner with a quiet shared card and one orange action.
- Reworked Smart Insights, customer portal, QR actions and NFC promotion into warm neutral panels, shared typography, restrained borders and orange actions.
- Insights choices expose selection; suggestions use keyboard-accessible disclosure buttons. Collapsed actions are inert. Copy-link uses a labeled native button.
- Fixed malformed chained opacity utilities and added detection to the existing color guard.
- Blog surfaces and text use the warm palette; onboarding/billing glows use the original orange. Marketing social-preview brand highlights now use orange.
- Customer-selected review-page colors and official platform logos are preserved. White text on the original orange retains the previously documented 3.30:1 tradeoff; this pass does not darken the brand orange.

Verification uses real dashboard components rendered with fictional data, alongside the local marketing tour. This is not evidence of visiting every authenticated screen or testing real customer sends.

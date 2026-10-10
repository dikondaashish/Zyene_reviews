# Dashboard loading states

> Archived October 10, 2026. This is historical evidence, not current implementation or deployment status. See [the current cleanup record](../../DEEP_CODEBASE_AUDIT_REPORT.md).

The authenticated app uses a soft, moving highlight across neutral skeleton placeholders, informed by the OptiMonk Home → Analytics transition observed in Chrome on September 29, 2026.

## Implementation

- `dashboard-loading.css` applies a 1.6-second transform-only shimmer to existing shared skeletons inside the dashboard shell. Public-site skeletons retain their existing behavior; vendored UI primitives are unchanged.
- `DashboardSkeleton` also identifies placeholders rendered outside the shell, such as dialog portals. New dashboard loading components use this wrapper.
- Page, form, chart, business-list, Smart Insights, and Customer Portal placeholders describe the content being loaded. The dashboard loading layout mirrors the restored insights/portal-first order.
- A dashboard route fallback covers routes without their own loading boundary. More specific boundaries remain in place.
- Analytics Suspense boundaries and dashboard dynamic imports show placeholders while their components load. Campaigns and Google listing forms also use placeholders.
- Empty review lists show loading feedback until their request completes. Existing review content stays visible during background refreshes.
- Reduced-motion users get static placeholders. Loading effects do not add artificial delay or hide already-loaded content.

The loaded dashboard arrangement, Smart Insights content and colors, and Customer Portal content and colors are unchanged.

## Browser verification

Chrome checks used a temporary local route containing the production loading components. Confirmed the pseudo-element transform changes over time, the 1.6-second animation runs in light and dark mode, and reduced-motion emulation disables it. Confirmed no horizontal page overflow at 320px and 390px. A temporary delayed server page verified that the Next.js loading boundary appears during navigation and is replaced when content resolves. All temporary routes and their artificial delay were removed afterward.

Screenshots are saved locally in `output/loading-shimmer/`. The local auth session was expired, so authenticated production navigation after deployment remains a separate check.

## Automated checks

TypeScript, the file-size guard, color guard, and eight focused tests passed. Changed-file ESLint reported no errors and retained the existing chart mount-effect warning. React Doctor scored the changed files 89/100 with one maintainability warning for the existing public-review panel's conditional rendering; no errors were reported.

The production webpack build passed, including type checking and static-page generation.

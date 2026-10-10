# Dashboard UI/UX polish — September 28, 2026

> Active UX audit with an unfinished keyboard review, restored October 10, 2026. The September checks below are historical. Current guidance is in [DESIGN.md](DESIGN.md); remaining work is tracked in [DOCUMENTATION_FOLLOW_UP_2026-10-10.md](DOCUMENTATION_FOLLOW_UP_2026-10-10.md).

## Current decision and open work — October 10, 2026

The owner requested that Smart Insights and Customer Portal retain their original
placement ahead of metric cards. `src/app/(dashboard)/dashboard/dashboard-view.tsx`
and `dashboard-view-top-row.tsx` still implement that order. DESIGN.md now reflects
this decision; this document does not propose another layout change.

The competitor search autocomplete keyboard review remains open (UX-1). Its input
and suggestion list have accessibility roles, but those roles alone do not prove
keyboard selection, dismissal and focus behavior. Record a dedicated controlled
check and fix confirmed defects before marking that follow-up complete.

## September implementation record

This pass improves the authenticated app using the approved OptiMonk-inspired light and dark palette. The Smart Insights and Customer Portal color exceptions, original review-platform branding, and collapsible sidebar are preserved.

## Coverage

Live Chrome review covered Dashboard, Businesses, Customers, Campaigns, Review Requests, Reviews, Competitors, Analytics, Google SEO/AEO overview, Questions (unavailable state for the selected business), Settings General, and Integrations. Source review also covered representative campaign creation/detail, contact import, onboarding, Questions, Google SEO/AEO advanced forms, billing interval selection, team permissions, lodging settings, and integration dialogs.

This is a route-family and shared-component audit, not an exhaustive review of every component, permission combination, account state, or backend workflow. Production inspection was read-only; no campaigns, replies, billing changes, or account settings were submitted.

## Changes

- The welcome header, Smart Insights, and Customer Portal retain their original dashboard positions. The original section order was restored at the user's request after the polish pass. Metrics show their actual values immediately instead of counting up from zero.
- Metric cards use consistent solid surfaces, readable descriptions, tabular numbers, and calmer movement. The existing rating stars remain intact.
- Analytics uses the existing Google and Facebook brand assets. Platform buttons wrap on small screens, and both platform and date controls expose their selected state.
- Customers has concise introductory copy, optional test-contact guidance, a compact mobile action row, a visible export-progress state, named search, neutral filter reset, and page/range context in pagination.
- Campaign and competitor empty states share a clear next-action pattern. Browse Templates opens the template library through a persistent URL parameter.
- Eight main route loading states share responsive skeletons and accessible loading announcements.
- Campaigns, Analytics, and Settings remove redundant outer padding. Settings navigation scrolls within each group on narrow screens.
- The app shell includes a keyboard skip link and avoids nested main landmarks.
- CSV selection uses keyboard-accessible buttons with accurate copy. Campaign steps identify the current step; later steps no longer look available. Onboarding fields have associated labels and validation descriptions.
- Questions keeps the selected question visible while composing an answer. Integration and Google visibility forms have associated field labels.
- Clipboard actions report success only after copying succeeds and provide failure feedback.
- Team permissions include text equivalents for icon states. Settings pages use page-level headings, lodging switches have accessible names, billing interval buttons expose selection, and empty link flags display “None.”

## Verification

- `pnpm verify:fast`: TypeScript and file-size guard passed.
- `pnpm build`: production webpack build passed, including TypeScript and all 272 static pages.
- Color guard passed; no new raw colors or palette drift.
- ESLint passed for changed TSX files.
- Five focused test files passed (17 tests): dashboard insights/accessibility, header switchers, campaign timing, onboarding motion, and settings access.
- React Doctor changed-file scan: 81/100, no errors, two maintainability warnings in existing conditional metric rendering. Broad transition warnings were removed. These two warnings do not indicate failed behavior or an accessibility regression.
- Chrome local component preview tested at desktop, 390px, and 320px. Verified light/dark rendering, no page-level horizontal overflow, platform/date selection, search/reset, and initial template selection from the URL.
- Preview screenshots and the temporary fixture are saved locally under `output/app-ux-polish/`; the temporary route is removed before shipping.

## Limits and follow-up

Local visual checks used real components with sample props because the localhost auth session was expired. They do not replace end-to-end tests of authenticated sends, uploads, billing, OAuth, or every settings mutation. Automated checks do not establish that every page is visually perfect. The competitor search autocomplete still deserves a dedicated keyboard interaction review. Other route-specific layout and workflow refinements can build on this shared pass without changing the approved palette.

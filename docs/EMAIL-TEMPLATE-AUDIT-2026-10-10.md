# Email template audit — October 10, 2026

The audit covers every application email renderer and all 13 Supabase authentication/security email templates. Preview data is synthetic; no customer emails were sent during testing.

## Inventory

| Family | Preview cases |
| --- | ---: |
| Welcome, payments, subscriptions, team invitations, recovery receipts | 10 |
| Review alerts, weekly digests, AI visibility alerts | 7 |
| Competitor alert and AI visibility reports, including white label | 4 |
| Personal review requests, custom text/HTML, three built-in campaigns | 7 |
| Seven signup/onboarding nurture steps | 7 |
| Paid onboarding sequence and winback | 5 |
| Marketing nurture, newsletter welcome, three newsletter editions | 7 |
| Guide, template pack, referrals, free-tool results, bonus replies | 6 |
| Contact/demo receipts and internal form notifications | 5 |
| Supabase authentication/security templates | 13 |
| **Total** | **71** |

## Changes

- Shared inline/table layout, readable typography, mobile sizing, preheaders, dark styles, 44px or taller action buttons, and Outlook width/padding fallbacks.
- Fixed malformed alert/digest tables; replaced CSS-grid report layouts with email-safe tables.
- Added plain-text alternatives to application emails, retaining action URLs and removing hidden preheaders/CSS.
- Completed unfinished campaign copy; custom plain-text review requests now render their actual content with clickable review links.
- Escaped dynamic names, newsletter copy, review evidence and URL attributes. Merchant-authored HTML remains customizable; inserted customer values stay text.
- Removed unsupported discounts, false urgency, misleading signup/trial timing, and blanket claims that every review is from Google.
- Used production defaults for dashboard, billing and settings destinations when an app URL is unset.
- Marketing nurture includes the subscriber's real unsubscribe link and rechecks subscription status after each delay.
- Authentication source preserves Supabase's `ConfirmationURL`, `Token`, and other provider variables. Existing notification enable/disable settings are preserved.

## Rendering checks

Chromium and WebKit: 320, 375, 430, 768 and 1366px widths, each in light, dark, stylesheet-stripped and Outlook dark-selector modes. Every mode tests all 71 previews: **2,840 render checks**. The automated checks cover horizontal overflow, table structure, destination attributes, action-button height and visible-text contrast. External assets are blocked to check readability when images do not load.

Mobile light/dark screenshots for every template were inspected together, with representative full-size previews reviewed individually. Phone and laptop light/dark screenshots are available in `output/email-audit/screenshots/`; the gallery is `output/email-audit/index.html`.

These are browser and fallback simulations. Native Gmail, Apple Mail and Word-based Outlook inbox rendering, deliverability, spam placement, provider tracking rewrites and actual authentication redemption have **not** been verified. User-authored full HTML templates retain their own styling and need their own preview checks.

The compatibility approach follows [Gmail's supported CSS guidance](https://developers.google.com/gmail/design/css), [Supabase's email-template variables](https://supabase.com/docs/guides/auth/auth-email-templates), and [Microsoft's email-rendering guidance](https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/email-troubleshoot-rendering).

## Reproduce

```sh
pnpm email:preview
pnpm exec playwright install chromium webkit
pnpm test:email
pnpm verify:fast
pnpm test
pnpm build
```

The preview command also exports `auth-templates.json` and individual `auth-*-source.html` files for the Supabase dashboard. The maintained source is `src/lib/email/supabase-auth-templates.ts`. Changing that file alone does not update the hosted provider configuration.

## Validation and hosted configuration

- Typecheck and file-size guard: passed.
- Full Vitest suite: 305 files, 2,025 tests passed, including SDK-level plain-text delivery checks.
- Color guard: passed; standalone email layouts and preview HTML explicitly use literal colors because inboxes cannot resolve application CSS tokens.
- Final rendering rerun: all 40 configurations passed (2,840 template checks).
- Production webpack build: passed, including TypeScript and all 280 static pages.
- Supabase hosted subjects/bodies: all 13 saved in the production project. Signup and invitation were reloaded and their HTML compared to the maintained source. Other bodies were compared in the editor before saving, with provider save acknowledgements checked. All seven optional security-notification switches remain disabled.

Checks run from an equivalent checkout under `/tmp/zyene-email-qa` with the same lockfile because the workspace's iCloud-offloaded dependencies stalled loading. The original dependency installation was left intact.

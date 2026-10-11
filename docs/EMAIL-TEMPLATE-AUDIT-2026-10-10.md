# Email template audit — October 10, 2026

The audit covers every application email renderer and all 13 Supabase authentication/security email templates. Every Zyene email now uses a warm off-white canvas, a rounded white message card, the official orange logo above the card, and a separate company footer. The final structure adapts the owner-provided Gusto verification email reviewed in Gmail: centered logo, bordered message section, clear sans-serif heading, rounded action and quiet footer. Zyene retains its own identity and copy. Action buttons and accents use the owner-requested `#FF4F01` brand orange. White button labels are 19px bold: the measured 3.2963:1 contrast meets the 3:1 requirement for large text; ordinary body and link text retain the 4.5:1 threshold. Preview data is synthetic; no customer emails were sent during testing.

Company footer:

> Zyene, Inc.
>
> 28 Geary St Ste 650 #1892, San Francisco, CA 94108

The footer also includes support, website, privacy and copyright details. Existing explicit agency white-label reports retain their agency identity.

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

- Shared email-safe inline/table layout with a 600px shell, warm off-white background, a white card with a fine border and 12px corners, centered 36px logo above the card, dark centered 28px heading, 15px body copy, and a separate muted footer. Detail panels use a pale peach background and 8px corners. Mobile keeps the background and rounded card visible with narrower padding.
- Orange action buttons use exactly `#FF4F01`, with 19px bold white labels in light, dark and fallback modes. Buttons are centered with 8px corners and remain at least 48px tall; inline colors, preheaders, mobile spacing, dark styles and Outlook width/padding fallbacks are retained.
- Shortened the welcome email to a personal greeting, concise introduction and one primary action. Its plain-text version derives from the same content, including the correct support address and company footer.
- Fixed malformed alert/digest tables; replaced CSS-grid report layouts with email-safe tables.
- Added plain-text alternatives to application emails, retaining action URLs/company details and removing hidden preheaders/CSS.
- Completed unfinished campaign copy; custom plain-text review requests now render their actual content with clickable review links.
- Escaped dynamic names, newsletter copy, review evidence and URL attributes. Custom review HTML, including full documents, is placed inside the branded delivery frame while retaining merchant styles; inserted customer values stay text.
- Removed unsupported discounts, false urgency, misleading signup/trial timing, and blanket claims that every review is from Google.
- Used production defaults for dashboard, billing and settings destinations when an app URL is unset.
- Fixed the Resend SDK property from `reply_to` to `replyTo`: the old property was silently discarded. Both sending accounts now serialize the correct Reply-To header. Product mail defaults to support; review requests retain the merchant reply address.
- Newsletter and product-tip sequences include visible opt-out links and RFC 8058 one-click headers. Provider POSTs return JSON success without a login or redirect. Browser GETs only show confirmation; link scanners cannot unsubscribe recipients.
- Product-tip opt-out uses an opaque run UUID, cancels onboarding/trial/winback sequences, prevents future registration, and is checked after every delay. Completing a worker cannot overwrite a canceled preference. Essential security and billing emails continue.
- The proxy permits origin-less POSTs only on the two exact token-authorized unsubscribe paths. Other mutations retain origin validation, and unsubscribe requests retain rate limiting.
- Marketing nurture includes the subscriber's real unsubscribe link and rechecks subscription status after each delay. Newsletter preferences remain separate from product-tip preferences.
- Authentication source preserves Supabase's `ConfirmationURL`, `Token`, and other provider variables. Existing notification enable/disable settings are preserved.

## Rendering checks

Chromium and WebKit: 320, 375, 430, 768 and 1366px widths, each in light, dark, images-blocked, stylesheet-stripped and Outlook dark-selector modes. Every mode tests all 71 previews: **3,550 render checks** across **50 configurations**. The final rounded design was retested in all configurations. The runner resets scroll position between documents so a preceding long email cannot crop the next preview. The automated checks cover horizontal overflow, table structure, destination attributes, action-button height, computed white button text and exact `#FF4F01` backgrounds in every mode, visible-text contrast, actual logo markup and company address.

Normal rendering uses the exact official PNG from the repository. The public production PNG separately returned HTTP 200 and loaded at its full 1200px width in both a direct browser view and an ordinary email preview. The images-blocked mode verifies readable identity and content when images cannot load.

Mobile light/dark screenshots for every template were inspected together, with representative full-size previews reviewed individually. Phone and laptop light/dark screenshots are available in `output/email-audit/screenshots/`; the gallery is `output/email-audit/index.html`.

These are browser and fallback simulations. Native Gmail, Apple Mail and Word-based Outlook inbox rendering, deliverability, spam placement, provider tracking rewrites and actual authentication redemption have **not** been verified. Merchant-authored styles need their own preview checks. Supabase's sandboxed dashboard preview did not load the external logo; the saved URL, public asset and ordinary email preview were verified independently.

Button typography follows [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). The compatibility approach follows [Gmail's supported CSS guidance](https://developers.google.com/gmail/design/css), [Supabase's email-template variables](https://supabase.com/docs/guides/auth/auth-email-templates), and [Microsoft's email-rendering guidance](https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/email-troubleshoot-rendering).

Sender headers and opt-out behavior follow [Google's sender guidelines](https://support.google.com/mail/answer/81126) and [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058). This audit does not claim complete legal compliance or inbox placement.

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
- Full Vitest suite: 308 files, 2,052 tests passed, including actual SDK serialization, one-click endpoints, proxy guards and persisted opt-out checks.
- Color guard: passed; standalone email layouts and preview HTML explicitly use literal colors because inboxes cannot resolve application CSS tokens.
- Final rendering rerun: all 50 configurations passed (3,550 template checks); 284 phone/laptop light/dark screenshots saved.
- Production webpack build: passed, including TypeScript and all 281 static pages.
- Supabase hosted bodies: the earlier design was saved and compared byte-for-byte in all 13 templates. The final rounded design was then pasted from the maintained export, saved, reloaded, and checked through each provider preview for the expected heading, brand identity, company address and provider variables. Current verification uses preview content and source excerpts; it does not claim a fresh byte-for-byte comparison of every rounded body. An empty invitation body was caught during readback, restored, saved and verified. Every later save checked the complete preview first. Existing subjects were retained and all seven optional security-notification switches remain disabled.
- Zyene sender DNS: removed the effective duplicate DMARC policy by renaming the old `p=none` record to `_dmarc-legacy`. One existing `p=quarantine` policy remains active; its contents were preserved. Both authoritative nameservers and a recursive resolver confirmed the result. [RFC 7489](https://www.rfc-editor.org/rfc/rfc7489) stops policy processing when multiple DMARC records remain.
- CollectRatings sender DNS: SPF, DKIM and SES feedback MX exist for the configured `send.collectratings.com` sender. Added the missing root DMARC policy (`v=DMARC1; p=none; adkim=r; aspf=r`), verified on both authoritative nameservers. This non-enforcing policy completes the published authentication setup without rejecting existing mail.

Checks run from an equivalent checkout under `/tmp/zyene-email-qa` with the same lockfile because the workspace's iCloud-offloaded dependencies stalled loading. The original dependency installation was left intact.

Hosted template and DNS corrections are live. Application code is on the email-audit pull request and takes effect after merge/deployment. Provider screenshots, exact body comparisons and verification logs are retained under `output/email-audit/`.

# Privacy & consent architecture

> **Rule for every change:** non-essential browser code (analytics, ads, replay, third-party widgets that set cookies) is started **only** from `PrivacyScripts` or behind a `PrivacyManager` check. Adding a `<Script>`, SDK init or pixel anywhere else bypasses consent. Review that with the same care as an auth bypass.

This is engineering documentation. It describes what the code does. It is not a legal opinion, and nothing here should be read as a claim that the product is "GDPR/CCPA compliant".

## 1. Overview

```
request ──► proxy.ts ─► withPrivacyJurisdiction()   reads x-vercel-ip-country + Sec-GPC
                         └─ sets zyene_jurisdiction=EU_EEA|UK|US|OTHER[.gpc]   (JS-readable, 24 h)
page (static or dynamic) renders with NO trackers in HTML
browser ─► <PrivacyManager/> (root layout, mounted once)
             usePrivacy() = resolvePrivacyState(zyene_consent, zyene_jurisdiction, GPC)
             ├─ CookieBannerBar         opt-in regions, until a choice exists
             ├─ PrivacySettingsDialog   opened by any "Privacy choices" button
             ├─ PrivacyScripts          GTM, CTA tracker, Meta Pixel, Better Stack, Sentry Replay
             └─ VercelMeasurement       cookieless; drops events after an explicit analytics "no"
```

| Module | Role |
|---|---|
| `src/lib/privacy/types.ts` | Categories, `Jurisdiction`, `ConsentRecord`, `PrivacyState` |
| `src/lib/privacy/privacy-regions.ts` | Country → jurisdiction, and the **rules per jurisdiction** (opt-in/opt-out, banner, defaults) |
| `src/lib/privacy/consent-policy.ts` | `resolvePrivacyState()`: the single decision function. Also Consent Mode mapping and withdrawal detection |
| `src/lib/privacy/consent-record.ts` | `zyene_consent` format, versioning, shared domain, legacy migration |
| `src/lib/privacy/jurisdiction-cookie.ts` | `zyene_jurisdiction` format and per-request resolution, including the dev override |
| `src/lib/routing/proxy-privacy-jurisdiction.ts` | Proxy hook that sets the jurisdiction cookie |
| `src/lib/privacy/privacy-store.ts` | Browser PrivacyManager: `usePrivacy()`, `hasConsent()`, `savePrivacyChoice()`, `openPrivacySettings()` |
| `src/lib/privacy/tracking-config.ts` | Public tracker IDs and hosts |
| `src/components/privacy/*` | Banner, dialog, `PrivacyScripts`, `VercelMeasurement`, `PrivacyChoicesButton`, `FunctionalEmbedGate` |

## 2. Region detection

- Vercel adds `x-vercel-ip-country` (ISO alpha-2) to every request at the edge. Next 16 removed `request.geo`, and `@vercel/functions`' `geolocation()` reads the same header, so we read it directly and add no dependency.
- The proxy maps the country to `EU_EEA | UK | US | OTHER` and writes **only that label** to `zyene_jurisdiction`. It never writes the country, region, city or IP, and it logs nothing.
- The label lives in a cookie rather than being read in the root layout. Reading `headers()` in the layout would make every marketing page dynamic.
- No header (local dev, or a request that skipped the proxy) → `OTHER`, which is opt-in. A missing or garbled cookie in the browser → `OTHER` as well.
- Client-side navigation never re-detects location. The cookie is refreshed on full page requests only when its value changes.

Countries per group are listed in `privacy-regions.ts`: EU-27 + IS/LI/NO, GB, and US plus territories. Crown dependencies, Switzerland and everywhere else fall to `OTHER`.

## 3. Behaviour by jurisdiction

| | EU/EEA | UK | US | OTHER / unknown |
|---|---|---|---|---|
| Model | opt-in | opt-in | opt-out | opt-in |
| First-visit banner | yes | yes | **no** | yes |
| Before any choice | essential only | essential only | all categories on (marketing off with GPC) | essential only |
| "Privacy choices" in footer | yes | yes | yes | yes |

To change a region's behaviour, edit `JURISDICTION_RULES`. Nothing else hard-codes regional behaviour.

## 4. Consent categories

| Category | Default (opt-in regions) | What is in it |
|---|---|---|
| essential | always on, locked | auth/session, OAuth state, consent + jurisdiction cookies, UI preferences, Sentry errors, Stripe redirect, Google Sign-In |
| functional | off | Cal.com embed on `/demo` (click-to-load), Better Stack status widget |
| analytics | off | GTM → GA4, CTA dataLayer listener, Sentry Session Replay, first-party marketing events, signup funnel dataLayer events |
| marketing | off | Meta Pixel, Google Ads via GTM Consent Mode, `zyene_utm` attribution cookie |

## 5. Storage of the choice

`zyene_consent=v2.f<0|1>.a<0|1>.m<0|1>.<JURISDICTION>.<epoch-ms>`

- Domain `.zyenereviews.com` (host-only on localhost and previews), `path=/`, `SameSite=Lax`, `Secure` on https, 180 days. It is not `HttpOnly`, because the browser UI reads it.
- The cookie holds no identifiers. It is untrusted input: it only decides which trackers start and must never be used for authorization.
- **Versioning:** bump `CONSENT_VERSION` whenever a category gains a materially different tool. Older records then parse as `null` and opt-in visitors see the banner again. v1 (2026-10-15) had no functional category and is re-asked.
- **Legacy migration:** the original localStorage banner (`cookie-consent`, `cookie-preferences`) is converted once and then removed.

## 6. How scripts are gated

- `PrivacyScripts` renders `<Script>` tags only for granted categories. Nothing is server-rendered, so the HTML of every page contains no tracker. Hydration uses the "nothing granted" snapshot, so there is no flash of trackers.
- **GTM** loads if analytics **or** marketing is granted. A Consent Mode v2 `default` is queued before `gtm.js`, so tags inside the container see the per-category state. Later grants push `gtag('consent','update',…)`. **The container contents (GTM-WF6DJZ8J) are not in this repo.** Every tag there must respect Consent Mode, or must be triggered only on `analytics_storage`/`ad_storage` granted.
- **Sentry:** errors are always on (no cookies). `replayIntegration` is attached via `Sentry.addIntegration` only after analytics consent. The sample rates come from `Sentry.init`.
- **Plain functions** (`trackMarketingEventClient`, `trackSignupEvent`, `UtmCapture`) check `hasConsent()` / `usePrivacy()` before touching storage or sending events.
- **Third-party iframes** use `FunctionalEmbedGate`, which shows a click-to-load placeholder. The `/demo` calendar is gated this way. The "Book an appointment" dialog is not gated, because opening it is the visitor's request.
- **Withdrawal** (any category turned off that was running, including US defaults) expires known tracker cookies (`_ga*`, `_gid`, `_gat`, `_fbp`, `_fbc`, `_gcl*`, `zyene_utm`) on the host and parent domain, then reloads. Scripts that already ran cannot be unloaded in place. Third-party cookies inside iframes (Cal.com) cannot be deleted by us.

### Vercel Web Analytics / Speed Insights

`@vercel/analytics@1.6` and `@vercel/speed-insights@1.3` set no cookies and no localStorage. Visitors are counted with a server-side hash that rotates daily. Because nothing is stored on or read from the device, they run before a choice. Once a visitor **explicitly** rejects analytics, `beforeSend` drops every event. *Legal review:* confirm this classification for EU/UK.

## 7. Global Privacy Control

- Detected from `navigator.globalPrivacyControl === true` **or** the `Sec-GPC: 1` request header. The proxy records the header as `.gpc` on the jurisdiction cookie.
- Effect in **every** region: `marketing` is forced off and the dialog shows the switch disabled with an explanation. Essential, functional and analytics are not affected.
- Do Not Track (`DNT`) is a different signal and is ignored.

## 8. Adding things

**A new analytics provider**
1. Add its public ID to `tracking-config.ts` (from a `NEXT_PUBLIC_*` env var).
2. Render it inside `PrivacyScripts` under `analytics &&`, or initialise its SDK in an effect keyed on `analytics`.
3. Add its cookie prefixes to `COOKIES_BY_CATEGORY.analytics` in `privacy-store.ts`.
4. Add a row to the policy table (`privacy-cookies-section.tsx`) and to the inventory below.
5. If it changes what visitors agreed to, bump `CONSENT_VERSION`.

**A new marketing provider:** same steps, under `marketing`. If it is loaded through GTM instead, make sure the tag requires `ad_storage` in GTM.

**Classifying a new cookie or storage key**
- *Essential:* the feature the visitor asked for cannot work without it (auth, security, payment, a preference they set, remembering a dismissed message).
- *Functional:* an optional convenience, often third-party, that the core flow works without.
- *Analytics:* measurement of usage.
- *Marketing:* advertising, attribution or cross-site profiles.
- If you cannot tell, treat it as non-essential and gate it until someone confirms.

## 9. Testing locally

- In development, add `?privacy_region=EU_EEA|UK|US|OTHER` to any page URL. The value is stored in `zyene_jurisdiction` until it changes. You can also set `PRIVACY_REGION_OVERRIDE=US` in `.env.local`. **Both are ignored when `NODE_ENV=production`**, including Vercel previews.
- To reset, clear the `zyene_consent` and `zyene_jurisdiction` cookies.
- In automated tests, send the header Vercel would send, for example `page.setExtraHTTPHeaders({ "x-vercel-ip-country": "DE" })`. This also works against `pnpm start`, which is how CI runs the suite.
- Unit tests: `pnpm exec vitest run tests/unit/privacy-*.test.ts`
- Browser/network test: `pnpm exec playwright test tests/visual/privacy-consent.spec.ts` (part of the `public-pages` CI job). It asserts that no request reaches GTM, Google Analytics, Meta or Better Stack before consent.

## 10. Cookie and storage inventory

| Name | Provider | Purpose | Category | 1st/3rd party | Created | Lifetime | Consent-controlled |
|---|---|---|---|---|---|---|---|
| `sb-<project>-auth-token` (+ chunks) | Supabase via `@supabase/ssr` | Auth session | Essential | 1st (`.zyenereviews.com`) | sign-in / refresh in proxy | per Supabase session | No |
| Facebook connect state, `FB_CONNECT_COOKIE` | Zyene | OAuth CSRF / selection nonce | Essential | 1st | Facebook connect flow | short-lived | No |
| add-business OAuth cookie | Zyene | Google OAuth state for adding a business | Essential | 1st | add-business flow | short-lived | No |
| growth dashboard cookie | Zyene | Internal dashboard auth | Essential | 1st | internal login | per config | No |
| `zyene_consent` | Zyene | Stores the choice | Essential | 1st | on choice | 180 days | No (is the record) |
| `zyene_jurisdiction` | Zyene | Region group + GPC flag | Essential | 1st | proxy, page requests | 24 h | No |
| `locale` cookie + localStorage | Zyene | Language | Essential (preference) | 1st | language switch | 1 year | No |
| `theme` (localStorage) | next-themes | Light/dark | Essential (preference) | 1st | theme switch | persistent | No |
| `sidebar_state` | shadcn sidebar | Sidebar open state | Essential (preference) | 1st | sidebar toggle | 7 days | No |
| `getting-started-dismissed`, `zyene-widget:*`, `zyene_payment_pending`, home-wizard/exit-intent "seen" keys | Zyene | UI state, payment return handling | Essential | 1st (localStorage) | on interaction | persistent | No (*review*) |
| `zyene_me_*`, `zyene_signup_*_tracked` (sessionStorage) | Zyene | Event dedupe | Analytics | 1st | on tracked event | session | **Yes** |
| `zyene_utm` | Zyene | Campaign attribution | Marketing | 1st | landing with UTM params | 30 days | **Yes** |
| `_ga`, `_ga_<id>` | Google Analytics (via GTM) | Usage analytics | Analytics | 1st (set by GA script) | after GTM loads | up to 2 years | **Yes** |
| `_gcl_*` | Google Ads (via GTM) | Ad conversion | Marketing | 1st | if an Ads tag fires | 90 days | **Yes** (via Consent Mode in GTM) |
| `_fbp`, `_fbc` | Meta Pixel | Ad attribution | Marketing | 1st | after Pixel loads | 90 days | **Yes** |
| Sentry Replay session storage | Sentry | Replay buffering | Analytics | 1st | after replay is attached | session | **Yes** |
| Cal.com cookies | Cal.com | Booking widget | Functional | 3rd (iframe) | when the calendar loads | Cal.com-defined | **Yes** (click-to-load on `/demo`) |
| Better Stack widget | Better Stack | Status announcements | Functional (*unknown storage*) | 3rd | after functional consent | unknown | **Yes** |
| Google Identity Services | Google | Google sign-in button | Essential (requested) | 3rd | auth pages | Google-defined | No |

Not used anywhere in the repo: PostHog, Mixpanel, Amplitude, Segment, Hotjar, Clarity, Intercom, Crisp, Zendesk, HubSpot, TikTok and LinkedIn pixels, Stripe.js/Elements. Stripe is server-side plus a redirect to Checkout or the billing portal.

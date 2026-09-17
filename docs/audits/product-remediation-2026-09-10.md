# Product audit remediation

## Authorized scope and exception

The owner authorized implementing the September 10 product audit recommendations. The owner also states that Google approval and attorney-reviewed documentation cover the existing rating-based review-routing flow. **Preserve that routing, its threshold, and service-recovery behavior.** The original audit's routing recommendation is excluded from implementation. This records the owner's instruction; no independent legal conclusion or new public approval claim is being made.

**Brand constraint reaffirmed September 12:** preserve the original `#ff4f00` orange in both themes and all primary actions. Do not substitute another orange.

Do not delete or reclassify production customers based on guessed identity. Do not overwrite existing local work. No new testimonials or customer outcomes may be invented.

## Baseline

Before remediation: typecheck passed; 163 test files / 1,236 tests passed; file sizes and migrations passed. ESLint had 502 warnings and zero errors. Color guard failed on the pre-existing contrast utility and its test fixtures; resolve the narrow legitimate-color exception before the final gate.

## Implementation status

Checked items mean implemented in the local working tree, not deployed or proven through every live integration.

- [x] Widget: preserve original review text; identify rating-only reviews; show zero/empty states without fabricated scores or endorsements; display the actual platform.
- [x] Tracking: stop accepting client assertions of Google publication. Label request completion and Google handoffs separately from verified published reviews; retain legacy API compatibility.
- [x] AI evidence: Wilson uncertainty intervals; filter generic text matches; label word overlap honestly; limit edit recommendations to the business's own website.
- [x] AI availability: explain monitoring-off states, historical results, coverage and spending projections; group advanced tools.
- [x] Marketing: simplify homepage, remove unsupported logo/testimonial proof, retain the labeled fictional interactive tour and original orange.
- [x] Examples: replace invented case-study outcomes with educational workflows; align page titles, footer links, imagery, metadata and social-card copy.
- [x] Public content: replace internal partner/enterprise/agency instructions with buyer-facing scope; qualify feature and integration availability; date competitor pricing evidence.
- [x] Tools: return useful results without email; preserve results if optional delivery fails; remove estimated response rates; label the response generator as template-based with editing and copying.
- [x] Pricing/help/docs: correct email allowances, reset periods and CSV export instructions; add API response/error/pagination guidance; align campaign help with visible controls.
- [x] Dashboard: retain the existing task-first layout and prioritize recent unresolved reviews; clarify completion metrics and missing dates.
- [x] Reviews: default to Needs reply, search review text/authors, keep compact rows expandable, prevent stale business/search responses, and restrict bulk actions to visible selections.
- [x] Requests/campaigns: add a read-only request preview with business, recipient, message, schedule and quota; use real business context in campaign previews; preserve queue/retry and audience-isolation fixes; make empty-state copy accurate.
- [x] Customers/import: reserve the explicit `zyene:test` tag for KPI/send exclusions; do not guess test identities. Validate CSV rows before upload, support phone-only contacts, provide a template, and retain business context.
- [x] Settings: wrap navigation; use the canonical collection URL; validate notification phone numbers; calculate quiet hours in the business timezone; explain UTC resets and preview the next Stripe invoice without creating a charge.
- [x] Onboarding: remove the final-step shortcut that bypassed completion; preserve existing authentication, payment and account safeguards.
- [x] Localization/editorial: disclose the English conversion/support path on Spanish pages; remove unsupported industry and campaign benchmarks; label arithmetic examples as assumptions.
- [ ] Release validation: the production build passes; final signed-in preview scenarios remain open until they are exercised with a local test session.

## Verification evidence — September 12

- Full `pnpm verify`: **173 test files, 1,262 tests passed**, TypeScript passed, file-size guard passed (28 grandfathered files, no growth exemptions added).
- Final source SEO checks: every marketing page exports metadata; no raw `<img>` tags in marketing routes/components; sitemap coverage tests pass. This is not a fresh search-engine crawl.
- Full ESLint: **zero errors, 502 existing warnings**. Color and migration guards pass; `git diff --check` passes.
- Focused regressions cover original widget text, unverified handoffs, uncertainty bounds, owned-page recommendations, optional email failure, request-preview authentication and tenant scope, literal review search, rejection of stale URL updates, test-contact exclusions, CSV input, timezone/DST quiet hours, and renewal after an expired trial.
- Local browser: response tool generated without email, accepted an edited reply, and displayed “Copied to clipboard.” No email was sent.
- Local browser at 390 × 844: homepage fits without horizontal overflow. After clearing stale development assets, computed root primary is **`#ff4f00`**, and the hero action background is **`rgb(255, 79, 0)`**. The old cached stylesheet had shown a different orange; the current source and refreshed page preserve the requested color.
- Production build: **`pnpm build` passed** after compilation, TypeScript, route generation, and build tracing. Earlier local attempts were blocked reading installed dependency files. The restored packages matched the SHA-512 checksums in `pnpm-lock.yaml`; no dependency version or lockfile changed.
- React Doctor: 76/100, 14 diagnostics. Ten are unsupported `try/finally` optimization paths; these are compiler bailouts, not observed runtime failures. Remaining findings concern two list keys, complexity, and an existing effect. No suppressions or unsafe removal of cleanup behavior were added. This diagnostic is not represented as a clean pass.

## Remaining release and evidence work

- Inspect the final preview with an authenticated test account. The original audit inspected the signed-in production workspace; that does not prove the locally changed UI is deployed. The latest local `/reviews` navigation redirected to `auth.zyenereviews.com/login`; no local authenticated session was available.
- Exercise new-account/OAuth cancellation and resume, restricted roles, populated campaign partial failures/retries, and billing renewal presentation in a dedicated test environment. Unit tests provide coverage, but live provider delivery and payments were not exercised.
- Founder/team facts, actual customer stories and permissioned product screenshots need real supplied evidence. Current unsupported outcomes were removed rather than replaced with invented proof.
- The docs were corrected for concrete mismatches; a full documentation consolidation, fresh screenshots for each feature, and a customer changelog tied to an actual deployment are separate remaining editorial work. Spanish conversion/support screens remain English, with an explicit notice.
- No deployment, production message, contact deletion, customer reclassification, role change or payment transaction was performed.

## Claim/source register

Comparison copy records source dates and links in the data. Prices are plan-specific and subject to the provider's current terms.

| Provider | Primary evidence checked September 12, 2026 | Treatment |
|---|---|---|
| Birdeye | https://birdeye.com/pricing/ and https://birdeye.com/blog/what-does-birdeye-cost/ | Custom quote; remove invented fixed-price savings claims. |
| Podium | https://www.podium.com/getpricing | Custom quote and scope confirmation. |
| NiceJob | https://get.nicejob.com/pricing | Reviews $75/month; Pro $125/month at verification. |
| GatherUp | https://gatherup.com/pricing/ | Single-location $99/month; distinguish multi-location scope and allowances. |

## External evidence and release limits

Real customer permission records, Google/attorney approval documents, founder facts, and customer-specific business-description changes must not be fabricated. Unsupported marketing proof can be removed without them. Existing approval documentation is not copied into public content.

Production sends, payment transactions, account deletion and role changes are excluded from automated validation. Record deployment state and any remaining prerequisites explicitly at completion.

## Reconciliation checkpoint — September 12 continuation

**Version and environment:** local working tree at `a5431f3e` on `main`, Node `v22.23.1`, pnpm `10.18.2`, Next.js `16.2.12`, and `http://localhost:3000` with `.env.local`. This was not deployed. Browser checks used the local preview and existing isolated/demo records only. No production customer, payment, role, campaign, public reply, review, or subscription was changed.

**Status vocabulary:** `verified` means the acceptance behavior has direct test or browser evidence below; `implemented but unverified` means the local code has coverage but the required latest-preview workflow was not exercised; `still pending` means remediation remains outside the work completed so far; `blocked` names a missing test prerequisite; `documented exception` is the owner-authorized rating-routing exception above.

### Browser evidence

- Public response generator: generated a template from generic test text, allowed an edit, and displayed **Copied to clipboard** without an email address or delivery.
- Public review-link generator: entering a generic test business stopped at **Select your business from the list**. Its provider lookup and returned link were not treated as verified.
- Public widget (`/w/wolfpack-bbq-burgers`): rating-only records render the neutral text **This customer left a rating without a written review.** No invented review text was visible. The current record has no provider `external_url`, so the new source-link control is implemented but not live-data verified.
- Collection page (`/r/wolfpack-bbq-burgers`) at 390 × 844: no document overflow; root `--primary` was `#ff4f00` in both the restored light theme and a temporary dark-theme check. The temporary theme preference was cleared afterward. A server/client footer-origin hydration mismatch was found and fixed; a fresh page then had no browser diagnostic for it.
- Marketing: 20 public routes were directly checked for one H1 and no desktop overflow. The revised security page renders **Configurable feedback workflows**. The review-template guide renders the revised Responsible Outreach section and matching anchor. The Podium comparison CTA now opens a mailto URL with the actual competitor name.
- Local first-compilation timing: `/security` and `/resources/review-request-templates` took 36–46 seconds during first dev compilation. The browser controller timed out while the local server completed HTTP 200 responses; after compilation, both pages rendered. This is a local development-preview limitation, not provider verification.

### Original audit findings and acceptance criteria

| Finding / criterion | Status | Evidence or remaining work |
|---|---|---|
| 1. Rating-only widget reviews never become invented testimonials | **verified** | `public-review-evidence` test and live local widget check; neutral rating-only text is visible. Trusted `http(s)` source links are **implemented but unverified** against a record that has one. |
| 2. Rating-based review routing and service recovery | **documented exception** | Preserved exactly under the owner’s documented exception. No threshold, routing, or recovery behavior was changed. Public copy no longer claims that the product does not use this workflow. |
| 3. Google click/handoff must not become a verified published review | **verified** | `public-review-evidence`, `product-evidence`, `product-workflow-reliability`, request-preview, and campaign tests distinguish a handoff/completion from publication. Latest authenticated dashboard rendering remains unverified. |
| 4. Customer proof, logos, composite stories, and outcomes | **implemented but unverified** | Unsupported proof was removed/labeled in the local work. Permissioned customer proof, founder/team facts, and actual screenshots remain **blocked** on owner-supplied evidence. |
| 5. AEO confidence, evidence, disabled states, and actionable scope | **implemented but unverified** | Evidence/ownership tests pass. Latest authenticated AEO screens still require a local test session. |

### Marketing, help, and content ledger

| Audit surface | Status | Evidence or remaining work |
|---|---|---|
| Landing page and interactive tour | **verified** | Local route and mobile checks passed; sample/demo labeling remains in place. |
| How it works and feature hub/pages | **implemented but unverified** | Capability/routing copy now describes configurable feedback and service recovery; each feature page still needs latest-preview task checks. |
| Pricing | **implemented but unverified** | Plan/help corrections have test and build coverage; checkout and plan-change behavior needs Stripe test mode. |
| Integrations | **implemented but unverified** | Customer-facing availability copy is present; real provider connect/sync/reply behavior needs provider test facilities. |
| English industry pages | **implemented but unverified** | Unsupported outcomes were removed/qualified; tailored, permissioned screenshots remain **blocked** on evidence. |
| Spanish hub and industry pages | **still pending** | The English conversion/support disclosure remains; full Spanish conversion and support localization was not invented. |
| Comparison hub and competitor pages | **verified** | Local Podium page shows dated source handling and the corrected CTA subject; broader competitor pricing must be rechecked whenever providers change terms. |
| Case-study hub and workflows | **implemented but unverified** | Local copy labels examples rather than treating them as customer proof; genuine customer stories remain **blocked** on permissions and evidence. |
| About | **blocked** | Public behavioral contradiction was removed. Founder/team identity, support ownership, and customer evidence require owner-supplied facts. |
| Partners | **implemented but unverified** | Internal acquisition playbook was replaced with buyer-facing content; actual program terms need owner evidence. |
| Agencies | **implemented but unverified** | Buyer-facing scope is present; real multi-client screenshots and branding limits remain evidence-dependent. |
| Enterprise | **implemented but unverified** | Buyer-facing wording replaced internal process detail; security evidence and delivery scope need owner confirmation. |
| Demo and contact | **implemented but unverified** | Copy/route checks passed through build; no real booking or message was submitted. |
| Blog content | **verified** | Local article check confirms handoffs are not called published reviews. Product-routing policy assertions were removed from public instructional copy. |
| Resource guides and templates | **verified** | Local guide check verifies visible previews, no-PDF statement, revised routing wording, and working table-of-contents anchor. |
| Free tools hub | **implemented but unverified** | Source and build pass; each utility remains separately tracked below. |
| Response generator | **verified** | Browser generated, edited, and copied a template without optional email delivery. |
| Review-link generator | **implemented but unverified** | Safe no-selection state was verified; an actual provider lookup/link needs a designated test listing. |
| Reputation checker | **implemented but unverified** | Fetched/estimated-data messaging is in local work; no live business lookup result was validated. |
| Privacy and terms | **blocked** | These attorney-sensitive pages were not altered. Counsel must confirm any future public-policy changes. |
| Security and retention | **implemented but unverified** | Security page renders the revised workflow wording. Retention record-type evidence still needs owner/legal confirmation. |
| Public status | **verified** | Page reachability was checked previously; reported provider uptime was not independently certified. |
| Billing, analytics, campaign, review, and integration help | **implemented but unverified** | Corrected local documentation is covered by full build/tests; its steps need an authenticated test walkthrough. |
| Docs overview, quickstart, API, cookbook, widgets, and changelog | **implemented but unverified** | API/error/pagination and copy corrections are present. Consolidating thin standalone docs and publishing a deployment-tied changelog remain **still pending**. |

### Authenticated product ledger

| Audit surface | Status | Evidence or remaining work |
|---|---|---|
| Fresh sign-up, login, password recovery, and reset | **blocked** | Latest local preview has no authenticated dedicated test session. No account or credential action was created. |
| Onboarding completion and canceled payment | **implemented but unverified** | Existing recovery/resume code remains; Stripe cancellation needs a test-mode checkout. |
| Canceled/failed Google onboarding connection | **verified** | New `onboarding-google-oauth-callback` unit test covers consent cancellation, keeps a returned code intact, and ignores payment URLs. The UI now gives a retry/manual-entry recovery path without exposing an environment-variable name. |
| Dashboard prioritization and metric labels | **implemented but unverified** | Source/tests cover data semantics; latest authenticated desktop/mobile state needs browser evidence. |
| Reviews search, reply preview, and automatic replies | **implemented but unverified** | Literal-search and review workflow tests pass; no public reply or auto-reply setting was executed. |
| Private feedback service-recovery inbox | **documented exception** | The service-recovery path is preserved with the authorized routing. Individual records were not processed. |
| Requests and metric semantics | **implemented but unverified** | Request preview and handoff semantics are unit-tested; latest UI needs authenticated validation. |
| Campaigns list and empty state | **implemented but unverified** | Local code/test coverage exists; latest authenticated UI needs browser validation. |
| New campaign audience, exclusions, preview, quota, and queue/retry | **verified** | Audience isolation, test-contact exclusions, request preview, failed enqueue, and retry-without-duplicate tests pass. A provider delivery lifecycle remains **blocked** on isolated recipients and credentials. |
| Populated campaign detail, partial failures, retry, cancellation | **blocked** | Detail response tests pass, but no populated isolated campaign/test provider delivery is available. Do not infer delivery from a queued state. |
| Customers, test-contact exclusion, and duplicate handling | **implemented but unverified** | Explicit `zyene:test` exclusion is unit-tested. Browser confirmation of row dates, merge affordance, and a real isolated contact import remains needed. |
| Customer detail | **implemented but unverified** | Source scope is covered; no customer record was changed. |
| CSV import | **verified** | CSV validation/preview tests cover malformed data and phone-only contacts. A browser import into a non-production workspace remains **blocked** on an isolated CSV/test contacts. |
| Businesses and location boundaries | **implemented but unverified** | Source scope is preserved; cross-business browser tests require separate test businesses. |
| Competitors | **implemented but unverified** | Copy/data-source handling is covered; fresh comparisons need an authenticated test workspace. |
| Analytics and exports | **implemented but unverified** | Metric semantics are tested; live filters/export behavior remains unverified. |
| Google Q&A unavailable state | **implemented but unverified** | Source behavior was reviewed; latest UI needs an appropriate test listing. |
| Settings shell, general, and business information | **implemented but unverified** | Navigation/timezone improvements are in local work; destructive account actions were intentionally not exercised. |
| Public profile and canonical collection URL | **verified** | Collection browser test confirms the current local branded path, color, mobile fit, and resolved footer. Routing itself is the documented exception. |
| Notifications and quiet hours | **verified** | Notification quiet-hour and timezone/DST tests pass. A real notification is **blocked** on a designated test recipient. |
| Competitor alerts | **implemented but unverified** | Route/source behavior is covered; delivery needs a test destination. |
| Team roles and business boundaries | **implemented but unverified** | Access tests pass, but an owner/member pair across two isolated businesses has not been exercised in the browser. No invitation or role was changed. |
| Billing limits and renewal summary | **verified** | Billing-member and renewal-summary tests pass. Stripe sandbox limits, failed cards, and invoices remain **blocked** on a test customer/card. |
| Google integrations: disconnect and sync failure | **verified** | OAuth scope, connection-error, platform-error, sync-conflict, and sync-error tests pass. Actual disconnect/reconnect must use a designated test Google connection. |
| Zapier/API setup | **implemented but unverified** | Documentation/source validation is covered. A safe webhook test destination and duplicate-delivery exercise remain **blocked** on provider setup. |

### AEO and public-surface ledger

| Audit surface | Status | Evidence or remaining work |
|---|---|---|
| AEO overview and prompt library | **implemented but unverified** | Evidence/cost boundary behavior has tests; latest authenticated UI remains pending. |
| Prompt detail | **implemented but unverified** | Detail-navigation test passes; no live prompt was run. |
| Geo grid | **implemented but unverified** | Coverage/conditional-rank display code is in local work; no live grid sample was run. |
| Technical audit and alerts unavailable states | **implemented but unverified** | Availability handling is source-covered; latest UI must be checked with an unavailable integration. |
| Competitive insights | **verified** | Product-evidence tests cover uncertainty, generic-match filtering, and owner-controlled recommendations. |
| Differentiation | **implemented but unverified** | Customer-facing simplification is in local work; latest authenticated view remains pending. |
| Collection page | **verified** | Responsive check, hydration fix, exact primary color in both themes, and preserved documented routing are directly verified. No feedback was submitted. |
| Widget readability, controls, and source link | **implemented but unverified** | Authentic rating-only text is verified. A complete provider URL needs a test record before the source link can be verified in-browser. |
| 119-route public coverage ledger | **implemented but unverified** | Original coverage shows 119 HTTP 200 pages with one H1. Current local browser directly rechecked 20 routes plus key revised pages; `pnpm build` generated all 268 static pages. A post-change browser walkthrough of every public form/link is still pending. |

### Final code checks

- `pnpm verify`: **175 test files, 1,267 tests passed**; TypeScript and file-size guard passed (28 grandfathered files, none grew).
- Focused workflow suites passed for public-review evidence, campaigns, CSV, test contacts, notification timezones, billing, OAuth/sync errors, review search, settings access, AEO navigation, and the new OAuth-cancellation recovery.
- `pnpm check:colors`: passed. The requested `#ff4f00` remains the source primary color in light and dark themes; browser computed-style checks confirmed it.
- `pnpm check:migrations` and `git diff --check`: passed.
- `pnpm lint`: **0 errors, 502 existing warnings**. The warning count is unchanged from the baseline and includes vendored skill scripts and pre-existing application warnings.
- `pnpm build`: passed using webpack; it compiled, type-checked, generated all 268 static pages, and collected build traces. The only emitted build warning was the existing edge-runtime static-generation limitation.
- React Doctor changed-file scan: **71/100, 23 diagnostics**. It exits nonzero when diagnostics exist. The introduced derived-state warning in OAuth recovery was removed; the remaining compiler, complexity, list-key, parent-effect, transition, and ref diagnostics are broader pre-existing/remediation-work items that need separately scoped structural changes.
- SEO pass for changed marketing/content files: all marketing `page.tsx` exports have metadata; no raw `<img>` was found in marketing routes/components; no changed external `_blank` link lacks `noopener noreferrer`; required Organization, Article, Product, and LocalBusiness helpers remain wired. No marketing URL was added, so no sitemap change was needed. Two Open Graph image `alt` strings include the brand suffix; they are image alt text, not metadata titles.

### Remaining prerequisites and release verdict

**Authenticated-session handoff, September 12:** the browser session available for the local preview was inspected after the owner reported sign-in. Its only application tab was still `http://localhost:3000/login`, showing the email/password form; no authenticated local dashboard tab was available. This is a handoff/environment gap, not evidence that any authenticated workflow passed or failed. The local environment has a Supabase URL configured, while `GOOGLE_CLIENT_ID` is empty, so an actual Google-consent round trip cannot be exercised there.

**Signed-in deployed baseline, September 12:** the owner then supplied a signed-in tab at `https://app.zyenereviews.com` for read-only comparison. This is deployed production code, not proof of the local working tree. Dashboard, Reviews, Requests, Campaigns, Customers, Analytics, Google SEO/AEO, Integrations, Billing, Notifications, and Team pages loaded in the Wolfpack BBQ & Burgers workspace without a visible application error. The desktop dashboard had no horizontal overflow; temporary 390 × 844 checks of Dashboard, Reviews, Campaigns/New, Customers, Analytics, and Billing also had no overflow (Customers and Analytics showed their expected empty/no-keyword states). No submit, send, publish, disconnect, import, role change, payment, or setting save was performed.

That deployed baseline exposed release-relevant drift from the local fixes: Dashboard displayed `0` for Total Reviews and Average Rating alongside `1,413 reviews analyzed`, `4.7/5`, and a `4.7` star distribution; the Requests modal accepted recipient fields but showed no business, message, schedule/quota preview; the Campaigns list was correctly empty, while the unsaved builder still previewed the fictional Sunrise Café/Sarah content and its review step omitted audience/exclusion and recipient-count details; the Reviews page opened on All rather than Needs reply and had no visible reviewer/content search field. The current local source contains the corresponding rollup, active-business preview, audience/exclusion, and default/search implementations; these deployed observations therefore remain baseline evidence and a deployment blocker, not a reason to change the preserved routing exception.

**Blocked prerequisites:** a dedicated local test account signed in at `http://localhost:3000/login`; a separate owner/member pair and two test businesses; a Google OAuth client/test Business Profile listing allowed for localhost; non-production SMS/email recipients and credentials; a non-production CSV and contacts; a Stripe test customer/card; and a safe webhook destination. These are required to prove the fresh-account, provider cancellation/disconnect, restricted-role, campaign delivery/retry, notification, import, and billing scenarios without touching a real customer or charging money.

**Exact provider test setup required:**

- **Local auth/data:** a separate Supabase project (or isolated preview database) with a test owner, a member, two businesses, and test contacts; use that project's `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only service key. The local account must be signed in to the same `http://localhost:3000` origin being tested.
- **Google onboarding/disconnect:** a Google Cloud OAuth Web client with JavaScript origin `http://localhost:3000` and redirect URI `http://localhost:3000/onboarding`; set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for the preview, enable Business Profile APIs, and use a dedicated Google account that owns an isolated test Business Profile/location. This is needed for consent cancellation, successful connect, refresh, disconnect, and sync-failure tests. The current local environment has no client ID, so the browser Google button correctly remains unavailable.
- **Campaign/request/notification delivery:** run Inngest dev against the preview, configure Twilio test/sandbox credentials and a designated verified test number, plus Resend test-mode credentials and a designated test mailbox/sender domain. Use only those recipients and inspect provider delivery webhooks; do not use real customer addresses.
- **Billing:** use Stripe test-mode `pk_test_`/`sk_test_` keys, a Stripe test customer and test card (including a declined-card case), and `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe` (or an equivalent signed preview endpoint) to deliver webhook events. No live key, invoice, or charge is acceptable for this audit.
- **CSV and tenant boundaries:** prepare a non-production CSV containing phone-only, email-only, malformed, duplicate, opted-out, and explicitly `zyene:test` rows; pair it with the isolated Supabase workspace above. Use separate owner/member identities and business IDs to prove RLS and cross-business rejection. A safe generic webhook receiver is required for Zapier/API duplicate-delivery checks.

**Release readiness: blocked for production deployment.** The code and production build are ready for review, but the latest authenticated end-to-end workflows and provider-test scenarios above are not yet proven. Resume from this checkpoint by signing into the local preview with the dedicated test account, then use only the listed isolated facilities. Do not deploy, send, publish, charge, or modify production records until those results are recorded here.

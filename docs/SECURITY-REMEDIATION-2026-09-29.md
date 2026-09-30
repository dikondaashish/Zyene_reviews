# Security Remediation: 2026-09-29

Scope: local Zyene Reviews source and synthetic local tests. No production system was attacked, tested, changed, or deployed. Existing unrelated working-tree changes were preserved. No credentials were added to this report, tests, or new migrations. Historical applied migrations were not edited.

`fixed` below means the source fix and regression tests are complete; it does not claim the patch is deployed. `requires production verification` means the source mitigation is prepared but live grants, data consistency, or key rotation remain unverified. Database tests execute twelve new migrations and the existing AEO credit-ledger migration against a synthetic PostgreSQL 17 schema, not a complete replay of every historical Supabase migration.

## OAuth Account-Takeover Flow

The original callback accepted `add_user` and `add_org` from the URL. After exchanging an OAuth code, it created a business using the supplied organization and called `getUserById(add_user)`, `generateLink`, then `verifyOtp` to restore that user's session. A URL parameter therefore chose the account receiving the restored session.

The callback now rejects the legacy identifiers. An authenticated server action verifies active organization management before creating a signed, ten-minute HTTP-only state cookie. The callback requires the initiating authenticated user, verifies the state, consumes the cookie, and rechecks organization access before code exchange or admin work. Business ownership and restoration use that verified initiating identity. Negative tests cover forged state, another user, another organization, expired state, and legacy URL parameters.

## All 18 Strix Findings

File groups below expand to exact paths in the file inventory. Test paths are under `tests/unit/` unless otherwise specified.

| Finding | Status | Files Changed | Tests Added / Updated | Remaining Action |
| --- | --- | --- | --- | --- |
| vuln-0001: committed OAuth encryption key | requires production verification | Key Rotation group; new migration `20260929235000_secure_oauth_key_rotation.sql` | `tests/security/database-boundaries.sql`: service-only crypto, operator-only rotation, successful re-encryption, corrupt-token rollback, fail-closed decrypt | Verify the active key can decrypt current data without returning plaintext. Reconcile failures, invoke the prepared rotation during maintenance, revoke/reconnect provider tokens, and remediate secret history under a separate coordinated procedure. |
| vuln-0002: Next AVIF optimizer RCE dependency | fixed | `package.json`, `pnpm-lock.yaml` | `image-security-dependencies.test.ts`: patched runtime versions and AVIF round trip; production build | Deploy Next 16.3.3. No production exploitability test was performed. |
| vuln-0003: sharp/libheif RCE dependency | fixed | `package.json`, `pnpm-lock.yaml`; transitive override upgraded too | `image-security-dependencies.test.ts` | Deploy sharp 0.35.4 and the updated frozen lockfile. |
| vuln-0004: unsafe nanoid size | false positive | `package.json`, `pnpm-lock.yaml` patched as dependency maintenance; no size-input fix required | Inspected both source callers; both use constant `nanoid(6)` | No reachable negative-size or overflow input was found. Reassess if a caller begins accepting a size from input. |
| vuln-0005: Google add-business cross-tenant OAuth / account restoration | fixed | OAuth group | `oauth-add-business-callback-security`, `add-business-authorization`, `add-business-oauth-state`, `add-business-oauth-cookie`, `prepare-add-business-oauth`, `oauth-add-business-owner` | Deploy the signed initiation and callback together. |
| vuln-0006: Facebook connection CSRF and unbound callback | fixed | Facebook group | `facebook-oauth-state`, `facebook-oauth-callback-security`, `facebook-pages-token-boundary`, `facebook-confirm-authorization` | Deploy. Redis must be available; failures stop connection rather than putting tokens in a cookie. |
| vuln-0007: public businesses/integration reads | requires production verification | Integration Boundary group; migration `20260929230000_restrict_public_integration_reads.sql` | `integration-read-boundary`; local SQL proves anonymous read denial, column-grant revocation, authenticated tenant isolation, and blocked direct integration writes | Apply the forward migration and inspect deployed table/column grants, RLS policies, exposed schemas, and custom roles using the read-only query file. |
| vuln-0008: omitted WITH CHECK permits reparenting | false positive | No application fix required | Local SQL attempts reparenting under an UPDATE policy with only USING and receives permission denial | PostgreSQL implicitly reuses USING for WITH CHECK. Review the actual predicate and live policy drift; omission alone is not a vulnerability. |
| vuln-0009: unsigned public tracking writes | fixed | Review Tracking group | `review-tracking-token`, `review-open-authorization`; updated `public-review-evidence` | Deploy signed send links and review UI together. Legacy unsigned links can display the capture flow but cannot modify their old request; a new anonymous request is rate-limited. |
| vuln-0010: CSV formula injection | fixed | CSV group | `csv-formula-protection`: formula/control/whitespace prefixes serialized safely | Deploy. All eight Papa CSV writers use the shared escape option. |
| vuln-0011: SMS name/content injection | fixed | Output Encoding group | `sms-and-recovery-output-encoding`: newline, URL, protocol-free domain, HTML payloads; ordinary Unicode names retained | Deploy. Untrusted names are bounded single-line labels; merchant-authored templates remain intentional content. |
| vuln-0012: newsletter email cost abuse | fixed | Marketing Limits group | `public-marketing-rate-limits`: spent limiter and Redis failure stop subscriber/email work | Deploy; keep rate-limit storage available. |
| vuln-0013: book-lead dev/staging limiter bypass | fixed | `src/app/api/marketing/book-lead/route.ts` | `public-marketing-rate-limits`: preview and no-deployment-environment cases denied | Deploy. The bypass was not evidence of production exposure; the environment gate is now removed completely. |
| vuln-0014: cross-tenant public private-feedback insertion | fixed | Private Feedback group | `private-feedback-authorization`: bare UUID, wrong-business signature, and missing scoped request denied before insert | Deploy signed public-flow UI and API together. |
| vuln-0015: public AI draft spend / claimed monthly-quota exhaustion | fixed | AI Draft group, shared budgets and signed review flow | `public-ai-draft-security`: missing/forged IDs, invalid signature before admin access, foreign business, spent limiter, Redis failure | Deploy. The model-spend path was real. The scanner's self-minted nonexistent-ID monthly-counter claim was overstated; such an ID updated no stored draft. |
| vuln-0016: free Places/email tool cost abuse | fixed | Marketing Limits group | `public-free-tool-limits`; updated `product-tool-results` preserves usable results and email-failure behavior | Deploy dedicated search/result/email limits. |
| vuln-0017: unbounded AI analysis/backfill | fixed | AI Analysis group | `review-analysis-authorization`, `review-analysis-model-budget`, `analysis-backfill-authorization`, `analysis-batch-boundary`, `ai-business-budget` | Deploy route, worker, and UI changes together. Limits fail closed and are charged by the verified business. |
| vuln-0018: anonymous ciphertext plus committed-key compromise chain | requires production verification | Integration Boundary and Key Rotation groups | Integration read tests plus SQL grant, crypto and rotation assertions | Source mitigations are complete. Confirm live credential-read denial, rotate the exposed key, and revoke/reconnect affected OAuth provider credentials before closing this finding. |

## Additional Validated Triage Leads

| Finding | Status | Files Changed | Regression Evidence | Remaining Action |
| --- | --- | --- | --- | --- |
| Google/Square disconnect and Facebook/Yelp confirmation service-role access | fixed | Integration Authorization group | `manage-business-integration`, `disconnect-google-authorization`, `facebook-confirm-authorization` deny foreign tenants and viewers before privileged work | Deploy. |
| Billing entitlements self-assigned from onboarding or direct SQL API | requires production verification | Billing group; migration `20260929232000_protect_organization_billing_columns.sql` | `onboarding-billing-authorization`; SQL denies explicit table/column billing writes while allowing safe organization fields | Apply migration and verify live client INSERT/UPDATE grants. Paid entitlements must remain server/Stripe controlled. |
| Business-member role escalation | requires production verification | Migration `20260929233000_guard_business_member_roles.sql` | `business-member-role-boundary`; SQL denies self-promotion, manager-to-admin promotion, additional owner creation and owner removal | Apply migration after checking deployed role values. The authorized first-owner bootstrap remains supported. |
| Stripe retry/deduplication | requires production verification | Stripe group; migration `20260929231000_stripe_webhook_processing_claims.sql` | `stripe-webhook-claim`, `stripe-webhook-handler-retry`; SQL checks competing claims, wrong claim token, failed-event retry, completed duplicate and legacy unknown state | Apply schema before claim-handler code. Reconcile historical `legacy_unknown` rows against Stripe delivery/business state; they fail closed and are not replayed automatically. |
| HTTP SSRF, alternate addresses and DNS rebinding | fixed | SSRF group | `aeo-ssrf-guard`, `aeo-public-http-rebinding`, existing crawler tests: internal/mapped/NAT64/compatible/site-local addresses, mixed DNS, lookup change and redirect protection | Deploy. Connection-time resolution rechecks and pins a vetted public address; responses and timeouts are bounded. |
| Headless browser SSRF | requires production verification | `src/services/aeo/technical-audit/headless-renderer.ts` | `aeo-headless-egress` proves rendering refuses to start without the explicit isolation gate | Keep `AEO_HEADLESS_RENDER_ISOLATED_EGRESS` unset/false until network-level denial of internal/metadata destinations is verified. Setting the flag alone does not establish isolation. |
| Viewer integration changes and outbound replies | fixed | Integration Authorization and Reply groups | `integration-oauth-management-boundary`, `google-location-selector-authorization`, `review-reply-authorization` | Deploy; manager authorization is required before tokens or provider changes. |
| Review linked to another tenant's platform, including automatic replies | requires production verification | Reply group; migration `20260929235100_enforce_review_platform_tenant.sql` | `review-reply-authorization`, `system-review-reply-tenant`; SQL rejects a mismatched platform link | Apply composite FK. Count existing mismatched rows read-only; reconcile them before validating the NOT VALID constraint. Runtime replies already refuse mismatched links before credential access. |
| Accepted invitation reused after membership removal | fixed | `src/lib/auth/accept-business-invitation.ts` | `accepted-invitation-reuse` plus actual PostgreSQL invitation tests: removed/inactive membership is never recreated, identity and business/org pairing are verified, and failed writes roll back | Deploy. Acceptance is now atomic and an already-accepted link is only a no-op for existing active memberships. See the re-audit invitation changes below. |
| Public privileged sync-lock RPC | requires production verification | Migration `20260929234000_restrict_platform_sync_lock.sql` | `platform-sync-lock-grants`; SQL denies anon/authenticated calls and checks service-role lock idempotency | Apply migration and verify function grants; lock duration is bounded. |
| Recovery-email HTML injection | fixed | `src/services/resend/templates/recovery-email.ts`, private feedback API | `sms-and-recovery-output-encoding` | Deploy escaped labels and CR/LF-free subject. |


## Re-Audit and Additional Fixes

The re-audit found additional defects; the earlier work was not treated as automatically correct. The original eighteen-finding table was rechecked against the updated code. Its disposition remains thirteen source-fixed, two false positives, and three requiring production verification. This does not certify perfect security or promise an empty future Strix report. Strix was not rerun with the credentials pasted in chat.

| Issue | Source Change | Regression Evidence | Remaining Action |
| --- | --- | --- | --- |
| Google onboarding returned access/refresh tokens for multi-location accounts and accepted client-supplied location/token bundles | Credentials now stay in a five-minute server-side Redis connection. The browser receives an opaque handle. Finalization requires the initiating user/business, a provider-observed location, current manager authorization, and single consumption. Internal credential finalization is server-only and no longer exported as a server action. | `google-connect-token-boundary`: no tokens in responses; wrong user, business, location, revoked manager, replay, and storage outage denied. | Deploy onboarding actions, shared types and client hook together. In-flight old token-bearing selections must reconnect. |
| Google onboarding connection CSRF | Server-authorized initiation binds random state to an HTTP-only browser cookie, current user, business and captured redirect URI; callback consumes state before code exchange. | `google-onboarding-oauth-state`, `onboarding-google-oauth-callback`, `google-connect-token-boundary`: forged/missing cookie, wrong state/user/business, expiry, replay and unsolicited code denied. | Deploy launch and callback together; existing in-flight callbacks without state are rejected. Redis outages fail closed. |
| Read-only users could invoke Google provider mutations; historical resource links could point at another location | Listing, lodging, local posts, place-action mutations and Q&A answers require integration-manager authorization before credentials. Stored resource names must belong to the verified platform location, and the platform lookup is business-scoped. | `google-mutation-authorization`, `google-resource-boundary`: six mutation handlers deny before token/provider access; foreign location and traversal payloads denied. | Deploy. |
| AEO mutation contexts accepted read-only membership; report downloads trusted broad RLS | The internal admin-context helper is server-only and requires live write authorization. Integration changes and ingestion-key creation require manager authorization. Report downloads explicitly verify the row's business membership before returning HTML or signing storage. | `aeo-privileged-context`, `live-business-access`: viewer/revoked/foreign access denied before admin creation; foreign HTML/PDF download denied; authorized writer remains supported. | Deploy with the business-scope RLS guards. |
| Cached context and organization fallback restored removed business-member access | Live membership checks require active org membership and explicit active business membership for employees. Managers retain intended org-wide access. Redis is never used to authorize. Nested org business lists are filtered, and active-business switching rechecks scope. | `live-business-access`, `manage-business-integration`; actual SQL proves sibling-business isolation, removed-member denial, suspension overriding a business role, and valid scoped-manager invitations. | Apply `20260929235300_business_scoped_access_guards.sql`. Review any business-id table without RLS and custom/deployed policy drift using read-only metadata checks. |
| Direct invitations bypassed API role ceilings; accepting a business invite granted org-wide management or downgraded an existing owner | Trigger checks active manager scope, business/org pairing, role ceiling and server-controlled fields. Acceptance commits membership pair, consumed state and one audit event atomically. Business invitees receive only ORG_EMPLOYEE; existing roles are preserved. Resend verifies current role ceiling. | `accepted-invitation-reuse`, actual `invitation-boundaries.sql`: direct escalation/mismatched tenant denied; owner roles preserved; removed membership not recreated; forced write failure rolls back. | Apply `20260929235200_secure_business_invitations.sql`; pending legacy invites expire and need authorized reissue/resend. Privately review historically promoted org-manager roles, without automatic demotion. |
| Upstash's SDK timeout returned success instead of rejecting | Shared limiter rejects the SDK's success:true timeout result, while preserving actual allow/deny decisions. | `fail-closed-rate-limit` exercises the real SDK with a never-resolving synthetic Redis response and confirms the wrapper throws. | Deploy; monitor limiter availability. |
| SSRF transport failed real hostname connections with Node automatic address-family selection | Undici connection disables automatic family selection so the vetted single-address lookup contract is respected. DNS validation/pinning remains enforced. | `aeo-public-http-runtime`: real Undici connection to a synthetic local HTTP server with Node automatic selection enabled and bounded response body; existing rebinding/SSRF suites pass. Loopback is permitted only by the test mock. | Deploy. Do not enable headless egress without verified network isolation. |
| Late Stripe deletion/update/invoice events could affect replacement subscriptions; cancellation partially committed | Service-only atomic projection locks and matches the current customer/subscription binding. Checkout verifies metadata against stored customer and retrieved subscription, uses compare-and-swap replacement, and rejects unknown prices. Live Stripe state replaces stale status payloads. Cancellation and feature shutdown roll back together. Non-entitled statuses do not get paid limits. | `stripe-subscription-boundaries`, `billing-projection-boundaries.sql`: late deletion, recovered payment, one-off invoices, wrong checkout customer, active replacement, unpaid statuses, unknown price and forced second-write failure. Existing claim/retry suites pass. | Apply `20260929235400_atomic_subscription_projection.sql` before code. Reconcile legacy webhook state privately; verify endpoint/API-version configuration read-only. |
| Delayed/retried credit grants could refill spent credits or become unretryable | Service-only credit receipt, organization lock and monotonic service-period watermark make grants atomic and replay-safe, including across days and different event IDs. Critical grant failures now keep webhooks retryable; already-linked checkout retries finish the grant. | Actual credit-ledger SQL plus `billing-projection-boundaries.sql`: duplicate/cross-day/same-cycle/older-cycle/foreign-customer grants denied; spent balance preserved. Handler test proves linked checkout retries its failed grant. | Apply `20260929235500_stripe_credit_grant_receipts.sql` before code. Keep metered billing gated until the existing credit schema, price and new receipt schema are verified. |
| Checkout retry skipped its welcome workflow; email deduplication was silently ineffective | The already-linked checkout no longer returns before welcome/growth work. A stable checkout key is passed to Resend's request options rather than the email body. | `stripe-subscription-boundaries` proves a failed credit grant sends no notification, then the retry completes welcome/growth. `resend-idempotency` uses the real SDK with mocked HTTP and verifies the actual Idempotency-Key header, unkeyed sends and missing-credential refusal. | Deploy the handlers and email wrapper together. Email replay protection is subject to the provider's retention window, not a promise of permanent exactly-once notifications. |
| Concurrent referral events could duplicate Stripe credits, while failed credits were marked rewarded | Service-only SQL verifies the stored paid referral and active owner relationship, serializes claims, freezes the credit recipient/amount/provider key and uses token-bound completion only after Stripe succeeds. Critical failures propagate to Stripe retries. Ambiguous claims stop before the provider's key-retention deadline. | `referral-reward-retry`, `stripe-subscription-boundaries`, actual `referral-reward-boundaries.sql`: duplicate claims, wrong completion token, suspended owner, unpaid/unknown status and client SQL access denied; changed configuration/customer cannot alter a retry's payload; failed Stripe/completion remains retryable; expired/legacy claims require reconciliation. | Apply `20260929235600_referral_reward_claims.sql` before code. Privately reconcile historical converted rows and any claim older than 23 hours against Stripe balance transactions; never blindly reissue an ambiguous credit. |
| Additional production/development dependency advisories | Scoped same-major patched dependencies/overrides, including nanoid, DOMPurify, Hono, fast-uri, ip-address, Vitest and Vite; ESLint Next config aligned with Next. | Fresh full `pnpm audit` reports no known vulnerabilities; full tests and frozen lockfile validation are recorded below. | Deploy the frozen lockfile. Zero known advisories is not proof of zero vulnerabilities. |

Additional exact file groups:

- Google onboarding: `src/app/actions/onboarding/google-oauth.ts`, `google-oauth-start.ts`, `google-oauth-helpers.ts`, `google-connection-finalize.ts`, `index.ts`; `src/services/google/connect-session.ts`, `onboarding-oauth-state.ts`; `src/types/components.ts`; onboarding URL parser, URL-effects hook, shared pending-code types and connection hook.
- Google mutations: `src/services/google/listing-patch-api.ts`, `lodging-api.ts`, `place-actions-api.ts`, `resource-boundary.ts`; `src/app/api/google/local-posts/route.ts`, `src/app/api/google/qa/answer/route.ts`.
- Live authorization: `src/lib/auth/business-context.ts`, `business-context-load.ts`, `manage-business-integration.ts`; `src/lib/db/supabase/verify-business-access.ts`; Google disconnect now filters reviews and platform deletion by both platform and business.
- Invitations: `src/lib/auth/accept-business-invitation.ts`; `src/services/team/invite-api.ts`, `resend-invite-api.ts`, `team-member-api.ts`, `team-member-update-api.ts`; `20260929235200_secure_business_invitations.sql`, `20260929235300_business_scoped_access_guards.sql`.
- Limits/transport: `src/lib/auth/fail-closed-rate-limit.ts`, `rate-limit.ts`; `src/services/aeo/crawler/public-http.ts`.
- Stripe: all three webhook handler modules, `src/services/stripe/organization-billing-sync.ts`, `subscription-projection.ts`, `invoice-service-period.ts`, `src/services/aeo/billing/renewal-credit-reset.ts`; `src/lib/growth/referral-rewards.ts`, `src/services/resend/send-email.ts`; `20260929235400_atomic_subscription_projection.sql`, `20260929235500_stripe_credit_grant_receipts.sql`, `20260929235600_referral_reward_claims.sql`.
- AEO: `src/app/(dashboard)/google-seo-aeo/phase-2/action-context.ts`, `integration-actions.ts`; `src/app/api/aeo/crawler-log-sources/route.ts`, `src/app/api/aeo/reports/[reportId]/route.ts`.
- SQL verification: `tests/security/invitation-boundaries.sql`, `business-scope-boundaries.sql`, `billing-projection-boundaries.sql`, `referral-reward-boundaries.sql`, `database-fixture.sql`; `scripts/test-security-sql.mjs`; updated read-only verification SQL.

Unapplied migration filenames were normalized to valid chronological timestamps. No applied historical migration was renamed or edited.

Stripe service-period behavior is checked against the [invoice object reference](https://docs.stripe.com/api/invoices/object) and the installed SDK's documented invoice-line contract. SDK timeout behavior was inspected and tested against installed `@upstash/ratelimit@2.0.8`. Dependency updates follow the maintainer advisories surfaced by pnpm, including [fast-uri](https://github.com/fastify/fast-uri/security/advisories/GHSA-qw65-cvwx-89v3), [Hono](https://github.com/honojs/hono/security/advisories/GHSA-crvj-82cr-hjcx), [ip-address](https://github.com/beaugunderson/ip-address/security/advisories/GHSA-rpw4-54j3-4h4q), [Vitest](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9), and [js-yaml](https://github.com/nodeca/js-yaml/security/advisories/GHSA-2883-xcg3-v3hh).

Stripe may prune an idempotency key once it is at least 24 hours old, so a key alone does not guarantee permanent deduplication. Referral retries use a conservative 23-hour deadline and durable completed state; older ambiguous operations fail closed for reconciliation. See the [Stripe idempotent requests contract](https://docs.stripe.com/api/idempotent_requests).

Financial referral steps run before welcome/growth notifications. Focused tests first reproduced the old ordering and then proved that a failed referral sends no welcome email, schedules no onboarding drip, and keeps the checkout/trial-conversion event retryable.


## File Inventory

### OAuth

- `src/app/(dashboard)/businesses/add/actions.ts`
- `src/app/(dashboard)/businesses/add/use-add-business-page.ts`
- `src/services/auth/add-business-authorization.ts`
- `src/services/auth/add-business-oauth-cookie.ts`
- `src/services/auth/add-business-oauth-state.ts`
- `src/services/auth/oauth-callback.ts`
- `src/services/auth/oauth-callback-add-business.ts`
- `src/services/auth/oauth-callback-add-business-create.ts`
- `src/services/auth/oauth-callback-add-business-restore.ts`

### Integration Boundary and Key Rotation

- `src/lib/auth/business-context-load.ts`
- `src/lib/auth/business-context-platforms.ts`
- `src/app/onboarding/load-onboarding-business.ts`
- `src/app/actions/onboarding/google-sync.ts`
- `supabase/migrations/20260929230000_restrict_public_integration_reads.sql`
- `supabase/migrations/20260929235000_secure_oauth_key_rotation.sql`

### Integration Authorization, Facebook and Replies

- `src/lib/auth/manage-business-integration.ts`
- `src/app/(dashboard)/settings/integrations/actions.ts`
- `src/app/(dashboard)/settings/integrations/square-actions.ts`
- `src/app/api/integrations/square/connect/route.ts` and `callback/route.ts`
- `src/app/api/integrations/clover/connect/route.ts` and `callback/route.ts`
- `src/app/api/integrations/facebook/connect/route.ts`, `callback/route.ts`, `pages/route.ts`
- `src/services/facebook/oauth-state.ts`, `connect-session.ts`, `complete-oauth.ts`, `client.ts`, `confirm-api.ts`, `confirm-schema.ts`
- `src/services/yelp/confirm-api.ts`
- `src/services/google/location-selector-api.ts`
- `src/services/reviews/reply-review-access.ts`
- `src/services/reviews/post-google-reply-system.ts`
- `supabase/migrations/20260929235100_enforce_review_platform_tenant.sql`

### Billing and Stripe

- `src/app/actions/onboarding/billing.ts`
- `src/app/actions/onboarding/organization.ts`
- `src/lib/validations/onboarding.ts`
- `src/services/stripe/webhook-claim.ts`
- `src/services/stripe/webhook-handler.ts`
- `src/services/stripe/webhook-checkout-completed.ts`
- `src/services/stripe/webhook-invoice-events.ts`
- `src/services/stripe/webhook-subscription-changed.ts`
- `src/services/nfc/fulfill-checkout.ts`
- `src/lib/growth/referral-rewards.ts`
- `src/services/resend/send-email.ts`
- `supabase/migrations/20260929235600_referral_reward_claims.sql`
- `supabase/migrations/20260929231000_stripe_webhook_processing_claims.sql`
- `supabase/migrations/20260929232000_protect_organization_billing_columns.sql`

### Review Tracking and Private Feedback

- `src/lib/review-requests/tracking-token.ts`
- `src/app/api/track/review/route.ts`, `review-open/route.ts`
- `src/services/review-flow/create-public-review-open.ts`
- `src/app/r/[slug]/load-review-page-data.ts`, `record-review-page-open.ts`, `page-view.tsx`, `review-page-types.ts`, `review-page-flow-section.tsx`
- `src/app/r/[slug]/review-flow/types.ts`, `use-review-flow.ts`, `use-review-flow-actions.ts`, `use-review-flow-tracking.ts`, `use-review-flow-negative-submit.ts`, `use-review-flow-generate.ts`
- `src/lib/review-requests/send-outbound.ts`, `process-scheduled-one-prep-contact.ts`
- `src/services/review-requests/api/send-request-execute-immediate.ts`
- `src/services/customers/bulk-request-action.ts`
- `src/services/reviews/private-feedback-api.ts`, `private-feedback-schema.ts`

### CSV and Output Encoding

- `src/lib/export/safe-csv.ts`
- `src/app/api/requests/export/route.ts`, `analytics/export/route.ts`
- `src/services/reviews/export-api.ts`, `src/services/competitors/export-api.ts`
- `src/services/aeo/crawler/export-crawl-findings.ts`
- `src/services/aeo/reporting/export-citations.ts`, `export-prompts.ts`
- `src/lib/security/sms-label.ts`
- `src/lib/review-requests/dashboard-request-message.ts`, `send-outbound-dispatch.ts`
- `src/lib/notifications/review-request.ts`
- `src/services/customers/bulk-request-action.ts`
- `src/services/resend/templates/recovery-email.ts`

### SSRF

- `src/services/aeo/crawler/ssrf-guard.ts`, `public-http.ts`, `safe-fetch.ts`
- `src/services/aeo/alerting/deliver-alert-channel.ts`
- `src/services/aeo/integrations/deliver-outbound-event.ts`
- `src/services/aeo/competitors/refresh-competitor-pages.ts`
- `src/services/aeo/content-briefs/fetch-cited-source.ts`
- `src/services/aeo/reporting/generate-report.ts`
- `src/services/aeo/technical-audit/refresh-llms-txt.ts`, `refresh-nap-consistency.ts`, `headless-renderer.ts`

### Marketing Limits, AI Draft and AI Analysis

- `src/lib/auth/rate-limit.ts`
- `src/app/api/marketing/newsletter/subscribe/route.ts`, `book-lead/route.ts`
- `src/app/api/marketing/tools/places-search/route.ts`, `review-response/route.ts`
- `src/lib/free-tools/place-tool-handler.ts`
- `src/services/review-flow/generate-review-api.ts`, `generate-review-quota.ts`
- `src/services/ai/ai-business-budget.ts`, `review-analysis-api.ts`, `analysis-batch-boundary.ts`
- `src/services/ai/suggest-reply-api.ts`, `suggest-qa-answer-api.ts`, `optimize-business-description-api.ts`, `optimize-gbp-content-api.ts`
- `src/app/api/ai/analyze/route.ts`, `src/app/api/smart/analyze/route.ts`
- `src/domains/ai/services/ai-analysis-service.ts`
- `src/services/smart/analyze-backfill-api.ts`
- `src/services/inngest/functions/process-review-analysis-batch-function.ts`
- `src/components/reviews/use-reviews-page-client-backfill.ts`
- `scripts/test-private-feedback-category.ts`

### Other Database Guards and Verification

- `supabase/migrations/20260929233000_guard_business_member_roles.sql`
- `supabase/migrations/20260929234000_restrict_platform_sync_lock.sql`
- `scripts/test-security-sql.mjs`
- `tests/security/database-fixture.sql`, `database-boundaries.sql`
- `docs/security-readonly-verification-2026-09-29.sql`

## Operational Changes and Remaining Work

Backfill now accepts a required, authorized business UUID and a maximum of 250 reviews, with two submissions per business per day. Model analysis has a shared daily business limit; single-review calls and batches of at most five reviews consume it. Public drafts require signed request links and separate IP, request and business limits. Redis failures prevent AI calls and public email fanout. Those limits are intentional abuse controls and may need plan-aware tuning based on legitimate volumes.

Before releasing, review and apply the twelve forward migrations according to their application notes. The Stripe claim, projection, credit-receipt and referral-claim migrations must precede their new handlers. Keep existing legacy webhook rows in `legacy_unknown` until reconciled; automatically retrying them could repeat completed side effects. Referral claims likewise fail closed for historical converted rows and ambiguous operations older than 23 hours; reconcile against Stripe before any authorized operator repair. The review-platform composite constraint requires PostgreSQL 15 or later and enforces new writes immediately, but deliberately does not scan or repair historical inconsistent rows; validate it after the read-only consistency check and any authorized repair.

The new key-rotation routine does not rotate anything merely by being deployed. It generates a fresh key inside PostgreSQL, re-encrypts both credential stores in one transaction, and aborts without changing the key or tokens if any nonempty token cannot be decrypted. An operator must verify current key/data consistency, pause credential writers during maintenance, and invoke it explicitly. Rotation cannot undo prior ciphertext disclosure; provider credentials must also be revoked/reconnected. Revoke the Google Cloud and AkashML secrets shared in the chat and supply future credentials through local secret storage.

Headless rendering refuses to run by default. Its isolation flag must remain disabled until outbound networking demonstrably blocks internal, loopback and metadata destinations, including after DNS changes. The flag is an operator assertion, not a network control.

The read-only SQL file returns grant/policy metadata, migration versions and aggregate inconsistency counts only. It intentionally does not select credential values, encryption keys, user email addresses, customer data, or function bodies. No live configuration check has been executed.

The business-scope migration constrains existing RLS-enabled tables; it is not proof that every deployed table has RLS enabled. Review tables reported without RLS, any custom grants/policies, old privileged invitation assignments, and Supabase Auth abuse/rate-limit settings before release. A read-only metadata check cannot establish whether historical disclosure occurred.

## Verification Record

- Focused regression suites passed after each fix group.
- Twelve forward migrations plus the existing AEO credit-ledger migration passed local PostgreSQL 17 grant, tenant, role, invitation, Stripe-claim, subscription projection, credit receipt, referral claim, rotation/rollback and platform-link assertions through `pnpm test:security:sql`.
- Final `pnpm verify` passed after all source changes: TypeScript, 244 test files / 1,547 tests, and the file-size guard. Focused SDK/Stripe replay suites also passed after the final financial-before-notification ordering change.
- Final `pnpm verify:fast` passed TypeScript and file-size checks.
- Final `pnpm build` passed with Next 16.3.3, including compilation, type checking, and generation of 273 static pages. Existing Edge Runtime deprecation and Tailwind module warnings remain.
- Final `git diff --check` passed. No tracked environment files or historical applied migrations were changed.
- Frozen offline lockfile validation passed; the patched AVIF encode/decode test passed.
- Fresh full `pnpm audit` passed: no known production or development dependency advisories.
- React Doctor remains non-green: 81/100, six compiler-optimization diagnostics for existing unsupported async `try/finally` / `throw` patterns and one existing complexity warning. Its two additional parent-state warnings concern the one-time onboarding URL effect that captures external callback code/state and clears the URL; this is intentional external-input propagation, not a derived-state feedback loop. No diagnostic was suppressed. This is not a clean lint/React Doctor certification.
- A concurrent build/typecheck attempt failed because Next rewrote `.next/types` during TypeScript's input scan. Verification was rerun after the build completed; final typecheck/build results are recorded, not that transient generated-file failure.
- No commit, deployment, production database operation, or production exploit test was performed.

Maintainer references: [Next AVIF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [sharp advisory](https://github.com/lovell/sharp/security/advisories/GHSA-rgj7-g3m4-5g8c), and [PostgreSQL policy semantics](https://www.postgresql.org/docs/current/sql-createpolicy.html).

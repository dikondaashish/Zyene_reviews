# Security Follow-Up: 2026-09-30

This report supersedes the operational status in [the initial deployment record](SECURITY-DEPLOYMENT-2026-09-30.md), without rewriting that historical record. Source inventories and the original vulnerable OAuth flow remain in [the remediation report](SECURITY-REMEDIATION-2026-09-29.md).

## Scope and Approvals

The owner authorized a security-only commit/push to `main`, production rollout, backend-only accounting after deployment, repair of the two invitation-driven organization roles to business-only access, and a PostgreSQL upgrade after compatibility/recovery checks. The owner explicitly chose to keep Supabase Free and will handle the exposed Google/AkashML credentials. A promise to rotate is not completion evidence.

No production attacks, forged tenant writes, event replays, payments, provider revocations, or new paid subscriptions were performed. Live queries returned only metadata and aggregate counts; credential values stayed inside PostgreSQL or private process memory. Identifier-level billing evidence is outside the repository with owner-only permissions. Unrelated source duplicates were preserved.

## Additional Fixes

### OAuth Rotation and In-Flight Writes

The old encrypt-and-persist flow uses separate database requests. A rotation between those requests could leave ciphertext under the retired key. Applied `20260930153833_guard_oauth_ciphertext_writes.sql` validates changed access/refresh ciphertext under a shared key lock and rejects stale writes with retryable SQLSTATE `40001`. Rotation locks both credential tables, changes the key and re-encrypts all fields atomically, and rolls everything back on a failure.

The live database key was rotated. An in-database before/after digest verified all **18 nonempty token fields** were preserved without returning plaintext or a key. A second applied migration, `20260930160138_retire_legacy_oauth_encryption_key.sql`, invokes the safe rotation so a fresh migration chain also retires the historical hardcoded seed. All 18 fields still decrypt afterward. Provider tokens themselves have not been revoked; rotation cannot undo historical disclosure.

Regression tests in `tests/security/database-boundaries.sql` cover stale UPDATE/INSERT rejection, readable data after rotation, valid new encryption writes, and atomic rollback on deliberately corrupt synthetic data. The trigger is disabled only to create that corruption fixture in a disposable database, never in production.

### Storage Tenant Boundaries

Live policies confirmed any authenticated user could upload/overwrite `business-logos`, while private AEO buckets relied only on an organization prefix. The source UI's business-ID filename does not establish ownership. Applied `20260930162251_scope_business_storage_access.sql` requires live writable business membership for INSERT, UPDATE (both existing and replacement names), and DELETE. Public display remains intentional; existing logo/footer upload conventions are preserved.

Private answer/crawl reads now require an exact published `aeo_samples.answer_storage_path` or `crawl_pages.content_storage_path` pointer belonging to an authorized business. Orphan and sibling-business objects are denied. These pointer tables have no permissive client mutation policy in the live database, so clients cannot forge ownership by editing a pointer.

`tests/security/storage-fixture.sql` uses the real historical logo/answer policies. `storage-boundaries.sql` covers anonymous/viewer writes, foreign/sibling uploads, cross-tenant renaming, overwrite attempts, suspension, private evidence isolation, and authorized upload/delete/read success. Removing the new migration reproduces unauthorized evidence visibility locally; adding it passes. Live verification inspected policy metadata only, not malicious operations.

### Backend AI Accounting and Q&A Limits

The prior deployed suggestion handlers called an authenticated accounting RPC. The new `src/services/ai/record-reply-usage.ts` revalidates `getUser()` and live business access before creating the privileged client; it derives the organization from the authorized business row. Both `suggest-reply-api.ts` and `suggest-qa-answer-api.ts` use it. Q&A now checks the monthly reply allowance before model work and records usage before parsing, including successful plaintext fallback replies.

`tests/unit/ai-reply-usage.test.ts` and `ai-qa-usage.test.ts` deny foreign/sibling/suspended/missing identities before admin/provider operations, verify server-derived organization accounting, and exercise monthly quota and fallback accounting. `tests/security/ai-usage-boundaries.sql` denies client counter calls and preserves backend increments without changing another tenant's counter.

`20260930165420_backend_only_ai_usage.sql` was applied **after** production deployment `dpl_EfANhQWy5PuUQfHeBr7uZSiLT3Pu` became READY for security commit `bf9c0dc19e2f57291d6ad1feaa412572a03d3a15`, with the production application/public-capture aliases. Read-only grant checks confirm both `anon` and `authenticated` are denied EXECUTE while `service_role` retains it. Browser RPC access is removed without breaking the deployed backend callers.

### Historical Invitation Scope

Private identity and audit-history checks matched two accepted business-admin invitations to active organization-admin memberships created within one minute of acceptance. The owner confirmed business-only access was intended. A transaction demoted exactly those two organization memberships to `ORG_EMPLOYEE`, preserved their active business-admin memberships, and inserted two security audit events. Preconditions required exact identity, organization, invitation, timing, and existing roles; an unexpected row count would abort. No generated membership IDs were committed.

### Safe Audit Snapshot

`scripts/create-security-audit-snapshot.mjs` and the Strix runner exclude credential files, missing tracked paths, and all symlink traversal. They redact retired seed literals in both SQL and comments, as well as monitoring bearer URLs, leaving repository migrations untouched, and disable external MCP connectors. `security-audit-snapshot.test.ts` covers those boundaries and rejects a snapshot inside the original checkout.

### Dependency and Monitoring Follow-Up

A fresh dependency audit found 17 advisories across five packages. The framework is now pinned to Next/ESLint config 16.3.8; scoped transitive overrides require Axios 1.20.0, fast-uri 3.1.8, ip-address 10.7.2 and brace-expansion 1.1.21/5.0.12. The [Next advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j) applies to attacker-controlled SVG values in Node ImageResponse; reviewed OG routes use fixed content or catalog-derived values, so a reachable RCE was not established. The dependency is patched regardless. Frozen installation and `pnpm audit --json` now report zero advisories. `patched-transitive-dependencies.test.ts` parses the lockfile and checks the installed Next/Twilio HTTP runtime; native AVIF tests still pass.

The follow-up/review-sync/weekly-digest modules and two older tests contained heartbeat bearer URLs. Those committed fallbacks are removed; only server environment settings are used. Production metadata confirms all three settings exist, so configured monitoring is preserved. Ten new credential-boundary tests and the updated existing tests cover no-env/no-request, success/failure suffixes, daily fallback and isolated monitoring failures. Removal does not invalidate URLs retained in Git history: the monitor owner must rotate them and update Vercel before retiring the old endpoints.

### Poster Print CSS Boundary

The API schema accepts only hex colors and the database constrains `review_page_background_color`, but the historical schema does not equivalently constrain `brand_color`. `resolveCustomerPortalBrandColor` previously passed through any stored string; the print window interpolated it into a style block. The color resolver and HTML sink now accept only supported three/six-digit hex values, fall back safely, and derive foreground color from constants. Valid three-digit contrast is also preserved. Ten regression cases reject style/script closure, URL/property injection and malformed colors, including calls that bypass the normal resolver. Business names remain HTML-escaped. Tests first reproduced the unsafe output and then passed with the fix; no production payload was submitted.

The partial IP-header lead is deployment-dependent: [Vercel documents overwriting X-Forwarded-For to prevent spoofing](https://vercel.com/docs/headers/request-headers). Generic self-hosting must verify its trusted proxy. The global availability limiter intentionally fails open; the independently enforced spend-producing endpoint limits fail closed. No production spoofing test was performed.

### AI Insights Cache and Generation Gates

The source-only scan's cost lead was confirmed in `src/services/ai/ai-insights-api.ts`: a cache miss could reach model generation with no plan, per-user rate or per-business daily budget gate. A cached business-context selector also lacked a live membership check before Redis could return private insights. The handler now revalidates live business access before any cache read, derives organization/plan from the authorized database row, checks active plan and per-user limits, and requires the fail-closed business budget before generation. Review text, business name and output tokens are bounded. Authorized cache hits and the insufficient-review response remain usable without consuming model budget.

Fifteen synthetic handler tests cover missing/foreign/sibling/revoked access, expired/free plans, rate/budget/cache outages, correct server-derived tenant filters, bounded prompts, cache reuse and eligible generation. Ten of the original thirteen cases failed against the vulnerable handler before the fix. The shared AI budget coverage now includes Insights.

The resumed scanner uses the Docker endpoint selected by the CLI explicitly: Docker's Python SDK did not read the CLI context and lost its default socket. The runner now exports that selected endpoint when no explicit host is supplied, and two isolated shell tests prove context resolution and preservation of an explicit host. No Docker settings were changed.

### Four Additional Findings From the Repeat Scan

These identifiers belong to repeat run `zyene-strix-bslupd_365d`, not the original eighteen-item report. Each vulnerable path was checked in actual source. This group needs a separate release attestation below; it requires no new production SQL migration.

| Repeat Finding | Status | Files Changed | Regression Evidence | Remaining Action |
| --- | --- | --- | --- | --- |
| 0001: Smart Insights model/cache access lacks spend and live-tenant gates | fixed in source | `src/services/smart/insights-api.ts`, `src/services/ai/authorize-insights.ts`, `src/services/ai/ai-insights-api.ts` | `ai-insights-security.test.ts`: 30 shared handler cases; foreign/sibling/revoked users cannot read caches or generate; free/inactive/rate/budget failures cannot invoke the model | Attest this group's rollout; keep Redis available. |
| 0002: bulk campaign sends bypass monthly SMS/email allowances | fixed in source | Campaign send API/quota/job-access services, Inngest client/contact worker, `src/lib/stripe/check-limits.ts`, channel reservation helper/Lua script | Five focused campaign/limit suites: 35 cases; exact business/campaign binding, writable actor, quota denial, post-delay revocation/opt-outs and malformed counters. A disposable Redis test proves atomic two-channel reservations, retries, tenant/month isolation and exactly three successes for 20 concurrent claims against cap three. | Inspect historical queued jobs missing actor data; they fail closed. Requeue only with an authenticated owner's explicit authorization. Reservations are conservative, not a promise of exactly-once provider delivery across every crash. |
| 0003: AEO prompt suggestions invoke paid discovery without spend gates | fixed in source | `src/app/(dashboard)/google-seo-aeo/prompts/suggest-prompts-action.ts`, `src/lib/auth/rate-limit.ts` | `aeo-prompt-suggestion-security.test.ts`: 10 cases; foreign/sibling/viewer/suspended denial before privileged/provider work, user/hourly fail-closed limits, no paid discovery for free/inactive/budget-denied plans, authorized business scope | Free users retain bounded deterministic templates. Paid discovery shares the existing daily business budget. |
| 0004: merchant-controlled place-action URL HEAD checks allow SSRF/unsafe redirects | fixed in source | `src/services/google/place-action-link-utils.ts`, `src/services/aeo/crawler/public-http.ts` | `place-action-link-ssrf.test.ts`: 14 cases, eleven reproduced against the unsafe handler; private literals, credentials/protocols, private redirects, connection-time DNS rebinding and redirect cycles are denied; healthy public redirects still work. Existing pinned-transport/runtime tests also pass. | No production SSRF payload was used; keep the shared transport on all user-controlled URL paths. |

All 92 cases in the combined focused group pass, followed by `pnpm verify:fast`. The disposable PostgreSQL harness still passes all seventeen security migrations; the actual Redis harness also passes. The updated campaign worker validates live writable access again before its permission reads, privileged request creation and provider send; post-send bookkeeping settles only the signed job's exact tenant/campaign/request.

A subsequent registry audit reported three additional advisories in DOMPurify and gRPC. Scoped overrides now require DOMPurify 3.4.16 and `@grpc/grpc-js` 1.14.5, and the lockfile regression test covers both. The documented vulnerable [DOMPurify in-place hook combination](https://github.com/cure53/DOMPurify/security/advisories/GHSA-p98j-92pf-mc4p) and gRPC server [certificate-context](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j)/[error-message](https://github.com/grpc/grpc-node/security/advisories/GHSA-f596-whhp-79r4) paths were not established in application source. The dependencies are patched regardless; frozen installation and a fresh audit report zero advisories.

## Stripe Read-Only Reconciliation

`scripts/security-billing-reconcile-readonly.mjs` checks exact Vercel project, Supabase host, and Stripe account bindings before GET-only inspection. Decrypted production secrets remain in memory, never output. The enabled endpoint has the five handled event types and API version `2026-02-25.clover`, matching Stripe SDK 20.4.1. A separate private comparison of the visible Stripe destination secret and decrypted production Vercel configuration confirmed they match. Only the boolean result was output, and the secret was hidden again before a screenshot. No secret was copied into this report. The dashboard shows 26 deliveries and zero failures this week; that is historical observation, not a new delivery test.

All **122 legacy-unknown records remain unchanged**: 61 events were retrievable and 61 unavailable/older than retention. The retrievable events comprise 7 subscription updates, 51 successful invoices and 3 failed invoices. None has a pending webhook, but successful delivery does not prove every side effect completed. Six current subscription/customer bindings and statuses matched, with zero drift, unavailable subscriptions, or customer mismatch. This is not a historical credit-ledger reconciliation or proof that plan-price mappings match.

The private identifier report is `/Users/ashishdikonda/.strix/zyene-reviews-runs/follow-up-2026-09-30/billing-readonly.json`. No events were replayed, deleted, or falsely marked processed. Preview/development also use live Stripe credentials; there is no isolated test configuration yet. A staging/test webhook check must use a separate non-production database and Stripe test credentials.

## Original 18 Findings

Named source groups refer to the exact file inventory in the original remediation report; regression suite names are under `tests/unit/` unless a SQL path is given. "Fixed" means verified source mitigation and the required DB boundary are complete, not perfect security or proof of no historic exploitation.

| Finding | Status | Files Changed | Tests Added / Updated | Remaining Action |
| --- | --- | --- | --- | --- |
| 0001: committed OAuth encryption key | requires production verification | Key Rotation group; ciphertext guard and seed-retirement migrations | SQL rotation, stale-write and rollback tests | DB key rotated; revoke/reconnect affected provider credentials and coordinate secret-history remediation. |
| 0002: Next AVIF dependency | fixed | `package.json`, `pnpm-lock.yaml` | `image-security-dependencies` and build | Next 16.3.8 is in the attested source release; no live exploit test. |
| 0003: sharp/libheif dependency | fixed | `package.json`, `pnpm-lock.yaml` | `image-security-dependencies` | Preserve patched frozen lockfile/runtime. |
| 0004: caller-controlled nanoid size | false positive | No reachable size-input change required | Both constant `nanoid(6)` callers inspected | Reassess if size becomes input-controlled. |
| 0005: Google OAuth account takeover | fixed | OAuth group | Six callback/state/owner/authorization suites | Initiation/callback fixes are in attested production source. |
| 0006: Facebook connection CSRF | fixed | Facebook group | State/callback/confirmation/token-boundary suites | Redis remains required and fail-closed. |
| 0007: public sensitive integration reads | fixed | Integration Boundary group; live read-grant migration | Integration unit tests and actual SQL grant/tenant denial | Live table/column grants and dependent views checked; monitor drift. |
| 0008: missing WITH CHECK reparenting | false positive | No change required for omission alone | Actual PostgreSQL implicit-WITH-CHECK denial | Continue reviewing predicate correctness, not syntax alone. |
| 0009: unsigned tracking mutation | fixed | Review Tracking group | Tracking token/open authorization | Legacy unsigned requests cannot mutate old rows. |
| 0010: CSV formula injection | fixed | CSV group | `csv-formula-protection` | Keep all exporters on the shared escaping option. |
| 0011: SMS content/name injection | fixed | Output Encoding group | `sms-and-recovery-output-encoding` | Merchant-authored template content remains intentional. |
| 0012: newsletter cost abuse | fixed | Marketing Limits group | Public marketing limiter/outage denial | Monitor limiter availability. |
| 0013: book-lead limiter bypass | fixed | Book-lead route | Preview/missing-env limiter denial | No production bypass was established; gate removed everywhere. |
| 0014: cross-tenant private feedback | fixed | Private Feedback group | Bare-ID/foreign-signature/scoped-request denial | Preserve signed UI/API contract. |
| 0015: public AI draft spend | fixed | AI Draft group and budgets | `public-ai-draft-security` | Nonexistent-ID monthly exhaustion claim was overstated; reachable model spend fixed. |
| 0016: Places/email tool cost abuse | fixed | Marketing Limits group | Free-tool limits and usable-result tests | Monitor provider spend and limiter availability. |
| 0017: unbounded analysis/backfill | fixed | AI Analysis group | Access/batch/daily-budget suites | Maintain verified-business limits and bounded batches. |
| 0018: ciphertext plus exposed-key chain | requires production verification | Integration/Key Rotation groups and new rotation guard | Grant, crypto, token-response and rotation SQL | Live reads closed and DB key rotated; provider revocation/reconnection and incident-history assessment remain. |

Disposition remains **14 fixed, 2 false positives, 2 requiring operational verification/remediation**. Additional storage, privileged-RPC, invitation, billing and AI-accounting leads are documented separately, not hidden by the eighteen-item count.

## Release Attestation and Checks

### Saved Checkpoint: Provider Change

The owner supplied a replacement AkashML credential on September 30. It is not included in this report, Git, test fixtures, or scanner configuration. Subsequent scanner invocations will use the replacement through private process input, not an older saved credential. A key shared in chat should still be rotated after use.

The saved source-only run, `zyene-strix-bslupd_365d`, stopped at `2026-09-30T18:48:49Z` after HTTP 402 insufficient credits. Its saved coverage contained **52 surfaces, four filed findings and eight gaps**; it was not a completed or clean audit. All four findings now have source fixes and passing focused tests. The run was resumed with the newest replacement credential and a rebuilt credential-free snapshot containing those fixes. Full local validation is now green; this group's release attestation and final scanner coverage remain pending. The checkpoint preserves the reviewed security changes separately from concurrent Google-sync work.

Security commit `604d7fd4e078ed028f2158109eb7123dfe002337` is pushed to `main`. [GitHub CI run 36758156025](https://github.com/dikondaashish/Zyene_reviews/actions/runs/36758156025) succeeded. Vercel deployment `dpl_2RUUcKnSLZSJmjFqL4ZhnP2L5Ut4` is READY with that exact source SHA and all production application/public-capture aliases. This release contains the first Insights fix and narrow Color Guard fixture exception; it does not contain the newer uncommitted campaign/Smart Insights/AEO changes. Its full local verification passed 252 files / 1,601 tests, followed by the production build and fast check.

The prior production deployment `dpl_5DkcXEQoThJfzLLyofVYcDgSZwBt` is READY for commit `46ad5111d29c023272fa8aedf6f9832419938280`, with the application/public-capture aliases. Its production Vertex configuration uses the existing key ending `eba5`, not the exposed key ending `e764`. Only that comparison was output. Headless isolation opt-in is absent in authoritative production configuration; rendering stays disabled.

- Latest full working-tree `pnpm verify`: 260 files / 1,693 tests, TypeScript and sizes passed. This includes concurrent Google-sync changes, which are not included in the security-only commit. An earlier attempt observed four failing new Google-sync assertions while that concurrent implementation was still being written; after its changes arrived, the complete suite passed twice. No unrelated edits were reverted or included in this security group.
- New dependency/monitoring/poster/snapshot focused group: 7 files / 34 tests passed. React Doctor's changed-file scan scored 100/100 with no findings. The latest dependency audit reports zero advisories.
- Focused AI/limiter/integration/Stripe suites: 5 files / 27 tests passed.
- Disposable PostgreSQL harness: 17 security migrations plus real historical RPC/storage/credit migrations passed, including tenant, role, invitation, grant, storage, counter, billing, retry and rotation regressions. No network, host mounts or application credentials were provided.
- The latest `pnpm build` passed with the four new source fixes and dependency patches: compilation, TypeScript and 273 generated static pages, followed by a passing `pnpm verify:fast`. Existing Edge Runtime and Tailwind module warnings remain. Focused ESLint reported no errors and two pre-existing unused-parameter/destructuring warnings.
- A following fast check found duplicate generated `.next/types/* 2.ts` declarations. Only those generated duplicates were removed; `pnpm verify:fast` then passed. Unrelated source duplicates were not removed.
- The four new live SQL bodies were not edited after application. Remote migration history has 148 records (131 pre-existing plus 17 security entries), including the backend-only counter. Pending local versions were renamed to the Supabase-assigned versions; no earlier ledger row or applied SQL body was changed.
- Security commit `bf9c0dc1` was pushed to `main`. [GitHub CI run 36746338601](https://github.com/dikondaashish/Zyene_reviews/actions/runs/36746338601) passed its full validation job. Vercel deployment `dpl_EfANhQWy5PuUQfHeBr7uZSiLT3Pu` is READY, its source SHA matches, and all production aliases point to it. The subsequent metadata-only ledger alignment does not change the deployed application callers.
- Security commit `f0ee4d0214a84b21f15ae9e0ab939eb43ea31a12` was subsequently pushed. Vercel deployment `dpl_BSQwovuevByRT45EVLzN9uGS6TCm` is READY with that exact SHA and all production aliases. Its [CI run 36755726018](https://github.com/dikondaashish/Zyene_reviews/actions/runs/36755726018) stopped at Color Guard because the new print-security test contains necessary literal-color fixtures. The exact fixture path was narrowly allowed in `604d7fd4`, whose full CI passed and deployment is attested above.

## Remaining Operational Work

1. Obtain independent recovery access before the approved PostgreSQL 17.11.0.002 upgrade. Compatibility checks found no deprecated extensions, logical slots, ltree/float GiST indexes, or custom estimator functions needing repair. Free has no scheduled backups; the installed CLI is not authenticated. The owner has only used plugins so far. Plugins support SQL/migrations, not a logical-backup download. Supabase documents restoring the original instance on failed upgrades, but that is not an independent restore-tested backup or a downgrade after success. No upgrade was started without that prerequisite.
2. Leaked-password protection is still disabled and Pro-only. The owner chose Free, so no paid plan was purchased or bypassed.
3. Owner must revoke only the exposed Google key ending `e764` while retaining the production key ending `eba5`, rotate chat-shared AkashML credentials after use, and provide only a private file path/confirmation. Google revocation is not confirmed complete. The newest AkashML credential is used only in scanner process memory; earlier credentials are not reused.
4. Coordinate Google/provider token revocation and reconnection with the affected business owners. DB encryption rotation alone cannot invalidate provider credentials.
5. Reconcile historical Stripe side effects with retained billing/audit exports; preserve unavailable/ambiguous events. The signing-secret match is now verified. Prepare isolated test credentials/database before an end-to-end webhook check. No automatic live replay is safe.
6. Complete and triage source-only Strix run `zyene-strix-bslupd_365d` using the newest replacement credential and a rebuilt snapshot. Its first attempt failed with a Docker socket connection error after eleven coverage entries; after Docker recovery, its resume stopped on HTTP 402 at 52 surfaces, four findings and eight gaps. Run `zyene-strix-1mfphe_569f` also failed after provider 429s and then HTTP 402: only three coverage entries and no filed findings, not a completed clean audit. Both runs' confirmed leads are tracked separately from the original eighteen findings. Chat-shared replacement credentials require rotation after use and are not persisted in repository/configuration files. No empty future scanner report or perfect-security guarantee is made.
7. The final repeat Supabase plugin query/advisor check was denied by the connector. Earlier live migration/grant/rotation evidence remains recorded; restoring connector access is required for a new plugin attestation. No credentials or plugin session tokens were extracted to bypass that restriction.

Advisor notices are interpreted, not silenced: four no-policy RLS tables deny client rows; identity-scoped read helpers and policy helpers intentionally use definer security. The AI counter is now backend-only. Disabled leaked-password protection remains a real operational limitation on Free.

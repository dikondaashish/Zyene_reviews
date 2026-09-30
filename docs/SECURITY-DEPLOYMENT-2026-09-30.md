# Security Deployment and Verification: 2026-09-30

Historical checkpoint: current rollout, rotation, storage, membership and billing follow-up is recorded in [Security Follow-Up](SECURITY-FOLLOW-UP-2026-09-30.md). Statements below about pending rotations and unverified deployment describe the earlier phase, not the latest state.

## Scope and Authorization

The user confirmed that the remediated application was already deployed and explicitly authorized applying security migrations through the connected Supabase plugin. That deployment statement was not independently verified against a Vercel release artifact.

Verified target: **Zyene Reviews**, Supabase project `snielpllhrppdqzkzjwf`, matching the local public project URL; PostgreSQL 17.6. Stripe account `acct_1T71rDIiQQIaqDAL` is live mode and belongs to Zyene Reviews.

Production changes were limited to thirteen reviewed security migrations. No production exploit tests, provider reconnections, key rotations, webhook/event replays, payments, balance credits, Stripe configuration changes, or application deployments were performed. No secrets or customer records were returned to the client or added to this report. Unrelated source files were left untouched.

## Migration Ledger

All entries below applied successfully and are recorded in Supabase migration history. The plugin assigns versions at application time. Only these new security migration filenames were aligned to those versions, preventing future CLI replay under their original pending timestamps. The 131 earlier remote migration records were not changed. After filename alignment, local SQL bodies matched the SHA-256 hashes recorded for the applied request bodies. Remote history now has 144 entries, including all thirteen reviewed security migrations.

Each transaction used a five-second lock timeout and sixty-second statement timeout. These were transient transaction settings, not changes to database configuration.

| Original Pending Filename | Recorded Version | Migration |
| --- | --- | --- |
| `20260929230000_restrict_public_integration_reads.sql` | `20260930143031` | [restrict_public_integration_reads](../supabase/migrations/20260930143031_restrict_public_integration_reads.sql) |
| `20260929231000_stripe_webhook_processing_claims.sql` | `20260930143035` | [stripe_webhook_processing_claims](../supabase/migrations/20260930143035_stripe_webhook_processing_claims.sql) |
| `20260929232000_protect_organization_billing_columns.sql` | `20260930143037` | [protect_organization_billing_columns](../supabase/migrations/20260930143037_protect_organization_billing_columns.sql) |
| `20260929233000_guard_business_member_roles.sql` | `20260930143537` | [guard_business_member_roles](../supabase/migrations/20260930143537_guard_business_member_roles.sql) |
| `20260929234000_restrict_platform_sync_lock.sql` | `20260930143541` | [restrict_platform_sync_lock](../supabase/migrations/20260930143541_restrict_platform_sync_lock.sql) |
| `20260929235000_secure_oauth_key_rotation.sql` | `20260930143543` | [secure_oauth_key_rotation](../supabase/migrations/20260930143543_secure_oauth_key_rotation.sql) |
| `20260929235100_enforce_review_platform_tenant.sql` | `20260930143632` | [enforce_review_platform_tenant](../supabase/migrations/20260930143632_enforce_review_platform_tenant.sql) |
| `20260929235200_secure_business_invitations.sql` | `20260930143635` | [secure_business_invitations](../supabase/migrations/20260930143635_secure_business_invitations.sql) |
| `20260929235300_business_scoped_access_guards.sql` | `20260930143637` | [business_scoped_access_guards](../supabase/migrations/20260930143637_business_scoped_access_guards.sql) |
| `20260929235400_atomic_subscription_projection.sql` | `20260930143714` | [atomic_subscription_projection](../supabase/migrations/20260930143714_atomic_subscription_projection.sql) |
| `20260929235500_stripe_credit_grant_receipts.sql` | `20260930143715` | [stripe_credit_grant_receipts](../supabase/migrations/20260930143715_stripe_credit_grant_receipts.sql) |
| `20260929235600_referral_reward_claims.sql` | `20260930143717` | [referral_reward_claims](../supabase/migrations/20260930143717_referral_reward_claims.sql) |
| `20260930144137_guard_privileged_business_rpcs.sql` | `20260930145044` | [guard_privileged_business_rpcs](../supabase/migrations/20260930145044_guard_privileged_business_rpcs.sql) |

The webhook and credit-receipt migrations received explicit backend-only RLS policies before application. Webhook table/column grants were also revoked from client roles. These changes were tested locally before applying them; no applied SQL body was subsequently edited.

## Live Read-Only Verification

- Anonymous business reads and client reads/writes of access/refresh-token columns are denied.
- Legacy integration reads, client vault access, and client billing entitlement writes are denied. Intended safe organization-field updates remain granted.
- All 70 public business-ID tables have RLS and four restrictive business-scope policies each: 280 guards. No public business-ID table without RLS was found.
- No view or materialized view depending on the credential tables/private vault was found. Credential-reading roles are the backend service and Supabase-managed administrative/read-only roles; neither client role has credential access.
- All new billing, credit, referral, platform-lock, and invitation-acceptance RPCs are backend-only. The rotation routine is operator-only, not service-role executable.
- Stripe bookkeeping tables have RLS and deny client data access. The two new backend policies are explicitly service-role scoped.
- All 122 historical webhook records remain `legacy_unknown`. None was marked successfully processed, deleted, or replayed.
- Zero review/platform tenant mismatches and zero invitation/business organization mismatches were found. The review/platform composite foreign key is now validated.
- No pending unaccepted/nonexpired invitations or referral conversions existed at preflight. No legacy referral rewards currently require reconciliation.
- All 18 nonempty OAuth credential fields decrypt using the current private database key, both before and after migration. Decryption happened wholly inside PostgreSQL; only counts were returned. This proves compatibility, not that the exposed key is safe or rotated.
- Post-migration metadata confirms the five customer mutation RPCs use invoker security, so the new write policies apply to actual RPC calls.

The locked decryption RPC cannot run inside a READ ONLY transaction because it takes a row-sharing lock. The read-only consistency check therefore used pgcrypto directly inside the database and returned only counts; it did not weaken the RPC or retrieve any plaintext/key.

## Additional RPC Bypass Fixed

The live definitions and historical source showed that `bulk_add_customer_tags`, `bulk_remove_customer_tags`, `merge_customers`, `upsert_customer_by_identity`, and `import_customers_by_identity` bypassed RLS through definer security. Their older helper checked active business membership, not write permission or active organization membership. A viewer or organization-suspended member with a surviving business membership could therefore mutate customer data.

Those five routines now run as the caller and obey the existing restrictive write policies. Signatures, defaults, business logic, and backend service access are preserved. No wrapper schema or duplicate customer algorithm was introduced.

The definer-only `mute_aeo_alert` RPC now requires writable, active business access instead of broad organization membership. `claim_review_milestone` requires active business read access, retaining read-only dashboards while denying sibling businesses, removed memberships, and organization suspension.

Changed files: the thirteenth migration, `scripts/test-security-sql.mjs`, `tests/security/legacy-business-rpcs-fixture.sql`, and `tests/security/privileged-business-rpc-boundaries.sql`. The SQL harness executes five real historical RPC/schema migrations unchanged, plus the existing credit-ledger migration and all thirteen security migrations.

Regression evidence: the first local run failed on the reproduced viewer tag-write bypass. After the fix, negative tests deny viewer tag edits/removal, identity insertion/update/import/merge, sibling-business and other-tenant mutations, unauthorized alert mutes/milestone claims, and suspended-member writes. Positive cases retain member imports, merges, tag updates, own alert mutes, own read-only milestones, and backend customer/milestone operations. No live malicious write was attempted.

## Stripe Configuration

The single webhook endpoint `we_1T72k7IiQQIaqDAL5og8XYiy` is enabled at `https://www.zyenereviews.com/api/webhooks/stripe`. It has exactly the five events handled by the application:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

Endpoint API version **2026-02-25.clover** matches the installed Stripe **20.4.1** SDK's default API version. The signing secret was not retrieved or compared to the deployed secret. No endpoint update, delivery attempt, event replay, or financial operation was performed. End-to-end live delivery remains untested.

## Current 18-Finding Disposition

`fixed` means source mitigation and regression evidence are complete; database-dependent protections below are now live. Application deployment was confirmed by the user, not independently attested. See the [original report's file inventory](SECURITY-REMEDIATION-2026-09-29.md#file-inventory) for the exact source files in named groups. Unit test names below are under `tests/unit/`.

| Finding | Status | Files Changed | Tests Added / Updated | Remaining Action |
| --- | --- | --- | --- | --- |
| vuln-0001: committed OAuth encryption key | requires production verification | Key Rotation group; `20260930143543_secure_oauth_key_rotation.sql` | `tests/security/database-boundaries.sql`: protected crypto, atomic rotation and corrupt-data rollback | Data/key compatibility and client denial are verified. Separately coordinate actual key rotation, provider revocation/reconnection, and secret-history remediation. |
| vuln-0002: Next AVIF optimizer dependency | fixed | `package.json`, `pnpm-lock.yaml` | `image-security-dependencies.test.ts`; local production build | Verify deployed artifact contains Next 16.3.3 as part of release attestation; no production exploitation was attempted. |
| vuln-0003: sharp/libheif dependency | fixed | `package.json`, `pnpm-lock.yaml` | `image-security-dependencies.test.ts` | Verify deployed frozen lockfile/runtime contains sharp 0.35.4. |
| vuln-0004: unsafe nanoid size | false positive | Dependency maintenance only | Both callers inspected: constant `nanoid(6)` | Reassess if input controls size. |
| vuln-0005: Google OAuth account takeover | fixed | OAuth group | Callback/state/cookie/authorization/owner negative tests | No pending DB action. Release initiation and callback together; user reports deployment complete. |
| vuln-0006: Facebook connection CSRF | fixed | Facebook group | State, callback, token boundary and confirmation authorization tests | Keep Redis available; failures stop connection. |
| vuln-0007: public sensitive integration reads | fixed | Integration Boundary group; `20260930143031_restrict_public_integration_reads.sql` | Integration boundary unit tests and real SQL client/tenant/grant denial | Live standard/client grants, private vault denial, dependency views, and role privileges checked. Recheck on future schema/grant changes. |
| vuln-0008: omitted WITH CHECK reparenting | false positive | No application change required | Actual PostgreSQL UPDATE/reparenting denial | USING is implicitly reused for WITH CHECK; evaluate predicate semantics, not omission alone. |
| vuln-0009: unsigned tracking writes | fixed | Review Tracking group | Signed token and review-open authorization tests | Legacy unsigned links cannot modify old requests. |
| vuln-0010: CSV formula injection | fixed | CSV group | Formula/control/whitespace prefix serialization tests | Keep all exporters on the shared escape option. |
| vuln-0011: SMS name/content injection | fixed | Output Encoding group | SMS/recovery output-encoding tests | Merchant-authored templates remain intentional content. |
| vuln-0012: newsletter cost abuse | fixed | Marketing Limits group | Public marketing spent-limit/outage denial tests | Monitor fail-closed limiter availability. |
| vuln-0013: book-lead limiter bypass | fixed | Marketing book-lead route | Preview/no-environment bypass denial tests | No production bypass was established; the gate was removed from all environments. |
| vuln-0014: cross-tenant private feedback | fixed | Private Feedback group | Bare UUID, wrong-business signature, missing scoped request denied | Preserve signed flow/API contract together. |
| vuln-0015: public AI spend abuse | fixed | AI Draft group/shared budgets | Invalid/foreign request and limiter outage tests before provider/admin work | Scanner's nonexistent-ID monthly-counter claim was overstated; actual model-spend path fixed. |
| vuln-0016: Places/email tool cost abuse | fixed | Marketing Limits group | Dedicated search/result/email limits and preserved usable results | Monitor provider spend and limiter availability. |
| vuln-0017: unbounded AI analysis/backfill | fixed | AI Analysis group | Verified-business/batch/daily-budget negative tests | Monitor legitimate volumes; do not disable fail-closed limits. |
| vuln-0018: ciphertext plus exposed-key compromise | requires production verification | Integration Boundary/Key Rotation groups | Grant/crypto/rotation SQL plus token response-boundary tests | Live read chain is closed; key rotation and provider revocation/reconnection are still outstanding. Historical disclosure cannot be disproved by metadata. |

Disposition: **14 fixed, 2 false positives, 2 requiring production verification/remediation**. A future scanner can still flag historical committed key material, intentional privileged helpers, or newly discovered issues. No claim of perfect security or an empty future Strix report is made.

Additional triage leads now DB-mitigated and verified: billing-column forgery, member role escalation, invitation role/tenant/atomic acceptance, public sync-lock invocation, review/platform tenant links, webhook claim/completion/retry, atomic subscription projection, monotonic credit receipts, durable referral claims, and the new customer/alert/milestone RPC bypass. Existing source tests cover OAuth/provider authorization, service-role access, SSRF, signed public inputs, and fail-closed cost limits.

## Remaining Operational Work

1. Coordinate a maintenance window for `rotate_oauth_encryption_key()`, pause credential writers, verify counts again, invoke rotation, and verify successful re-encryption. Rotation was not invoked here. Revoke/reconnect affected provider credentials and address previously shared secrets through a separate controlled procedure.
2. Privately reconcile the 122 `legacy_unknown` Stripe events against delivery and business state before any authorized repair/replay. Deduplication cannot infer whether an old handler completed its side effects.
3. Verify deployed signing-secret configuration without copying its value, and validate delivery in Stripe test mode or a staging environment. The live endpoint read is not an end-to-end webhook test.
4. Keep headless rendering disabled until real network-level metadata/private-address egress denial is verified. The isolation flag alone is not a firewall.
5. Review historical invitation-driven organization-management assignments privately. The read-only aggregate flagged two ORG_ADMIN memberships on businesses with accepted invitations; it does not match verified invitee identities or prove an invitation caused promotion. Confirm intended roles against private audit history. Do not auto-demote users.
6. Enable Supabase's currently disabled [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) through the approved Auth configuration workflow. No Auth configuration was changed.
7. Schedule the platform's supported PostgreSQL security upgrade separately. This project is on 17.6; see [Supabase's PostgreSQL 15.19/17.11 upgrade notes](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes), including legacy cipher compatibility. No platform upgrade was performed.

## Advisor Interpretation

Security advisors were rerun after migration. They report four RLS-enabled/no-policy tables, three anonymous-callable read-only identity helpers, seven authenticated-callable definer helpers, and disabled leaked-password protection. This is **not** an all-green advisor result.

- The [no-policy notices](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) concern `cron_job_runs`, `marketing_newsletter_deliveries`, `opt_outs`, and `sms_opt_outs`. RLS with no policy denies client rows; the first two also revoke client table reads. No permissive policy was added just to silence notices.
- The [anonymous definer notices](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) concern `get_user_business_ids`, `get_user_org_ids`, and `get_user_store_role`. Live definitions bind to `auth.uid()` and active membership; anonymous identity returns no memberships. Existing RLS calls rely on these helpers, so execute grants were not blindly revoked.
- The [authenticated definer notices](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) include those helpers, the authorized-business policy helper, the now-scoped milestone and alert RPCs, and the organization-scoped AI counter. Definer security alone does not establish a vulnerability. The AI counter remains client-executable for existing deployed suggestion handlers and only increments the caller's active organization; making bookkeeping backend-only would require a coordinated application/API rollout, not an isolated grant revocation.
- Five actual customer write bypasses were removed rather than dismissing all function notices as expected.

## Verification Record

- Initial red/green bookkeeping tests denied anonymous/authenticated webhook and credit-receipt reads and forged completion.
- New RPC red/green test reproduced viewer mutation and then passed after invoker/active-business changes.
- `pnpm test:security:sql`: thirteen security migrations, the real credit-ledger migration, and five historical RPC/schema migrations execute in disposable PostgreSQL 17 with no network, host ports, host volumes, or application environment.
- Focused five affected unit suites: **21 tests passed**.
- `pnpm verify`: TypeScript, **244 test files / 1,547 tests**, and file-size guard passed.
- `pnpm verify:fast` passed after local generated-type cleanup. Duplicate `.next/types/* 2.ts` declarations caused the initial failure; only those generated duplicates were removed and route types regenerated. Unrelated source duplicates were preserved.
- Fresh `pnpm build` passed with Next 16.3.3: compilation, TypeScript and generation of 273 static pages. Existing Edge Runtime deprecation and Tailwind package-module warnings remain.
- Complete read-only verification SQL executed successfully against the authorized project; no configuration or data writes were made by that script.
- `git diff --check` passed. All thirteen local SQL-body hashes match the applied inputs. All thirteen assigned versions are recorded, and all 131 earlier version/name records are unchanged.
- No commit was made.

## Applied Source Hashes

SHA-256 hashes cover canonical SQL file bodies, excluding the transient timeout wrapper.

| Recorded Version | SHA-256 |
| --- | --- |
| `20260930143031` | `8eeb7bb85f83bdb803df2574cf838f6d6caa3e72a1e7bd11bd9cf2d82f7f55dd` |
| `20260930143035` | `89c64448a245c5618c45be485f6f571b2ea4c1668fade1e9e0bfac7f9a3e8e60` |
| `20260930143037` | `f3d245490b8c6a80c826291ca9ccd8ef2e7cbd340ebc324f89e243cba55e6005` |
| `20260930143537` | `b0e12ccdda9d71961f38fd83561cc83706058f8110236668f58324e4c651b93a` |
| `20260930143541` | `5b374b1f085a5cb44be7cddb5ad1468e5b7f461c6f27298ee8f667f106d117cc` |
| `20260930143543` | `d6cae621adba5f3300f0195faf38eb9cd35e22add58f1d3bebeea8daecb46474` |
| `20260930143632` | `c3b960ae66447cc89bb6b3959b2443d701e1c050f5bd7d692bf4a09db0389ab5` |
| `20260930143635` | `4b3d023e098f44e18cbeacc3503050d7e326167015a7151dd248901e4279c628` |
| `20260930143637` | `7b2d93a633337ec437b044609233f88d0de27ab5bf760dbdf1ec54eedf010657` |
| `20260930143714` | `eb1bd0dfe0d0fc963414f7e6213d400a73a9ace0d23268a12ef40858be6d6fa7` |
| `20260930143715` | `fa50c324dc0d791a540ba348f8bfdb1d763d9c38fbf9dc05ae353afe1618d74d` |
| `20260930143717` | `0249a3a2ac2f55a983fb4e19f20fa9276f8988a223a9e4201cd2a8e505d0da10` |
| `20260930145044` | `48cfaf84efbc028dd055bc3e7f6b9c0d76560bf80cc46939d4fc905392bc9334` |

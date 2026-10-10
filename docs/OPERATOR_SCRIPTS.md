# Operator scripts

Reviewed October 10, 2026. Package/CI wiring is not a complete usage inventory:
manual tools are deliberately excluded from CI when they read live configuration,
write customer data, call vendors or spend money. The maintainer owns these tools;
any live run requires confirming the intended environment and current authority.
Scripts retain their invocation examples and environment variables in their headers.

| Tool | Purpose / environment | Side effects and disposition |
|---|---|---|
| `scripts/create-security-audit-snapshot.mjs` | Sanitized local source copy for independent scanning | Writes outside checkout; tested by security-audit-snapshot. Keep. |
| `scripts/run-strix-akashml.sh` | Local snapshot security scan with Strix + AkashML | Requires Docker/provider credentials; sends sanitized source and incurs provider cost. Docker preflight is unit-tested. Keep. |
| `scripts/test-security-redis.mjs` | Disposable Redis allowance atomicity tests | Starts/stops an isolated local Docker container; active secure-SaaS skill prescribes it. Keep. |
| `scripts/test-security-sql.mjs` | Disposable PostgreSQL tenant/security boundaries | Package-wired local database harness; does not certify production grants. Keep. |
| `scripts/security-billing-reconcile-readonly.mjs` | Bound-account billing/configuration reconciliation | Live provider/database reads and private local output; no payments or DB writes. Security follow-up consumes it. Keep. |
| `scripts/seed-aeo-live-run.ts` | One real vendor sampling cycle for a selected business | Can spend and leaves database data; explicit `--confirm` gate. Keep as manual QA, never an ordinary test. |
| `scripts/smoke-aeo-dispatch.ts` | Fixture-based dispatch/store integration check | Writes/cleans real schema data using privileged credentials. Select an isolated environment. Referenced by seed tool. Keep. |
| `scripts/verify-aeo-credentials.ts` | Small real credential checks | Provider calls may incur cost; inspect engine behavior before use. Keep manual. |
| `scripts/verify-answerability-live.ts` | Inspect answerability of a chosen public URL | Outbound page reads; useful direct CLI. Keep manual. |
| `scripts/verify-crawler-live.ts` | Inspect crawler behavior on a chosen public URL | Outbound network reads; not an automated production attack. Keep manual. |
| `scripts/verify-fetch-cited-source-live.ts` | Verify cited-source fetch behavior | Outbound network reads. Keep manual. |
| `scripts/verify-template-pack-report-production.mjs` | Read-only funnel report verification | Authenticated report API reads; choose explicit target. Keep manual. |
| `scripts/test-analysis.ts` | Synthetic review examples through a real model adapter | Billable provider calls; header/model descriptions can age. Keep manual; verify configured adapter before running. |
| `scripts/audit-marketing-seo.mjs` | Read-only static marketing audit | Referenced by archived content audit; keyword checks are heuristics, not render/SEO certification. Keep useful CLI. |
| `scripts/qa-lead-magnet-flow.mjs` | Lead-magnet QA runbook tool | Dry-run default; `--execute` can subscribe/send in selected environment. Keep. |
| `scripts/prospecting/build_prospect_emails.py` | Owner prospecting PDF/HTML generation | Writes local collateral; requires Python/reportlab. Keep human workflow; does not send mail by itself. |
| `scripts/validate-geo-faq-build.mjs` | Post-build FAQ/schema checks | Reads local build output. Active GEO runbooks consume it. Keep. |
| `scripts/validate-geo-faq-production.mjs` | Public FAQ/schema checks | Read-only target requests. Active GEO runbooks consume it. Keep. |
| `scripts/validate-geo-faq-schema.mjs` | Standalone FAQ schema diagnostic | Read-only target requests; self-documented manual utility. Keep until deliberately superseded. |

`scripts/lib/validate-geo-faq-core.mjs` is a shared dependency, not a standalone
command. Other package-wired commands remain documented in package.json/README.

The executed one-off `collapse-tailwind-size-classes.mjs` codemod was retired in
this cleanup. Its former source can be recovered from Git history. Do not remove
manual security/QA utilities solely because package.json does not invoke them.

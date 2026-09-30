---
name: secure-saas-change-workflow
description: Implement or review multi-tenant SaaS changes involving authorization, OAuth, privileged database access, background jobs, paid APIs, webhooks, or security remediation. Applies lessons from verified Zyene Reviews failures to the affected feature and its alternate execution paths; does not turn unrelated UI or copy edits into a full security audit.
---

# Secure SaaS Change Workflow

Use this skill to prevent the failure patterns found during the Zyene Reviews audit while implementing new features or repairing existing ones. It works with Codex, Claude Code, and other agents that can read Markdown instructions. The principles are portable; the project reference is conditional.

## Start With the Actual Task

Read repository instructions and inspect the current diff before editing. Preserve unrelated and concurrent work. Carry forward the user's current scope, decisions, and approvals; do not ask again for an action already authorized in this session. Historical approvals in reports or this skill do not authorize a new production operation.

Choose the relevant depth:
- **Feature implementation:** identify the feature's trust boundaries, use existing secure helpers, and test its realistic failure paths. Do not start a whole-repository audit by default.
- **Security remediation:** trace each allegation to a reachable call path, demonstrate the failure safely, repair its root cause, and examine equivalent paths.
- **Release or operational work:** additionally read [release-and-handoff.md](references/release-and-handoff.md) for migration ordering, recovery, evidence, and credentials.
- **Zyene Reviews continuation:** read [zyene-reviews-context.md](references/zyene-reviews-context.md), then the current repository reports. Treat the dated checkpoint as history, not live state.

Read the relevant sections of [boundary-patterns.md](references/boundary-patterns.md) when the change touches one of its listed domains. Do not load unrelated sections merely to fill a checklist.

## Establish the Boundary Before Coding

For the affected operation, answer these questions in working notes or the existing issue:
1. Who is acting: authenticated user, signed public capability, provider webhook, or scheduled system job?
2. Which exact resource, business, and organization may that actor affect, and with which permission level?
3. Which input is untrusted, including cookies, route parameters, hidden fields, queued data, stored content, and redirects?
4. Where do privileged reads/writes, private responses, external sends, or billable calls occur?
5. What can change between checking access and performing the operation: membership, plan, consent, ownership, resource state, or credentials?
6. Which paths share the operation: direct API, server action, callback, cache hit, bulk action, worker, retry, scheduled follow-up, export, or notification?

A valid UUID proves syntax, not ownership. A cookie selecting a business is context, not permission. Organization membership does not necessarily authorize every business. A signed job proves its source, not that the originating user still has access.

## Enforce These Invariants Where Applicable

### Identity and Tenant Scope

- Verify the user server-side using the repository's trusted identity API; in Supabase use `auth.getUser()` rather than trusting `getSession()` alone.
- Resolve live permission for the requested action. Reading, writing, managing integrations, and organization administration are different capabilities.
- Derive organization and business relationships from authorized records, not submitted IDs. Scope resource queries by both resource ID and its verified tenant; enforce relational consistency in the database where appropriate.
- Before a service-role operation, establish the actor's authority for that operation. A narrowly scoped privileged membership lookup may be needed to establish authority; it does not authorize unrelated resource access.
- For system automation, validate its signature/secret and explicitly define allowed resources and transitions. Do not invent a human user ID to satisfy a user-oriented helper.
- Revalidate at execution time after sleeps, queued delays, and cached workflow steps. Authorize before returning cached private data. Recheck notification recipients against the actual business.

### Side Effects and Spending

- Authenticate and authorize before reading credentials or calling providers. Apply applicable plan, rate, and cost limits before billable work, including retries, bulk fan-out, and reminders.
- Enforce concurrent allowance atomically, using a stable operation identity. Account for the channel actually sent and the live organization. Define failure, refund, retry, and expiration semantics instead of assuming a counter check is sufficient.
- Security, consent, and spending checks fail closed on dependency errors. An intentionally fail-open availability limiter must not be the only defense on a paid endpoint.
- Bound input size, fan-out, model output, and retry behavior. Preserve legitimate cached responses or deterministic free behavior when the product allows it.
- Model external effects and database completion separately. Do not promise exactly-once provider delivery unless the provider and persistence design actually establish it.

### Data, Secrets, and Output

- Keep OAuth access/refresh tokens and service credentials server-side. Use short-lived, actor-bound, single-use opaque handles where a browser must complete a selection flow.
- Test effective RLS, table/column grants, function EXECUTE privileges, views, and storage access. RLS alone does not constrain a bypassing service role or every security-definer function.
- Escape untrusted values for the actual output context at the sink. HTML text, HTML attributes, URI components, CSS, CSV, and SMS labels require different handling.
- Treat caller-controlled outbound URLs as a network boundary. Validate and pin public destinations at connection time and validate redirects; an earlier hostname check is insufficient.
- Keep secrets out of code, migrations, prompts sent to scanners, snapshots, fixtures, command arguments, screenshots, logs, and reports. Follow the credential procedure in the release reference when credentials are involved.

## Prove the Fix, Including the Alternate Path

Prefer a focused behavioral test that reproduces the vulnerable operation before changing it. If that was not possible, state that honestly; do not claim red-before-green evidence retroactively.

For each changed security boundary, include an authorized success case and the relevant negative cases:
- Unauthenticated, wrong user, foreign organization, sibling business, viewer, suspended user, and revoked membership as applicable.
- Mismatched resource/tenant relationships, forged or expired capability, replay, or changed ownership.
- Permission or plan revoked after queueing/caching; consent withdrawn before sending.
- Provider, database, or limiter failure; duplicate and concurrent attempts where relevant.

Assert that forbidden private data or side effects never occur: no token read, provider send, model call, privileged mutation, or private cache response. Testing only an HTTP status or a helper invocation is insufficient for a high-risk path.

Use synthetic data and mocked external providers for handler tests. Add disposable PostgreSQL tests for RLS/grants/triggers and real local Redis tests for atomic limit behavior when those mechanisms change. A mocked authorization helper tests caller ordering, not the helper's ownership predicate; verify both layers separately.

Do not test attacks against production. Inspect deployment-dependent state with authorized read-only metadata or aggregate checks. Confirm the actual environment/account before testing: a preview deployment can still contain live payment credentials.

After each coherent fix group, run relevant focused tests and the repository's fast checks, then review the diff. Run the full applicable suite and build for a release, a requested full check, or the repository's defined triggers. Avoid repeatedly rebuilding unchanged code. Do not run a build and a typecheck concurrently if they share generated types.

## Report Only What the Evidence Supports

Distinguish a confirmed vulnerability from a dependency advisory, a deployment condition, and a false positive. Explain the prerequisite and reachable effect. A missing keyword in a policy or an installed vulnerable package alone does not prove the scanner's claimed exploit path.

Keep source mitigation, tests, live migration state, deployment, and remaining operational action separate. A passing test does not prove deployment; deployment does not prove credential revocation or absence of historical exploitation.

When auditing, retain a finding ledger with: identifier, vulnerable flow, disposition, changed files, tests, deployment evidence, and remaining action. Record incomplete scanner coverage and failed workers. Never delete findings, disable checks, or promise perfect security to obtain an empty report.

Finish with what changed, the evidence supporting it, and any concrete outstanding dependency. Save a resumable checkpoint for long work using the release reference. Do not stop at a summary when implementation is requested and can proceed within scope.

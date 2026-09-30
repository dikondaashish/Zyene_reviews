# Boundary Patterns and Concrete Examples

Read only the sections relevant to the change. These are lessons from actual failure classes, not a requirement to redesign every feature.

## OAuth and Public Capabilities

**Failure:** an OAuth callback accepts a user/organization ID from the URL and uses privileged session-restoration APIs for that identity. Another flow returns provider tokens so a browser can choose a location.

**Required behavior:** bind initiation to the verified user and authorized organization/business; bind random, expiring state to the initiating browser; validate and consume state before token exchange; recheck authority at completion. Keep provider credentials in server-only storage. A browser selection handle must be short-lived, single-use, bound to the initiating actor/resource, and limited to choices observed from the provider. A signed state payload alone is not proof that the current actor is its owner.

**Tests:** forged/expired/replayed state, wrong browser/user/business, revoked manager, unsolicited callback, invalid provider resource, token-store outage, and a valid connection. Inspect actual responses for access/refresh token leakage. Preserve the normal new-user OAuth flow; an add-business flow and first-time sign-in may require different checks.

For public review tracking or feedback, an unguessable request ID is not sufficient authority to mutate an existing request. Bind a signed capability to its purpose and exact request/business, validate it before privileged work, and scope the stored request lookup. Decide deliberately how old unsigned links behave.

## Membership, Invitations, and Notifications

**Failure:** an employee's active organization membership is treated as access to every business, or accepting a business invitation grants an organization-admin role.

**Required behavior:** preserve intended organization-wide owner/admin powers, while employees require explicit active membership in the target business. Organization suspension must override stale business access. Invitation creation, resend, direct database insertion, and acceptance must enforce the same role ceiling and business/organization relationship. Acceptance should atomically establish the allowed memberships, consume the invitation, and record an audit event. It must not downgrade an existing owner or restore a removed member through an old accepted link.

**Notification example:** an employee belongs only to Branch A. Even if they have a notification-preference row for Branch B, do not send Branch B's review text, customer details, or digest. Filter candidates by live business access and revalidate recipients inside retried/cached send steps.

**Tests:** sibling business, missing or suspended organization membership, removed membership, viewer mutation, role escalation, preserved owner role, accepted-invite replay, and revoked recipient after digest construction. Historical excess roles need evidence and an owner decision; do not bulk-demote ambiguous accounts based on role names alone.

## Database and Storage Boundaries

**Failure:** an API checks ownership but direct client SQL/RPC access permits mutation; a storage path merely looks business-scoped; a public read exposes sensitive integration columns.

**Required behavior:** inspect effective grants and policies for anonymous, authenticated, service, and relevant custom roles. Include column grants, default/public function execution, dependent views, SECURITY DEFINER functions and their search paths, and writable ownership columns. Use both old-row and new-row ownership semantics for reparenting. Test actual PostgreSQL behavior: an omitted UPDATE `WITH CHECK` can inherit `USING`, so absence alone is not a finding.

For storage writes, establish writable ownership of both the existing and replacement object path. For private evidence reads, require a trusted database pointer associated with the authorized business; review who can change that pointer. Public logo display may remain intentional while writes require authorization.

**Tests:** direct client access bypassing application routes; tenant reparenting; foreign object overwrite/rename; anonymous read; viewer write; RPC role escalation; and legitimate owner operations. Execute tests against a disposable database with realistic grants and historical prerequisites. Document whether the fixture covers the complete schema or only the affected subset.

## Queued Work, Campaigns, and Spending

**Failure:** the enqueue endpoint checks permission, but the worker runs after membership removal; initial sends enforce quota, but reminders or alternate channels bypass it.

**Required behavior:** user-triggered jobs retain a server-derived actor and resource identity, then revalidate writable access before privileged reads/writes and after delays. System cron jobs use verified system authority and a narrowly defined live campaign/resource relationship. Validate event payloads before privileged work. Re-read consent, stopped/completed state, plan, and actual channel before external sends.

Use an atomic organization/channel allowance reservation, with a documented claim identity and database usage floor if needed. Define retry, failure, month rollover, retention, and downgrade behavior. A stable reservation can prevent duplicate charging but does not by itself prevent duplicate sends. Address worker concurrency and provider idempotency separately.

**Example:** an email campaign alternates its second reminder to SMS. A plan with zero SMS allowance must deny that reminder before Twilio, even if the initial email was allowed. A later scheduled attempt must not reuse one permanent claim to obtain unlimited unrecorded sends after database failures.

**Tests:** the exact channel chosen; exhausted/free allowance; simultaneous attempts near the cap; same-operation retry versus new operation; counter errors; plan changes; scoped bookkeeping; and revocation/opt-out after a sleep. Trace direct, bulk, queued, and follow-up callers of the provider sink.

## AI Endpoints and Caches

**Failure:** model generation is gated but private cache hits are returned before live access checks; a free template feature silently invokes paid prompt discovery; analysis/backfill has unbounded work.

**Required behavior:** verify business access before cache reads, derive the plan from the authorized organization, apply endpoint rate limits and generation budgets as appropriate, and bound reviews, prompt characters, batches, fan-out, and output tokens. A permissible cache hit need not spend generation budget. Keep deterministic free fallbacks only where the intended product permits them. Backend usage-accounting APIs must not allow clients to self-assign entitlements or counters.

**Tests:** foreign/revoked cache access, expired plan, paid-call denial on free fallback, limiter outages, insufficient data without a model call, bounded valid generation, and correct organization accounting. Distinguish a reachable model-spend flaw from an unproven claim that nonexistent record IDs increment usage.

## Webhooks and Billing

**Failure:** record an event as processed before its handler succeeds; retries duplicate credits; an older event overwrites a newer subscription state.

**Required behavior:** verify the provider signature, claim processing atomically, distinguish processing/success/failure/unknown, complete only after successful work, and allow safe retry after failure. Use claim tokens or equivalent ownership for completion and recovery. Make individual side effects idempotent and defend ordering where necessary; a processed-event flag is not enough. Map billing resources to the correct stored organization/customer, and keep entitlement writes backend-only.

**Tests:** signature failure; competing claims; failed handler followed by retry; completed duplicate; stale/wrong claim completion; duplicate credit grant; out-of-order subscription changes; wrong organization/customer; and legitimate transitions.

Legacy unknown events require read-only reconciliation with provider state and retained records. Do not automatically replay them, erase them, or label them completed. A successful HTTP delivery does not prove every historical business side effect occurred. Use isolated test credentials and a separate non-production database for delivery tests.

## Outbound URLs and Rendering

**Failure:** validate a URL once, then let ordinary fetch follow redirects or resolve DNS again; assume a headless isolation flag creates network isolation.

**Required behavior:** use the existing vetted transport to validate scheme/credentials and public address ranges, vet all resolved addresses, pin an approved destination at connection time, and validate every redirect. Bound hops, response bytes, and timeouts; reject loops and internal/metadata destinations, including alternate IPv4/IPv6 representations. A timeout covering HTTP may not cancel an earlier DNS lookup; report that limit accurately.

Headless rendering requires actual network-level egress restrictions before enabling an opt-in flag. Application URL interception alone is not proof of isolation.

**Tests:** private literals; mixed public/private DNS; connection-time rebinding; private redirect; redirect loop; and a valid public redirect. Use mocked DNS and local synthetic harnesses, never production SSRF probes.

## Output Encoding

**Failure:** safely display a review in React but interpolate its text unescaped into an email; concatenate a name/email into a mailto query; place stored colors into a print style block.

**Required behavior:** apply context-specific encoding at each output sink, even if a current caller validates input. HTML-escape text and attribute values; URI-encode contact/query components before HTML-escaping the assembled attribute; allowlist CSS colors; escape spreadsheet formula prefixes through the shared CSV writer. Encoding an attribute does not validate an untrusted URL scheme. Sanitize a raw phone before HTML escaping, and truncate raw text before escaping so entities remain intact.

**Tests:** malicious reviewer/inviter/business names, attribute breakout, mailto parameter injection, style closure, CSV control/whitespace prefixes, and ordinary Unicode names/ampersands/valid contact round trips. Do not remove intentional merchant-authored templates or claim JavaScript execution merely because HTML injection exists.

## Dependencies and Scanner Claims

Verify current versions and advisories from package metadata and primary documentation when changing dependencies; do not freeze the historical patched version from this audit into future advice. Update the correct direct package or scoped transitive override, preserve the frozen lockfile, and test affected runtime functionality. Distinguish installed vulnerable code from a reachable application exploit.

An unpinned manual `npx` tool is a supply-chain consideration, not automatic proof of dependency confusion. Check the intended upstream tool, registry publisher/repository/bin metadata, and whether invocation is manual, lifecycle, CI, or production. Never execute an unknown package just to discover who owns it.

# Release, Credentials, and Handoff

## Keep Authority and Scope Explicit

Full computer access is a capability, not a request to modify every service. Use the current user's authorized objective and existing approvals. Read-only inspection, local source fixes, a production deployment, paid-plan purchase, destructive credential revocation, and database upgrade have different effects. Ask only when a necessary action is outside existing authorization or a material owner decision is missing; continue independent work while awaiting it.

Do not repeat an approval question already answered in this session. Do not reuse historical chat approvals as standing permission in a new project. A plugin's presence does not prove access, identify the right project, or supply a recovery backup. Respect explicit connector denials; do not extract session tokens to bypass them.

## Credentials and Encryption

- Never repeat a submitted secret. Prefer an existing secret manager, environment injection, or owner-only file outside the repository. Request a file path or completion confirmation rather than a key in chat.
- If a user authorizes a provider key for an immediate task, confine it to the intended provider/process and avoid shell history, command arguments, tracked files, and persisted scanner configuration. Configure tools to redact secrets and ensure wrappers do not echo input. Do not silently reuse an older key after replacement.
- Treat a secret pasted into chat, committed, or included in an exported log as exposed. Track revocation/rotation as unfinished until there is evidence; deleting the source literal does not invalidate the secret.
- Distinguish encryption-key rotation from provider-token revocation. Re-encrypting stored OAuth fields does not revoke provider credentials or establish that no past disclosure occurred.
- When authorized to rotate encryption, use a transactional procedure with locking, current-key write validation, corruption rollback, and in-database verification. Verify preservation through counts/digests/decryption checks without returning keys or plaintext. Test in-flight writes under the old key.
- Preserve the confirmed active production credential when retiring a different exposed key. Coordinated reconnection and secret-history cleanup are separate operational work, not automatic follow-ons to a source patch.

## Migrations and Recovery

Inspect the deployed code, live migration ledger, and relevant grants before choosing ordering. Never edit an already-applied migration's SQL body; create a forward migration. Align remote-assigned versions only with evidence of the exact already-applied SQL.

There is no universal "code first" or "database first" rule:
- Revoking a browser accounting RPC may require deploying compatible backend callers first.
- A webhook handler using new claim columns requires the compatible schema first.
- Cross-tenant foreign keys may require read-only checks for historical violations before validation.

For an approved release, record the ordered plan, compatibility assumptions, rollback or recovery path, and safe verification. Recheck exact project/account bindings before external mutations. Use aggregate or metadata results for live checks where possible.

For an upgrade with downtime or no downgrade path, verify compatibility and an independent usable recovery backup before starting when recovery is a prerequisite. An installed but unauthenticated CLI, a SQL plugin, and a provider's failed-upgrade rollback promise are not equivalent to a restore-ready backup. Do not buy a paid plan to resolve this unless authorized. Record unavailable plan features accurately and recheck current offerings when relevant.

## Source and Deployment Evidence

Commit coherent reviewed groups with their regression tests. Inspect staged paths and content; do not include unrelated concurrent edits or credential-bearing files. Do not reset the worktree to obtain a clean diff. An unrelated failure being actively changed by another actor must be distinguished from a regression, not silently suppressed.

Follow the repository's checks. If fixtures require guard exceptions, use the narrow justified fixture path; do not disable an entire guard. Check the lockfile/runtime, not only the top-level version declaration. Report pre-existing warnings separately from failing checks.

When deployment is authorized, match the reviewed commit SHA to the remote branch, CI result, deployment source SHA, READY state, and intended production aliases. A local build is not deployment evidence. A READY deployment is not proof its custom domains were promoted. If concurrent work changes HEAD, push only the reviewed commit and do not force-push over others.

Do not conflate the dirty working-tree test count with the committed release's count. Record both with their scope. Do not infer that an environment is safe from its name: preview/development may contain production credentials.

## Scanner Runs

Run source scans on a deliberate credential-free snapshot. Exclude environment files, credentials, symlinks escaping scope, and unrelated generated/private artifacts. Redact historical secret literals in the snapshot without rewriting applied migrations or historical evidence. Disable production connectors and provide explicit synthetic/source-only scope. Review the scanner's capabilities before allowing subprocesses or external tools.

Track run ID, source revision/snapshot, model/provider (never the key), coverage, findings, gaps, worker failures, and exit reason. Bound retries on rate limits and stop on invalid access, exhausted credits, or missing prerequisites. Preserve the checkpoint; do not relaunch indefinitely or silently switch credentials/providers.

Check both run status and completeness. "Completed" with failed workers or unexamined surfaces is incomplete coverage. "Zero findings" from a failed scan is not a clean bill of health. Later local tests do not count as an independent rerun. Preserve original reports and mark findings revalidated in a separate ledger.

## Resumable Checkpoint

For long work, keep an existing report current rather than creating a succession of conflicting summaries. Include:
- Scope, current user decisions, authorization boundaries, and environment constraints.
- Source revision, reviewed commit groups, dirty unrelated paths, and any running sessions that require follow-up.
- Each finding's vulnerable flow, confirmed/false-positive/deployment-dependent disposition, changed files, negative/positive tests, and residual risk.
- Test commands/results with scope; actual migration/deployment evidence; source-fixed versus deployed versus operationally resolved status.
- Blockers with the exact missing prerequisite, owner, and next safe action.
- Private artifact paths and credential variable names when needed, never credential values.

Distinguish "user intends to rotate", "rotation attempted", and "revocation verified". Keep historical evidence dated and direct readers to the current status. Do not repeat dangerous actions merely because a previous task ended before a summary was written.

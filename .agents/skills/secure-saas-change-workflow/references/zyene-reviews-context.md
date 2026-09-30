# Zyene Reviews Context

Read this only inside Zyene Reviews or when the user explicitly requests its audit handoff. Paths below are relative to that repository root. This is a historical orientation from September 30, 2026, not proof of current production state or ongoing authorization. Do not apply its account, plan, or deployment decisions to another project.

## Evidence to Read

1. `AGENTS.md`: active repository conventions, skills, file limits, and verification commands.
2. `docs/SECURITY-FOLLOW-UP-2026-09-30.md`: latest recorded finding tables, release evidence, and operational work from this audit. Check for a newer superseding report.
3. `docs/SECURITY-REMEDIATION-2026-09-29.md`: original vulnerable OAuth flow, source file inventory, and regression evidence.
4. `docs/SECURITY-DEPLOYMENT-2026-09-30.md`: historical rollout, superseded operationally by the follow-up report.
5. `docs/security-readonly-verification-2026-09-29.sql`: review before authorized metadata verification; a saved query file is not proof it ran against today's configuration.

Private scanner reports and billing evidence are referenced from the reports. Do not copy their sensitive contents into a public skill or repository. Inspect only what is needed for the task.

## Reuse Existing Implementations

Locate and read current callers before using these paths; names or contracts may have changed:
- `src/lib/auth/business-context.ts`: selected business context; selection alone does not establish live authority.
- `src/lib/db/supabase/verify-business-access.ts`: live business membership checks. Use the required read/write permission, not a broad organization fallback.
- `src/services/ai/authorize-insights.ts`: shared authorization/plan/rate gates before private insights caches.
- `src/services/ai/record-reply-usage.ts`: authorized backend usage accounting.
- `src/lib/stripe/reserve-channel-usage.ts`: live-plan atomic channel allowance reservations, backed by a shared Redis script.
- `src/services/campaigns/campaign-job-access.ts`: user job identity, campaign scope, and current contact permission.
- `src/lib/campaigns/drip-send-context.ts` and `drip-step-send.ts`: live campaign/request binding and actual-channel reservation for system reminders.
- `src/services/aeo/crawler/public-http.ts`: vetted public HTTP transport; do not bypass it with ordinary fetch for user-controlled URLs.
- `src/lib/security/html-escape.ts`: HTML encoding helper; does not replace URI validation or context-specific encoding.

## Verification

Use `pnpm verify:fast` and focused Vitest tests for a coherent source change. Follow AGENTS.md for when full `pnpm verify` and `pnpm build` are necessary. Use `pnpm test:security:sql` for relevant database boundaries and `node scripts/test-security-redis.mjs` for allowance atomicity when Docker is available. Read those scripts first and ensure they still create disposable synthetic environments. Do not run application/provider scripts against real customer data as a substitute.

After changing this skill, run `pnpm run skills:sync` to expose the canonical `.agents/skills` version to Claude Code and Windsurf. Verify targets before running the synchronization script because it replaces target entries. Other agents can read the canonical SKILL.md through AGENTS.md.

## Historical Outcomes and Unfinished Work

At the last verified source release, the original eighteen findings were classified as fourteen fixed, two false positives, and two requiring operational verification/remediation. Seventeen security migrations had been applied. The six repeat findings plus an additional notification recipient flaw had source mitigations; the final source release was `faf32a20` with successful CI and READY production deployment. Exact evidence is in the follow-up report, not guaranteed by this summary.

The repeat scanner reviewed 67 surfaces and filed six findings, but retained six coverage gaps and a false completeness flag. Final email/recipient/reminder patches were tested locally and in CI after the scanner's independent revalidation; another independent scan was still pending.

Do not silently treat these operational items as completed:
- Independent recovery access before an approved PostgreSQL upgrade; the upgrade was not started.
- Confirmation of exposed Google/AkashML credential and monitoring bearer URL rotation.
- Provider token revocation/reconnection and historical exposure assessment; rotating the database encryption key did not resolve these.
- Historical Stripe side-effect reconciliation and an isolated test setup; preview/development used live payment credentials at that time.
- Supabase connector access restoration for a new live attestation after a denied query.
- Review of old queued initial campaign jobs missing actor data; do not fabricate identities to requeue them.
- Leaked-password protection was unavailable under the owner's explicit Free-plan choice; do not upgrade the plan without current authorization.

Re-read current reports and verify changed conditions before acting. The user authorized earlier specific deployments and migrations, not unrestricted future production mutations. Preserve concurrent Google-sync work and unexplained source duplicates if still present; investigate ownership instead of deleting them.

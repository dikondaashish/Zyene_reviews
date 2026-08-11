---
name: full-codebase-audit-and-micro-completion
description: >
  Audit an entire codebase systematically, inspect every relevant source file, and
  identify bugs, incomplete implementations, security risks, performance issues,
  duplication, and maintainability problems. Safely complete and optimize small
  self-contained code blocks when intent is unambiguous, then verify with the repo's
  own checks. Use when asked to audit, review, improve, optimize, complete, refactor,
  harden, or productionize a repository or a large slice of it (e.g. "audit the whole
  codebase", "find bugs across the repo", "make this production-ready", "finish the
  half-written code"). Do NOT use for a single-file edit, one bug fix, or a scoped
  feature — use tdd-workflow, react-doctor, or security-auditor instead.
metadata:
  author: zyene-reviews
  version: "1.0.0"
  argument-hint: <optional scope, e.g. src/services/google or "billing + webhooks">
---

# Full Codebase Audit and Micro-Completion (Zyene Reviews)

## Mission

Perform a repository-level audit. Do **not** review only the files currently open,
recently changed, or named in the prompt — unless the user explicitly scoped it.

1. Discover the codebase and its architecture.
2. Inspect all in-scope source files systematically.
3. Find correctness, security, performance, design, quality, and testing gaps.
4. Complete small, obviously incomplete code blocks when safe.
5. Optimize only when the benefit is measurable or clearly reduces complexity,
   duplication, risk, or resource usage.
6. Verify every modification with this repo's checks.
7. Produce an actionable report — even when no changes are made.

## Related skills

Delegate depth rather than duplicating it:

| Concern | Skill |
|---------|-------|
| Naming, folder structure, dead code, file size | **codebase-standards-auditor** |
| Auth, RLS, payments, webhooks, secrets | **security-auditor** / **security-audit** |
| React/UI quality regressions | **react-doctor**, **react-patterns** |
| Marketing metadata, JSON-LD, sitemap | **seo**, **on-page-seo-auditor** |
| Missing tests for a fixed defect | **tdd-workflow** |

## Non-negotiable rules

- Never claim the codebase was reviewed unless every in-scope file was inventoried and
  either inspected or excluded **with a stated reason**.
- Never make a behavior-changing assumption solely to fill in missing code.
- Do not rewrite large modules for style alone.
- Do not change public APIs, database schemas, RLS policies, auth flows, Stripe/billing
  logic, Inngest job contracts, cron routes, or deployment config without explicit
  approval. These are **Escalate**, never Auto-fix.
- Never expose, log, commit, or reproduce secrets, tokens, credentials, or PII. If you
  find one in source, report its location — never quote the value.
- Preserve existing project conventions ([AGENTS.md](../../../AGENTS.md)) unless
  demonstrably harmful.
- Prefer minimal, reversible diffs.
- Out of scope unless the user asks or a defect points there: `node_modules/`,
  `.next/`, `src/types/database.types.ts` (generated), `src/components/ui/` (vendored
  shadcn), lockfiles, build output, caches, binaries, applied migrations under
  `supabase/migrations/`.
- Do not mark an issue fixed until verification ran successfully.

## Phase 1 — Discover

Read first, in this order:

1. [AGENTS.md](../../../AGENTS.md) (master standards), [CLAUDE.md](../../../CLAUDE.md),
   `.claude/rules/`, `.cursor/rules/`.
2. `package.json` scripts, `tsconfig.json`, `eslint.config.*`, `next.config.ts`,
   `vitest.config.*`, `playwright.config.*`, `.github/workflows/`, `.env.example`.
3. `scripts/check-file-sizes.mjs`, `scripts/check-color-guards.mjs`,
   `scripts/check-migrations.mjs` — these encode enforced invariants.

Then build a repository map. For this repo the standing shape is:

| Area | Path | Trust boundary |
|------|------|----------------|
| Marketing (SEO-critical) | `src/app/(marketing)/` | Public, unauthenticated |
| Dashboard | `src/app/(dashboard)/` | Authenticated, business-scoped |
| API routes | `src/app/api/` | Zod-validated; server secrets |
| Server actions | `src/app/actions/` | Authenticated; often skips route-level guards |
| Review capture | `src/app/r/[slug]/` | **Public, unauthenticated writes** |
| Widget | `src/app/w/[slug]/` | Public, embeddable, CORS surface |
| Cron | `src/app/api/cron/` | `CRON_SECRET` required |
| Webhooks | Stripe / provider routes | Signature verification required |
| Services | `src/services/` | External API adapters (Google, etc.) |
| Domain logic | `src/lib/`, `src/core/`, `src/domains/` | — |
| Jobs | `src/lib/inngest/` | Retries, idempotency |
| DB | `supabase/migrations/` | RLS per table |
| Tests | `tests/{unit,integration,visual}` | — |

Confirm this map against the actual tree — do not assume it is still current.

Categorize every file: production source · tests · config · migrations ·
scripts/tooling · docs · generated/vendor/excluded.

Create an audit checklist containing every in-scope file and work through it. Do not
skip a file because it looks small. Use a TODO list for the checklist when the scope
exceeds ~30 files, so coverage is visible and resumable.

## Phase 2 — Baseline

Run before changing anything, and record results verbatim:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm check:sizes && pnpm check:migrations && pnpm check:colors
```

`pnpm build` is slow — run it once in Phase 7 rather than in the baseline, unless the
audit touches `next.config.ts`, route config, or bundling.

Record: commands run · pass/fail · **failures that existed before your changes** ·
checks you could not run and why (missing env vars, no network, etc.).

Never hide or silently inherit a pre-existing failure.

## Phase 3 — Audit every in-scope file

Inspect each file in context: imports, callers, tests, data flow, error handling, and
external side effects. Full dimension checklist:
[references/audit-dimensions.md](references/audit-dimensions.md).

Repo-specific hotspots and the greps that surface them:
[references/zyene-hotspots.md](references/zyene-hotspots.md).

Summary of dimensions — correctness · security & privacy · performance & reliability ·
architecture & maintainability · tests & observability.

## Phase 4 — Micro-completion protocol

Complete a code block automatically only when **all** of these hold:

1. The missing behavior is unambiguous from its signature, callers, tests, neighboring
   patterns, comments, or a written spec.
2. The change is small and self-contained — normally ≤ 10 lines.
3. It does not change public behavior beyond completing the evident intent.
4. It does not touch security-sensitive, financial, authorization, migration, or
   irreversible operations.
5. A focused verification method exists or can be added.

Safe examples: returning a clearly implied value in an otherwise complete helper · an
obvious null/empty guard matching neighboring code · finishing a small mapping, parser
branch, or validation rule with caller and test evidence · removing a proven redundant
operation · replacing a duplicated expression with an existing project helper.

For each micro-completion: state the evidence for intended behavior, make the smallest
change, add or update a focused test when the behavior is not already covered, run the
relevant checks immediately, and list it in the final report.

If intent is ambiguous — even slightly — it is a **Recommend**, not an Auto-fix.

## Phase 5 — Optimization protocol

Optimize only for a concrete benefit: simpler control flow · less duplicated logic ·
fewer network/DB/disk/render operations · bounded concurrency and timeouts · correct
memoization with explicit invalidation · lower algorithmic complexity where data size
justifies it.

Never optimize on speculation. With no benchmark, describe the expected benefit and
label it an **estimate**. Never trade correctness, clarity, observability, or
testability for a micro-optimization.

## Phase 6 — Change safety levels

Classify every proposed fix:

- **Auto-fix** — small, unambiguous, low-risk, with targeted verification.
- **Recommend** — clear issue, but needs product/domain confirmation or design work.
- **Escalate** — security-sensitive, data-destructive, financial, auth-related,
  migration-related, API-breaking, or high blast radius.

Apply **only Auto-fix** items unless the user explicitly authorizes more.

## Phase 7 — Verify

After each batch, run the narrowest relevant check first (e.g.
`pnpm vitest run tests/unit/<file>.test.ts`). Before finishing, run the full gate:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm check:sizes && pnpm build
```

If React/UI changed:

```bash
npx react-doctor@latest --verbose --diff
```

If marketing pages changed, run the **seo** skill. If a command cannot run, state
exactly why and what remains unverified.

## Final report

Use [references/report-template.md](references/report-template.md). Produce it even when
no changes were made. Ranked most-severe first; every finding needs file:line, impact,
evidence, recommended fix, and classification.

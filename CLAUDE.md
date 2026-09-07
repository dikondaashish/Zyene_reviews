# Claude Code — Zyene Reviews

**Read [AGENTS.md](./AGENTS.md) first.** It is the master guide for this repository (standards, SEO, skills, never-do list).

## Project (one paragraph)

Zyene Reviews is a multi-tenant Next.js reputation SaaS: sync/respond to reviews (Google, Yelp, Facebook), run SMS/email campaigns, private negative-feedback flows, competitor/AEO tooling, and Stripe billing — backed by Supabase RLS, Inngest, Upstash, Twilio, and Resend.

## Knowledge base (read before large changes)

| Doc | Use when |
|-----|----------|
| [docs/README.md](./docs/README.md) | Hub: setup, stack, doc map |
| [codebase-analysis-docs/CODEBASE_KNOWLEDGE.md](./codebase-analysis-docs/CODEBASE_KNOWLEDGE.md) | System map, flows, gotchas, doc TODOs |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Subsystems and diagrams |
| [docs/API.md](./docs/API.md) | HTTP endpoints |
| [docs/DATA_MODELS.md](./docs/DATA_MODELS.md) | Entities and relationships |
| [docs/PUBLIC_API.md](./docs/PUBLIC_API.md) | Internal modules to reuse |
| [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md) | Sessions, tenancy, API keys |
| [docs/CONFIGURATION.md](./docs/CONFIGURATION.md) | Env vars and config loading |
| [docs/CODING_CONVENTIONS.md](./docs/CODING_CONVENTIONS.md) | Naming, layering, tests |

Also: root [README.md](./README.md) (human onboarding), [docs/INDEX.md](./docs/INDEX.md) (full doc inventory including growth/GEO).

## Instructions for AI agents

1. **Follow** [docs/CODING_CONVENTIONS.md](./docs/CODING_CONVENTIONS.md) and [AGENTS.md](./AGENTS.md).
2. **Use** architecture principles from [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — modular monolith, `lib` vs `services`, no new deployables without need.
3. **Consult** [CODEBASE_KNOWLEDGE.md](./codebase-analysis-docs/CODEBASE_KNOWLEDGE.md) before large refactors or cross-cutting changes.
4. **Prefer existing patterns** (Zod boundaries, `getUser()`, `getActiveBusinessId()`, `sendOutboundReviewRequest`, Inngest events) over introducing new frameworks.
5. **Keep docs in sync** (or flag in the PR) when touching APIs, auth, schema, or env — see `.cursor/rules/documentation.mdc`.
6. **Default verify:** `pnpm verify:fast` + targeted Vitest; avoid full `pnpm build` unless routes/config/APIs warrant it.

## Claude-specific paths

| Resource | Location |
|----------|----------|
| Project rules | This file + [AGENTS.md](./AGENTS.md) |
| Extra rules | [.claude/rules/](./.claude/rules/) |
| Skills | [.claude/skills/](./.claude/skills/) → synced from `.agents/skills/` |

## Before you finish

Follow **[AGENTS.md §4](./AGENTS.md#4-before-finishing-any-task)**. Default:

```bash
pnpm verify:fast
pnpm exec vitest run tests/unit/<touched-file>.test.ts
```

Do **not** run `pnpm build` or the full `pnpm test` suite unless the change can break compile/CI (routes, `next.config`, APIs, shared lib) or the user asked for a full check. GitHub CI already builds. React-doctor only when component structure/hooks changed.

## Skills

Invoke skills from `.claude/skills/<name>/SKILL.md` (run `pnpm run skills:sync` after adding skills under `.agents/skills/`).

Priority: **react-doctor**, **security-auditor**, **on-page-seo-auditor**, **seo**, **react-patterns**, **senior-fullstack**, **tdd-workflow**.

Full list: [AGENTS.md §5](./AGENTS.md#5-available-skills).

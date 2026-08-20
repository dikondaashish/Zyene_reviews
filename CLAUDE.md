# Claude Code — Zyene Reviews

**Read [AGENTS.md](./AGENTS.md) first.** It is the master guide for this repository (standards, SEO, skills, never-do list).

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

# Zyene Reviews — Antigravity workspace rules

@AGENTS.md

---

## Always-on checklist (Antigravity agent)

Before marking any implementation task **done**, follow **[AGENTS.md §4](./AGENTS.md#4-before-finishing-any-task)**. Default:

```bash
pnpm verify:fast
pnpm exec vitest run tests/unit/<touched-file>.test.ts
```

Skip `pnpm build` and the full test suite unless routes, `next.config`, APIs, or shared lib changed. React-doctor only when component structure/hooks changed.

## Skills location

Load skills from **`.agents/skills/<skill-name>/SKILL.md`** (synced for Antigravity via `pnpm run skills:sync`).

**High-priority skills:** `on-page-seo-auditor`, `schema-markup-generator`, `technical-seo-checker`, `seo`, `security-auditor`, `react-patterns`, `react-doctor`, `senior-fullstack`, `vercel-react-best-practices`, `vercel-optimize`.

## Repo map (quick)

| Area | Path |
|------|------|
| Marketing / SEO | `src/app/(marketing)/` |
| Dashboard | `src/app/(dashboard)/` |
| API | `src/app/api/` |
| Review capture | `src/app/r/[slug]/` |
| SEO helpers | `src/components/seo/` |
| Sitemap / robots | `src/app/sitemap.ts`, `src/app/robots.ts` |

## Never do (hard stops)

- Edit auto-generated `database.types.ts`
- Change shadcn files under `src/components/ui/` (regenerate via CLI)
- Put secrets in migrations; edit already-applied migrations
- `console.log` in `"use client"` files
- Exceed file line limits (pages/API 100, components 150, lib 200)
- Append `| Zyene Reviews` in page titles (root layout template handles branding)
- Use `getSession()` alone for authorization — use `getUser()`
- Create Supabase tables without RLS policies

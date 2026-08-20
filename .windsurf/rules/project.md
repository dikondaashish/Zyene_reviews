# Zyene Reviews — Windsurf project rules

> **Master source:** [AGENTS.md](../../AGENTS.md). These rules are always on for this workspace.

## 1. Project overview

**Zyene Reviews** — multi-tenant SaaS reputation management for local businesses and agencies.

**Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 4, shadcn/ui, Supabase + RLS, Stripe, Resend, Inngest, Vercel, Upstash Redis.

**Domains:** `zyenereviews.com` (marketing, app dashboard, API) · `collectratings.com` (review capture `/r/[slug]`).

**Paths:** `src/app/(marketing)/`, `(dashboard)/`, `api/`, `r/[slug]`, `w/[slug]`. Business context: `getActiveBusinessId()` in `src/lib/auth/business-context.ts`.

## 2. Code standards

| File type | Max lines |
|-----------|-----------|
| Pages (`page.tsx`, `layout.tsx`) | 100 |
| API routes | 100 |
| Components | 150 |
| Services / lib | 200 |

- `@/` imports only · no `any` · RSC default · no client `console.log`
- Server: Pino logger · `getUser()` not `getSession()` · Zod on all API inputs · try/catch on async server code
- New Supabase tables: **always RLS** · never expose `STRIPE_SECRET_KEY` to client
- Thin `page.tsx`: metadata + re-export view only

## 3. SEO (marketing)

See also `.cursor/rules/seo.mdc`.

- Unique title ≤60, description ≤160 — never manual `| Zyene Reviews`
- `generateMetadata()` for dynamic routes · OG + Twitter on marketing pages
- One `<h1>` · h1→h2→h3 · semantic landmarks · `next/image` + alt
- New URLs in `src/app/sitemap.ts` · not blocked in `robots.ts` unless intentional
- JSON-LD: `@/components/seo/json-ld`

## 4. Before finishing any task

Follow **[AGENTS.md §4](../../AGENTS.md#4-before-finishing-any-task)**. Default: `pnpm verify:fast` plus only the Vitest file for the change. Skip `pnpm build` and the full test suite unless routes, `next.config`, APIs, or shared lib changed. React-doctor only when component structure/hooks changed. Marketing: **seo** or **on-page-seo-auditor**.

## 5. Skills

Canonical copies: `.agents/skills/<name>/SKILL.md` (this repo syncs to `.windsurf/skills/`).

**Use proactively:** on-page-seo-auditor, schema-markup-generator, technical-seo-checker, seo, security-auditor, react-patterns, tdd-workflow, senior-fullstack, react-doctor.

Full catalog: [AGENTS.md §5](../../AGENTS.md#5-available-skills).

## 6. Never do

- Edit `database.types.ts` · modify `src/components/ui/` primitives
- Secrets in SQL migrations · edit applied migrations
- Client `console.log` · exceed line limits · duplicate `| Zyene Reviews` in titles
- `getSession()` for auth · `any` or missing Zod on APIs · tables without RLS

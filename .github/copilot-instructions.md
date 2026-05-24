# Zyene Reviews — GitHub Copilot instructions

> **Master source:** [AGENTS.md](../AGENTS.md). Prefer that file for full skill lists and detail.

## Project

Multi-tenant **review management SaaS** (local businesses): Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, shadcn/ui, Supabase (RLS), Stripe, Resend, Inngest, Vercel.

- **zyenereviews.com** — marketing, dashboard (`app.`), API
- **collectratings.com** — public review capture (`src/app/r/[slug]/`)

Routes: `(marketing)/`, `(dashboard)/`, `api/`, `r/[slug]`, `w/[slug]`. Active business: `getActiveBusinessId()` in `src/lib/auth/business-context.ts`.

## Code standards (non-negotiable)

| File type | Max lines |
|-----------|-----------|
| `page.tsx` / `layout.tsx` | 100 |
| API `route.ts` | 100 |
| Components | 150 |
| `services/` / `lib/` | 200 |

- **`@/`** imports only · **no `any`** · strict TypeScript
- **RSC by default** · `"use client"` only when needed
- **Pino** on server · **no `console.log`** in client code
- **`getUser()`** for auth — not `getSession()` alone
- **Zod** on all API inputs · **try/catch** on async server code
- **RLS** on every new Supabase table
- Never expose **`STRIPE_SECRET_KEY`** or secrets to the client

## SEO (marketing pages)

- Unique title ≤60 chars, description ≤160 — **do not** append `| Zyene Reviews` (root `title.template` does)
- `generateMetadata()` for dynamic routes · OG + Twitter on all marketing pages
- One `<h1>` · semantic heading order · `next/image` + `alt` · add URL to `src/app/sitemap.ts`
- JSON-LD via `@/components/seo/json-ld` on key pages

## Before finishing

```bash
pnpm typecheck && pnpm test && pnpm build
```

Also: `npx react-doctor@latest --verbose --diff` on React changes; respect file line limits; no secrets in code.

## Priority skills (`.agents/skills/<name>/SKILL.md`)

| Skill | Use when |
|-------|----------|
| on-page-seo-auditor | Marketing pages |
| schema-markup-generator | JSON-LD / new page types |
| technical-seo-checker | sitemap / robots |
| security-auditor | Auth, Stripe, RLS, API |
| react-patterns | New components |
| react-doctor | Before commit (React/UI) |
| seo | Pre-commit SEO audit |

## Never do

- Edit `database.types.ts` (generated)
- Modify `src/components/ui/` shadcn primitives
- Secrets in migrations · edit applied migrations
- `console.log` in client · files over line limits
- `getSession()` for auth · tables without RLS

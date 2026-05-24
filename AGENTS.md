# AGENTS.md — Zyene Reviews

**Read this file first.** It is the single source of truth for every AI agent (Cursor, Claude Code, Copilot, etc.) and for engineers onboarding to this repository.

For human onboarding detail, see [README.md](./README.md). For Next.js version-specific docs, see [.agent/docs/AGENTS.md](./.agent/docs/AGENTS.md). For always-on Cursor rules, see [.cursor/rules/](.cursor/rules/).

---

## 1. Project overview

**Zyene Reviews** is a multi-tenant **SaaS reputation management platform** for local businesses and agencies. Customers connect review platforms, sync and respond to reviews, run SMS/email campaigns, route negative feedback privately, track competitors, and manage billing in one product.

### Tech stack

| Layer | Technology |
|-------|------------|
| App | **Next.js 16** (App Router), **React 19**, **TypeScript** (strict) |
| UI | **Tailwind CSS 4**, **shadcn/ui** |
| Data & auth | **Supabase** (Postgres + Auth + RLS) |
| Jobs | **Inngest** |
| Billing | **Stripe** |
| Email | **Resend** |
| Cache / limits | **Upstash Redis** |
| Deploy | **Vercel** |

### Domains

| Domain | Purpose |
|--------|---------|
| **zyenereviews.com** | Marketing site, docs, auth, dashboard (`app.zyenereviews.com`) |
| **collectratings.com** | Public review capture flows (`/r/[slug]`) |

### Key route groups

| Surface | Path | Notes |
|---------|------|--------|
| Marketing | `src/app/(marketing)/` | SEO-critical; metadata + sitemap required |
| Dashboard | `src/app/(dashboard)/` | Authenticated; business-scoped via cookie |
| API | `src/app/api/` | Zod-validated inputs; server-only secrets |
| Review capture | `src/app/r/[slug]/` | collectratings.com |
| Widget | `src/app/w/[slug]/` | Embeddable carousel/badge |

Active business context: `getActiveBusinessId()` in `src/lib/auth/business-context.ts`.

---

## 2. Code standards (non-negotiable)

### File size limits

Split files before exceeding limits. `page.tsx` / route files should only export metadata, params, and a thin default export.

| File type | Max lines |
|-----------|-----------|
| Page files (`page.tsx`, `layout.tsx` in `app/`) | **100** |
| API routes (`src/app/api/**/route.ts`) | **100** |
| Components (`src/components/**`) | **150** |
| Services / lib (`src/services/**`, `src/lib/**`) | **200** |

### Imports & types

- Use **`@/`** path aliases only (no deep relative `../../../`).
- **TypeScript strict** — no `any`, no `@ts-ignore` without a one-line justification.
- Prefer shared types in `src/types/` over inline duplicates.

### Server vs client

- Default to **React Server Components**; add `"use client"` only for interactivity or browser APIs.
- **Pino** logger on the server only — **zero `console.log`** in client components or client hooks.
- Never expose **`STRIPE_SECRET_KEY`** or other server secrets to the client. Use `NEXT_PUBLIC_*` only for truly public values.

### Auth & database

- Use **`supabase.auth.getUser()`** — never trust **`getSession()`** alone for authorization.
- **Zod** validation on **all** API route inputs (body, query, params).
- Wrap async server logic in **try/catch**; return structured API errors, do not leak stack traces.
- **Always add RLS policies** when creating new Supabase tables. Test tenant isolation.

### API patterns

- Business-scoped data must filter by `business_id` / org context from server-side resolution.
- Stripe webhooks and cron routes: verify signatures / `CRON_SECRET` as existing routes do.

---

## 3. SEO standards (every new marketing page)

Full rules: **`.cursor/rules/seo.mdc`** (always applied). Summary:

| Requirement | Rule |
|-------------|------|
| Title | Unique, ≤ **60** characters (segment only — root layout adds `\| Zyene Reviews` via `title.template`) |
| Description | Unique, ≤ **160** characters |
| Dynamic routes | `generateMetadata()` with awaited `params` (Next.js 15+) |
| Marketing OG | `openGraph.title`, `openGraph.description`, `openGraph.images` on every marketing page |
| Twitter | `twitter.card` (+ title/description) on every marketing page |
| Headings | Exactly **one** `<h1>`; semantic `h1` → `h2` → `h3` (no skipped levels) |
| HTML | Use `<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>` |
| Images | **`next/image`** only — never `<img>`; always `alt`; `width`/`height` or `fill`; `priority` only above-the-fold |
| Links | Internal: **`next/link`**; external `target="_blank"`: `rel="noopener noreferrer"` |
| Sitemap | Add new marketing URLs to **`src/app/sitemap.ts`** |
| Robots | Do not block public marketing paths in **`src/app/robots.ts`** |
| JSON-LD | Key pages: Organization (home), Article (blog), Product/Offer (pricing), LocalBusiness (review surfaces). Use **`@/components/seo/json-ld`** helpers |

Run the **`seo`** skill before committing marketing changes (see §5).

---

## 4. Before finishing any task

Do **not** mark work complete until all applicable checks pass:

```bash
pnpm typecheck   # must pass
pnpm test        # must pass
pnpm build       # must pass
```

Additional gates:

| Check | How |
|-------|-----|
| React quality | `npx react-doctor@latest --verbose --diff` on changed files (see **react-doctor** skill) |
| File sizes | No file over limits in §2 |
| Client logging | No new `console.log` in `"use client"` files |
| Secrets | No API keys, tokens, or passwords in code, migrations, or commits |
| Marketing SEO | Run **seo** or **on-page-seo-auditor** when touching `(marketing)/` |

If a check fails, fix it before reporting done.

---

## 5. Available skills

Skills live in **`.agents/skills/<name>/SKILL.md`**. Invoke by name when the task matches.

### Priority skills (use proactively)

| Skill | When to use |
|-------|-------------|
| **on-page-seo-auditor** | Creating or editing marketing pages |
| **schema-markup-generator** | New page types or JSON-LD / rich results |
| **technical-seo-checker** | `sitemap.ts`, `robots.ts`, crawl/index/speed issues |
| **seo** | Pre-commit SEO audit (metadata, h1, images, sitemap) |
| **security-auditor** | Auth, payments, RLS, API routes, webhooks |
| **react-patterns** | New React components and hooks |
| **tdd-workflow** | New features (tests first) |
| **senior-fullstack** | Architecture, refactors, cross-cutting design |
| **react-doctor** | Before every commit touching React/UI |

### SEO, content & growth

| Skill | When to use |
|-------|-------------|
| **geo-content-optimizer** | AI citation / GEO / quotable content |
| **seo-content-writer** | New SEO articles and landing copy |
| **content-quality-auditor** | EEAT / helpful content scoring |
| **content-refresher** | Updating declining or outdated pages |
| **keyword-research** | Topic discovery, clusters, content calendar |
| **competitor-analysis** | Competitive SEO / positioning |
| **content-gap-analysis** | Topics competitors cover that we do not |
| **meta-tags-optimizer** | Title/description/OG/Twitter CTR |
| **internal-linking-optimizer** | Site architecture and orphan pages |
| **backlink-analyzer** | Off-page / link profile |
| **domain-authority-auditor** | Domain trust / CITE audit |
| **entity-optimizer** | Knowledge graph / brand entity |
| **rank-tracker** | Keyword position tracking |
| **alert-manager** | SEO ranking/traffic alerts |
| **performance-reporter** | Stakeholder SEO reports |

### Engineering & quality

| Skill | When to use |
|-------|-------------|
| **security-audit** | Broader penetration / app security review |
| **tdd-workflow** | Test-driven feature development |
| **memory-management** | Persist SEO/campaign context across sessions |

### Vercel (official)

| Skill | When to use |
|-------|-------------|
| **vercel-react-best-practices** | React/Next.js performance |
| **vercel-composition-patterns** | Compound components, fewer boolean props |
| **vercel-react-view-transitions** | Page/route view transitions |
| **vercel-optimize** | Production cost & performance on Vercel |
| **web-design-guidelines** | UI/a11y/UX best practices |
| **deploy-to-vercel** | Claimable preview deploy |
| **vercel-cli-with-tokens** | CLI with scoped tokens |

### Other

| Skill | When to use |
|-------|-------------|
| **vercel-react-native-skills** | React Native / Expo (if applicable) |
| **legal-advisor** | Privacy policy, terms, compliance copy |
| **react-doctor** | Lint, a11y, bundle, architecture score |

Refresh Vercel skills: `pnpm run skills:vercel`. Cursor rules index: `.cursor/rules/awesome-cursorrules.md`.

---

## 6. What never to do

| Never | Why |
|-------|-----|
| Edit **`database.types.ts`** | Auto-generated from Supabase |
| Modify **`src/components/ui/`** shadcn primitives | Regenerate via CLI instead |
| Put secrets in **SQL migrations** | Migrations are versioned in git |
| Edit **already-applied** migrations | Create a new migration instead |
| Add **`console.log`** to client components | Use server Pino or remove before commit |
| Create files **over line limits** | Split into focused modules |
| Append **`\| Zyene Reviews`** in page titles | Root `layout.tsx` `title.template` handles it |
| Use **`getSession()`** for auth decisions | Spoofable; use `getUser()` |
| Ship **`any`** or skip Zod on API inputs | Breaks type safety and validation |
| Add Supabase tables **without RLS** | Tenant data leak risk |

---

## Quick reference

```bash
pnpm dev              # local dev
pnpm typecheck        # TypeScript
pnpm test             # Vitest
pnpm build            # production build
pnpm lint             # ESLint
pnpm cursorrules:install   # refresh .cursor/rules from awesome-cursorrules
pnpm skills:vercel         # refresh Vercel agent skills
```

**Production:** Vercel project `zyene-reviews` · **DB:** Supabase · **Docs:** `docs/` and `README.md`

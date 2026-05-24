# Project standards (Claude Code)

Applies to all work in this repository. Full detail: [AGENTS.md](../../AGENTS.md).

## Code

- Pages/API max **100** lines · components **150** · lib/services **200**
- `@/` imports · TypeScript strict · no `any`
- RSC default · no `console.log` in client · Pino on server
- `getUser()` not `getSession()` · Zod on API inputs · try/catch on server async
- RLS required for new Supabase tables · no client-side Stripe secrets

## SEO (marketing)

- Title ≤60, description ≤160 · no manual `| Zyene Reviews`
- OG + Twitter on marketing pages · one `<h1>` · `next/image` + alt
- Update `sitemap.ts` · JSON-LD via `@/components/seo/json-ld`

## Never

- `database.types.ts` · `src/components/ui/` edits · secrets in migrations
- Applied migration edits · client `console.log` · auth via `getSession()` only

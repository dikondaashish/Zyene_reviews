# Awesome Cursor Rules (curated for Zyene Reviews)

**Master AI guide:** [AGENTS.md](../../AGENTS.md) · **All IDEs:** see [README § AI-assisted development](../../README.md#ai-assisted-development-all-ides).

Rules sourced from [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) (CC0-1.0). Re-run `node scripts/install-awesome-cursorrules.mjs` to refresh from upstream.

| Local file | Purpose |
|------------|---------|
| `anti-overengineering.mdc` | Keep diffs small and scoped to the request |
| `nextjs15-supabase-security.mdc` | Supabase auth (`getUser` not `getSession`), async params, RLS, Stripe server-only |
| `nextjs15-react-tailwind.mdc` | Next.js 15 App Router, React 19, Tailwind patterns |
| `shadcn-ui-nextjs.mdc` | shadcn/ui + Next.js component conventions |
| `tanstack-query-v5.mdc` | TanStack Query v5, server prefetch, mutations |
| `vercel-deployment.mdc` | Vercel deploy, edge, middleware, cron |
| `vitest-testing.mdc` | Vitest unit test patterns |
| `playwright-e2e.mdc` | Playwright E2E patterns |

Project-specific rules (not from awesome-cursorrules):

- `auto-push-github.mdc` — commit and push after implementation tasks
- `seo.mdc` — metadata, JSON-LD, images, Core Web Vitals, sitemap/robots (always apply on app/pages)

## Cursor skills

| Location | Source | Refresh |
|----------|--------|---------|
| `.cursor/skills/ui-ux-pro-max/` | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `uipro init --ai cursor` |
| `.agents/skills/*` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `pnpm run skills:vercel` |

**Vercel agent skills** (MIT, locked in `skills-lock.json`):

| Skill | Use when |
|-------|----------|
| `vercel-optimize` | Cost/performance audit of a deployed Vercel project |
| `vercel-react-best-practices` | React/Next.js performance (40+ rules) |
| `web-design-guidelines` | UI/accessibility/UX review (100+ rules) |
| `vercel-composition-patterns` | Compound components, fewer boolean props |
| `vercel-react-view-transitions` | View Transition API, Next.js route animations |
| `vercel-react-native-skills` | React Native / Expo |
| `deploy-to-vercel` | Claimable preview deploy from the agent |
| `vercel-cli-with-tokens` | Vercel CLI with scoped tokens |

Also in `.agents/skills/`:

| Skill | Use when |
|-------|----------|
| `seo` | SEO audit before commit; metadata, JSON-LD, sitemap checks |
| `react-doctor` | React lint, a11y, bundle diagnostics |

Browse 150+ more **rules** in the awesome-cursorrules upstream README.

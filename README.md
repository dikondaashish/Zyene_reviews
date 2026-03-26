# Zyene Reviews

Reputation management SaaS for local businesses. The app supports Google/Yelp/Facebook integrations, review syncing, requests/campaigns, analytics, and team/billing workflows.

## Tech stack

- Next.js App Router + TypeScript
- Supabase (Auth + Postgres)
- Stripe (billing)
- Upstash Redis (rate limiting/cache)
- Inngest (async jobs)
- Sentry (observability)

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy env template and fill values:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
pnpm dev
```

## Scripts

- `pnpm dev` — start local app
- `pnpm build` — production build
- `pnpm start` — run built app
- `pnpm lint` — eslint
- `pnpm typecheck` — TypeScript typecheck
- `pnpm test` — run Vitest tests

## Notes

- This repo is pnpm-managed (single lockfile: `pnpm-lock.yaml`).
- Supabase schema changes are tracked in `supabase/migrations`.
- Operational docs are being organized incrementally under `docs/` (in progress).

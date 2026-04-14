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

## Required environment variables

Core variables used by this project (non-exhaustive):

- `NEXT_PUBLIC_ROOT_DOMAIN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

See `.env.example` and route/service files under `src/app/api` and `src/services` for the complete runtime set.

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
- Documentation map: `docs/INDEX.md`.

## Folder structure (current baseline)

- `src/app` - Next.js pages, layouts, API routes, and server actions.
- `src/components` - UI and feature-facing React components.
- `src/components/ui` - Reusable design-system primitives.
- `src/hooks` - Custom React hooks.
- `src/lib` - Shared utilities, providers, and third-party client setup.
- `src/services` - Service-layer integrations (Google, Stripe, Twilio, etc.).
- `src/types` - Shared TypeScript interfaces and domain typing helpers.
- `src/constants` - Global constants and configuration maps.
- `src/stores` - Global state containers.
- `docs` - Technical docs, audits, and implementation notes.

# Zyene Reviews — Copilot Project Instructions (Current)

## Product Context
Zyene Reviews is a multi-tenant SaaS for local businesses and agencies to:
- Connect review platforms (Google, Yelp, Facebook)
- Sync and manage public reviews
- Capture private feedback from low-star flows
- Run campaign/request workflows (SMS/email/link)
- Track analytics, competitor metrics, and business profile health

## Current Tech Stack
- **Framework:** Next.js 16 App Router + React 19 + TypeScript
- **UI:** Tailwind + shadcn/ui
- **DB/Auth:** Supabase (RLS + SSR auth)
- **Async jobs:** Inngest + cron API routes
- **Integrations:** Google Business Profile APIs, Yelp Fusion, Facebook Graph
- **Billing:** Stripe subscriptions + webhooks
- **Messaging/Email:** Twilio + Resend
- **Rate limiting/cache:** Upstash Redis + `@upstash/ratelimit`
- **Observability:** Sentry
- **Testing:** Vitest (`tests/unit`)

## Canonical Project Structure (As Of Today)
```text
src/
  app/
    (auth)/
    (dashboard)/
    (marketing)/
    onboarding/
    r/[slug]/
    w/[slug]/
    actions/
    api/
  components/
    ui/
    analytics/
    auth/
    businesses/
    campaigns/
    customers/
    dashboard/
    integrations/
    onboarding/
    providers/
    public/
    questions/
    reviews/
    settings/
    tours/
    widgets/
  services/
    ai/
    facebook/
    google/
    inngest/
    resend/
    stripe/
    twilio/
    yelp/
  lib/
    api/
    auth/
    campaigns/
    db/
      supabase/
    notifications/
    qr/
    state/
    stripe/
    tours/
    utils/
    validation/
  hooks/
  constants/
  types/
  proxy.ts
```

## Key API Route Domains (Current)
`src/app/api` contains route handlers grouped by domain:
- `_shared` — reusable auth/error/response contracts
- `ai` — analyze/suggest endpoints
- `auth` — callback
- `billing` — checkout/portal
- `businesses` — business update/delete/slug/QR
- `campaigns` — CRUD + async send
- `cron` — daily digest/follow-up/google performance/sync
- `customers` — CRUD/import/bulk
- `google` — listing/account access/lodging/place actions/qa/location selector
- `inngest` — event handler
- `integrations` — API key + OAuth confirm/callback/connect
- `requests` — send/export
- `review-flow` — public review text generation
- `reviews` — list/update/reply/export/private/bulk
- `settings` — notification settings
- `sync` — manual platform sync
- `team` — invite/role/remove
- `track` — review request tracking updates
- `users` — user profile
- `webhooks` — Stripe/Twilio/Google GBP webhooks

## Multi-Tenant Rules (Must Follow)
- Scope all business data by `business_id`.
- Scope org-level operations by `organization_id`.
- Never query mutable business data without ownership checks.
- Prefer helper guards like `userCanAccessBusiness(...)` where available.
- Never rely on “first business” style selection for writes.

## Security Rules (Non-Negotiable)
- Never trust client-supplied `business_id` for privileged writes when it can be derived server-side.
- Validate all mutating payloads with `zod`.
- Avoid mass-assignment: whitelist updatable fields.
- Use webhook signature/secret verification:
  - Stripe: `stripe-signature`
  - Twilio: `x-twilio-signature`
  - Google GBP webhook shared secret header
- Keep public endpoints minimal and tightly validated.
- Fail closed for missing critical webhook secrets in production.

## Service Layer Rules
- External provider calls belong in `src/services/*`, not in UI components.
- `src/lib/*` is for internal orchestration/helpers (auth context, DB wrappers, notifications, utilities).
- Do not introduce new provider code under `src/lib` going forward.

## Supabase Access Rules
- Use `src/lib/db/supabase/server.ts` in server contexts requiring user session.
- Use `src/lib/db/supabase/client.ts` only in browser/client components.
- Use `src/lib/db/supabase/admin.ts` only in trusted server contexts (cron, webhooks, backend jobs).
- Respect RLS for user-scoped flows; admin client should be rare and justified.

## Auth + Proxy Rules
- Request interception logic now lives in `src/proxy.ts` (not `src/middleware.ts`).
- Keep auth subdomain/app subdomain/root-domain routing behavior intact.
- Preserve CORS/preflight handling and allow-list headers needed by Next.js router prefetch.

## Billing Rules
- Stripe subscription state is source-of-truth from webhooks.
- Never manually “set plan active” from frontend-only events.
- Keep idempotency logic in webhook processing.

## Review Platform Rules
- Google/Yelp/Facebook sync flows use provider services + sync routes.
- Keep Google-specific features separated by phase modules (listing, performance, Q&A, lodging, etc.).
- Never expose provider tokens to client code.

## Campaign/Request Rules
- Bulk sends should remain async through Inngest.
- Respect opt-out lists and rate limits.
- Track request status transitions consistently.

## Testing Rules
- Unit tests live in `tests/unit`.
- Add/maintain tests when changing shared API helpers, error mappers, and critical route behavior.
- Keep tests green with:
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`

## Coding Standards
- TypeScript strictness: avoid `any`; prefer explicit interfaces/types.
- Use `async/await`, structured error handling, and consistent API responses.
- Reuse response wrappers in `app/api/_shared` where applicable.
- Keep components focused; split large files when responsibility is mixed.
- Prefer server components by default; use client components only for interactivity/browser APIs.

## Naming + Placement
- Components: `PascalCase.tsx`
- Hooks: `useSomething.ts`
- Service/internal modules: `kebab-case.ts` or established project style
- Route handlers: `route.ts` in domain folders
- Do not create new top-level root docs unless requested; keep runtime code first.

## Environment + Secrets
- Never hardcode secrets.
- Keep required keys in env files and platform env:
  - Supabase keys
  - Stripe keys + webhook secret
  - Twilio auth + webhook URL
  - Google OAuth + webhook secret
  - Redis + Inngest + Sentry keys as needed

## What Copilot Should Always Do
- Follow current folder boundaries (`services` vs `lib`).
- Preserve tenant isolation and ownership checks.
- Validate input before DB writes.
- Keep imports aligned to current structure (`@/services/*`, `@/lib/db/supabase/*`, `@/lib/auth/*`).
- Prefer minimal, safe changes over broad refactors unless asked.

## What Copilot Must Never Do
- Never bypass auth/ownership checks.
- Never call external APIs directly from React UI.
- Never store plaintext provider tokens.
- Never break webhook verification to “make it work”.
- Never ship unvalidated mutating endpoints.

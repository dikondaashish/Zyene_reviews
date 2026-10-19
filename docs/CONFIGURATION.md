# Configuration

Environment and runtime configuration for Zyene Reviews.

**Canonical annotated template:** [`.env.example`](../.env.example)  
**Typed accessors:** `src/config/env.ts`  
**Never commit:** `.env`, `.env.local`, service-account JSON, or secrets in migrations.

---

## 1. How configuration is loaded

1. Local: Next.js loads `.env.local` (and `.env`) into `process.env`.
2. Production: Vercel (or host) injects env vars per environment.
3. Application code should prefer imports from `@/config/env` for shared public/derived values.
4. Some modules still read `process.env` directly for optional/feature-specific keys — when adding new required vars, extend `.env.example` and document here.

`src/config/env.ts` exposes:

- Public: `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ROOT_DOMAIN`, `NEXT_PUBLIC_APP_NAME`
- Derived: `BASE_URL`, `IS_PRODUCTION`, marketing auth URL helpers
- Server helpers for secrets where centralized

Missing **required** vars accessed via `required()` throw at use/import time with a clear message.

---

## 2. Variable groups

### Supabase (required for app)

| Variable | Default | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | — | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | — | **Server only** — bypasses RLS |

### App domains

| Variable | Default | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_APP_URL` | derived | Canonical app origin |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `localhost:3000` | Cookie/domain routing |
| `NEXT_PUBLIC_APP_NAME` | `Zyene Reviews` | Display name |
| Review-flow domain vars | collectratings.com | See `.env.example` “Review flow” section |

### Google / GBP

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` / `SECRET` | OAuth |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client-side Google bits if needed |
| `GOOGLE_MAPS_API_KEY` | Places / free tools / website chat rating check (needs Places API (New): Autocomplete, Place Details, Nearby Search, Text Search) |
| `GOOGLE_PUBSUB_TOPIC_NAME` | Review notifications topic |
| `GOOGLE_PUBSUB_VERIFICATION_TOKEN` | Push URL `?token=` |
| `GOOGLE_GBP_WEBHOOK_SECRET` | Legacy GBP webhook |

### Stripe

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser |
| `STRIPE_WEBHOOK_SECRET` | Webhook verify |
| `STRIPE_*_PRICE_ID` | Plan prices |
| Coupon IDs | Optional new-customer promos |
| `AEO_METERED_BILLING_LIVE` | `true` turns on prepaid AEO balance: plan credit grants, per-test debits, the header balance pill, "Add balance" checkout, and pausing tests at $0. Anything else = off (tests are not counted) |

### Twilio / Resend

| Variable | Purpose |
|----------|---------|
| `TWILIO_ACCOUNT_SID`, `AUTH_TOKEN` | SMS credentials |
| `TWILIO_MESSAGING_SERVICE_SID` | Preferred SMS/RCS sender pool; supports SMS fallback |
| `TWILIO_PHONE_NUMBER` | Legacy SMS sender fallback |
| `RESEND_API_KEY`, `RESEND_FROM` | Product email |
| `SUPPORT_CHAT_LEAD_INBOX` | Optional. Inbox for website chat leads (default `zyene.inc@gmail.com`) |
| `SUPPORT_CHAT_REPORT_INBOX` | Optional. Weekly website-chat report recipient (defaults to the lead inbox) |
| `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_SUPPORT_CHANNEL_ID` | Optional. Website chat live takeover; all three required, otherwise off. Setup: [SUPPORT_CHAT_SLACK_SETUP.md](./SUPPORT_CHAT_SLACK_SETUP.md) |
| `RESEND_WEBHOOK_SECRET` | Delivery events |
| `RESEND_COLLECTRATINGS_API_KEY` / `FROM` | Review-request From domain |

### Inngest

| Variable | Purpose |
|----------|---------|
| `INNGEST_EVENT_KEY` | `inngest.send` |
| `INNGEST_SIGNING_KEY` | Verify `/api/inngest` |
| `INNGEST_SERVE_HOST` | Optional public origin for serve URL |
| `INNGEST_DEV` | **Never set on Vercel** |

### Upstash Redis

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Required in production-like mode |
| `UPSTASH_REDIS_REST_TOKEN` | |

### Security / jobs

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Bearer for `/api/cron/*` |
| `GROWTH_DASHBOARD_SECRET` | Required for growth operations; no cron-secret fallback. Rotate to revoke all growth sessions and old automation credentials. |
| `ENCRYPTION_KEY` | Optional legacy; OAuth uses DB RPCs today |

### AI (Vertex / GenAI)

| Variable | Purpose |
|----------|---------|
| `GCP_PROJECT_ID`, `GCP_REGION` | Defaults documented in `.env.example` |
| `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_VERTEX_CREDENTIALS_JSON` | Credentials |
| `GOOGLE_AI_PRIMARY_MODEL` / `FALLBACK` / `LITE` | Model routing overrides |

### Other integrations

Facebook, Yelp, Square, Clover, Sentry, Better Stack heartbeats, Cal.com embed, referral cents, IndexNow, GSC export — all annotated in `.env.example`.

### Privacy / consent

| Var | Scope | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_GTM_ID` | public | GTM container; defaults to the production container. Loaded only after analytics or marketing consent |
| `NEXT_PUBLIC_META_PIXEL_ID` | public | Unset = no pixel. Loaded only after marketing consent (and never with GPC). Also sends `StartTrial` once per Stripe trial confirmed on onboarding checkout return |
| `PRIVACY_REGION_OVERRIDE` | server, dev only | `EU_EEA`, `UK`, `US` or `OTHER`; ignored when `NODE_ENV=production`. Per-page alternative: `?privacy_region=` |

Region comes from Vercel's `x-vercel-ip-country` header (no key needed). See `docs/PRIVACY.md`.

---

## 3. Recommended local setup

```bash
cp .env.example .env.local
```

Minimum to boot marketing + auth against a shared staging Supabase:

1. Supabase URL + anon + service role  
2. `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_ROOT_DOMAIN` for localhost  
3. Upstash (if code paths require Redis)  
4. Stripe/Twilio/Resend/Google only when testing those features  

Use **staging** credentials — never production service role on a laptop unless explicitly approved.

---

## 4. Production checklist

- All secrets set in Vercel project settings (Production + Preview as needed).
- Supabase Auth redirect URLs include production and preview domains.
- Stripe webhook endpoint points at `/api/webhooks/stripe`.
- Inngest app linked; deployment protection bypass configured if needed.
- Cron jobs registered with `Authorization: Bearer` matching `CRON_SECRET`.
- Pub/Sub push URL token matches `GOOGLE_PUBSUB_VERIFICATION_TOKEN` exactly (no whitespace).
- `NEXT_PUBLIC_*` contains **no** secret keys (`sk_`, service role, etc.).

Also see [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).

---

## 5. Config files (non-env)

| File | Role |
|------|------|
| `next.config.ts` | Next.js / bundler |
| `tsconfig.json` | TypeScript paths (`@/*`) |
| `tailwind.config.ts` / PostCSS | Styling |
| `vitest.config.ts` | Unit tests |
| `playwright.config.ts` | Visual tests |
| `vercel.json` | Cron / hosting hints |
| `components.json` | shadcn |
| `sentry.server.config.ts` / `sentry.edge.config.ts` / `src/instrumentation-client.ts` | Sentry init (shared options in `src/lib/monitoring/sentry-init-options.ts`; server `beforeSend` + Pino bridge; client Session Replay is attached only after analytics consent via `src/lib/monitoring/sentry-replay-consent.ts`) |
| `src/services/inngest/sentry-middleware.ts` | Inngest terminal failures → Sentry |

Sentry uses organization `zyene-inc`, project `zyene-reviews` (numeric ID
`4510977316159488`). Its DSN is independent of the `trackmyopt` project in the
same organization. Set a dedicated `SENTRY_AUTH_TOKEN` in the `zyene-reviews`
Vercel project's production environment for source-map uploads; never copy
TrackMyOPT's DSN or store an auth token in a `NEXT_PUBLIC_` variable.

Local `next dev` (`NODE_ENV=development`) does not report to Sentry, so HMR and
stale-bundler errors stay out of the production issue list. Set
`NEXT_PUBLIC_SENTRY_ENABLE_DEV=true` locally to test the Sentry wiring.

---

## 6. Future extension

Feature flags and remote config beyond env vars may appear under `src/lib/features` — document new flag names here when introduced. Until then, plan limits and env toggles are the primary switches.

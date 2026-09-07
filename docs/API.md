# API Reference

HTTP surfaces in Zyene Reviews live under `src/app/api/**/route.ts` (~128 routes). This doc catalogs the **important** endpoints by audience. For interactive examples of the public developer API, see the in-app docs at `/docs/api` (`src/app/docs/api/`).

Companion: [AUTHENTICATION.md](./AUTHENTICATION.md), [DATA_MODELS.md](./DATA_MODELS.md).

---

## Conventions

| Concern | Convention |
|---------|------------|
| Success JSON | Often `{ success: true, data: ... }` |
| Error JSON | Often `{ success: false, error: string }` |
| Validation | Zod at route boundary; `400` on invalid input |
| Auth failures | `401` / `403` depending on path |
| CORS | Public `/api/v1/*` supports `OPTIONS` preflight |

---

## 1. Public developer API (`/api/v1/*`)

**Auth:** header `X-API-Key: zy_...` (hashed at rest). Scopes in `src/lib/api-keys/scopes.ts`.

| Method | Path | Scope | Purpose |
|--------|------|-------|---------|
| `POST` | `/api/v1/requests/send` | `review_requests:write` | Send SMS/email/link review request |
| `GET` | `/api/v1/reviews` | `reviews:read` | Paginated reviews for the key’s business |
| `GET` | `/api/v1/analytics` | `analytics:read` | Aggregate review/request activity |
| `GET` | `/api/v1/aeo/prompts` | `prompts:read` | AEO prompts |
| `GET` | `/api/v1/aeo/results` | `results:read` | AEO sample results |
| `GET` | `/api/v1/aeo/citations` | `citations:read` | Citations |
| `GET` | `/api/v1/aeo/scores` | `scores:read` | Scores |

### `POST /api/v1/requests/send`

**Body (JSON):**

| Field | Type | Notes |
|-------|------|-------|
| `customerName` | string? | max 200 |
| `customerPhone` | string? | max 40 |
| `customerEmail` | string? | max 320 |
| `channel` | `"sms" \| "email" \| "link" \| "both"` | default `sms` |

**Success `200`:** `{ success: true, data: { requestId, status, channel, reviewLink, warning? } }`  
**Errors:** `400` invalid body; `401` bad/missing key; `403` missing scope; provider/business errors via `result.code` from send helper.

### `GET /api/v1/reviews`

**Query:** `page` (default 1), `limit` (1–100, default 20), `status` (`pending|responded|ignored`), `minRating` (1–5).

**Success `200`:** `{ success: true, data: { page, limit, total, reviews: [...] } }`  
Review fields include `id, author_name, rating, text, review_date, response_status, response_text, platform, is_visible`.

### `GET /api/v1/analytics`

**Query:** typically `days` (see route for exact schema).  
**Scope:** `analytics:read`. Returns aggregates for the API key’s business.

### AEO v1 routes

Require corresponding AEO scopes. Treat as **beta/feature-gated** unless product confirms GA — see Documentation TODO in [CODEBASE_KNOWLEDGE.md](../codebase-analysis-docs/CODEBASE_KNOWLEDGE.md).

---

## 2. Session / dashboard APIs (selected)

Auth: Supabase session (`getUser`) + active business context unless noted.

### Reviews

| Method | Path | Purpose |
|--------|------|---------|
| `GET`/`POST` | `/api/reviews` | List / create-related review ops for active business |
| `GET`/`PATCH`/`DELETE` | `/api/reviews/[id]` | Single review |
| `POST` | `/api/reviews/[id]/reply` | Publish or save reply |
| `POST` | `/api/reviews/bulk` | Bulk actions |
| `GET` | `/api/reviews/export` | Export |
| `GET`/`POST` | `/api/reviews/private` | Private feedback inbox |
| `PATCH` | `/api/reviews/private/[id]/status` | Update private feedback status |

### Customers & campaigns

| Method | Path | Purpose |
|--------|------|---------|
| `GET`/`POST` | `/api/customers` | CRM list/create |
| `POST` | `/api/customers/import`, `/bulk`, `/merge` | Import/bulk/merge |
| `GET` | `/api/customers/stats` | Stats |
| `GET`/`POST` | `/api/campaigns` | Campaign CRUD list/create |
| `GET`/`PATCH`/`DELETE` | `/api/campaigns/[id]` | Campaign detail |
| `POST` | `/api/campaigns/[id]/send` | Trigger send |

### Requests, team, businesses, billing

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/requests/send` | Session-authenticated send |
| `GET` | `/api/requests/export` | Export requests |
| `POST` | `/api/team/invite` | Invite member |
| `POST` | `/api/team/accept-invite` | Accept invite |
| `POST` | `/api/team/invites/[id]/resend` | Resend |
| `PATCH`/`DELETE` | `/api/team/[id]` | Update/remove member |
| `GET`/`PATCH` | `/api/businesses/[id]` | Business settings |
| `GET` | `/api/businesses/[id]/qr-code` | QR asset |
| `GET` | `/api/businesses/check-slug` | Slug availability |
| `POST` | `/api/billing/checkout` | Stripe Checkout |
| `POST` | `/api/billing/portal` | Customer portal |
| `POST` | `/api/billing/proration-preview` | Proration preview |
| `GET`/`PATCH` | `/api/users/me` | Current user profile |
| `GET`/`PATCH` | `/api/settings/notifications` | Notification prefs |
| `GET`/`POST`/`DELETE` | `/api/integrations/api-key` | Manage developer API keys |

### AI & smart analysis

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/ai/suggest-reply` | Draft reply |
| `POST` | `/api/ai/suggest-qa-answer` | GBP Q&A draft |
| `POST` | `/api/ai/analyze`, `/api/ai/insights` | Analysis / insights |
| `POST` | `/api/ai/optimize-gbp-content`, `/optimize-business-description` | Copy helpers |
| `POST` | `/api/smart/analyze`, `/backfill`, `/insights` | Smart review pipeline |

### Sync & Google helpers

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/sync/google`, `/facebook`, `/yelp` | Trigger platform sync |
| Various | `/api/google/*` | Listing, local posts, lodging, Q&A, place actions, location selector, account access |

### Competitors, analytics, AEO dashboard, misc

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/competitors/range-data`, `range-meta`, `export` | Competitor watch data |
| `GET` | `/api/analytics/range-data`, `export` | Analytics |
| Various | `/api/aeo/*` | Exports, reports, crawler logs (session) |
| `POST` | `/api/review-flow/generate` | Generate/configure review flow |
| `GET`/`POST` | `/api/referral` | Referral program |
| `POST` | `/api/nfc/checkout` | NFC card order checkout |
| `POST` | `/api/milestones/reviews/claim` | Milestone claim |
| `GET` | `/api/places/autocomplete` | Places autocomplete |
| `GET` | `/api/health` | Health check |

Exact bodies vary by route — open the corresponding `route.ts` when implementing.

---

## 3. Auth callbacks

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/auth/callback` | Supabase OAuth / magic-link callback (`handleOAuthCallback`) |
| `POST`/`GET` | `/api/auth/google/complete` | Finish Google identity / GBP connect handoff |

---

## 4. Integration OAuth

| Flow | Connect | Callback / confirm |
|------|---------|-------------------|
| Facebook | `/api/integrations/facebook/connect` | `callback`, `confirm`, `pages` |
| Yelp | `/api/integrations/yelp/connect` | `confirm` |
| Square | `/api/integrations/square/connect` | `callback` |
| Clover | `/api/integrations/clover/connect` | `callback` |

Errors: OAuth denials redirect with error query params; token exchange failures return 4xx/5xx JSON or error pages depending on route.

---

## 5. Webhooks

| Method | Path | Auth / verification |
|--------|------|---------------------|
| `POST` | `/api/webhooks/stripe` | Stripe signature (`STRIPE_WEBHOOK_SECRET`) |
| `POST` | `/api/webhooks/resend` | Svix (`RESEND_WEBHOOK_SECRET`) |
| `POST` | `/api/webhooks/twilio` | Twilio signature |
| `POST` | `/api/webhooks/google/pubsub` | `?token=` = `GOOGLE_PUBSUB_VERIFICATION_TOKEN` |
| `POST` | `/api/webhooks/google/gbp-reviews` | Legacy token `GOOGLE_GBP_WEBHOOK_SECRET` |
| `POST` | `/api/webhooks/square` | Square signature key |
| `POST` | `/api/webhooks/clover` | Clover webhook auth |
| `POST` | `/api/webhooks/generic` | Configured shared secret / API pattern |
| `POST` | `/api/webhooks/supabase/review-request-scheduled` | Supabase webhook secret pattern |

**Important errors:** `401` bad signature/token; `400` malformed payload; handlers should be idempotent where events can retry.

---

## 6. Cron (`GET /api/cron/*`)

**Auth:** `Authorization: Bearer <CRON_SECRET>` (some also accept Vercel Cron headers).

| Path | Role |
|------|------|
| `/api/cron/daily-digest` | Daily heartbeat / digest related |
| `/api/cron/weekly-digest` | Weekly email digest |
| `/api/cron/sync-reviews` | Review sync kick |
| `/api/cron/follow-up` | Follow-up reminders |
| `/api/cron/google-performance` | GBP metrics pull |
| `/api/cron/scheduled-review-requests` | Due scheduled sends |
| `/api/cron/competitor-watch` | Competitor snapshots |
| `/api/cron/monthly-newsletter` | Marketing newsletter |
| `/api/cron/register-google-pubsub-notifications` | Re-register Pub/Sub |
| `/api/cron/aeo-*` | AEO schedulers, digests, credit reset |

`401` if secret missing/wrong.

---

## 7. Marketing & public tools

Unauthenticated or lightly rate-limited:

| Path | Purpose |
|------|---------|
| `/api/marketing/contact` | Contact form |
| `/api/marketing/demo-request` | Demo inbound |
| `/api/marketing/newsletter/subscribe`, `unsubscribe` | Newsletter |
| `/api/marketing/agency-waitlist` | Agency waitlist |
| `/api/marketing/events/track` | Funnel events |
| `/api/marketing/tools/*` | Free tools (places search, reputation score, review link, review response) |
| `/api/track/review`, `/api/track/review-open` | Open/click tracking pixels/redirects |
| `/api/indexnow` | IndexNow ping helper |

Internal growth (secret-gated): `/api/internal/growth-*`, marketing report endpoints.

---

## 8. Inngest

| Method | Path | Purpose |
|--------|------|---------|
| `GET`/`POST`/`PUT` | `/api/inngest` | Inngest serve endpoint (signing key verified) |

---

## Error cases (cross-cutting)

| Status | Typical cause |
|--------|----------------|
| `400` | Zod validation failure, bad JSON |
| `401` | Missing/invalid session, API key, cron secret, webhook signature |
| `403` | Authenticated but lacking role/scope/plan entitlement |
| `404` | Unknown id / business mismatch |
| `429` | Upstash rate limit |
| `500` | Upstream vendor or unexpected server error (no stack traces to clients) |

When adding endpoints: keep route files ≤100 lines, validate with Zod, document here and in `/docs/api` if public.

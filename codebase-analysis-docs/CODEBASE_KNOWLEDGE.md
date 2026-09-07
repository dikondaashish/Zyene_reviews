# Codebase Knowledge

Living system map for humans and AI agents working in **Zyene Reviews**.

Read this before large refactors. For setup commands, prefer [docs/README.md](../docs/README.md) and the root [README.md](../README.md). For enforceable coding rules, prefer [AGENTS.md](../AGENTS.md).

---

## 1. Overview (three levels)

### High level — business purpose

Zyene Reviews helps local businesses and agencies manage reputation end-to-end: ingest reviews from major platforms, respond with AI assistance, proactively request reviews, divert low ratings into private feedback, measure local SEO / AEO signals, and bill via subscriptions.

### Mid level — modules and communication

| Module area | Location | Talks to |
|-------------|----------|----------|
| Product UI | `src/app/(dashboard)`, `src/components/**` | Server Actions, `/api/*`, Supabase SSR |
| Marketing / SEO | `src/app/(marketing)`, `src/lib/seo` | Static/SSR pages, sitemap, free tools APIs |
| Auth & tenancy | `src/lib/auth`, `src/app/(auth)`, `/api/auth/*` | Supabase Auth, cookies, Redis cache |
| Reviews & AI | `src/lib/reviews`, `src/lib/ai`, `src/services/ai` | DB, GenAI, Inngest |
| Campaigns & requests | `src/lib/campaigns`, `src/lib/review-requests`, Twilio/Resend services | DB, Inngest, webhooks |
| Integrations | `src/services/{google,facebook,yelp,square,clover}` | OAuth, vendor APIs, sync jobs |
| Billing | `src/lib/billing`, `src/services/stripe` | Stripe API + webhooks |
| AEO / GEO | `src/services/aeo`, related cron/API | Sampling, citations, reports, quotas |
| Jobs | `src/lib/inngest`, `src/services/inngest`, `/api/cron` | Inngest Cloud, schedulers |

Flow pattern:

```
HTTP/UI → route or Server Action → src/lib (domain) → src/services (vendor) → Postgres / Redis / vendor API
                                         ↘ inngest.send → worker → same lib/services
```

### Low level — important functions and patterns

| Symbol / area | Path | Why it matters |
|---------------|------|----------------|
| `getActiveBusinessId` | `src/lib/auth/business-context.ts` | Resolves tenant location from cookie + membership |
| `createClient` / `createAdminClient` | `src/lib/db/supabase/server.ts`, `admin.ts` | User RLS vs service-role bypass |
| `authenticateApiKey` | `src/lib/api-keys/authenticate.ts` + `src/app/api/v1/_lib/auth.ts` | Public API auth |
| `sendOutboundReviewRequest` | `src/lib/review-requests/send-outbound` | Shared send path for UI, API, Zapier |
| Config accessors | `src/config/env.ts` | Central env reads (prefer over raw `process.env`) |
| Inngest registration | `src/lib/inngest`, `src/services/inngest` | Background sync and campaigns |
| Proxy / middleware-like | `src/proxy.ts` | Request interception entry (Next proxy convention) |

Common patterns:

- Zod `safeParse` at API boundaries; structured `{ success, error }` or `{ success, data }` JSON.
- Server Actions return `ActionResponse`-style results (success/error), not thrown auth errors for expected cases.
- Pino on server only — no `console.log` in client components.
- Path alias `@/` only (no deep relative imports).

---

## 2. Folder structure

| Path | Role |
|------|------|
| `src/app/` | App Router: pages, layouts, `api/`, `actions/` |
| `src/components/` | UI and feature components (`ui/` = shadcn — do not hand-edit) |
| `src/lib/` | Domain logic, helpers, validations, feature modules |
| `src/services/` | External provider adapters |
| `src/domains/` | Cross-cutting domain packages (e.g. AI) |
| `src/hooks/` | Client hooks |
| `src/types/` | Shared TS types (not generated DB types) |
| `src/config/` | Env/config module |
| `src/constants/` | Static constants |
| `supabase/migrations/` | SQL migrations (append-only for applied history) |
| `tests/unit`, `tests/integration`, `tests/visual` | Automated tests |
| `scripts/` | Ops, verify, GEO, cron helpers |
| `docs/` | Engineering + growth documentation |
| `codebase-analysis-docs/` | Agent-oriented knowledge (this file) |
| `.agents/skills/` | Canonical AI skills (sync to Claude/Windsurf) |
| `.cursor/rules/` | Cursor always-on / scoped rules |
| `public/` | Static assets |
| `content/` | Content sources where applicable |

---

## 3. Key data flows

### Dashboard authenticated request

1. Browser hits page or `/api/...` with Supabase auth cookies.
2. Server calls `supabase.auth.getUser()`.
3. `getActiveBusinessId()` validates `active_business_id` cookie against memberships (Redis may cache context).
4. Handler/lib filters all queries by `business_id` / org.
5. Response rendered or JSON returned.

### Review sync

1. Trigger: cron `/api/cron/sync-reviews`, Google Pub/Sub `/api/webhooks/google/pubsub`, or manual sync API.
2. Event enqueued to Inngest.
3. Worker uses stored OAuth tokens (vault/RPC encryption) via Google service.
4. Upserts into `reviews` / updates `review_platforms`.
5. Optional AI analysis and notifications.

### Campaign / review request send

1. UI, cron `scheduled-review-requests`, or `/api/v1/requests/send`.
2. Domain send helper applies caps, opt-outs, templates.
3. Twilio SMS and/or Resend email (CollectRatings Resend account for capture-domain mail when configured).
4. Status transitions on `review_requests`; tracking via `/api/track/*` and Resend/Twilio webhooks.

### Billing

1. Checkout / portal APIs create Stripe sessions.
2. Stripe webhook `/api/webhooks/stripe` updates org plan / subscription fields (idempotent via `stripe_webhook_events`).
3. Feature gates read plan entitlements in lib.

---

## 4. Constraints and assumptions

1. **Single Next.js app** — do not assume separate frontend/backend repos.
2. **Business is the operational scope**; organization is the billing/membership scope.
3. **RLS is mandatory** but app code must still filter by tenant IDs (defense in depth). Service role (`createAdminClient`) bypasses RLS — use only after explicit authz.
4. **Production expects Upstash Redis**; missing Redis can throw in prod-like paths.
5. **Inngest must reach the deployment** — Vercel Deployment Protection can silently block jobs (see `.env.example`).
6. **Plan names / limits evolved** — check current migrations and billing lib; initial schema CHECK constraints may have been altered later.
7. **POS integrations (Square/Clover)** exist as sandbox spikes; full auto-send after payment may still be roadmap-level — check [ROADMAP.md](../docs/ROADMAP.md) and feature flags before assuming production behavior.
8. **Yelp API depth is capped** by vendor limits.
9. **File size ratchet** — CI fails if files grow past limits or grandfathered baselines expand.

---

## 5. Gotchas for new contributors

1. **`params` / `searchParams` are async** in App Router pages — always `await` them.
2. **Never use `getSession()` for authorization** — forgeable JWT in cookies.
3. **Active business cookie can be stale** after membership changes — context loaders validate ownership.
4. **Two Resend accounts** — product transactional vs CollectRatings review-request From domain.
5. **Google Pub/Sub auth is query-token based**, not custom headers; whitespace in tokens causes 401s.
6. **Do not set `INNGEST_DEV` on Vercel** — forces local mode and Cloud will not run functions.
7. **Marketing SEO rules are strict** — unique titles/descriptions, sitemap entries, OG/Twitter, one `h1` (see `.cursor/rules/seo.mdc`).
8. **Avoid full `pnpm build` after tiny UI/copy edits** — use `pnpm verify:fast`; builds are slow and stall sessions.
9. **`database.types.ts` is generated** — hand edits are wiped / forbidden by AGENTS.md.
10. **Existing `docs/` mixes engineering SoT with growth/GEO ops** — prefer the knowledge-base files in [docs/README.md](../docs/README.md) for architecture/API/auth; use [docs/INDEX.md](../docs/INDEX.md) for the full inventory.

---

## 6. Entry points cheat sheet

| Concern | Start here |
|---------|------------|
| Root layout / metadata template | `src/app/layout.tsx`, `layout-metadata.ts` |
| Dashboard shell | `src/app/(dashboard)/` |
| Public capture | `src/app/r/[slug]/` |
| API routes | `src/app/api/` (~128 `route.ts` files) |
| Env | `.env.example`, `src/config/env.ts` |
| Schema history | `supabase/migrations/` (~116 files) |
| Agent standards | `AGENTS.md`, `CLAUDE.md` |

---

## Documentation TODO

Gaps and follow-ups identified while building this knowledge base (2026-09):

### Missing / thin areas (by folder)

| Area | Gap |
|------|-----|
| `src/services/aeo/**` + AEO cron | Engineering runbook for quotas, credit ledger, and failure modes is scattered across dated AEO phase docs |
| `src/domains/ai/**` | Model routing / Vertex credential setup is mostly in `.env.example` comments — needs a dedicated AI ops short doc |
| `src/app/actions/**` | No catalog of Server Actions vs API routes (when to use which) |
| `src/proxy.ts` | Behavior vs classic middleware not fully documented for agents |
| Square / Clover | Spike vs production matrix should live in one “integrations status” page |
| `tests/integration` | Patterns and required env for local integration tests under-documented |
| Widget `src/app/w/[slug]` | Embed contract (script params, CSP, caching) not in API/docs hub |

### Suggested docs to add later

1. `docs/BACKGROUND_JOBS.md` — Inngest event names, cron schedule matrix, Better Stack heartbeats.
2. `docs/INTEGRATIONS_STATUS.md` — live vs sandbox vs planned per vendor.
3. `docs/SERVER_ACTIONS.md` — inventory + auth checklist.
4. `docs/REVIEW_FLOW.md` — collectratings domain, slug rules, shield thresholds, tracking pixels.
5. Per-route OpenAPI (or generated) for `/api/v1/*` only — keep internal routes summarized.

### Questions for the product owner / tech lead

1. Which Square/Clover paths are safe to document as “supported in production” vs “sandbox only”?
2. Is there a preferred staging seed process we should document (or explicitly mark as unavailable)?
3. Should dated GEO/AEO completion reports stay in `docs/` root or move under `docs/archive/` / `docs/growth/` to reduce noise for agents?
4. Are any `/api/v1/aeo/*` endpoints generally available to customers, or internal/beta only?
5. What is the canonical production hostname matrix (www vs app vs collectratings) for redirects we should treat as SoT?

When these are answered, fold the answers into [ARCHITECTURE.md](../docs/ARCHITECTURE.md), [API.md](../docs/API.md), and this file — then shrink this TODO list.

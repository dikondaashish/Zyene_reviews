# Zyene Reviews — Copilot Project Instructions

## What This Project Is
Zyene Reviews (zyenereviews.com) is a SaaS review management platform for local 
businesses. It helps businesses monitor, respond to, and automate customer reviews 
across Google, Yelp, and Facebook. Core features include real-time review alerts, 
AI-powered reply suggestions, SMS/email campaigns, and a multi-location dashboard.

Target users: Restaurant owners, local service businesses, marketing agencies 
managing multiple clients.

---

## Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js API Routes, Inngest (background jobs/workflows), cron API routes
- **Database:** PostgreSQL via Supabase (with RLS enforced)
- **Auth:** Supabase Auth (`@supabase/ssr`)
- **Payments:** Stripe (subscription billing, tiered plans — webhooks-only state management)
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`) — sentiment analysis + reply generation
- **APIs Integrated:** Google Business Profile API, Yelp Fusion API, Facebook Graph API
- **Hosting:** Vercel
- **Caching / Rate Limiting:** Upstash Redis (`@upstash/redis`, `@upstash/ratelimit`)
- **Notifications:** Resend (email), Twilio (SMS + webhook for opt-outs)
- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics + Speed Insights

### Key Frontend Libraries
- `@tanstack/react-query` — server state management & caching
- `zustand` — lightweight client state
- `react-hook-form` + `zod` — form handling and validation
- `recharts` — analytics charts
- `date-fns` — all date formatting and manipulation
- `framer-motion` — animations
- `sonner` — toast notifications
- `papaparse` — CSV import/export
- `nanoid` — unique ID generation
- `lucide-react` — icons

---

## MCP (Model Context Protocol) Access
Copilot has **MCP Supabase access** for this project. This means Copilot can:
- Directly query and inspect the live Supabase database (tables, rows, schema)
- Run SQL via `mcp_supabase_execute_sql` to validate data, debug issues, or verify migrations
- List tables, extensions, and migrations using `mcp_supabase_list_tables` / `mcp_supabase_list_migrations`
- Apply new migrations via `mcp_supabase_apply_migration`
- Fetch logs and check advisors via `mcp_supabase_get_logs` / `mcp_supabase_get_advisors`
- Generate TypeScript types via `mcp_supabase_generate_typescript_types`

**When to use MCP Supabase:**
- To verify the actual DB schema before writing queries or migrations
- To check if a table/column exists before referencing it in code
- To validate that a migration ran correctly
- To debug RLS policies or data issues

**Safety rules for MCP Supabase:**
- Never run destructive SQL (DROP, DELETE, TRUNCATE) without explicit user confirmation
- Always use migrations for schema changes — never run DDL directly against production
- Respect RLS — use `mcp_supabase_execute_sql` for read-only inspection only unless asked

---

## Tenant / Data Model Hierarchy
```
Organization (plan, billing, slug)
  └── Organization Members (role: owner | admin | member)
  └── Businesses (locations — each has a unique slug)
        └── Review Platforms (google | yelp | facebook | api)
        └── Reviews
        └── Review Requests
        └── Campaigns
        └── Customers
        └── Competitors
        └── Business Members (role: owner | admin)
        └── Notification Preferences
```
- **Everything is scoped to `businessId` at the business level and `organizationId` at the org level**
- Plan limits (max locations, SMS/email/link quotas, AI reply quota, team members) live on the `organizations` table
- API tokens for review platforms are stored **encrypted** in the DB and decrypted via the `decrypt_token` Supabase RPC

---

## Project Folder Structure
```
/src
  /app                  → Next.js App Router pages and layouts
    /(auth)             → Login, signup, forgot-password routes
    /(dashboard)        → Protected dashboard routes
      /analytics        → Analytics page
      /businesses       → Business list + add business
      /campaigns        → Campaign list, detail, new campaign
      /competitors      → Competitor tracking
      /customers        → Customer CRM + CSV import
      /dashboard        → Main dashboard overview
      /integrations     → Platform integrations (Google, Yelp, Facebook, API, Widget)
      /requests         → Review request sends and history
      /reviews          → Review feed + reply
      /settings         → Settings sub-routes (billing, team, notifications, profile, public-profile, business-info, general)
    /(marketing)        → Public marketing pages (home, about, contact, privacy, terms, etc.)
    /(onboarding)       → Onboarding flow (redirects to /businesses/add)
    /actions            → Next.js Server Actions (e.g. competitor.ts)
    /api                → API route handlers
      /ai               → AI suggest-reply, analyze
      /auth             → Supabase auth callback
      /billing          → Stripe checkout + portal
      /businesses       → Business CRUD + QR code
      /campaigns        → Campaign CRUD + send
      /cron             → Scheduled jobs (daily-digest, follow-up, sync-reviews)
      /customers        → Customer import
      /inngest          → Inngest webhook handler
      /integrations     → Google, Yelp, Facebook OAuth flows + API key management
      /requests         → Review request send + export
      /review-flow      → Public review flow generation
      /reviews          → Review reply + export + private feedback
      /settings         → Notification settings
      /sync             → Manual Google sync trigger
      /team             → Team invite + management
      /track            → Review link click tracking
      /users            → User profile
      /webhooks         → Stripe webhook + Twilio webhook (SMS opt-outs)
    /r/[slug]           → Public review landing page (customer-facing, no auth)
    /w/[slug]           → Embeddable review widget (iFrame, no auth)
  /components           → Reusable UI components
    /ui                 → Base shadcn/ui components (always prefer these)
    /analytics          → Analytics-specific components (charts, filters)
    /campaigns          → Campaign-specific components (CSV import dialog)
    /dashboard          → Dashboard shell (sidebar, business-switcher, user-nav, charts)
    /integrations       → Integration cards (Google, Yelp, Facebook, Widget, API, Zapier)
    /providers          → React context providers (QueryProvider, ThemeProvider)
    /public             → Public-facing components (review flow, access error)
    /reviews            → Review-specific components (ReviewCard, filters, private feedback)
    /settings           → Settings form components
    /widgets            → Embeddable review carousel widget
  /hooks                → Custom React hooks (e.g. use-mobile.ts)
  /lib                  → Shared utilities and integrations
    /ai                 → Anthropic Claude client, reply + analysis logic, prompts
    /facebook           → Facebook Graph API client, adapter, sync service
    /google             → Google Business Profile API client + sync service
    /inngest            → Inngest client + background job functions (campaign processing)
    /notifications      → Review alert + review request notification helpers
    /qr                 → QR code generation (qrcode library)
    /resend             → Resend client, send-email helper, email templates
    /stripe             → Stripe client, plans config, check-limits helper
    /supabase           → Supabase browser/server/admin clients + database.types.ts
    /twilio             → Twilio client + SMS send helper
    /types              → Shared TypeScript interfaces (MemberContext, etc.)
    /yelp               → Yelp Fusion API client, adapter, sync service
    business-context.ts → getActiveBusinessId() — resolves active business from cookie + Redis cache
    rate-limit.ts       → Upstash rate limiters (global, AI, sync, request, campaign)
    redis.ts            → Upstash Redis client
    utils.ts            → cn() and general helpers
/supabase
  /migrations           → SQL migration files (numbered + timestamped)
```

---

## Core Architecture Rules
- Never call external APIs directly from UI components — always go through `/lib` service modules
- All date handling must use `date-fns` — never raw `new Date()` math without it
- Authentication is required on all dashboard routes — Supabase Auth middleware handles this in `src/middleware.ts`
- Stripe webhooks (`/api/webhooks/stripe`) handle all subscription state — never manually update plan/status in the DB
- Review sync runs via Inngest background jobs AND `/api/cron/` routes — do not trigger sync from frontend directly
- All data is scoped by `businessId` at the location level AND `organizationId` at the org level — never fetch without the appropriate scope
- Use Next.js Server Actions (`/src/app/actions`) for form mutations; use API routes for external/webhook integrations
- RLS (Row Level Security) is enforced at the Supabase level — always respect it; use `adminClient` only in trusted server-side contexts
- Platform OAuth tokens (Google, Facebook) are stored encrypted in the DB — always use the `decrypt_token` RPC, never read raw token columns
- Redis (Upstash) is used for: active business context caching, and 5-layer rate limiting. If Redis is unavailable, fail open (do not block traffic)
- Rate limiting has 5 layers: global API (60 req/min/IP in middleware), AI replies (20 req/min/user), sync (1 req/5min/business), review requests (10 req/min), campaign sends (5 req/min)

---

## Naming Conventions
- Components: PascalCase (e.g. `ReviewCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g. `useReviewFeed.ts`)
- Lib/service files: camelCase (e.g. `google/sync-service.ts`, `stripe/check-limits.ts`)
- Database models/types: PascalCase singular (e.g. `Review`, `Business`, `Organization`)
- Constants: UPPER_SNAKE_CASE
- Next.js route files: lowercase kebab-case directories with `page.tsx`, `layout.tsx`, `route.ts`

---

## Business Logic to Know
- **Plans:**
  - **Starter** — $29.99/mo ($299.99/yr) — 1 location, 2,500 email/SMS requests/mo, 5,000 link requests/mo, 5 team members
  - **Professional** — $59.99/mo ($599.99/yr) — 3 locations, limits multiplied per location, 15 team members
  - **Enterprise** — custom pricing — unlimited everything
- **Plan limits** are tracked and enforced via `src/lib/stripe/check-limits.ts` against the `organizations` table columns (`max_businesses`, `max_sms_requests_per_month`, `ai_replies_used_this_month`, etc.)
- **Review alert:** triggered when a new review is detected during sync; sends email/SMS notification based on `notification_preferences`
- **AI Reply:** generated using **Anthropic Claude** (not OpenAI), tone based on business category; quota tracked in `organizations.ai_replies_used_this_month`
- **Review Flow:** customers visit `/r/[slug]` → rate experience → if stars ≥ `min_stars_for_google`, redirected to Google; otherwise, private feedback is captured in `private_feedback` table
- **Review Widget:** embeddable at `/w/[slug]` — renders a carousel of 4+ star reviews for the business (iFrame embed)
- **Onboarding flow:** Register → Add Business (`/businesses/add`) → Connect Google → Enable Alerts → Send First Review Request
- **User roles:**
  - **Organization level:** `owner`, `admin`, `member` (via `organization_members` table)
  - **Business level:** `owner`, `admin` (via `business_members` table)
- **Campaigns:** bulk SMS/email sends to a contact list, processed async via Inngest (`process-campaign-contact`); respect SMS opt-outs (`opt_outs` table) and frequency caps
- **Competitors:** track competitor Google ratings and review counts; scoped to `business_id`
- **Follow-up:** `/api/cron/follow-up` sends a follow-up message to contacts who haven't completed the review flow
- **Daily Digest:** `/api/cron/daily-digest` sends a summary email of new reviews
- **SMS Opt-outs:** Twilio webhook at `/api/webhooks/twilio` handles STOP keywords and inserts into `opt_outs` table

---

## Code Style & Preferences
- Use functional components with hooks — no class components
- Prefer `async/await` over `.then()` chains
- All API errors must be caught and shown via the `sonner` toast system
- Write comments for any business logic that isn't obvious
- Keep components under 200 lines — split into smaller components if larger
- Always validate user input with `zod` — both client-side (react-hook-form) and server-side (API routes / Server Actions)
- Use TypeScript strictly — never use `any` type; use proper interfaces from `/lib/types/` or `database.types.ts`
- Prefer Server Components where possible; use `"use client"` only when interactivity or browser APIs are needed
- Use `@tanstack/react-query` for client-side data fetching where needed; prefer Server Components + Server Actions for mutations
- Use `date-fns` for all date formatting and calculations

---

## What Copilot Should Always Do
- Suggest code that fits this folder structure and naming convention
- Respect the multi-tenancy pattern (data always scoped to `businessId` or `organizationId`)
- Follow Stripe best practices — subscription state is managed only through webhooks
- When writing API routes, always include Supabase auth check (`supabase.auth.getUser()`) as the first step
- When building UI, make it mobile-first responsive using Tailwind CSS
- Use shadcn/ui components from `/src/components/ui` before creating new custom ones
- When unsure about business logic, ask before assuming
- Use Next.js Server Actions for data mutations, API routes for external integrations
- Use `date-fns` for any date work
- Use `zod` for all input validation schemas
- Use the `adminClient` (from `/lib/supabase/admin.ts`) only in trusted server contexts (API routes, Inngest jobs, cron jobs) — never in browser code

## What Copilot Should Never Do
- Never hardcode API keys or secrets — always use `.env` variables
- Never mutate state directly in React
- Never call third-party APIs directly from a React component
- Never skip error handling on async functions
- Never use `any` type in TypeScript — use proper interfaces
- Never manually update Stripe subscription state — let webhooks handle it
- Never fetch data without scoping by `businessId` or `organizationId`
- Never bypass Supabase RLS policies
- Never read raw `access_token` / `refresh_token` columns directly — always use the `decrypt_token` RPC
- Never use OpenAI — the AI provider is **Anthropic Claude**
- Never block traffic when Redis/rate-limit checks fail — fail open with a console error

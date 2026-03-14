# Zyene Reviews — Codebase Structure (File & Line Reference)

This document describes **every major file and key lines** in the Zyene Reviews project so you can understand structure and behavior at a glance.

---

## 1. High-Level Architecture

- **Framework**: Next.js 16 (App Router), React 19.
- **Auth**: Supabase Auth (Google OAuth + magic link); session in cookies; middleware enforces subdomain routing (`auth.*`, `app.*`) and onboarding.
- **Data**: Supabase (Postgres) with typed client; RLS; admin client for API/webhooks.
- **Payments**: Stripe (checkout, portal, webhooks); plan limits in `lib/stripe/plans.ts` and `check-limits.ts`.
- **Background jobs**: Inngest (campaign send per contact); Vercel Cron for daily digest, follow-up, sync.
- **AI**: Anthropic Claude (Haiku) for sentiment analysis, reply suggestions, and AI-generated review text.
- **Comms**: Resend (email), Twilio (SMS); templates in `lib/resend/templates/`.
- **Rate limiting & cache**: Upstash Redis; rate limits in `lib/rate-limit.ts`; business context cached in `lib/business-context.ts`.
- **Monitoring**: Sentry (Next.js config in root); Vercel Analytics/Speed Insights; BetterStack uptime widget in root layout.

---

## 2. Root & Config Files

| File | Purpose | Key lines |
|------|---------|-----------|
| **package.json** | App name `zyene-ratings`; deps: Next 16, React 19, Supabase SSR/JS, Stripe, Twilio, Resend, Anthropic, Google GenAI, TanStack Query, Radix/shadcn, Recharts, Zustand, BullMQ, ioredis, Inngest, Sentry, etc. Scripts: `dev`, `build`, `start`, `lint`. | 1–66 |
| **next.config.ts** | Next config: `reactCompiler: true`. Wrapped with `withSentryConfig`: org `zyene`, project `zyene-reviews`, `widenClientFileUpload`, `tunnelRoute: "/monitoring"`, `automaticVercelMonitors`. | 1–46 |
| **tsconfig.json** | Target ES2017, strict, paths `@/*` → `./src/*`, include Next env and src. | 1–35 |
| **postcss.config.mjs** | PostCSS (Tailwind). | — |
| **eslint.config.mjs** | ESLint config. | — |
| **components.json** | shadcn/ui component config. | — |
| **vercel.json** | Empty `{}` (can add crons/rewrites here). | — |
| **next-env.d.ts** | Next.js type references. | — |
| **sentry.client.config.ts** | Sentry client init. | — |
| **sentry.server.config.ts** | Sentry server init. | — |
| **sentry.edge.config.ts** | Sentry edge init. | — |

---

## 3. Middleware — `src/middleware.ts`

Runs on every request (except static assets per `config.matcher`).

- **Lines 5–42**: Create Supabase server client with cookie handlers; `getUser()`; set `cookieOptions` from `NEXT_PUBLIC_ROOT_DOMAIN`.
- **Lines 57–103**: **API routes** (`pathname.startsWith("/api")`):  
  - Global rate limit via `globalApiRateLimit.limit(ip)` (whitelist: `/api/webhooks`, `/api/inngest`, `/api/cron`).  
  - CSRF: for POST/PUT/DELETE/PATCH, require `Origin` in allowed list (`app.*`, `auth.*`, root).
- **Lines 109–125**: **Auth subdomain** (`auth.${rootDomain}`): if user and path `/` → redirect to app; if path `/` → rewrite to `/login`.
- **Lines 127–181**: **App subdomain** (`app.${rootDomain}`): require user else redirect to auth; read `users.onboarding_completed`; redirect to `/onboarding` if not completed; redirect `/onboarding` to `/` if completed; `/dashboard` → redirect to `/`; `/` → rewrite to `/dashboard`.
- **Lines 182–282**: **Root domain**: localhost uses path-based routing (allow `/r/`, handle `/onboarding` and `/dashboard` with same auth/onboarding checks). Production: `/` passes through; non-reserved paths rewritten to `/r{pathname}` (e.g. `domain.com/slug` → `/r/slug` for public review page).

---

## 4. Root Layout & Global Styles

### `src/app/layout.tsx`

- **Lines 1–9**: Imports (Metadata, Geist fonts, Toaster, QueryProvider, ThemeProvider, Vercel Analytics/SpeedInsights, Script, globals.css).
- **Lines 11–18**: Geist sans/mono font variables.
- **Lines 20–23**: Metadata (title, description).
- **Lines 26–55**: Root layout: `html` + `body` with theme; `ThemeProvider` → `QueryProvider` → children, Toaster, Analytics, SpeedInsights; BetterStack script `strategy="lazyOnload"`.

### `src/app/globals.css`

- **Lines 1–5**: Tailwind, tw-animate, shadcn; dark variant; `@theme inline` mapping CSS vars (background, foreground, sidebar, chart, radius, etc.).
- **Lines 47–75**: `:root` light theme (oklch colors).
- **Lines 77–98**: `.dark` theme overrides.
- **Lines 100–107**: Base layer (border, outline, body bg/text).
- **Lines 109–111**: BetterStack banner overrides.

---

## 5. App Router — Route Groups & Pages

### (auth) — `src/app/(auth)/`

- **layout.tsx**: Split layout: left branded panel (logo, headline, feature pills, footer); right panel with `children`. Links to `/`, login, signup.
- **login/page.tsx**: Login form (email or Google); redirects after auth.
- **signup/page.tsx**: Signup (leads to Google OAuth or email).
- **forgot-password/page.tsx**: Password reset flow.

### (marketing) — `src/app/(marketing)/`

- **layout.tsx**: Client component: header (nav, mobile menu), main, CookieBanner, footer (links: Product, Resources, Legal; status iframe).
- **page.tsx**: Landing (features, pricing, CTA).
- **about/page.tsx**, **contact/page.tsx**, **help/page.tsx**, **privacy/page.tsx**, **terms/page.tsx**, **data-retention/page.tsx**: Static/marketing pages.

### (dashboard) — `src/app/(dashboard)/`

- **layout.tsx**: Server layout: auth required (redirect if no user); `getActiveBusinessId()` for sidebar; renders `SidebarProvider`, `AppSidebar`, `SidebarInset`, `DashboardLayoutClient` with header (OrganizationDisplay, BusinessSwitcher, ThemeToggle, UserNav), `MobileSidebarFAB`, children.
- **dashboard/page.tsx**: Main dashboard: Google connect state, sync button, getting-started banner, stats (reviews, requests, rating, sentiment), recent reviews, review trend chart, rating distribution, QR code card. Uses `getActiveBusinessId()` and active business data.
- **dashboard/loading.tsx**, **error.tsx**: Loading and error boundaries.
- **businesses/page.tsx**: List businesses; add business (Google OAuth).
- **businesses/add/page.tsx**: Add business flow.
- **customers/page.tsx**: Customer list; import.
- **customers/import/page.tsx**: CSV import for customers.
- **competitors/page.tsx**: Competitors list; add-competitor-dialog, competitors-list.
- **reviews/page.tsx**: Reviews list with filters (reviews-filters, review-card, private-feedback-card).
- **requests/page.tsx**: Review requests; send-request-dialog.
- **review-requests/page.tsx**: Review request campaigns/analytics.
- **campaigns/page.tsx**: Campaign list.
- **campaigns/new/page.tsx**: New campaign.
- **campaigns/[id]/page.tsx**: Single campaign.
- **analytics/page.tsx**: Analytics (filters, charts: volume, ratings, sentiment, theme, platform table); loading/error.
- **integrations/page.tsx**: Integration cards (Google, Facebook, Yelp, API key, webhook, widget, Zapier); actions in `integrations/actions.ts`.
- **settings/page.tsx**: Settings redirect/layout.
- **settings/layout.tsx**: Settings nav (General, Business, Team, Billing, Notifications, Public Profile, etc.).
- **settings/general/page.tsx**: General settings form.
- **settings/business-information/page.tsx**: Business info form.
- **settings/team/page.tsx**: Team table, invite dialog.
- **settings/billing/page.tsx**: Billing client (Stripe portal); loading/error.
- **settings/notifications/page.tsx**: Notification preferences.
- **settings/public-profile/page.tsx**: Public profile / slug / review content.
- **settings/notifications/page.tsx**: Notification form.

### onboarding — `src/app/onboarding/`

- **layout.tsx**: Wraps onboarding flow.
- **page.tsx**: Client: loads user, org, business; `useOnboardingStore` (currentStep); renders Step1Form–Step4Form; Google connect; on complete calls onboarding API and redirects.

### Public review flow — `src/app/r/[slug]/`

- **page.tsx**: Server: load business by `slug`; check org `plan`/`plan_status` (subscription); check Google `review_platforms`; if `ref` (requestId), update `review_requests` (clicked); render `PublicReviewFlow` with business props.
- **review-flow.tsx**: Client: multi-step flow (rating → tags → generating → review/thankyou/negative); category→tags mapping; calls `/api/review-flow/generate` for AI review text; submits private feedback or redirects to Google; tracks via `/api/track/review`.
- **not-found.tsx**: 404 for invalid slug.

### Widget — `src/app/w/[slug]/page.tsx`

- Embeddable widget page (e.g. review widget for external sites).

### Error boundary — `src/app/error.tsx`

- Global error UI.

---

## 6. API Routes (Structure & Key Lines)

| Method | Path | File | Purpose |
|--------|------|------|---------|
| GET | `/api/auth/callback` | `api/auth/callback/route.ts` | OAuth callback: exchange code for session; **Add Business** flow (org_id, user_id in query): create business, review_platforms, optionally restore original user session; **New user**: create user, org, business, organization_members, events, welcome email; **Existing user**: refresh Google tokens, update review_platforms, businesses.google_review_url. |
| POST | `/api/billing/checkout` | `api/billing/checkout/route.ts` | Create Stripe Checkout session (plan, org id in metadata). |
| GET | `/api/billing/portal` | `api/billing/portal/route.ts` | Create Stripe Customer Portal session. |
| GET/PATCH/DELETE | `/api/businesses/[id]` | `api/businesses/[id]/route.ts` | Get/update/delete business (with RLS/membership). |
| GET | `/api/businesses/[id]/qr-code` | `api/businesses/[id]/qr-code/route.ts` | Return QR code image for business review link. |
| POST | `/api/businesses/check-slug` | `api/businesses/check-slug/route.ts` | Check slug availability. |
| GET/POST | `/api/campaigns` | `api/campaigns/route.ts` | List/create campaigns. |
| GET/PATCH/DELETE | `/api/campaigns/[id]` | `api/campaigns/[id]/route.ts` | Single campaign CRUD. |
| POST | `/api/campaigns/[id]/send` | `api/campaigns/[id]/send/route.ts` | Trigger campaign send (enqueue Inngest `campaign/send.contact` per contact). |
| POST | `/api/cron/daily-digest` | `api/cron/daily-digest/route.ts` | Vercel cron: send daily digest emails (Resend). |
| POST | `/api/cron/follow-up` | `api/cron/follow-up/route.ts` | Cron: send follow-up for review requests. |
| POST | `/api/cron/sync-reviews` | `api/cron/sync-reviews/route.ts` | Cron: sync Google (and possibly other) reviews. |
| POST | `/api/customers/import` | `api/customers/import/route.ts` | CSV import for customers. |
| GET/POST | `/api/customers` | `api/customers/route.ts` | List/create customers. |
| POST | `/api/inngest` | `api/inngest/route.ts` | Inngest webhook (serve Inngest functions). |
| GET/POST | `/api/integrations/api-key` | `api/integrations/api-key/route.ts` | Get or regenerate API key. |
| GET | `/api/integrations/facebook/callback` | `api/integrations/facebook/callback/route.ts` | Facebook OAuth callback. |
| POST | `/api/integrations/facebook/confirm` | `api/integrations/facebook/confirm/route.ts` | Confirm Facebook page selection. |
| GET | `/api/integrations/facebook/connect` | `api/integrations/facebook/connect/route.ts` | Start Facebook connect. |
| GET | `/api/integrations/facebook/pages` | `api/integrations/facebook/pages/route.ts` | List Facebook pages. |
| POST | `/api/integrations/yelp/confirm` | `api/integrations/yelp/confirm/route.ts` | Yelp confirm. |
| GET | `/api/integrations/yelp/connect` | `api/integrations/yelp/connect/route.ts` | Yelp connect. |
| POST | `/api/requests/export` | `api/requests/export/route.ts` | Export requests. |
| POST | `/api/requests/send` | `api/requests/send/route.ts` | Send single review request (SMS/email); rate limited. |
| POST | `/api/review-flow/generate` | `api/review-flow/generate/route.ts` | AI-generated review text (Anthropic); body: businessName, businessCategory, rating, selectedTags; rate limited by IP. |
| POST | `/api/reviews/[id]/reply` | `api/reviews/[id]/reply/route.ts` | Submit reply to review (and/or post to platform if supported). |
| GET | `/api/reviews/export` | `api/reviews/export/route.ts` | Export reviews. |
| GET/POST | `/api/reviews/private` | `api/reviews/private/route.ts` | Private feedback (create/read). |
| POST | `/api/settings/notifications` | `api/settings/notifications/route.ts` | Update notification preferences. |
| POST | `/api/sync/google` | `api/sync/google/route.ts` | Manual Google review sync; rate limited. |
| GET/PATCH/DELETE | `/api/team/[id]` | `api/team/[id]/route.ts` | Team member get/update/remove. |
| POST | `/api/team/invite` | `api/team/invite/route.ts` | Invite member (email, role). |
| POST | `/api/track/review` | `api/track/review/route.ts` | Track review flow events: body `action` (update/insert), `requestId`, `trackData`; updates or inserts `review_requests`. |
| GET | `/api/users/me` | `api/users/me/route.ts` | Current user profile. |
| POST | `/api/webhooks/stripe` | `api/webhooks/stripe/route.ts` | Stripe webhook: raw body, verify signature; handle `checkout.session.completed`, `customer.subscription.*`, `invoice.*`; update `organizations` (plan, limits, stripe_*). |
| POST | `/api/webhooks/twilio` | `api/webhooks/twilio/route.ts` | Twilio status callbacks (SMS delivery, etc.). |
| POST | `/api/ai/analyze` | `api/ai/analyze/route.ts` | Trigger AI sentiment/themes/summary for a review (writes to `reviews`). |
| POST | `/api/ai/suggest-reply` | `api/ai/suggest-reply/route.ts` | AI-suggested reply for a review. |

---

## 7. Lib Modules — Purpose & Key Exports

| Path | Purpose | Key exports / behavior |
|------|---------|------------------------|
| **lib/supabase/client.ts** | Browser Supabase client | `createClient()` with cookie domain from `NEXT_PUBLIC_ROOT_DOMAIN`. |
| **lib/supabase/server.ts** | Server Supabase client (cookies) | `createClient()` for RLS-authenticated server use. |
| **lib/supabase/admin.ts** | Service-role client (bypass RLS) | `createAdminClient()`; used in API, webhooks, cron. |
| **lib/supabase/database.types.ts** | Generated Supabase types | `Database`, table Row/Insert/Update types. |
| **lib/business-context.ts** | Active business for dashboard | `getActiveBusinessId()`: cookie `active_business_id` + Redis cache `user_businesses:{userId}` (5 min TTL), validates against org businesses; `setActiveBusiness(businessId)` sets cookie and revalidates. |
| **lib/redis.ts** | Upstash Redis | `redis` instance (UPSTASH_REDIS_REST_*). |
| **lib/rate-limit.ts** | Rate limiters | `requestRateLimit`, `campaignRateLimit`, `aiRateLimit`, `syncRateLimit`, `globalApiRateLimit` (sliding window, various windows). |
| **lib/stripe/client.ts** | Stripe SDK | `stripe` instance. |
| **lib/stripe/plans.ts** | Plan definitions & helpers | `PLANS`, `PLAN_MAP`, `getPlanByPriceId`, `getPlansByInterval`, `UNSUBSCRIBED_LIMITS`; limits: maxLocations, email/sms/link requests, aiReplies, teamMembers. |
| **lib/stripe/check-limits.ts** | Enforce plan limits | `checkLimit()` for requests/sync/businesses/etc. |
| **lib/ai/client.ts** | Anthropic client | `anthropic` (ANTHROPIC_API_KEY). |
| **lib/ai/analysis.ts** | Review sentiment/themes | `analyzeReview(review)`: calls Claude with SENTIMENT_PROMPT, parses JSON, updates `reviews` (sentiment, urgency_score, themes, ai_summary). |
| **lib/ai/prompts.ts** | AI prompt strings | `SENTIMENT_PROMPT`, reply suggestion prompts. |
| **lib/inngest/client.ts** | Inngest app | `inngest` with event schema `campaign/send.contact`. |
| **lib/inngest/functions.ts** | Inngest functions | `processCampaignContact`: fetch campaign/business, check opt-out & frequency cap, create review_request, delay, send SMS/email via `sendReviewRequest`, follow-up step. |
| **lib/notifications/review-request.ts** | Send review request | `sendReviewRequest()`: Resend + Twilio; templates. |
| **lib/notifications/review-alert.ts** | Review alert notification | Build/send alert email/SMS. |
| **lib/resend/client.ts** | Resend client | Resend API. |
| **lib/resend/send-email.ts** | Send email helper | `sendEmail()`. |
| **lib/resend/templates/*.ts** | Email templates | welcomeEmail, reviewRequestEmail, reviewAlertEmail, dailyDigestEmail, teamInviteEmail. |
| **lib/twilio/client.ts** | Twilio client | Twilio init. |
| **lib/twilio/send-sms.ts** | Send SMS | `sendSMS()`. |
| **lib/google/business-profile.ts** | Google Business Profile API | `listAccounts`, `listLocations` (OAuth tokens). |
| **lib/google/sync-service.ts** | Google reviews sync | Sync reviews into `reviews` table. |
| **lib/facebook/client.ts**, **adapter.ts**, **sync-service.ts** | Facebook integration | OAuth, adapter, sync. |
| **lib/yelp/client.ts**, **adapter.ts**, **sync-service.ts** | Yelp integration | Same pattern. |
| **lib/qr/generate-qr.ts** | QR generation | Generate QR for review link. |
| **lib/utils.ts** | Utils | `cn()` (classnames). |
| **lib/validations/onboarding.ts** | Zod schemas | Onboarding step validation. |
| **lib/stores/onboarding-store.ts** | Zustand store | Onboarding step state. |
| **lib/types/member-context.ts** | Types | Member/org context types. |
| **lib/analytics/onboarding-tracking.ts** | Analytics | Onboarding events. |
| **lib/tours/dashboard-tour.ts** | Tour steps | Dashboard product tour. |

---

## 8. Database Schema (Supabase) — Tables

- **users**: id (auth), email, full_name, avatar_url, phone, timezone, onboarding_completed, created_at, updated_at.
- **organizations**: id, name, slug, type, plan, plan_status, stripe_customer_id, stripe_subscription_id, trial_ends_at, max_* limits, ai_replies_used_this_month, custom_domain, logo_url, primary_color, hide_powered_by, support_email, created_at, updated_at.
- **organization_members**: id, organization_id, user_id, role, status, created_at.
- **businesses**: id, organization_id, name, slug, category, address, city, state, zip, country, timezone, email, phone, website, logo_url, brand_color, status, total_reviews, average_rating; review request settings (delay, frequency cap, min amount, email/sms enabled); Google/negative flow copy (headings, buttons, thank you, apology); footer (text, company name, link, logo); hide_branding; google_review_url; custom_tags; created_at, updated_at.
- **business_members**: id, business_id, user_id, role, status, created_at.
- **review_platforms**: id, business_id, platform, sync_status, access_token, refresh_token, google_account_id, google_location_id, external_id, external_url, last_synced_at, token_expires_at, total_reviews, average_rating (tokens often encrypted via RPC).
- **reviews**: id, business_id, platform, platform_id, external_id, external_url, rating, text, review_date, author_name, author_avatar_url; response (response_text, response_status, response_source, responded_at); sentiment, urgency_score, themes, ai_summary; alert_sent, alert_sent_at; created_at.
- **review_requests**: id, business_id, campaign_id, channel, customer_name, customer_phone, customer_email, status (queued/sending/sent/clicked/completed/review_left/skipped), trigger_source, review_link, sent_at, clicked_at, opened_at, delivered_at, completed_at, rating_given, tags_selected, review_left, ai_review_text, error_message, follow_up fields; created_at.
- **campaigns**: id, business_id, name, channel (sms/email/both), trigger_type, status, delay_minutes, sms_template, email_template, email_subject, follow_up_enabled, follow_up_delay_hours, follow_up_template; totals (sent, opened, clicked, completed, reviews_received); created_at, updated_at.
- **customers** / **customer_contacts**: Customer and contact data for campaigns (customer_contacts has last_request_sent_at, total_requests_sent for caps).
- **competitors**: id, business_id, name, google_url, average_rating, total_reviews.
- **integrations**: business_id, platform, status, access_token, refresh_token, external_merchant_id, api_key, webhook_secret, last_event_at.
- **invitations**: organization_id, business_id, email, role, token, expires_at.
- **notification_preferences**: business_id, user_id, email_enabled, sms_enabled, digest_enabled, quiet_hours, min_urgency_for_sms.
- **events**: organization_id, user_id, business_id, event_type, entity_type, entity_id, metadata, created_at.
- **opt_outs** / **sms_opt_outs**: Phone opt-out for SMS.

Migrations in `supabase/migrations/` (e.g. 001_initial_schema, 002_review_request_ai_fields, token_encryption, notification_settings, footer_branding, etc.) define and evolve these tables and RLS.

---

## 9. Key Components (Grouped)

- **ui/** (shadcn): alert, alert-dialog, avatar, badge, button, card, checkbox, collapsible, command, dialog, dropdown-menu, form, input, label, popover, progress, select, separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, tooltip; cookie-banner.
- **dashboard/**: app-sidebar (nav items, settings submenu), business-switcher, dashboard-layout-client, getting-started-banner, google-connect-button, google-connect-empty-state, mobile-sidebar-fab, organization-display, qr-code-card, rating-distribution-chart, review-trend-chart, sync-button, theme-toggle, user-nav.
- **onboarding/**: Step1Organization–Step4Notifications, step1-form–step4-form, completion-screen.
- **analytics/**: analytics-filters, platform-table, ratings-chart, sentiment-chart, theme-chart, volume-chart.
- **reviews/**: review-card, reviews-filters, private-feedback-card.
- **integrations/**: google-card, facebook-card, yelp-card, developer-api-card, webhook-card, widget-card, zapier-card, placeholder-card.
- **settings/**: billing-client, branding-form, business-info-form, delete-account-section, general-settings-form, invite-member-dialog, notification-form, organization-name-form, profile-form, public-profile-editor, review-content-form, review-settings-form, slug-editor, team-table; index re-exports.
- **public/**: access-error (subscription/platform).
- **providers/**: query-provider (TanStack Query), theme-provider.
- **widgets/**: review-carousel.
- **tours/**: DashboardTourProvider, dashboard-tour.css; hook use-dashboard-tour.

---

## 10. Key Data Flows (Summary)

1. **Auth**: Login/signup → Supabase Auth → `/api/auth/callback` → create/update user, org, business, members, events; redirect app or onboarding.
2. **Public review**: Customer hits `/{slug}` (rewritten to `/r/[slug]`) → `r/[slug]/page.tsx` checks subscription & Google connection → `PublicReviewFlow` (rating → tags → AI review text → Google or private feedback) → `/api/track/review` and `/api/review-flow/generate`, `/api/reviews/private` as needed.
3. **Campaign**: User creates campaign, adds contacts → POST `/api/campaigns/[id]/send` → Inngest `campaign/send.contact` per contact → processCampaignContact: cap/opt-out check, create review_request, delay, sendReviewRequest (SMS/email), optional follow-up.
4. **Reviews sync**: Cron or manual POST `/api/sync/google` → Google sync service → upsert `reviews`; optional AI analyze → `reviews.sentiment/themes/ai_summary`.
5. **Billing**: Checkout → Stripe → webhook `checkout.session.completed` / `customer.subscription.*` → update `organizations.plan`, plan_status, limits.

---

## 11. Actions (Server Actions)

- **src/app/actions/onboarding.ts**: Complete onboarding (update user onboarding_completed, business details, notification prefs).
- **src/app/actions/competitor.ts**: Add/update/delete competitors.

---

## 12. Full File Index (by directory)

```
src/
├── app/
│   ├── (auth)/layout.tsx, forgot-password/page.tsx, login/page.tsx, signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── analytics/error.tsx, loading.tsx, page.tsx
│   │   ├── businesses/add/page.tsx, page.tsx
│   │   ├── campaigns/[id]/page.tsx, new/page.tsx, page.tsx
│   │   ├── competitors/add-competitor-dialog.tsx, competitors-list.tsx, page.tsx
│   │   ├── customers/import/page.tsx, page.tsx
│   │   ├── dashboard/error.tsx, loading.tsx, page.tsx
│   │   ├── integrations/actions.ts, page.tsx
│   │   ├── requests/send-request-dialog.tsx, page.tsx
│   │   ├── review-requests/page.tsx
│   │   ├── reviews/page.tsx
│   │   └── settings/
│   │       ├── layout.tsx, page.tsx
│   │       ├── billing/error.tsx, loading.tsx, page.tsx
│   │       ├── business-information/page.tsx, general/page.tsx
│   │       ├── notifications/page.tsx, public-profile/page.tsx, team/page.tsx
│   ├── (marketing)/layout.tsx, page.tsx, about/page.tsx, contact/page.tsx,
│   │       data-retention/page.tsx, help/page.tsx, privacy/page.tsx, terms/page.tsx
│   ├── api/
│   │   ├── ai/analyze/route.ts, suggest-reply/route.ts
│   │   ├── auth/callback/route.ts
│   │   ├── billing/checkout/route.ts, portal/route.ts
│   │   ├── businesses/[id]/qr-code/route.ts, [id]/route.ts, check-slug/route.ts
│   │   ├── campaigns/[id]/route.ts, [id]/send/route.ts, route.ts
│   │   ├── cron/daily-digest/route.ts, follow-up/route.ts, sync-reviews/route.ts
│   │   ├── customers/import/route.ts, route.ts
│   │   ├── inngest/route.ts
│   │   ├── integrations/api-key/route.ts, facebook/*, yelp/*
│   │   ├── requests/export/route.ts, send/route.ts
│   │   ├── review-flow/generate/route.ts
│   │   ├── reviews/[id]/reply/route.ts, export/route.ts, private/route.ts
│   │   ├── settings/notifications/route.ts
│   │   ├── sync/google/route.ts
│   │   ├── team/[id]/route.ts, invite/route.ts
│   │   ├── track/review/route.ts
│   │   ├── users/me/route.ts
│   │   └── webhooks/stripe/route.ts, twilio/route.ts
│   ├── actions/competitor.ts, onboarding.ts
│   ├── error.tsx, globals.css, layout.tsx
│   ├── onboarding/layout.tsx, page.tsx
│   ├── r/[slug]/not-found.tsx, page.tsx, review-flow.tsx
│   └── w/[slug]/page.tsx
├── components/
│   ├── analytics/*.tsx
│   ├── dashboard/*.tsx
│   ├── integrations/*.tsx
│   ├── onboarding/*.tsx
│   ├── providers/*.tsx
│   ├── public/access-error.tsx
│   ├── reviews/*.tsx
│   ├── settings/*.tsx, index.ts
│   ├── tours/*.tsx, *.css
│   ├── ui/*.tsx
│   └── widgets/review-carousel.tsx
├── hooks/use-dashboard-tour.ts, use-media-query.ts, use-mobile.ts
└── lib/
    ├── ai/client.ts, analysis.ts, prompts.ts
    ├── analytics/onboarding-tracking.ts
    ├── business-context.ts
    ├── facebook/adapter.ts, client.ts, sync-service.ts
    ├── google/business-profile.ts, sync-service.ts
    ├── inngest/client.ts, functions.ts
    ├── notifications/review-alert.ts, review-request.ts
    ├── qr/generate-qr.ts
    ├── rate-limit.ts, redis.ts
    ├── resend/client.ts, send-email.ts, templates/*.ts
    ├── stripe/check-limits.ts, client.ts, plans.ts
    ├── supabase/admin.ts, client.ts, database.types.ts, server.ts
    ├── stores/onboarding-store.ts
    ├── tours/dashboard-tour.ts
    ├── twilio/client.ts, send-sms.ts
    ├── types/member-context.ts
    ├── utils.ts
    ├── validations/onboarding.ts
    └── yelp/adapter.ts, client.ts, sync-service.ts
middleware.ts
```
Plus root: next.config.ts, tsconfig.json, package.json, postcss.config.mjs, eslint.config.mjs, sentry.*.ts, vercel.json; supabase/migrations/*.sql.

---

This gives you a file-by-file and line-aware map of the Zyene Reviews codebase. For any specific file, open it and use the line numbers above to jump to the relevant block.

# Zyene Ratings — Complete Project Documentation

> **Version**: 2.0.0  
> **Last Updated**: February 17, 2026  
> **Repository**: [https://github.com/dikondaashish/Zyene_reviews.git](https://github.com/dikondaashish/Zyene_reviews.git)  
> **Branch**: `main`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Environment Variables](#4-environment-variables)
5. [Architecture & Routing](#5-architecture--routing)
6. [Database Schema (Supabase)](#6-database-schema-supabase)
7. [Authentication System](#7-authentication-system)
8. [Middleware — Subdomain & Path Routing](#8-middleware--subdomain--path-routing)
9. [Marketing Site](#9-marketing-site)
10. [Onboarding Flow](#10-onboarding-flow)
11. [Dashboard](#11-dashboard)
12. [Reviews Inbox](#12-reviews-inbox)
13. [Review Requests & Public Review Flow](#13-review-requests--public-review-flow)
14. [Google Business Profile Integration](#14-google-business-profile-integration)
15. [AI Features (Anthropic Claude)](#15-ai-features-anthropic-claude)
16. [Stripe Billing & Subscriptions](#16-stripe-billing--subscriptions)
17. [Team Management](#17-team-management)
18. [Settings Hub](#18-settings-hub)
19. [Notifications System (SMS & Email)](#19-notifications-system-sms--email)
20. [Analytics Dashboard](#20-analytics-dashboard)
21. [Integrations & Webhooks](#21-integrations--webhooks)
22. [UI Components (shadcn/ui)](#22-ui-components-shadcnui)
23. [Styling & Theming](#23-styling--theming)
24. [API Routes Reference](#24-api-routes-reference)
25. [Deployment & Git](#25-deployment--git)
26. [Development Setup](#26-development-setup)

---

## 1. Project Overview

**Zyene Ratings** is a SaaS application designed specifically for restaurant owners to **automate customer review management**. It connects to a business's Google Business Profile, syncs all customer reviews, performs AI-powered sentiment analysis, generates smart reply suggestions, sends multi-channel alerts (SMS + Email) for urgent reviews, handles subscription billing via Stripe, and supports team-based access — all from a single unified dashboard.

### Core Features

| Feature | Description |
|---|---|
| **Google Business Profile Sync** | Automatically pulls all reviews from Google and keeps them in sync |
| **AI Sentiment Analysis** | Uses Anthropic Claude to analyze sentiment, urgency, themes, and generate summaries |
| **AI Smart Replies** | Generates context-aware reply suggestions in two tones (professional & warm/friendly) |
| **Reviews Inbox** | Filterable, sortable, paginated inbox to manage and reply to reviews |
| **Review Requests** | Send SMS review invitations to customers with smart rating-gated flow (4-5★ → Google, 1-3★ → private feedback) |
| **Stripe Billing** | Subscription management with Free, Starter ($39/mo), and Growth ($79/mo) plans with usage limits |
| **Team Management** | Invite/manage team members with role-based access (Owner, Admin, Member) |
| **SMS & Email Alerts** | Multi-channel notifications: Twilio SMS + Resend email with urgency-tiered routing and quiet hours |
| **Notification Settings** | User-configurable SMS/email preferences: phone number, urgency threshold, quiet hours, digest toggle |
| **Analytics Dashboard** | Charts for review volume, sentiment distribution, theme breakdown, and rating trends (Recharts) |
| **Subdomain Routing** | Separate subdomains for marketing, login, and dashboard |
| **GBP Onboarding** | Guided flow requiring Google Business Profile connection before dashboard access |
| **Settings Hub** | General (business info, review settings, profile), Notifications, Team, and Billing pages |

---

## 2. Tech Stack & Dependencies

### Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | Full-stack React framework (App Router) |
| **React** | 19.2.3 | UI rendering |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **pnpm** | 10.18.2 | Package manager |

### Backend & Services

| Technology | Version | Purpose |
|---|---|---|
| **Supabase** (`@supabase/supabase-js`) | ^2.95.3 | Database (PostgreSQL), Auth, Realtime |
| **Supabase SSR** (`@supabase/ssr`) | ^0.8.0 | Server-side Supabase client for Next.js |
| **Anthropic SDK** (`@anthropic-ai/sdk`) | ^0.74.0 | AI sentiment analysis & smart replies |
| **Twilio** (`twilio`) | ^5.12.1 | SMS notifications & review requests |
| **Stripe** (`stripe` + `@stripe/stripe-js`) | ^20.3.1 / ^8.7.0 | Subscription billing & payment processing |
| **Resend** (`resend`) | latest | Transactional email (alerts, digests, invites, welcome) |
| **BullMQ** (`bullmq`) | latest | Job queue for background processing |
| **ioredis** | latest | Redis client (BullMQ backing store) |

### UI & State

| Technology | Version | Purpose |
|---|---|---|
| **shadcn/ui** (`shadcn`) | ^3.8.5 | Pre-built accessible UI components |
| **Radix UI** (`radix-ui`) | ^1.4.3 | Headless UI primitives underlying shadcn |
| **@radix-ui/react-checkbox** | latest | Standalone checkbox primitive |
| **Lucide React** | ^0.564.0 | Icon library |
| **React Hook Form** | ^7.71.1 | Form state management |
| **Zod** | ^4.3.6 | Schema validation |
| **@hookform/resolvers** | ^5.2.2 | Connects Zod schemas to React Hook Form |
| **Sonner** | ^2.0.7 | Toast notifications |
| **date-fns** | ^4.1.0 | Date formatting utilities |
| **Recharts** | ^3.7.0 | Chart library for Analytics dashboard |
| **TanStack React Query** | ^5.90.21 | Server-state management |
| **Zustand** | ^5.0.11 | Client-state management |
| **cmdk** | ^1.1.1 | Command palette component |
| **nanoid** | ^5.1.6 | Unique ID generation |
| **next-themes** | latest | Theme switching (light/dark mode) |
| **@react-email/components** | latest | React Email template components |

### Dev Dependencies

| Technology | Version | Purpose |
|---|---|---|
| **@tailwindcss/postcss** | ^4 | PostCSS integration for Tailwind |
| **tw-animate-css** | ^1.4.0 | CSS animation utilities |
| **ESLint** + **eslint-config-next** | ^9 / 16.1.6 | Linting |
| **Prettier** + **prettier-plugin-tailwindcss** | ^3.8.1 / ^0.7.2 | Code formatting |
| **babel-plugin-react-compiler** | 1.0.0 | React Compiler optimization |

---

## 3. Project Structure

```
zyene-ratings/
├── .env.local                          # Environment variables
├── .gitignore
├── components.json                     # shadcn/ui configuration
├── eslint.config.mjs                   # ESLint config
├── next-env.d.ts                       # Next.js TypeScript declarations
├── next.config.ts                      # Next.js configuration
├── package.json                        # Dependencies & scripts
├── pnpm-lock.yaml                      # Lock file
├── pnpm-workspace.yaml                 # pnpm workspace config
├── postcss.config.mjs                  # PostCSS config (Tailwind)
├── tsconfig.json                       # TypeScript configuration
├── vercel.json                         # Vercel deployment config
├── README.md
├── public/                             # Static assets
├── supabase/                           # Supabase migration files
│
└── src/
    ├── middleware.ts                    # Subdomain routing & auth middleware
    │
    ├── app/
    │   ├── layout.tsx                  # Root layout (fonts, providers, toaster)
    │   ├── globals.css                 # Global styles & CSS variables
    │   ├── favicon.ico
    │   │
    │   ├── (marketing)/
    │   │   ├── layout.tsx              # Marketing layout
    │   │   └── page.tsx                # Landing page (localhost:3000)
    │   │
    │   ├── (auth)/
    │   │   ├── layout.tsx              # Centered card layout for auth pages
    │   │   ├── login/page.tsx          # Email/password login
    │   │   ├── signup/page.tsx         # User registration
    │   │   └── forgot-password/page.tsx # Password reset
    │   │
    │   ├── (onboarding)/
    │   │   ├── layout.tsx              # Centered layout for onboarding
    │   │   └── onboarding/page.tsx     # GBP connection page
    │   │
    │   ├── (dashboard)/
    │   │   ├── layout.tsx              # Sidebar + header layout with auth guard
    │   │   ├── dashboard/page.tsx      # Home — stats cards & quick actions
    │   │   ├── reviews/page.tsx        # Reviews inbox with filters & pagination
    │   │   ├── requests/
    │   │   │   ├── page.tsx            # Review Requests dashboard (stats + table)
    │   │   │   └── send-request-dialog.tsx  # Send Request modal (Zod form)
    │   │   ├── analytics/page.tsx      # Analytics Dashboard (Charts & Trends)
    │   │   ├── integrations/
    │   │   │   ├── page.tsx            # Integrations Hub (Google, Webhooks, POS)
    │   │   │   └── actions.ts          # Server Actions for integrations
    │   │   └── settings/
    │   │       ├── layout.tsx          # Settings sidebar (General, Notifications, Team)
    │   │       ├── page.tsx            # Settings index (redirects)
    │   │       ├── general/page.tsx    # General Settings (Business Info, Review Settings, Profile)
    │   │       ├── notifications/page.tsx # Notification Preferences (SMS & Email)
    │   │       ├── team/page.tsx       # Team Management (Members + Invites)
    │   │       └── billing/page.tsx    # Billing & Subscription Management
    │   │
    │   ├── r/
    │   │   └── [slug]/
    │   │       ├── page.tsx            # Public review page (business lookup, click tracking)
    │   │       └── review-flow.tsx     # Star rating → Google redirect or private feedback
    │   │
    │   └── api/
    │       ├── auth/callback/route.ts             # OAuth callback & user provisioning
    │       ├── sync/google/route.ts                # Manual Google review sync trigger
    │       ├── cron/sync-reviews/route.ts          # Scheduled review sync (cron)
    │       ├── cron/daily-digest/route.ts          # Daily digest email (cron, 13:00 UTC)
    │       ├── reviews/[id]/reply/route.ts         # Reply to a review via Google API
    │       ├── ai/analyze/route.ts                 # AI sentiment analysis endpoint
    │       ├── ai/suggest-reply/route.ts           # AI reply suggestion endpoint
    │       ├── requests/send/route.ts              # Send review request SMS to customer
    │       ├── businesses/[id]/route.ts            # Update business details (PATCH)
    │       ├── users/me/route.ts                   # Update user profile (PATCH) / Delete (DELETE)
    │       ├── billing/checkout/route.ts           # Create Stripe checkout session
    │       ├── billing/portal/route.ts             # Create Stripe billing portal session
    │       ├── team/invite/route.ts                # Send team invitation email
    │       ├── team/[id]/route.ts                  # Update member role (PATCH) / Remove (DELETE)
    │       ├── settings/notifications/route.ts     # Save notification preferences
    │       ├── webhooks/twilio/route.ts            # Twilio SMS opt-out/in webhook
    │       └── webhooks/stripe/route.ts            # Stripe subscription webhook
    │
    ├── components/
    │   ├── dashboard/
    │   │   ├── app-sidebar.tsx         # Main navigation sidebar
    │   │   ├── business-switcher.tsx   # Business/organization switcher
    │   │   ├── google-connect-button.tsx # "Connect Google" / "Connected" button
    │   │   ├── sync-button.tsx         # Manual sync trigger button
    │   │   └── user-nav.tsx            # User dropdown menu (profile, logout)
    │   │
    │   ├── reviews/
    │   │   ├── review-card.tsx         # Individual review display with reply & AI features
    │   │   └── reviews-filters.tsx     # Filter bar (status, rating, sort)
    │   │
    │   ├── settings/
    │   │   ├── notification-form.tsx   # SMS/Email notification preferences form
    │   │   ├── billing-client.tsx      # Billing page (plan cards, usage bars, checkout)
    │   │   ├── team-table.tsx          # Team members + invites table
    │   │   ├── invite-member-dialog.tsx # Invite new member modal
    │   │   ├── business-info-form.tsx  # Edit business name, slug, category
    │   │   ├── review-settings-form.tsx # Review request frequency cap settings
    │   │   └── profile-form.tsx        # Edit user profile (full_name)
    │   │
    │   ├── analytics/
    │   │   ├── analytics-filters.tsx   # Date range filter (7d, 30d, 90d, 1y)
    │   │   ├── volume-chart.tsx        # Review volume over time (BarChart)
    │   │   ├── sentiment-chart.tsx     # Sentiment distribution (PieChart)
    │   │   ├── theme-chart.tsx         # Theme breakdown (BarChart)
    │   │   ├── ratings-chart.tsx       # Rating trends over time (LineChart)
    │   │   └── platform-table.tsx      # Platform-level review stats table
    │   │
    │   ├── providers/
    │   │   └── query-provider.tsx      # TanStack React Query provider
    │   │
    │   └── ui/                         # shadcn/ui components (22+ components)
    │       ├── alert.tsx               # and more...
    │
    ├── lib/
    │   ├── utils.ts                    # Utility: cn() for Tailwind class merging
    │   │
    │   ├── supabase/
    │   │   ├── client.ts              # Browser Supabase client (createBrowserClient)
    │   │   ├── server.ts              # Server Supabase client (createServerClient)
    │   │   └── admin.ts               # Admin Supabase client (service_role key)
    │   │
    │   ├── google/
    │   │   ├── business-profile.ts    # Google Business Profile API wrapper
    │   │   └── sync-service.ts        # Review sync orchestrator (token refresh, upsert, AI, alerts)
    │   │
    │   ├── ai/
    │   │   ├── client.ts              # Anthropic SDK client initialization
    │   │   ├── prompts.ts             # Engineered prompts for sentiment & reply generation
    │   │   └── analysis.ts            # analyzeReview() — calls Claude, parses JSON, updates DB
    │   │
    │   ├── twilio/
    │   │   ├── client.ts              # Twilio SDK client initialization
    │   │   └── send-sms.ts            # sendSMS() — sends SMS with opt-out check
    │   │
    │   ├── stripe/
    │   │   ├── client.ts              # Stripe SDK client initialization
    │   │   ├── plans.ts               # Plan definitions (Free, Starter, Growth) with limits
    │   │   └── check-limits.ts        # checkLimit() — usage enforcement per plan
    │   │
    │   ├── resend/
    │   │   ├── client.ts              # Resend SDK client initialization
    │   │   ├── send-email.ts          # sendEmail() — Resend SDK wrapper
    │   │   └── templates/
    │   │       ├── review-alert-email.ts  # Urgent review alert email template
    │   │       ├── daily-digest-email.ts  # Daily digest summary email template
    │   │       ├── welcome-email.ts       # Welcome email on signup template
    │   │       └── team-invite-email.ts   # Team invitation email template
    │   │
    │   └── notifications/
    │       └── review-alert.ts        # sendReviewAlert() — tiered SMS + Email alert logic
    │
    └── hooks/
        └── use-mobile.ts              # useIsMobile() — responsive breakpoint hook (768px)
```

---

## 4. Environment Variables

The application requires the following environment variables in `.env.local`:

```env
# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# ── Google OAuth ──
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>

# ── Anthropic (AI) ──
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# ── Twilio (SMS) ──
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>

# ── Stripe (Billing) ──
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-signing-secret>
STRIPE_STARTER_PRICE_ID=<stripe-price-id-for-starter-plan>
STRIPE_GROWTH_PRICE_ID=<stripe-price-id-for-growth-plan>

# ── Resend (Email) ──
RESEND_API_KEY=<your-resend-api-key>

# ── Cron Security ──
CRON_SECRET=<random-secret-for-cron-endpoints>

# ── Application ──
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Architecture & Routing

### Subdomain Architecture

The application uses a **multi-subdomain architecture** to separate concerns:

| Subdomain | URL (Dev) | URL (Production) | Purpose |
|---|---|---|---|
| **Root** | `localhost:3000` | `zyene.com` | Marketing / Landing page |
| **Login** | `login.localhost:3000` | `login.zyene.com` | Authentication pages |
| **Dashboard** | `dashboard.localhost:3000` | `dashboard.zyene.com` | Main application |

> In **localhost development**, path-based routing is used as a fallback since subdomains on localhost can be unreliable. The middleware handles both subdomain and path routing.

### Next.js Route Groups

The app uses Next.js **route groups** to organize code:

| Route Group | Layout | Purpose |
|---|---|---|
| `(marketing)` | None (root layout only) | Landing page |
| `(auth)` | Centered card layout | Login, Signup, Forgot Password |
| `(onboarding)` | Centered flex layout | GBP connection flow |
| `(dashboard)` | Sidebar + header layout | All authenticated app pages |
| `api/` | N/A | API routes |

### Data Flow Diagram

```
User → Middleware (Auth + Routing)
         ├── Marketing Site (unauthenticated)
         ├── Auth Pages (login, signup, forgot-password)
         ├── Onboarding (requires auth, no GBP)
         ├── Public Review Page (/r/[slug] — rating-gated, no auth required)
         └── Dashboard (requires auth + GBP)
                ├── Dashboard Home (stats)
                ├── Reviews Inbox
                │     ├── Filter / Sort / Paginate
                │     ├── View Review Card (sentiment, urgency, themes)
                │     ├── Reply to Review → Google API
                │     └── AI Suggest Reply → Anthropic API
                ├── Review Requests (send SMS to customer → rating flow)
                ├── Analytics (Charts: Trends, Volume, Sentiment, Themes)
                ├── Integrations (Google Sync, Webhooks)
                └── Settings
                      ├── General (Business Info, Review Settings, Profile)
                      ├── Notifications (SMS, Email, Quiet Hours, Digest)
                      ├── Team (Members, Invites, Roles)
                      └── Billing (Plans, Usage, Stripe Checkout/Portal)
```

---

## 6. Database Schema (Supabase)

The database is hosted on **Supabase** (PostgreSQL) with the following tables:

### Core Tables

#### `organizations`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Organization ID |
| `name` | TEXT | Organization display name |
| `slug` | TEXT (UNIQUE) | URL-safe slug |
| `type` | TEXT | Organization type (e.g., "business") |
| `stripe_customer_id` | TEXT | Stripe customer ID for billing |
| `stripe_subscription_id` | TEXT | Active Stripe subscription ID |
| `plan_id` | TEXT | Current plan: "free", "starter", "growth" |
| `max_businesses` | INTEGER | Plan limit: max businesses allowed (-1 = unlimited) |
| `max_review_requests_per_month` | INTEGER | Plan limit: monthly review requests (-1 = unlimited) |
| `max_ai_replies_per_month` | INTEGER | Plan limit: monthly AI replies (-1 = unlimited) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### `users`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Matches Supabase auth.users.id |
| `email` | TEXT | User email |
| `full_name` | TEXT | Display name |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### `organization_members`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Membership ID |
| `organization_id` | UUID (FK → organizations) | Organization |
| `user_id` | UUID (FK → users) | User |
| `role` | TEXT | Role: "owner", "admin", "member" |
| `status` | TEXT | Status: "active", "invited" |

#### `businesses`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Business ID |
| `organization_id` | UUID (FK → organizations) | Parent organization |
| `name` | TEXT | Business name |
| `slug` | TEXT | URL-safe slug |
| `phone` | TEXT | Business phone number |
| `email` | TEXT | Business contact email |
| `address_line1` | TEXT | Street address |
| `city` | TEXT | City |
| `state` | TEXT | State |
| `zip` | TEXT | ZIP/Postal code |
| `country` | TEXT | Country code |
| `timezone` | TEXT | Timezone (e.g., "America/New_York") |
| `category` | TEXT | Business category (Restaurant, Cafe, Bar, Retail, Service, Other) |
| `status` | TEXT | Status: "active", "inactive" |
| `review_request_delay_minutes` | INTEGER | Minutes after visit before sending request (default: 120) |
| `review_request_min_amount_cents` | INTEGER | Minimum transaction amount to trigger request (default: 1500 = $15) |
| `review_request_frequency_cap_days` | INTEGER | Days between requests to same customer (default: 30) |
| `review_request_sms_enabled` | BOOLEAN | Whether SMS review requests are enabled |
| `review_request_email_enabled` | BOOLEAN | Whether email review requests are enabled |
| `total_reviews` | INTEGER | Aggregated review count |
| `average_rating` | DECIMAL | Aggregated average rating |

#### `review_platforms`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Platform connection ID |
| `business_id` | UUID (FK → businesses) | Parent business |
| `platform` | TEXT | Platform name: "google" |
| `external_id` | TEXT | Google Location ID |
| `access_token` | TEXT | Google OAuth access token |
| `refresh_token` | TEXT | Google OAuth refresh token |
| `token_expires_at` | TIMESTAMPTZ | Token expiry time |
| `sync_status` | TEXT | Sync status: "active", "error_*" |
| `total_reviews` | INTEGER | Review count for this platform |
| `average_rating` | DECIMAL | Average rating for this platform |
| `last_synced_at` | TIMESTAMPTZ | Last successful sync time |

#### `reviews`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Review ID |
| `business_id` | UUID (FK → businesses) | Parent business |
| `platform` | TEXT | Source: "google" |
| `platform_id` | UUID (FK → review_platforms) | Platform connection |
| `external_id` | TEXT | Google review ID |
| `author_name` | TEXT | Reviewer's display name |
| `rating` | INTEGER | Star rating (1-5) |
| `content` | TEXT | Review text |
| `published_at` | TIMESTAMPTZ | When the review was posted |
| `response_status` | TEXT | "pending", "responded", "ignored" |
| `response_text` | TEXT | Reply text |
| `responded_at` | TIMESTAMPTZ | When replied |
| `response_source` | TEXT | "google", "manual", "ai" |
| `sentiment` | TEXT | AI: "positive", "negative", "neutral", "mixed" |
| `urgency_score` | INTEGER | AI: 1-10 urgency score |
| `themes` | TEXT[] | AI: Array of themes |
| `ai_summary` | TEXT | AI: One-sentence summary |
| `alert_sent` | BOOLEAN | Whether SMS alert was sent |
| `alert_sent_at` | TIMESTAMPTZ | When alert was sent |

**Unique Constraint**: `(business_id, platform, external_id)` — prevents duplicate reviews.

### Notification Tables

#### `notification_preferences`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Preference ID |
| `user_id` | UUID (FK → users) | User |
| `sms_enabled` | BOOLEAN | Whether SMS alerts are turned on |
| `phone_number` | TEXT | User's phone number (with country code) |
| `min_urgency_score` | INTEGER | Minimum urgency score to trigger alert (5-10) |
| `quiet_hours_start` | TEXT | Start of quiet hours (HH:MM format) |
| `quiet_hours_end` | TEXT | End of quiet hours (HH:MM format) |
| `email_enabled` | BOOLEAN | Whether email alerts are enabled |
| `digest_enabled` | BOOLEAN | Whether daily digest emails are enabled |

#### `sms_opt_outs`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Opt-out record ID |
| `phone_number` | TEXT (UNIQUE) | Phone number that opted out |
| `opted_out_at` | TIMESTAMPTZ | When they opted out |

### Support Tables

#### `events`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Event ID |
| `organization_id` | UUID | Organization |
| `user_id` | UUID | User who triggered the event |
| `event_type` | TEXT | Event type: "user.signed_up", etc. |
| `entity_type` | TEXT | Entity type: "user", "review", etc. |
| `entity_id` | UUID | Related entity ID |
| `metadata` | JSONB | Additional event data |

#### `campaigns`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Campaign ID |
| `business_id` | UUID (FK → businesses) | Parent business |
| `name` | TEXT | Campaign name |
| `type` | TEXT | Campaign type |
| `status` | TEXT | Campaign status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Billing & Team Tables

#### `invitations`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Invitation ID |
| `organization_id` | UUID (FK → organizations) | Organization invited to |
| `email` | TEXT | Invited email address |
| `role` | TEXT | Assigned role: "admin", "member" |
| `invited_by` | UUID (FK → users) | User who sent the invitation |
| `status` | TEXT | "pending", "accepted", "expired" |
| `created_at` | TIMESTAMPTZ | When invitation was created |
| `expires_at` | TIMESTAMPTZ | Expiration time |

### Review Request Tables

#### `customer_contacts`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Contact ID |
| `business_id` | UUID (FK → businesses) | Parent business |
| `name` | TEXT | Customer name |
| `phone` | TEXT | Customer phone number |
| `email` | TEXT | Customer email (optional) |
| `last_request_sent_at` | TIMESTAMPTZ | When last review request was sent |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Unique Constraint**: `(business_id, phone)` — one contact per phone per business.

#### `review_requests`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Request ID |
| `business_id` | UUID (FK → businesses) | Parent business |
| `contact_id` | UUID (FK → customer_contacts) | Customer contact |
| `sent_by` | UUID (FK → users) | User who sent the request |
| `phone` | TEXT | Phone number SMS was sent to |
| `status` | TEXT | "sent", "delivered", "clicked", "reviewed" |
| `sms_sid` | TEXT | Twilio message SID |
| `clicked_at` | TIMESTAMPTZ | When customer clicked the link |
| `created_at` | TIMESTAMPTZ | When request was sent |

#### `private_feedback`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Feedback ID |
| `business_id` | UUID (FK → businesses) | Parent business |
| `request_id` | UUID (FK → review_requests) | Associated review request (optional) |
| `rating` | INTEGER | Star rating (1-3, since 4-5 go to Google) |
| `feedback` | TEXT | Customer's private feedback text |
| `created_at` | TIMESTAMPTZ | When feedback was submitted |

---

## 7. Authentication System

### Overview

Authentication is handled by **Supabase Auth** with support for:
- **Email/Password** — Standard login
- **Google OAuth** — Used for both login and Google Business Profile connection

### Client Files

#### `src/lib/supabase/client.ts` — Browser Client
```typescript
// Creates a Supabase client for use in Client Components ("use client")
// Uses createBrowserClient from @supabase/ssr
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
```

#### `src/lib/supabase/server.ts` — Server Client
```typescript
// Creates a Supabase client for use in Server Components & API routes
// Uses createServerClient from @supabase/ssr with cookie handling
export async function createClient() { ... }
```

#### `src/lib/supabase/admin.ts` — Admin Client
```typescript
// Creates a Supabase admin client using the SERVICE_ROLE_KEY
// Bypasses RLS policies — used for system operations
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}
```

### Auth Pages

#### Login Page — `src/app/(auth)/login/page.tsx`
- **Type**: Client Component (`"use client"`)
- **Features**:
  - Email + Password form
  - Error handling with toast notifications
  - Loading state with spinner
  - Link to forgot password
  - Link to signup
  - Handles `?error=account_not_created` param from onboarding cancel
  - On success: redirects to `dashboard.{rootDomain}`

#### Signup Page — `src/app/(auth)/signup/page.tsx`
- **Type**: Client Component
- **Features**: Email + Password + Name registration form

#### Forgot Password — `src/app/(auth)/forgot-password/page.tsx`
- **Type**: Client Component
- **Features**: Email-based password reset flow via Supabase

### Auth Callback — `src/app/api/auth/callback/route.ts`

This is the **most complex API route** in the application. It handles the OAuth callback flow:

**For NEW users:**
1. Exchange auth code for session
2. Create `users` record
3. Create default `organizations` record (named `"{Name}'s Restaurant"`)
4. Create default `businesses` record
5. Create `organization_members` record (role: "owner")
6. Log `user.signed_up` event
7. Redirect to `/onboarding`

**For EXISTING users signing in via Google:**
1. **Robust Token Extraction**: Checks both standard session AND `identities` array for tokens (fixes "No refresh token" bugs).
2. Find user's business via `organization_members → organizations → businesses`
3. If `review_platforms` record exists for Google → update tokens (preserving refresh token if not provided)
4. If no platform record → insert new Google platform
5. Redirect to dashboard

**Critical Fixes Implemented:**
- **Wildcard Cookies**: Auth cookies are set with `domain: .zyene.in` to allow sharing between `auth.` and `dashboard.` subdomains.
- **Offline Access**: Google OAuth requests include `access_type: offline` and `prompt: consent` to guarantee a Refresh Token.

---

## 8. Middleware — Subdomain & Path Routing

**File**: `src/middleware.ts` (129 lines)

The middleware is the routing brain of the application. It runs on every request (except static files) and handles:

### Session Management
- Creates a Supabase server client on every request
- Sets cookies with `domain: 'localhost'` to allow session sharing between subdomains
- Refreshes auth tokens automatically

### Routing Logic

```
Request arrives at middleware
│
├── PATH starts with /api → Pass through (API routes handle their own auth)
├── PATH contains "." → Pass through (static file)
│
├── HOST = login.{rootDomain}
│   ├── User logged in + path = "/" → Redirect to dashboard
│   ├── Path = "/" → Rewrite to /login
│   └── Other paths → Pass through (signup, forgot-password)
│
├── HOST = dashboard.{rootDomain}
│   ├── User NOT logged in → Redirect to login
│   ├── Path = "/" → Rewrite to /dashboard
│   └── Other paths → Pass through
│
└── HOST = {rootDomain} (localhost fallback)
    ├── Path starts with /dashboard + NOT logged in → Redirect to /login
    ├── Path = /login or / + logged in → Redirect to /dashboard
    └── Other → Pass through
```

### Matcher Configuration
```typescript
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
```

---

## 9. Marketing Site

**File**: `src/app/(marketing)/page.tsx`

A 322-line marketing page served at the root domain (`localhost:3000`) with 6 sections:

1. **Hero Section**: Large heading ("Transform Your Restaurant's Online Reputation"), tagline, two CTAs ("Start Free Trial", "Watch Demo")
2. **Problem Section**: 3-column grid highlighting pain points restaurants face with reviews
3. **Features Section**: 6-card grid showcasing core features (AI Analysis, Smart Replies, Review Requests, SMS Alerts, Analytics, Team Management) with Lucide icons
4. **How It Works Section**: 3-step visual flow (Connect Google → AI Analyzes → Stay On Top)
5. **Pricing Section**: 3 pricing cards:
   - **Free** ($0/mo) — 1 location, 10 requests/mo, email alerts only
   - **Starter** ($39/mo) — 1 location, 100 requests/mo, 30 AI replies/mo, SMS + email
   - **Growth** ($79/mo) — 3 locations, unlimited requests, unlimited AI replies, SMS + email, priority support
6. **CTA Footer**: Final call-to-action with signup button

---

## 10. Onboarding Flow

**Purpose**: Ensures every user has a Google Business Profile connected before accessing the dashboard.

### Onboarding Page — `src/app/(onboarding)/onboarding/page.tsx`
- **Type**: Client Component
- **UI**: Centered card with icon, title, description
- **Actions**:
  - **"Connect Google Business Profile"** button:
    - Triggers `supabase.auth.signInWithOAuth({ provider: 'google' })`
    - Requests scope: `https://www.googleapis.com/auth/business.manage`
    - Redirects to dashboard on success (callback handles GBP linking)
  - **"Cancel & Sign Out"** button:
    - Signs user out
    - Redirects to login with `?error=account_not_created`

### Enforcement
The dashboard layout (`(dashboard)/layout.tsx`) checks for GBP connection on every dashboard page load:
```typescript
const hasGoogleBusinessProfile = organizations.some(org =>
    org.businesses?.some(business =>
        business.review_platforms?.some(platform =>
            platform.platform === 'google'
        )
    )
);

if (!hasGoogleBusinessProfile) {
    redirect("/onboarding");
}
```

---

## 11. Dashboard

### Dashboard Layout — `src/app/(dashboard)/layout.tsx`

**Type**: Server Component (async)

**Features**:
1. **Auth Guard**: Redirects unauthenticated users to login
2. **GBP Guard**: Redirects users without Google Business Profile to onboarding
3. **Data Fetching**: Loads organizations with nested businesses and review platforms
4. **Layout Structure**:
   - `<SidebarProvider>` wrapping everything
   - `<AppSidebar />` — Left navigation panel
   - Header with `<BusinessSwitcher>` and `<UserNav>`
   - `<main>` content area with light gray background

### Dashboard Home — `src/app/(dashboard)/dashboard/page.tsx`

**Type**: Server Component (async)

**Sections**:
1. **Header**: Page title + last synced timestamp + Sync button
2. **Stats Cards** (4-column grid):
   - Total Reviews (from `business.total_reviews`)
   - Average Rating (from `business.average_rating`)
   - Response Rate (placeholder: 0%)
   - Pending Reviews (placeholder: 0)
3. **Recent Reviews Card**: Shows connection status and sync prompts
4. **Needs Attention Card**: Placeholder for items needing action

### Sidebar Navigation — `src/components/dashboard/app-sidebar.tsx`

**Type**: Client Component

**Menu Items**:
| Icon | Title | URL |
|---|---|---|
| Home | Dashboard | `/dashboard` |
| MessageSquare | Reviews | `/reviews` |
| Send | Review Requests | `/requests` |
| BarChart3 | Analytics | `/analytics` |
| Plug | Integrations | `/integrations` |
| Settings | Settings | `/settings` |

**Footer**: Settings link (`/settings`)

**Design**: Dark theme sidebar with collapsible behavior, "Z" logo badge, version number, active state highlighting.

### Business Switcher — `src/components/dashboard/business-switcher.tsx`
- Popover-based dropdown to switch between businesses/organizations
- Shows current business name
- Lists all organizations and their businesses

### User Nav — `src/components/dashboard/user-nav.tsx`
- User avatar dropdown menu
- Shows user name and email
- Sign out action (clears session, redirects to login)

### Sync Button — `src/components/dashboard/sync-button.tsx`
- Triggers `/api/sync/google` POST request
- Loading state with spinner
- Toast notifications for success/failure

### Google Connect Button — `src/components/dashboard/google-connect-button.tsx`
- Shows "Connected" (green) or "Connect Google" state
- Triggers Google OAuth flow when not connected

---

## 12. Reviews Inbox

### Reviews Page — `src/app/(dashboard)/reviews/page.tsx`

**Type**: Server Component (async)

**Features**:
1. **Auth & Business Resolution**: Gets user → organization → business chain
2. **Filtering**: Supports URL-based filters:
   - `?status=all|needs_response|responded|ignored`
   - `?rating=all|1|2|3|4|5`
   - `?sort=newest|oldest|lowest|highest`
3. **Pagination**: 20 reviews per page, URL-based (`?page=1`)
4. **Empty State**: Shows contextual message based on filters
5. **Layout**: Header with review count badge, filter bar, review cards grid, pagination controls

### Reviews Filters — `src/components/reviews/reviews-filters.tsx`

**Type**: Client Component

- Three filter dropdowns: Status, Rating, Sort
- Uses `useSearchParams` and `useRouter` for URL-based state
- Resets to page 1 when filters change

### Review Card — `src/components/reviews/review-card.tsx`

**Type**: Client Component (277 lines — the largest component)

**Interface**:
```typescript
interface Review {
    id: string;
    author_name: string;
    rating: number;
    content: string;
    published_at: string;
    response_status: 'pending' | 'responded' | 'ignored';
    response_text?: string;
    responded_at?: string;
    platform: string;
    sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    urgency_score?: number;
    themes?: string[];
}
```

**Features**:
1. **Visual Star Rating**: Filled/empty stars with color
2. **Status Badge**: Color-coded (pending=yellow, responded=green, ignored=gray)
3. **Sentiment Badge**: Color-coded AI sentiment indicator
4. **Urgency Badge**: Shows urgency score with gradient coloring (red for high)
5. **Theme Pills**: Small tags showing review topics (food_quality, service_speed, etc.)
6. **Inline Reply Form**:
   - Expandable textarea
   - Submit → `POST /api/reviews/{id}/reply`
   - Optimistic UI update with `router.refresh()`
   - Toast notifications
7. **AI Suggest Reply Button**:
   - Calls `POST /api/ai/suggest-reply`
   - Displays up to 2 reply suggestions (professional + warm)
   - Click a suggestion → populates reply textarea
8. **Existing Reply Display**: Shows the business's reply if already responded
9. **Dropdown Menu**: Additional actions (future expansion)
10. **Relative Timestamps**: "2 hours ago" format via `date-fns`

---

## 13. Review Requests & Public Review Flow

This feature enables businesses to proactively request reviews from customers via SMS. The flow implements a **rating-gated strategy**: customers who rate 4-5★ are redirected to Google to leave a public review, while 1-3★ ratings capture private feedback that stays internal.

### Send Review Request — `POST /api/requests/send`

**Pipeline**:
1. **Plan Limit Check**: Calls `checkLimit("review_requests")` → returns `{ allowed, current, limit }` based on plan
2. **Frequency Cap**: Checks `customer_contacts.last_request_sent_at` — prevents sending if customer was contacted within the configured frequency period
3. **Customer Contact Upsert**: Creates/updates `customer_contacts` record with name, phone, business_id
4. **SMS Delivery**: Sends SMS via Twilio with a link to `/r/{business_slug}?ref={request_id}`
5. **Request Tracking**: Inserts `review_requests` record with `status: "sent"`, Twilio SID

### Public Review Page — `src/app/r/[slug]/`

#### Server Page (`page.tsx`)
- **Type**: Server Component
- Looks up business by `slug` from URL
- Tracks click event: updates `review_requests.clicked_at` and `status: "clicked"` when `?ref` is present
- Fetches the business's Google `new_review_url` from `review_platforms` if available
- Passes `businessId`, `requestId`, and `googleUrl` to the client `PublicReviewFlow` component
- **No auth required** — this page is publicly accessible

#### Review Flow (`review-flow.tsx`)
- **Type**: Client Component
- **Step 1**: Customer selects a star rating (1-5 interactive stars)
- **Step 2** (conditional):
  - **4-5 Stars**: Shows "Thank you!" message and redirects to the business's Google review URL
  - **1-3 Stars**: Shows a feedback textarea for private feedback
- **On Private Feedback Submit**:
  - Inserts into `private_feedback` table (rating + feedback text)
  - Updates `review_requests.status` to `"reviewed"` if associated with a request
  - Shows a thank-you confirmation

### Requests Dashboard — `src/app/(dashboard)/requests/page.tsx`

**Type**: Server Component (async)

**Sections**:
1. **Stats Cards** (4-column grid):
   - Total Sent (count of `review_requests`)
   - Delivery Rate (`delivered / sent * 100`)
   - Click Rate (`clicked / delivered * 100`)
   - Review Rate (`reviewed / clicked * 100`)
2. **Send Request Button**: Opens `SendRequestDialog`
3. **Requests Table**: Paginated table showing all sent requests with:
   - Contact name, phone, status badge, sent date, click tracking
   - Status color coding: sent=blue, delivered=green, clicked=yellow, reviewed=purple

### Send Request Dialog — `src/app/(dashboard)/requests/send-request-dialog.tsx`

**Type**: Client Component

- **Form Library**: React Hook Form + Zod validation
- **Fields**:
  - Customer name (optional)
  - Phone number (required, with country code validation)
  - Channel selector: SMS (active) | Email (disabled with "Coming soon" tooltip)
  - Schedule for Later toggle (disabled for MVP — always sends immediately)
- **Submit**: POSTs to `/api/requests/send`
- **Plan Limit Display**: Shows current usage vs. plan limit

---

## 14. Google Business Profile Integration

### API Wrapper — `src/lib/google/business-profile.ts`

**TypeScript Interfaces**:
- `GoogleTokenResponse` — OAuth token refresh response
- `GoogleAccount` — GBP account (name, type, verification state)
- `GoogleLocation` — Business location (name, title, store code)
- `GoogleReview` — Review with reviewer, rating, comment, reply

**Google API Endpoints Used**:
| Function | Google API | URL |
|---|---|---|
| `refreshGoogleToken()` | OAuth2 | `https://oauth2.googleapis.com/token` |
| `listAccounts()` | My Business Account Management v1 | `https://mybusinessaccountmanagement.googleapis.com/v1/accounts` |
| `listLocations()` | My Business Business Information v1 | `https://mybusinessbusinessinformation.googleapis.com/v1/{accountName}/locations` |
| `listReviews()` | My Business v4 | `https://mybusiness.googleapis.com/v4/accounts/{id}/locations/{id}/reviews` |
| `replyToReview()` | My Business v4 | `https://mybusiness.googleapis.com/v4/.../reviews/{id}/reply` (PUT) |

### Sync Service — `src/lib/google/sync-service.ts`

**Two exported functions**:

#### `getValidGoogleToken(platformId: string)`
1. Fetch platform record from DB
2. Check if access token is expired (5-minute buffer)
3. If expired: refresh using `refreshGoogleToken()` and update DB
4. Return valid access token + platform data

#### `syncGoogleReviewsForPlatform(platformId: string)`
Complete sync pipeline:
1. **Get Valid Token** → `getValidGoogleToken()`
2. **Fetch from Google**:
   - List accounts → get first account
   - List locations (or use saved `external_id`) → get location ID
   - List reviews for that location
3. **Upsert to DB**: For each review:
   - Map star rating string → number (FIVE→5, FOUR→4, etc.)
   - Upsert using `(business_id, platform, external_id)` conflict key
   - Track response status from Google reply data
4. **AI Analysis**: For new reviews without sentiment → `analyzeReview()`
5. **SMS Alert**: For urgent reviews after analysis → `sendReviewAlert()`
6. **Update Stats**: Recalculate total reviews and average rating for platform and business

### API Routes

#### `POST /api/sync/google` — Manual Sync
- Authenticates user
- Finds their Google platform connection
- Calls `syncGoogleReviewsForPlatform()`
- Returns JSON result

#### `GET /api/cron/sync-reviews` — Scheduled Sync
- Designed for Vercel Cron or external scheduler
- Syncs all active Google platforms across all users

#### `POST /api/reviews/[id]/reply` — Reply to Review
1. Get review from DB
2. Get platform and refresh tokens via `getValidGoogleToken()`
3. Call `replyToReview()` on Google API
4. Update review record: `response_status = "responded"`, save reply text and timestamp

---

## 15. AI Features (Anthropic Claude)

### Client — `src/lib/ai/client.ts`
```typescript
import Anthropic from '@anthropic-ai/sdk';
export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

### Prompts — `src/lib/ai/prompts.ts`

#### `SENTIMENT_PROMPT`
Analyzes a review and returns JSON:
```json
{
    "sentiment": "positive | negative | neutral | mixed",
    "urgency": 1-10,
    "themes": ["food_quality", "service_speed", "staff_behavior", ...],
    "summary": "One sentence summary"
}
```
Urgency considers: star rating, emotional intensity, health/safety mentions, profanity, viral potential.

Available themes: `food_quality`, `service_speed`, `staff_behavior`, `cleanliness`, `pricing`, `ambiance`, `delivery`, `wait_time`, `portion_size`, `parking`, `noise`, `other`.

#### `REPLY_PROMPT`
Generates 2 reply options as the business owner:
```json
{
    "replies": [
        {"tone": "professional", "text": "..."},
        {"tone": "warm_friendly", "text": "..."}
    ]
}
```
Rules: genuine (not corporate), reference specifics, apologize for negatives, thank for positives, under 120 words, never argue.

### Analysis Function — `src/lib/ai/analysis.ts`

`analyzeReview(review)`:
1. Calls Claude (`claude-3-haiku-20240307`) with the `SENTIMENT_PROMPT`
2. Extracts JSON from response (handles markdown wrapping)
3. Parses result and updates the review record in DB with:
   - `sentiment`
   - `urgency_score`
   - `themes`
   - `ai_summary`
4. Returns the parsed result (used for alert triggering)

### API Endpoints

#### `POST /api/ai/analyze` — On-Demand Analysis
- Body: `{ reviewId: string }`
- Fetches review from DB, runs `analyzeReview()`, returns result

#### `POST /api/ai/suggest-reply` — Reply Suggestions
- Body: `{ reviewId: string }`
- Fetches review + business name
- Calls Claude with `REPLY_PROMPT`
- Returns array of `{ tone, text }` suggestions

---

## 16. Stripe Billing & Subscriptions

The application uses **Stripe** for subscription billing with three tiers.

### Plan Definitions — `src/lib/stripe/plans.ts`

| Plan | Price | Review Requests | Team Members | AI Replies | Analytics |
|---|---|---|---|---|---|
| **Free** | $0/mo | 10/month | 1 | 5/month | Basic |
| **Starter** | $39/mo | 100/month | 3 | 50/month | Advanced |
| **Growth** | $79/mo | Unlimited | 10 | Unlimited | Full |

Each plan has a `stripe_price_id` that maps to a Stripe Price object. The `PLANS` export is a typed array of `Plan` objects used throughout the UI.

### Usage Enforcement — `src/lib/stripe/check-limits.ts`

`checkLimit(limitType: string, organizationId: string)`:
1. Fetches the organization's `plan_id` from the database
2. Looks up the plan's limits from `PLANS` configuration
3. Counts current month's usage from the relevant table (e.g., `review_requests`, `organization_members`)
4. Returns `{ allowed: boolean, current: number, limit: number }`
5. Used by `api/requests/send`, `api/team/invite`, and `api/ai/suggest-reply`

### Stripe Client — `src/lib/stripe/client.ts`
Initializes the Stripe SDK with `STRIPE_SECRET_KEY`.

### API Routes

#### `POST /api/billing/checkout`
- Creates a Stripe Checkout Session for plan upgrade
- Links to organization's `stripe_customer_id` (creates one if not exists)
- Sets `success_url` and `cancel_url` back to billing page
- Returns the session URL for client redirect

#### `POST /api/billing/portal`
- Creates a Stripe Customer Portal session
- Allows users to manage their subscription, update payment methods, view invoices
- Returns the portal URL for client redirect

#### `POST /api/webhooks/stripe`
- **Signature Verification**: Uses `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- **Handled Events**:
  - `checkout.session.completed` — Updates `organizations.plan_id`, `stripe_subscription_id`, `stripe_customer_id`
  - `customer.subscription.updated` — Syncs plan changes (upgrades/downgrades)
  - `customer.subscription.deleted` — Resets organization to `"free"` plan
  - `invoice.payment_failed` — Logs payment failure (future: notify user)

### Billing UI — `src/components/settings/billing-client.tsx`

**Type**: Client Component (370 lines)

**Sections**:
1. **Current Plan Card**: Displays active plan name, price, and status badge
2. **Usage Stats**: Progress bars showing current usage vs. plan limits for:
   - Review Requests (x / limit)
   - Team Members (x / limit)
   - AI Replies (x / limit)
3. **Plan Cards Grid**: All three plans displayed with feature checklists, price, and:
   - Current plan → "Current Plan" badge
   - Upgrade options → "Upgrade" button → calls `POST /api/billing/checkout`
4. **Manage Subscription Button**: Opens Stripe Customer Portal via `POST /api/billing/portal`

---

## 17. Team Management

Team management allows organization owners and admins to invite new members and manage roles.

### Team Page — `src/app/(dashboard)/settings/team/page.tsx`

**Type**: Server Component (async)
- Fetches `organization_members` with joined user details
- Fetches pending `invitations` for the organization
- Passes both to `TeamTable` component
- Shows `InviteMemberDialog` for sending invites

### Team Table — `src/components/settings/team-table.tsx`

**Type**: Client Component

**Features**:
1. **Members Section**: Table showing:
   - User name, email, role (with badge color), joined date
   - Role change dropdown (Owner can change Admin/Member roles)
   - Remove member action (with confirmation)
2. **Pending Invites Section**: Table showing:
   - Email, invited role, sent date, expiry status
   - Resend invitation action
   - Cancel invitation action
3. **Role-Based Actions**: Only owners and admins see management controls

### Invite Member Dialog — `src/components/settings/invite-member-dialog.tsx`

**Type**: Client Component
- **Form**: Email + Role (Admin or Member) selector
- **Plan Limit Check**: Checks team member limit before allowing invite
- **Submit**: POSTs to `/api/team/invite`

### API Routes

#### `POST /api/team/invite`
1. Validates that inviter is owner or admin
2. Checks plan limit for team members
3. Creates `invitations` record with `status: "pending"`, `expires_at: 7 days`
4. Sends invitation email via Resend using `TeamInviteEmail` template
5. Invitation link: `{APP_URL}/signup?invitation={id}`

#### `PATCH /api/team/[id]`
- Updates `organization_members.role` for the specified member
- Only owners can change roles

#### `DELETE /api/team/[id]`
- Removes an `organization_members` record (active member) or deletes an `invitations` record (pending invite)
- Owners cannot remove themselves

### Team Invite Email — `src/lib/resend/templates/team-invite-email.ts`
- HTML email template with branded styling
- Shows inviter name, organization name, and a CTA button to accept

---

## 18. Settings Hub

The Settings area is organized with a sidebar navigation layout.

### Settings Layout — `src/app/(dashboard)/settings/layout.tsx`

**Type**: Client Component

**Sidebar Navigation Items**:
| Tab | Href |
|---|---|
| General | `/settings/general` |
| Notifications | `/settings/notifications` |
| Team | `/settings/team` |

### General Settings — `src/app/(dashboard)/settings/general/page.tsx`

**Type**: Server Component (async)

**Sub-sections** (3 cards):
1. **Business Information** (`BusinessInfoForm` — 251 lines):
   - 9 editable fields: name, phone, email, address_line1, city, state, zip, timezone (Select with 5 US timezones), category (Select: Restaurant/Cafe/Bar/Retail/Service/Other)
   - PATCHes to `/api/businesses/[id]`
2. **Review Settings** (`ReviewSettingsForm` — 203 lines):
   - `review_request_delay_minutes` — Minutes after visit before sending request (default: 120)
   - `review_request_min_amount_cents` — Minimum transaction amount (default: $15.00)
   - `review_request_frequency_cap_days` — Days between requests to same customer (default: 30)
   - `review_request_sms_enabled` — Toggle SMS review requests
   - `review_request_email_enabled` — Toggle email review requests
3. **Profile** (`ProfileForm`):
   - Edit user display name (`full_name`)
   - Disabled email display (read-only)
   - **Delete Account** button (stub — shows confirmation but not yet implemented)
   - PATCHes to `/api/users/me`

### Businesses API — `PATCH /api/businesses/[id]`
- Updates business record fields (name, slug, category, etc.)
- Ownership verification: ensures user is a member of the business's organization

### Users API — `PATCH /api/users/me`
- Updates `auth.users` metadata (`full_name`)
- Also updates `users` table record

---

## 19. Notifications System (SMS & Email)

The system provides multi-channel notifications powered by **Twilio** (SMS) and **Resend** (Email).

### SMS Integration (Twilio)
- **Library**: `twilio` SDK
- **Function**: `src/lib/twilio/send-sms.ts` handles opted-out checks
- **Triggers**: High urgency reviews (score ≥ 7) or very negative ratings (1-2 stars)
- **Opt-Out**: Webhook at `/api/webhooks/twilio` handles "STOP" replies

### Email Integration (Resend)
- **Library**: `resend` SDK
- **Templates**: React Email components in `src/lib/resend/templates/`
  - `ReviewAlertEmail`: Immediate alert for high/medium urgency reviews
  - `DailyDigestEmail`: Summary of previous day's activity
  - `WelcomeEmail`: Sent on signup
- **Daily Digest**: A Vercel Cron job (`/api/cron/daily-digest`) runs daily (13:00 UTC) to aggregate low-urgency reviews.
- **Urgency Tiers**:
  - **High (7-10) / 1-2 Stars**: SMS + Email Alert
  - **Medium (4-6)**: Email Alert
  - **Low (1-3) / Neutral**: Daily Digest Only

### Send SMS — `src/lib/twilio/send-sms.ts`

`sendSMS(to: string, body: string)`:
1. Check `sms_opt_outs` table for the phone number
2. If opted out → return `{ sent: false, reason: "opted_out" }`
3. Send message via `twilioClient.messages.create()`
4. Return `{ sent: true, sid: message.sid }`

### Review Alert Logic — `src/lib/notifications/review-alert.ts`

`sendReviewAlert(review)`:

**Trigger Criteria**: `urgency_score >= 7` OR `rating <= 2`

**Pipeline**:
1. Get business name from `businesses` table
2. Get all users in the organization via `organization_members`
3. Get their `notification_preferences` where `sms_enabled = true`
4. For each user with preferences:
   - Check user's custom urgency threshold
   - Check quiet hours (supports midnight crossover: 22:00 → 07:00)
   - If not in quiet hours → send SMS
   - SMS format:
     ```
     ⚠️ New 1★ review for Big Mike's BBQ:
     "The food was terrible and the service was slow..."
     — John Smith
     Reply: http://localhost:3000/reviews
     ```
5. Mark review as `alert_sent = true` with timestamp

### Notification Settings

#### Settings Page — `src/app/(dashboard)/settings/notifications/page.tsx`
- **Type**: Server Component
- Fetches user's `notification_preferences` from DB
- Passes as `initialPrefs` to `NotificationForm` component

#### Notification Form — `src/components/settings/notification-form.tsx`
- **Type**: Client Component
- **Form Library**: React Hook Form + Zod validation
- **Schema**:
  ```typescript
  const formSchema = z.object({
      sms_enabled: z.boolean(),
      phone_number: z.string().optional(),
      min_urgency_score: z.string(),  // String for Select compatibility
      quiet_hours_start: z.string().optional(),
      quiet_hours_end: z.string().optional(),
      email_enabled: z.boolean(),
      digest_enabled: z.boolean(),
  });
  ```
- **Fields**:
  - SMS toggle (Switch component)
  - Phone number (shown conditionally when SMS enabled)
  - Minimum urgency score (Select: 5-10 with labels: Moderate/Urgent/Critical)
  - Quiet hours start/end (time inputs, shown conditionally)
  - Email alerts toggle (Switch component)
  - Daily digest toggle (Switch component)
- **On Submit**: Converts `min_urgency_score` to integer, POSTs to `/api/settings/notifications`

#### Save API — `POST /api/settings/notifications`
- Authenticates user
- Upserts `notification_preferences` record (conflict on `user_id`)

### Twilio Webhook — `POST /api/webhooks/twilio`
- Receives incoming SMS from Twilio
- Handles opt-out/in commands:
  - `STOP` → Inserts into `sms_opt_outs`
  - `START` → Removes from `sms_opt_outs`

---

## 20. Analytics Dashboard

Located at `/analytics`, built with **Recharts**.

### Metrics Tracked
- **Volume**: Reviews per day/week/month
- **Sentiment**: Distribution of Positive/Neutral/Negative
- **Themes**: Top AI-identified themes (e.g., "Service", "Cleanliness")
- **Ratings**: Average rating trends over time

### Implementation
- **Server Actions**: Data aggregation happens on the server to reduce client payload.
- **Filtering**: URL-based date range selector (7d, 30d, 90d, 1y).

---

## 21. Integrations & Webhooks

### Google Business Profile
- **Status**: Fully implemented (Auth, Sync, Reply).
- **Offline Access**: Critical `access_type: offline` parameter ensures long-lived Refresh Tokens.

### Webhooks
- **Users**: Can generate a generic webhook URL to receive JSON payloads of new reviews.
- **Route**: `/api/webhooks/generic`

### Future Integrations
- Placeholder UI exists for POS systems (Square, Toast, Clover).

---

## 22. UI Components (shadcn/ui)

The project uses **25 shadcn/ui components**, all located in `src/components/ui/`:

| Component | File | Usage |
|---|---|---|
| Alert | `alert.tsx` | Warning/info messages |
| Avatar | `avatar.tsx` | User profile images in UserNav |
| Badge | `badge.tsx` | Status, sentiment, theme labels |
| Button | `button.tsx` | All interactive buttons (variants: default, outline, ghost, destructive) |
| Card | `card.tsx` | Dashboard stats, review cards, onboarding card |
| Checkbox | `checkbox.tsx` | Form checkboxes (review settings, filters) |
| Collapsible | `collapsible.tsx` | Collapsible sidebar sections |
| Command | `command.tsx` | Command palette (for business switcher search) |
| Dialog | `dialog.tsx` | Modal dialogs |
| Dropdown Menu | `dropdown-menu.tsx` | UserNav menu, review card actions |
| Form | `form.tsx` | React Hook Form integration (FormField, FormItem, FormLabel, etc.) |
| Input | `input.tsx` | Text inputs (email, password, phone, time) |
| Label | `label.tsx` | Form labels |
| Popover | `popover.tsx` | Business switcher dropdown |
| Select | `select.tsx` | Urgency score selector, review filters |
| Separator | `separator.tsx` | Visual dividers |
| Sheet | `sheet.tsx` | Slide-out panels |
| Sidebar | `sidebar.tsx` | Main navigation (SidebarProvider, SidebarContent, SidebarMenu, etc.) |
| Skeleton | `skeleton.tsx` | Loading placeholders |
| Sonner | `sonner.tsx` | Toast notification provider |
| Switch | `switch.tsx` | SMS toggle in notification settings |
| Table | `table.tsx` | Data tables |
| Tabs | `tabs.tsx` | Tab navigation |
| Textarea | `textarea.tsx` | Review reply input |
| Tooltip | `tooltip.tsx` | Hover tooltips |

---

## 23. Styling & Theming

### CSS Architecture — `src/app/globals.css`

- **Imports**: Tailwind CSS, `tw-animate-css`, `shadcn/tailwind.css`
- **Theme System**: CSS variables using OKLCH color space
- **Dark Mode**: Full dark mode support via `.dark` class

### Design Token Variables

**Light Mode**:
- Background: Pure white (`oklch(1 0 0)`)
- Foreground: Near black (`oklch(0.145 0 0)`)
- Primary: Dark (`oklch(0.205 0 0)`)
- Destructive: Red (`oklch(0.577 0.245 27.325)`)

**Sidebar Theme** (Always dark):
- Background: `oklch(0.205 0 0)` (dark)
- Foreground: `oklch(0.985 0 0)` (white)
- Primary accent: Blue (`oklch(0.546 0.245 262.88)`)
- Border: `oklch(0.269 0 0)` (dark gray)

### Fonts

| Font | Variable | Usage |
|---|---|---|
| **Geist Sans** | `--font-geist-sans` | Body text |
| **Geist Mono** | `--font-geist-mono` | Code/monospace |

### Key Design Decisions
- **Sidebar is always dark** regardless of light/dark mode
- **Main content area** has a light gray background (`bg-slate-50`)
- **Border radius**: 0.625rem base with calculated sm/md/lg/xl/2xl/3xl/4xl variants
- **Charts**: 5 chart colors defined for Recharts integration

---

## 24. API Routes Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/auth/callback` | Supabase | OAuth callback, user provisioning, GBP linking |
| `POST` | `/api/sync/google` | User | Trigger manual Google review sync |
| `GET` | `/api/cron/sync-reviews` | Cron | Scheduled sync for all platforms |
| `GET` | `/api/cron/daily-digest` | Cron | Daily digest email (13:00 UTC) |
| `POST` | `/api/reviews/[id]/reply` | User | Submit reply to Google review |
| `POST` | `/api/ai/analyze` | User | Run AI sentiment analysis on a review |
| `POST` | `/api/ai/suggest-reply` | User | Generate AI reply suggestions |
| `POST` | `/api/requests/send` | User | Send review request SMS to customer |
| `PATCH` | `/api/businesses/[id]` | User | Update business details |
| `PATCH` | `/api/users/me` | User | Update user profile |
| `DELETE` | `/api/users/me` | User | Delete user account (stub) |
| `POST` | `/api/billing/checkout` | User | Create Stripe checkout session |
| `POST` | `/api/billing/portal` | User | Create Stripe billing portal session |
| `POST` | `/api/team/invite` | User (Owner/Admin) | Send team invitation email |
| `PATCH` | `/api/team/[id]` | User (Owner) | Change team member role |
| `DELETE` | `/api/team/[id]` | User (Owner/Admin) | Remove member or cancel invite |
| `POST` | `/api/settings/notifications` | User | Save SMS/email notification preferences |
| `POST` | `/api/webhooks/twilio` | Twilio | Handle incoming SMS (opt-out/in) |
| `POST` | `/api/webhooks/stripe` | Stripe | Handle subscription lifecycle events |

---

## 25. Deployment & Git

### Production Deployment (Vercel)

1. **Connect Repository**: Link GitHub repo to Vercel.
2. **Environment Variables**: Copy all variables from `.env.local` to Vercel Project Settings.
3. **Domain Configuration**:
   - Add `zyene.in` (Production Root)
   - Add `www.zyene.in` -> Redirect to `zyene.in`
   - **Critical Subdomains**:
     - `auth.zyene.in` (CNAME to `cname.vercel-dns.com`)
     - `dashboard.zyene.in` (CNAME to `cname.vercel-dns.com`)
4. **Deploy**: Trigger deployment.

### DNS Verification
Ensure your DNS provider (e.g., GoDaddy, Cloudflare) has:
- **A Record**: `@` points to Vercel IP (`76.76.21.21`)
- **CNAME Record**: `www` points to `cname.vercel-dns.com`
- **CNAME Record**: `auth` points to `cname.vercel-dns.com`
- **CNAME Record**: `dashboard` points to `cname.vercel-dns.com`

### Git Workflow

Key settings:
- **Target**: ES2017
- **Module Resolution**: Bundler
- **Path Aliases**: `@/*` → `./src/*`
- **Strict Mode**: Enabled
- **JSX**: react-jsx
- **React Compiler**: babel-plugin-react-compiler enabled

---

## 26. Development Setup

### Prerequisites
- Node.js (LTS)
- pnpm 10.x
- Supabase account with project
- Google Cloud Console project with Business Profile API enabled
- Anthropic API key
- Twilio account with phone number

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/dikondaashish/Zyene_reviews.git
cd Zyene_reviews

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 4. Run the development server
pnpm dev

# 5. Open in browser
# Marketing:  http://localhost:3000
# Login:      http://localhost:3000/login (or http://login.localhost:3000)
# Dashboard:  http://localhost:3000/dashboard (or http://dashboard.localhost:3000)
```

### NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Build production bundle |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint checks |

---

## Summary

Zyene Ratings is a **full-stack, production-ready SaaS application** built over 12 development phases:

| Phase | What Was Built |
|---|---|
| **Phase 1** | Project initialization, dependencies, shadcn/ui setup |
| **Phase 2** | Database schema with RLS policies on Supabase |
| **Phase 3** | Complete authentication system with subdomain routing |
| **Phase 4** | Dashboard layout, navigation, stats cards, placeholder pages |
| **Phase 5** | Google Business Profile onboarding flow |
| **Phase 6** | Reviews inbox with filters, pagination, inline reply to Google |
| **Phase 7** | AI sentiment analysis and AI smart reply suggestions (Anthropic Claude) |
| **Phase 8** | SMS notifications for urgent reviews (Twilio) with user-configurable settings |
| **Phase 9** | Resend email integration: review alerts, daily digest, welcome email |
| **Phase 10** | Stripe billing with Free/Starter/Growth plans, usage limits, Checkout & Portal |
| **Phase 11** | Team management with invitations, role-based access, and email invites |
| **Phase 12** | Review requests via SMS with rating-gated public flow and private feedback |

The application contains **30+ pages/routes**, **40+ components**, **18 library modules**, and integrates with **6 external services** (Supabase, Google Business Profile API, Anthropic Claude, Twilio, Stripe, Resend).

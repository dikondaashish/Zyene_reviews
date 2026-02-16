# Zyene Ratings — Complete Project Documentation

> **Version**: 1.0.0  
> **Last Updated**: February 16, 2026  
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
13. [Google Business Profile Integration](#13-google-business-profile-integration)
14. [AI Features (Anthropic Claude)](#14-ai-features-anthropic-claude)
15. [SMS Notifications (Twilio)](#15-sms-notifications-twilio)
16. [UI Components (shadcn/ui)](#16-ui-components-shadcnui)
17. [Styling & Theming](#17-styling--theming)
18. [API Routes Reference](#18-api-routes-reference)
19. [Deployment & Git](#19-deployment--git)
20. [Development Setup](#20-development-setup)

---

## 1. Project Overview

**Zyene Ratings** is a SaaS application designed specifically for restaurant owners to **automate customer review management**. It connects to a business's Google Business Profile, syncs all customer reviews, performs AI-powered sentiment analysis, generates smart reply suggestions, and sends SMS alerts for urgent reviews — all from a single unified dashboard.

### Core Features

| Feature | Description |
|---|---|
| **Google Business Profile Sync** | Automatically pulls all reviews from Google and keeps them in sync |
| **AI Sentiment Analysis** | Uses Anthropic Claude to analyze sentiment, urgency, themes, and generate summaries |
| **AI Smart Replies** | Generates context-aware reply suggestions in two tones (professional & warm/friendly) |
| **Reviews Inbox** | Filterable, sortable, paginated inbox to manage and reply to reviews |
| **SMS Alerts** | Sends Twilio SMS notifications for urgent reviews (high urgency score or low ratings) |
| **Notification Settings** | User-configurable SMS preferences: phone number, urgency threshold, quiet hours |
| **Subdomain Routing** | Separate subdomains for marketing, login, and dashboard |
| **GBP Onboarding** | Guided flow requiring Google Business Profile connection before dashboard access |

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
| **Twilio** (`twilio`) | ^5.12.1 | SMS notifications |
| **Stripe** (`stripe` + `@stripe/stripe-js`) | ^20.3.1 / ^8.7.0 | Payment processing (prepared) |

### UI & State

| Technology | Version | Purpose |
|---|---|---|
| **shadcn/ui** (`shadcn`) | ^3.8.5 | Pre-built accessible UI components |
| **Radix UI** (`radix-ui`) | ^1.4.3 | Headless UI primitives underlying shadcn |
| **Lucide React** | ^0.564.0 | Icon library |
| **React Hook Form** | ^7.71.1 | Form state management |
| **Zod** | ^4.3.6 | Schema validation |
| **@hookform/resolvers** | ^5.2.2 | Connects Zod schemas to React Hook Form |
| **Sonner** | ^2.0.7 | Toast notifications |
| **date-fns** | ^4.1.0 | Date formatting utilities |
| **Recharts** | ^3.7.0 | Chart library (prepared for Analytics) |
| **TanStack React Query** | ^5.90.21 | Server-state management |
| **Zustand** | ^5.0.11 | Client-state management |
| **cmdk** | ^1.1.1 | Command palette component |
| **nanoid** | ^5.1.6 | Unique ID generation |

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
    │   │   ├── requests/page.tsx       # Review Requests (placeholder)
    │   │   ├── analytics/page.tsx      # Analytics (placeholder)
    │   │   ├── integrations/page.tsx   # Integrations (placeholder)
    │   │   ├── settings/page.tsx       # Settings hub
    │   │   └── settings/notifications/page.tsx # SMS notification settings
    │   │
    │   └── api/
    │       ├── auth/callback/route.ts             # OAuth callback & user provisioning
    │       ├── sync/google/route.ts                # Manual Google review sync trigger
    │       ├── cron/sync-reviews/route.ts          # Scheduled review sync (cron)
    │       ├── reviews/[id]/reply/route.ts         # Reply to a review via Google API
    │       ├── ai/analyze/route.ts                 # AI sentiment analysis endpoint
    │       ├── ai/suggest-reply/route.ts           # AI reply suggestion endpoint
    │       ├── settings/notifications/route.ts     # Save notification preferences
    │       └── webhooks/twilio/route.ts            # Twilio SMS opt-out/in webhook
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
    │   │   └── notification-form.tsx   # SMS notification preferences form
    │   │
    │   ├── providers/
    │   │   └── query-provider.tsx      # TanStack React Query provider
    │   │
    │   └── ui/                         # shadcn/ui components (22 components)
    │       ├── alert.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── command.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── popover.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       └── tooltip.tsx
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
    │   └── notifications/
    │       └── review-alert.ts        # sendReviewAlert() — urgent review SMS alert logic
    │
    └── hooks/
        └── (custom hooks directory)
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
         └── Dashboard (requires auth + GBP)
                ├── Dashboard Home (stats)
                ├── Reviews Inbox
                │     ├── Filter / Sort / Paginate
                │     ├── View Review Card (sentiment, urgency, themes)
                │     ├── Reply to Review → Google API
                │     └── AI Suggest Reply → Anthropic API
                ├── Review Requests (placeholder)
                ├── Analytics (placeholder)
                ├── Integrations (placeholder)
                └── Settings
                      └── Notification Preferences (SMS)
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
| `country` | TEXT | Country code |
| `timezone` | TEXT | Timezone |
| `category` | TEXT | Business category |
| `status` | TEXT | Status: "active", "inactive" |
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
| *(Prepared table for future review request campaigns)* | | |

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
1. Check if Google provider tokens are present
2. Find user's business via `organization_members → organizations → businesses`
3. If `review_platforms` record exists for Google → update tokens
4. If no platform record → insert new Google platform
5. Redirect to dashboard

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

A simple landing page served at the root domain (`localhost:3000`):
- Displays "Zyene Ratings" heading
- Tagline: "Automate your customer reviews and grow your business."
- Two CTA buttons: "Log In" and "Sign Up"
- Both link to the login subdomain

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

## 13. Google Business Profile Integration

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

## 14. AI Features (Anthropic Claude)

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

## 15. SMS Notifications (Twilio)

### Twilio Client — `src/lib/twilio/client.ts`
```typescript
import twilio from 'twilio';
export const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);
```

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
  });
  ```
- **Fields**:
  - SMS toggle (Switch component)
  - Phone number (shown conditionally when SMS enabled)
  - Minimum urgency score (Select: 5-10 with labels: Moderate/Urgent/Critical)
  - Quiet hours start/end (time inputs, shown conditionally)
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

## 16. UI Components (shadcn/ui)

The project uses **22 shadcn/ui components**, all located in `src/components/ui/`:

| Component | File | Usage |
|---|---|---|
| Alert | `alert.tsx` | Warning/info messages |
| Avatar | `avatar.tsx` | User profile images in UserNav |
| Badge | `badge.tsx` | Status, sentiment, theme labels |
| Button | `button.tsx` | All interactive buttons (variants: default, outline, ghost, destructive) |
| Card | `card.tsx` | Dashboard stats, review cards, onboarding card |
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

## 17. Styling & Theming

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

## 18. API Routes Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/auth/callback` | Supabase | OAuth callback, user provisioning, GBP linking |
| `POST` | `/api/sync/google` | User | Trigger manual Google review sync |
| `GET` | `/api/cron/sync-reviews` | Cron | Scheduled sync for all platforms |
| `POST` | `/api/reviews/[id]/reply` | User | Submit reply to Google review |
| `POST` | `/api/ai/analyze` | User | Run AI sentiment analysis on a review |
| `POST` | `/api/ai/suggest-reply` | User | Generate AI reply suggestions |
| `POST` | `/api/settings/notifications` | User | Save SMS notification preferences |
| `POST` | `/api/webhooks/twilio` | Twilio | Handle incoming SMS (opt-out/in) |

---

## 19. Deployment & Git

### Repository
- **URL**: [https://github.com/dikondaashish/Zyene_reviews.git](https://github.com/dikondaashish/Zyene_reviews.git)
- **Branch**: `main`
- **Package Manager**: pnpm 10.18.2

### Vercel Configuration — `vercel.json`
```json
{
    // Vercel-specific deployment settings
}
```

### TypeScript Configuration — `tsconfig.json`
Key settings:
- **Target**: ES2017
- **Module Resolution**: Bundler
- **Path Aliases**: `@/*` → `./src/*`
- **Strict Mode**: Enabled
- **JSX**: preserve
- **React Compiler**: babel-plugin-react-compiler enabled

---

## 20. Development Setup

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

Zyene Ratings is a **full-stack, production-ready SaaS application** built over 8 development phases:

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

The application contains **26 pages/routes**, **32 components**, **12 library modules**, and integrates with **4 external services** (Supabase, Google Business Profile API, Anthropic Claude, Twilio).

# Zyene Reviews — project deep dive and architecture

> Doc classification: core architecture reference. See `docs/INDEX.md` for full documentation map.  
> Unbuilt items: `docs/ROADMAP.md`.

## 1. System architecture

Zyene Reviews is a multi-tenant Next.js app with Supabase RLS, event-driven background jobs, and Redis-backed rate limits.

### Core stack
* **Framework**: [Next.js 16](https://nextjs.org/) (App Router) with TypeScript.
* **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL) with Row Level Security (RLS) for tenant isolation.
* **Background Jobs**: [Inngest](https://www.inngest.com/) for event-driven workflows (review sync, message scheduling).
* **Caching & Rate Limiting**: [Upstash Redis](https://upstash.com/) for middleware checks and metadata caching.
* **Observability**: [Sentry](https://sentry.io/) for error tracking and performance monitoring.
* **AI**: Google GenAI (`@google/genai`) via `src/domains/ai/`.
* **Styling**: Tailwind CSS + Shadcn UI. Design tokens: `docs/DESIGN.md` / `src/app/globals.css`.

---

## 2. Domain model and schema

Supports multi-location businesses and agencies. Primary location model is **`businesses`** (one row per location).

### Core identity hierarchy
* **Organizations (`organizations`)**: Primary tenant. Owns billing (Stripe), white-label settings, and limits.
* **Businesses (`businesses`)**: Individual locations. Owns reviews, integrations, and business settings.
* **Users (`users`) & Members (`organization_members`)**: Linked to Supabase Auth. Roles: `owner`, `admin`, `manager`, `member`, `viewer`.

### Reputation and logic tables
* **Reviews (`reviews`)**: Unified storage for Google, Meta, and Yelp. Includes AI fields: `sentiment`, `urgency_score`, `themes`.
* **Private Feedback (`private_feedback`)**: Negative Feedback Shield storage for low-rated feedback kept off public platforms.
* **Review Platforms (`review_platforms`)**: Connection state (tokens, sync status, location IDs).

### Campaign and CRM tables
* **Campaigns (`campaigns`)**: Always-on or one-time request engines. SMS, email, or both.
* **Review Requests (`review_requests`)**: Message logs: `queued` -> `sent` -> `delivered` -> `opened` -> `clicked` -> `review_left`.
* **Customers (`customers`)**: CRM contacts and `opt_outs`.

### Analytics and local SEO
* **Google Performance (`google_performance_metrics`)**: Daily GBP actions (calls, website clicks, directions, bookings).
* **Search Keywords (`google_search_keyword_monthly`)**: Monthly high-impression search terms for the listing.

---

## 3. Reputation intelligence

### AI review analysis

Incoming reviews run through a pipeline that extracts:
1. **Sentiment**: Positive, Neutral, Negative, or Mixed.
2. **Urgency score**: 1–10 from frustration or high-value feedback signals.
3. **Themes**: Tags such as Customer Service, Pricing, Cleanliness.
4. **Draft replies**: Context-aware response drafts from review text.

### Negative Feedback Shield

* Customers land on a selection page first (`/r/[slug]`).
* **High ratings (4–5 stars)**: Routed to public platforms (Google, Yelp).
* **Low ratings (1–3 stars)**: Routed to an internal private feedback form.
* Managers are alerted via the notification system to resolve privately.

---

## 4. Multi-channel campaigns

### Delivery channels
* **SMS**: Twilio.
* **Email**: Resend (HTML templates).
* **QR codes**: Dynamic QR generation for in-store placement (physical order fulfillment is Coming Soon).

### Automation triggers (shipped)
* **Manual batch**: CSV/Excel uploads (`manual_batch`).
* **Scheduled**: Time-based sends (`scheduled`).
* **Follow-up**: Optional single follow-up worker (not multi-step drip).

### Automation triggers (Coming Soon / Planned)
* **POS payment**: Square, Clover, Toast — placeholder UI; `pos_payment` locked in campaign builder.
* **Multi-step drip**: See `docs/ROADMAP.md`.

### Developer automation (shipped, limited)
* **REST API** (`api/v1/*`) and **generic webhooks** for external CRM/automation tools.
* **Zapier**: Compatible via API key + webhooks today. Marketplace app listing is Planned.

---

## 5. Integrations

| Platform | Status | Purpose |
| :--- | :--- | :--- |
| **Google GBP** | Live | Review sync, performance metrics, Q&A, listing helpers. |
| **Meta (FB)** | Live | Review import and replies. |
| **Yelp** | Live (API-capped) | Sync/monitoring; recent-review depth limited by Yelp API. |
| **Stripe** | Live | Subscriptions, billing, entitlements. **Not** Stripe Connect marketplace. |
| **Twilio / Resend** | Live | SMS and email. |
| **Inngest** | Live | Background sync, campaigns, digests, growth mail. |
| **Upstash** | Live | Rate limiting and session metadata. |
| **Developer API / webhooks** | Live | `api/v1/*`, generic inbound webhooks. |
| **Zapier marketplace app** | Planned | Listing not shipped. |
| **POS (Square / Clover / Toast)** | Coming Soon | Placeholder cards only. |
| **TripAdvisor** | Coming Soon | Placeholder card only. |

---

## 6. Security, multi-tenancy, performance

* **RLS**: Queries scoped via `get_user_org_ids()` so tenants cannot read each other's data.
* **Runtime**: App routes use the default Node/Fluid Compute runtime. There is no `runtime = 'edge'` on tracking/review routes today.
* **Atomic counter RPCs**: High-concurrency stats (e.g. `total_sent`) use Postgres functions to avoid race conditions.

---

## 7. Product outcomes

1. **Local SEO**: Daily Google metrics and keywords support Map Pack ranking work.
2. **Reputation guardrail**: Private feedback reduces public 1-star impact.
3. **Ops efficiency**: Automated replies and scheduled/manual campaigns reduce manual review-request work. POS auto-triggers are Planned.

---
Technical source of truth for the Zyene Reviews platform (implementation). For unbuilt work, see `docs/ROADMAP.md`.

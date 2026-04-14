# Zyene Reviews - Comprehensive Project Deep Dive & Technical Architecture

> Doc classification: core architecture reference. See `docs/INDEX.md` for full documentation map.

## 1. System Architecture Overview
Zyene Reviews is built using a modern, high-performance tech stack designed for scalability, multi-tenancy, and extreme reliability.

### Core Stack
*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router) utilizing TypeScript for end-to-end type safety.
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL) with Row Level Security (RLS) for multi-tenant isolation.
*   **Background Jobs**: [Inngest](https://www.inngest.com/) for reliable, event-driven asynchronous workflows (review syncing, message scheduling).
*   **Caching & Rate Limiting**: [Upstash Redis](https://upstash.com/) for low-latency middleware checks and metadata caching.
*   **Observability**: [Sentry](https://sentry.io/) for full-stack error tracking and performance monitoring.
*   **Styling**: Tailwind CSS + Shadcn UI for a premium, custom-branded design system.

---

## 2. Domain Data Model & Database Schema
The database is structured to support complex multi-location businesses and marketing agencies.

### 🏛️ Core Identity Hierarchy
*   **Organizations (`organizations`)**: The primary tenant. Owns billing (Stripe), white-label settings, and limits.
*   **Businesses (`businesses`)**: Individual locations. Owns reviews, integration connections, and business-specific settings.
*   **Users (`users`) & Members (`organization_members`)**: Cross-linked to Supabase Auth. Supports roles: `owner`, `admin`, `manager`, `member`, `viewer`.

### 🛡️ Reputation & Logic Tables
*   **Reviews (`reviews`)**: Unified storage for reviews from Google, Meta, and Yelp. Includes AI-enriched fields like `sentiment`, `urgency_score`, and `themes`.
*   **Private Feedback (`private_feedback`)**: Part of the **Negative Feedback Shield**. Stores low-rated feedback internally to prevent it from reaching public platforms.
*   **Review Platforms (`review_platforms`)**: Connectivity state for API platforms (tokens, sync status, location IDs).

### 📨 Campaign & CRM Tables
*   **Campaigns (`campaigns`)**: Automated "always-on" or "one-time" request engines. Supports SMS, Email, or both.
*   **Review Requests (`review_requests`)**: Individual message logs tracking the lifecycle: `queued` -> `sent` -> `delivered` -> `opened` -> `clicked` -> `review_left`.
*   **Customers (`customers`)**: Centralized CRM for contact management and opt-out (`opt_outs`) tracking.

### 📈 Analytics & Local SEO
*   **Google Performance (`google_performance_metrics`)**: Daily time-series data for GBP actions:
    *   Business Calls
    *   Website Clicks
    *   Direction Requests
    *   Booking Actions
*   **Search Keywords (`google_search_keyword_monthly`)**: Monthly tracking of high-impression search terms that led to the business listing.

---

## 3. The Reputation Intelligence Engine
Zyene doesn't just "show" reviews; it analyzes them to provide actionable business intelligence.

### AI-Powered Review Analysis
Every incoming review is processed through an AI pipeline that extracts:
1.  **Sentiment Analysis**: Categorization as Positive, Neutral, Negative, or Mixed.
2.  **Urgency Scoring**: 1-10 scale based on customer frustration or high-value feedback.
3.  **Theme Extraction**: Automatic tagging of topics like "Customer Service", "Pricing", or "Cleanliness".
4.  **Smart Drafts**: Context-aware response drafts tailored to the specific text of the review.

### Negative Feedback Shield
A critical feature for reputation protection:
*   Users are sent to a "Selection Page" first.
*   **High ratings (4-5 stars)**: Directed to public platforms like Google or Yelp.
*   **Low ratings (1-3 stars)**: Directed to an internal private feedback form.
*   **Internal Resolution**: Managers are alerted via the **Notification System** to resolve the issue privately.

---

## 4. Multi-Channel Campaign Infrastructure
Proactive review generation is handled through a robust, multi-channel messaging system.

### Delivery Channels
*   **SMS**: Powered by **Twilio** for high-priority, high-conversion mobile alerts.
*   **Email**: Powered by **Resend** for professional, HTML-templated feedback requests.
*   **QR Codes**: Dynamic QR generators for in-store physical placement.

### Automation Triggers
*   **Manual Batch**: CSV/Excel uploads for past customers.
*   **Point-of-Sale (POS) Integrations**: Automatic triggers via Webhooks for Square, Clover, Toast, and Stripe.
*   **API / Zapier**: External triggers for custom CRM workflows.

---

## 5. Integration Ecosystem
Zyene serves as the central hub for local business digital management.

| Platform | Type | Purpose |
| :--- | :--- | :--- |
| **Google GBP** | Direct API | Review syncing, Performance metrics, Q&A management. |
| **Meta (FB)** | Graph API | Review importing and automated responding. |
| **Yelp** | Fusion API | Reputation monitoring and rating aggregation. |
| **Stripe** | Connect | Subscription lifecycle, billing, and feature entitlements. |
| **Inngest** | Event Bus | Background sync loops every 6-24 hours. |
| **Upstash** | Redis | Global rate limiting and session metadata. |

---

## 6. Security, Multi-Tenancy & Performance
*   **RLS (Row Level Security)**: Every query is scoped to `get_user_org_ids()`, ensuring one customer can never see another's data.
*   **Edge Runtime**: High-traffic API routes (like tracking pixels and review links) run on the Next.js Edge for sub-50ms latency globally.
*   **Atomic Counter RPCs**: High-concurrency stats (like `total_sent`) are handled via PostgreSQL functions to prevent race conditions.

---

## 7. Strategic Value Propositions
1.  **Local SEO Dominance**: By tracking daily Google metrics and keywords, we help businesses rank higher in the "Local Map Pack".
2.  **Reputation Guardrail**: The private feedback shield significantly mitigates 1-star review impacts.
3.  **Operational Efficiency**: Automated review responses and POS triggers save the business owner hours of manual work every week.

---
*This document is the technical "Source of Truth" for the Zyene Reviews Platform.*

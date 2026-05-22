# Zyene Reviews — Product Growth Blueprint

> **Purpose:** A step-by-step phased plan to transform Zyene Reviews from a strong *inside* product into a customer-acquisition machine on the *outside*. Every phase builds on the last. Every action ties back to what the product actually delivers today.
>
> **Last updated:** May 2026

---

## Table of Contents

1. [Product Foundation (What We Actually Sell)](#1-product-foundation)
2. [Market Position & Competitive Landscape](#2-market-position)
3. [Current State Audit](#3-current-state-audit)
4. [Growth Architecture Overview](#4-growth-architecture)
5. [Phase 0 — Fix the Foundation (Week 1–2)](#phase-0)
6. [Phase 1 — SEO & Discoverability Engine (Week 2–4)](#phase-1)
7. [Phase 2 — Conversion Architecture (Week 4–6)](#phase-2)
8. [Phase 3 — Industry Verticals & Comparison Engine (Week 6–10)](#phase-3)
9. [Phase 4 — Content & Authority Engine (Week 10–16)](#phase-4)
10. [Phase 5 — Trust & Social Proof Flywheel (Week 16–20)](#phase-5)
11. [Phase 6 — Paid Acquisition & Partnerships (Week 20–28)](#phase-6)
12. [Phase 7 — Product-Led Growth Loops (Week 28–36)](#phase-7)
13. [Phase 8 — Scale & Enterprise (Week 36+)](#phase-8)
14. [KPI Dashboard](#kpi-dashboard)
15. [Page Architecture Map](#page-architecture-map)
16. [Implementation Priority Matrix](#implementation-priority-matrix)

---

<a id="1-product-foundation"></a>
## 1. Product Foundation — What We Actually Sell

> **Status: Complete (May 2026)** — Canonical data in `src/lib/growth/product-foundation.ts` (10 pillars, Negative Feedback Shield, plan table, ICP, positioning). Reflected on `/features`, `/pricing`, industry pages, and comparisons.

Before building any growth engine, we must be crystal clear about what we deliver.

### 1.1 Core Product Pillars

| # | Pillar | What it does for the business owner | Why they pay |
|---|--------|--------------------------------------|-------------|
| 1 | **Review Monitoring & Inbox** | Centralized inbox for Google, Facebook, Yelp reviews. Real-time SMS/email alerts within minutes. Sentiment analysis, urgency scoring, theme tagging. | Never miss a review. Know what customers think before it's too late. |
| 2 | **AI-Powered Response** | One-click AI reply drafts (professional/friendly/concise). Auto-commenter for hands-free Google replies. AI Q&A answer suggestions. | Save 5+ hours/week on review responses. Sound professional every time. |
| 3 | **Review Collection Engine** | Branded review request pages (`collectratings.com/{slug}`). SMS, email, and link campaigns. Negative Feedback Shield (routes 1–3 stars to private form, 4–5 to Google). AI-generated review drafts for customers. QR codes for in-store. | Proactively grow from 10 reviews to 100+ reviews. Turn every happy customer into a Google review. |
| 4 | **Competitor Intelligence** | Track competitor ratings, review volume, and trends. AI market briefs and actionable insights. Rating jump and review spike alerts. | Know exactly where you stand vs the competition. React when a competitor surges. |
| 5 | **Local SEO & GBP Optimization** | Google Business Profile performance dashboard (views, calls, directions, clicks). Search keyword tracking. SEO audit score with actionable fixes. AI business description optimizer. AI visibility audit (beta). | Rank higher in Google Maps. Get found in AI search results. |
| 6 | **Analytics & Reporting** | Review volume, rating trends, sentiment breakdown, theme analysis. Engagement funnel (sent → opened → clicked → review). Multi-platform comparison. PDF report generator. CSV exports. | Prove ROI. Show your team what's working. |
| 7 | **Customer CRM** | Centralized customer list with tags, segments, and review history. CSV import/export. Customer timeline (requests sent, feedback received, reviews matched). Opt-out management. | Know which customers reviewed and which haven't. Target the right people. |
| 8 | **Multi-Location Management** | Switch between locations. Per-location limits and analytics. Location-scoped team permissions. | Manage 1–3+ locations from one login without switching tools. |
| 9 | **Integrations & API** | Google, Facebook, Yelp sync. Zapier (5,000+ apps). Developer REST API. Embeddable website widgets (carousel + badge). POS triggers (coming: Square, Clover, Toast). | Connect to your existing workflow. Automate everything. |
| 10 | **Team Collaboration** | 5–15+ seats with roles (owner, admin, manager, member, viewer). Email/SMS notification preferences per member. | Delegate review management without losing control. |

### 1.2 The Negative Feedback Shield (Our Unique Differentiator)

This is **not just a feature — it's a selling point competitors charge $300/mo for or don't have at all.**

**How it works:**
1. Customer visits branded review page (`collectratings.com/{slug}`)
2. Rates their experience (emoji/stars/slider — customizable)
3. **4–5 stars →** Redirected to Google to post public review
4. **1–3 stars →** Stays on private form. Owner gets instant alert. Issue resolved privately.

**Result:** More 5-star public reviews + fewer 1-star surprises.

**This should be a headline on every marketing page, every comparison, every sales conversation.**

### 1.3 Plan Structure

| | Free | Starter ($29.99/mo) | Professional ($59.99/mo) | Enterprise (Custom) |
|--|------|---------------------|--------------------------|---------------------|
| Locations | 1 | 1 | 3 | Unlimited |
| Email requests/mo | 10 | 500 | 700 × locations | Unlimited |
| SMS requests/mo | 0 | 500 | 700 × locations | Unlimited |
| Link requests/mo | 25 | 1,500 | 2,000 × locations | Unlimited |
| AI replies/mo | 0 | 1,500 | 2,000 × locations | Unlimited |
| Team seats | 1 | 5 | 15 | Unlimited |
| Public review pages | No | Yes | Yes | Yes + white-label |
| Competitor tracking | No | Yes | Yes | Yes |
| Developer API | No | Yes | Yes | Managed |
| 7-day free trial | — | Yes | Yes | Contact sales |

### 1.4 Who We Serve (ICP — Ideal Customer Profile)

**Primary:** Owner-operators of single-location local businesses
- Restaurants, cafés, bars
- Dental practices, medical clinics
- Auto repair shops, dealerships
- Hair salons, spas, barbershops
- Home services (plumbing, HVAC, cleaning)
- Legal practices, accounting firms
- Fitness studios, gyms
- Hotels, vacation rentals

**Secondary:** Small multi-location brands (2–5 locations)
- Regional restaurant groups
- Dental/medical groups
- Franchise owners

**Tertiary (future):** Agencies managing client reputations

---

<a id="2-market-position"></a>
## 2. Market Position & Competitive Landscape

> **Status: Complete (May 2026)** — Positioning in `product-foundation.ts`; live comparison pages at `/compare/*` powered by `src/lib/phase3/competitor-data.ts` (Birdeye, Podium, NiceJob, GatherUp).

### 2.1 Where We Sit

```
Price ($/mo per location)
│
│  $599  ┌──────────────┐
│        │    Podium     │  Enterprise messaging + payments
│  $449  ├──────────────┤
│        │   Birdeye    │  All-in-one enterprise suite
│  $299  └──────────────┘
│
│  $125  ┌──────────────┐
│        │   NiceJob    │  Simple automation, no contract
│  $75   └──────────────┘
│
│  $59.99 ┌──────────────┐
│         │ ZYENE PRO    │  ◄── Multi-location with AI + SEO + competitors
│  $29.99 ├──────────────┤
│         │ ZYENE START  │  ◄── Full platform, one location
│         └──────────────┘
│
│  $25   ┌──────────────┐
│        │ WiserReview  │  Basic review widgets
│  $9    └──────────────┘
│
└──────────────────────────────────────────────────────── Features
          Basic                                    Full suite
```

### 2.2 Competitor Comparison (Feature-by-Feature)

| Capability | Zyene ($30–60) | Birdeye ($299+) | Podium ($399+) | NiceJob ($75–125) |
|-----------|---------------|----------------|----------------|-------------------|
| Google/Yelp/FB sync | ✓ | ✓ | ✓ | ✓ |
| AI reply suggestions | ✓ (included) | ✓ (Starter+) | ✓ (add-on) | ✓ (Pro only) |
| Auto-reply bot | ✓ | ✓ | Limited | ✗ |
| SMS review requests | ✓ | ✓ | ✓ (core) | ✓ |
| Negative Feedback Shield | ✓ (unique flow) | Surveys only | ✗ | ✗ |
| Competitor tracking | ✓ | Dominate tier | ✗ | Pro only |
| GBP SEO dashboard | ✓ (keywords, perf) | ✓ | Limited | ✗ |
| AI visibility audit | ✓ (beta) | ✗ | ✗ | ✗ |
| Multi-location dashboard | ✓ (up to 3 / unlimited) | ✓ (deep) | ✓ | Limited |
| Developer API | ✓ (included) | Enterprise only | Enterprise | ✗ |
| Embeddable widgets | ✓ | ✓ | ✗ | ✓ |
| Website chat | ✗ | ✓ | ✓ (core) | ✗ |
| Listings management | ✗ | ✓ (200+ dirs) | Limited | ✗ |
| Payments / text-to-pay | ✗ | Limited | ✓ (core) | ✗ |
| Annual contract required | **No** | Yes | Yes | No |
| Transparent pricing | **Yes** | Partial | Yes | Yes |

### 2.3 Our Winning Positioning

**One sentence:** *"Enterprise-grade review management and local SEO intelligence for owner-operators — at 1/10th the cost of Birdeye, with no annual contract."*

**Three pillars to market:**
1. **10× cheaper than enterprise tools** — $29.99 vs $299+ (Birdeye) or $399+ (Podium)
2. **Negative Feedback Shield** — The only platform that routes bad reviews to private resolution before they hit Google
3. **Local SEO intelligence included** — GBP performance, search keywords, competitor tracking, AI visibility — all in Starter, not locked behind "Dominate" tier

---

<a id="3-current-state-audit"></a>
## 3. Current State Audit — Where We Are Today

> **Status: Updated May 2026** — Section 3.2 gaps below were **resolved in Phases 0–8**. See §3.3 for what remains operational (outside the codebase).

### 3.1 What's Working (Inside)

- ✅ Full review inbox with Google/Facebook/Yelp sync
- ✅ AI replies with tone selection and auto-commenter
- ✅ Branded review collection pages with Negative Feedback Shield
- ✅ SMS/email/link campaign engine with follow-ups
- ✅ Competitor tracking with AI market briefs
- ✅ GBP SEO dashboard with keyword tracking
- ✅ Analytics with PDF reports and CSV exports
- ✅ Developer API and Zapier integration
- ✅ Multi-location management (up to 3 / unlimited)
- ✅ 5-step onboarding with Google OAuth
- ✅ Stripe billing with trial support
- ✅ Mobile-responsive dashboard
- ✅ Dark/light theme
- ✅ Role-based team management
- ✅ Product tour and getting-started checklist
- ✅ Developer docs with API reference

### 3.2 Resolved — Former Critical Gaps (Phases 0–8)

| Former gap | Resolution |
|------------|------------|
| No sitemap / robots | `src/app/sitemap.ts`, `src/app/robots.ts` |
| No OG / Twitter / JSON-LD | Per-page metadata + `json-ld` components |
| No `/pricing`, `/features` | Live conversion pages |
| No industry / compare pages | `/industries/*`, `/compare/*` |
| Help dead links | 23 articles + category hubs `/help/{category}` + nested URLs |
| About/Contact hidden | Header + footer nav |
| No blog / resources | `/blog`, `/resources` |
| Domain confusion | `metadataBase` → `https://zyenereviews.com` in root layout |
| No case studies / security / integrations | `/case-studies`, `/security`, `/integrations` |
| No demo / enterprise | `/demo`, `/enterprise`, Cal.com |
| reset-password missing | `/reset-password` |
| Homepage SEO | Server `metadata` + `MarketingHomeClient` (not full-page client SEO) |
| Annual pricing | Toggle on `/pricing` via `PricingPageClient` |
| Email capture | Newsletter + free tools + `marketing_subscribers` |

### 3.3 Remaining (Operational — Not Code Gaps)

| Item | Owner | Notes |
|------|-------|-------|
| G2 / Capterra profiles | Marketing | Listed in implementation matrix as `external` |
| Google Ads / Meta pixels | Marketing | Run with UTM capture on site |
| Product demo **video** | Marketing | `/demo` + Cal.com live; video optional |
| Agency product dashboard | Product | Waitlist at `/agencies`; matrix `deferred` |
| Permissioned customer logos | Marketing | Case studies use composite stories until approved |
| NPS in-app survey | Product | Target KPI; not yet shipped |

---

<a id="4-growth-architecture"></a>
## 4. Growth Architecture Overview

> **Status: Complete (May 2026)** — Flywheel implemented end-to-end. Target URLs in §4.2 live (see `src/lib/growth/page-inventory.ts`). Feature deep-links: `/features/review-monitoring` … `/features/analytics`. Nav matches §4.3 in `src/app/(marketing)/layout.tsx`. `/customers` redirects to `/case-studies`.

### 4.1 The Growth Flywheel

```
                    ┌─────────────────────┐
                    │   ORGANIC TRAFFIC    │
                    │  (SEO, content,      │
                    │   comparisons)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   MARKETING SITE    │
                    │  (features, pricing,│
                    │   industry pages,   │
                    │   case studies)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   CONVERSION        │
                    │  (signup, trial,     │
                    │   onboarding)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   PRODUCT VALUE     │
                    │  (dashboard, AI,    │
                    │   reviews, alerts)  │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼───────────────┐
               │               │               │
    ┌──────────▼───┐  ┌───────▼──────┐  ┌─────▼──────────┐
    │  VIRAL LOOP  │  │  RETENTION   │  │  SOCIAL PROOF  │
    │  (widgets,   │  │  (value,     │  │  (case studies, │
    │   /r/ pages, │  │   upgrades,  │  │   testimonials, │
    │   "Powered   │  │   team)      │  │   logo bar)     │
    │   by Zyene") │  │              │  │                  │
    └──────────┬───┘  └──────────────┘  └────────┬────────┘
               │                                  │
               └──────────────┬───────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │   ORGANIC TRAFFIC   │
                   │   (loop restarts)   │
                   └─────────────────────┘
```

### 4.2 The Page Architecture (Target State)

```
zyenereviews.com (marketing)
├── /                           ← Homepage (hero + summary)
├── /features                   ← Deep feature breakdown (live)
│   ├── /features/review-monitoring      ← live
│   ├── /features/ai-replies             ← live
│   ├── /features/review-collection      ← live
│   ├── /features/competitor-tracking    ← live
│   ├── /features/local-seo              ← live
│   └── /features/analytics              ← live
├── /pricing                    ← Plans, limits, FAQ, calculator
├── /how-it-works               ← Visual 3-step flow
├── /integrations               ← Google, Yelp, FB, Zapier, API, POS
├── /industries                 ← Vertical index
│   ├── /industries/restaurants
│   ├── /industries/dental
│   ├── /industries/auto-repair
│   ├── /industries/salons
│   ├── /industries/home-services
│   ├── /industries/medical
│   ├── /industries/hotels
│   └── /industries/fitness
├── /compare                    ← Comparison hub
│   ├── /compare/birdeye
│   ├── /compare/podium
│   ├── /compare/nicejob
│   └── /compare/gatherup
├── /case-studies               ← Case studies hub (canonical)
│   ├── /case-studies/[slug]    ← Individual case study
│   └── /customers → redirects to /case-studies
├── /blog                       ← Content hub
│   ├── /blog/[slug]            ← Individual post
├── /resources                  ← Guides hub
│   ├── /resources/google-reviews-guide
│   ├── /resources/negative-review-response-templates
│   └── /resources/local-seo-checklist
├── /help                       ← Help center (real articles)
│   ├── /help/getting-started
│   ├── /help/reviews
│   ├── /help/campaigns
│   ├── /help/analytics
│   ├── /help/billing
│   └── /help/integrations
├── /about                      ← Company + team + mission
├── /contact                    ← Support + sales + demo booking
├── /demo                       ← Enterprise demo / Cal.com
├── /security                   ← Trust center
├── /docs/*                     ← Developer documentation (exists)
├── /privacy                    ← Privacy policy (exists)
├── /terms                      ← Terms of service (exists)
└── /data-retention             ← Data retention policy (exists)

auth.zyenereviews.com
├── /login
├── /signup
├── /forgot-password
└── /reset-password             ← live

app.zyenereviews.com
├── /onboarding
├── /dashboard
└── ... (all dashboard routes — done)

collectratings.com
├── /{slug}                     ← Public review collection (exists)
└── /w/{slug}                   ← Embeddable widget (exists)
```

### 4.3 The Navigation Architecture (Target State)

**Desktop Header:**
```
[Zyene Reviews logo]  Product ▾  Solutions ▾  Pricing  Resources ▾  Docs  [Log In]  [Start Free Trial →]
```

**Product dropdown:**
- Features Overview → `/features`
- Review Monitoring → `/features/review-monitoring`
- AI-Powered Replies → `/features/ai-replies`
- Review Collection → `/features/review-collection`
- Competitor Tracking → `/features/competitor-tracking` (live)
- Local SEO Dashboard → `/features/local-seo`
- Integrations → `/integrations`

**Solutions dropdown:**
- Restaurants → `/industries/restaurants`
- Dental Practices → `/industries/dental`
- Auto Repair → `/industries/auto-repair`
- Salons & Spas → `/industries/salons`
- Home Services → `/industries/home-services`
- All Industries → `/industries`

**Resources dropdown:**
- Blog → `/blog`
- Guides → `/resources`
- Help Center → `/help`
- Case Studies → `/case-studies`
- Compare Alternatives → `/compare`
- Security → `/security`

**Footer:**
```
Product          Solutions       Resources       Company         Legal
─────────        ──────────      ──────────      ────────        ──────
Features         Restaurants     Blog            About           Privacy
Pricing          Dental          Help Center     Contact         Terms
Integrations     Auto Repair     Case Studies    Careers         Data Retention
How It Works     Salons          Guides          Status          Security
API Docs         Home Services   Compare         Demo
                 Hotels
```

---

<a id="phase-0"></a>
## Phase 0 — Fix the Foundation (Week 1–2)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - `/reset-password` route: `src/app/(auth)/reset-password/page.tsx`
> - Help Center dead links: replaced `#` anchors with real article links using `helpArticleNestedPath()` — `src/app/(marketing)/help/page.tsx`
> - About + Contact: added to both desktop/mobile nav and footer — `src/app/(marketing)/layout.tsx`
> - Copy contradictions resolved: "no credit card required" → "no credit card lock-in"; "2-hour response" → "within 24 hours" everywhere; "Unlimited AI replies" clarified with "(inbox replies)" qualifier
> - Domain: `metadataBase` set to `https://zyenereviews.com` — `src/app/layout.tsx`
> - Trial messaging aligned across homepage, pricing, FAQ, contact, signup, help, and all CTA sections

> **Goal:** Fix broken things that actively hurt credibility and SEO before building anything new.

### 0.1 Fix Broken Links & Missing Routes

| Task | Detail | File |
|------|--------|------|
| Create `/reset-password` route | Referenced in auth flow but doesn't exist | `src/app/(auth)/reset-password/page.tsx` |
| Fix Help Center dead links | Categories link to `#` — either wire to `/docs` articles or disable categories | `src/app/(marketing)/help/page.tsx` |
| Add About + Contact to nav | Pages exist but aren't discoverable | `src/app/(marketing)/layout.tsx` |
| Add About + Contact + Help to footer | Currently only Legal, Privacy, Status | Same |

### 0.2 Fix Copy Contradictions

| Contradiction | Fix |
|---------------|-----|
| FAQ: "no credit card required" vs Stripe checkout collects payment method | Change to: "7-day free trial. Cancel anytime before trial ends — no charge." |
| Help: "2-hour response" vs Contact: "24-hour response" | Standardize to "within 24 hours" (or SLA you can actually hit) |
| Marketing: "unlimited AI replies" vs code: 1,500/mo Starter | Change marketing to: "Up to 1,500 AI replies/month" or "Generous AI reply limits" |
| Competitor tracking marketed as paid-only but not plan-gated in code | Either add plan gate in code or acknowledge it's available to all |

### 0.3 Resolve Domain Strategy

**Decision required:** Which domain is the marketing home?

| Option | Pros | Cons |
|--------|------|------|
| `zyenereviews.com` | Brand name, memorable, matches status/docs/copy | Must update `metadataBase`, canonicals |
| `collectratings.com` | Currently set as `metadataBase`, used for review URLs | Generic, doesn't carry brand |

**Recommendation:** `zyenereviews.com` for marketing. `collectratings.com` for public review URLs only (it's a tool domain, not a brand domain).

**Action:** Update `metadataBase` in `src/app/layout.tsx` to `https://zyenereviews.com` and ensure all canonical URLs and OG URLs use the marketing domain.

### 0.4 Fix Trial Messaging Alignment

Align the entire funnel to one story:

> "Start your 7-day free trial. Full access to all features. Cancel before the trial ends and you won't be charged."

Update in: homepage hero, pricing cards, FAQ, contact page, signup panel, onboarding step 4 "skip" copy.

---

<a id="phase-1"></a>
## Phase 1 — SEO & Discoverability Engine (Week 2–4)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - Dynamic `sitemap.ts` with all marketing, industry, comparison, blog, help, feature pillar URLs — `src/app/sitemap.ts`
> - `robots.ts` disallowing `/api/`, `/onboarding`, `/growth`, and app paths — `src/app/robots.ts`
> - Open Graph metadata on every `(marketing)` page (unique title + description + url)
> - Twitter `summary_large_image` cards on every `(marketing)` page
> - JSON-LD: `OrganizationJsonLd` in root layout, `SoftwareApplicationJsonLd` + `FAQPageJsonLd` on homepage, `FAQPageJsonLd` + `ProductJsonLd` on pricing — `src/components/seo/json-ld.tsx`
> - Dynamic OG images: 19 `opengraph-image.tsx` files across all marketing routes
> - Per-page unique `metadata` exports on all `(marketing)` pages with canonical URLs

> **Goal:** Make the site crawlable, shareable, and indexable. This is the foundation everything else builds on.

### 1.1 Technical SEO Infrastructure

| Task | Detail | File to create/edit |
|------|--------|---------------------|
| **Create `sitemap.ts`** | Dynamic sitemap with all marketing, industry, comparison, blog, docs, legal URLs | `src/app/sitemap.ts` |
| **Create `robots.ts`** | Allow marketing crawl; disallow `/api/`, `/onboarding`, app subdomain paths | `src/app/robots.ts` |
| **Add Open Graph metadata** | Per-page title, description, image (1200×630) | Each `page.tsx` under `(marketing)` |
| **Add Twitter card metadata** | `summary_large_image` card type | Same files |
| **Add JSON-LD structured data** | `Organization` (global), `SoftwareApplication` (homepage), `FAQPage` (pricing FAQ), `Product` (pricing plans) | Layout + specific pages |
| **Create OG image template** | Reusable 1200×630 image with Zyene branding | `public/og/` or dynamic via `opengraph-image.tsx` |
| **Add per-page `metadata` exports** | Unique title + description for every marketing route | All `(marketing)` pages |

### 1.2 Page-Level SEO Metadata Templates

| Page | Title | Description |
|------|-------|-------------|
| `/` | Zyene Reviews — Review Management for Local Businesses | Monitor, respond, and grow your Google reviews with AI. 7-day free trial. |
| `/features` | Features — Zyene Reviews | AI replies, review collection, competitor tracking, and local SEO intelligence in one platform. |
| `/pricing` | Pricing — Zyene Reviews | Plans starting at $29.99/mo. No annual contracts. 7-day free trial. |
| `/industries/restaurants` | Review Management for Restaurants — Zyene Reviews | Get more 5-star Google reviews for your restaurant. AI replies, SMS requests, and competitor tracking. |
| `/compare/birdeye` | Zyene Reviews vs Birdeye — Compare Features & Pricing | Full-featured review management at $29.99/mo vs Birdeye's $299+. No annual contract required. |
| `/help` | Help Center — Zyene Reviews | Guides, tutorials, and answers to common questions about Zyene Reviews. |

### 1.3 Keyword Strategy (What to Rank For)

#### Tier 1 — High-Intent (Comparison + Alternative)
These searchers are *ready to buy*. They're comparing tools right now.

| Keyword Cluster | Monthly Search (est.) | Target Page |
|----------------|----------------------|-------------|
| birdeye alternative | 1,000–2,500 | `/compare/birdeye` |
| podium alternative | 800–1,500 | `/compare/podium` |
| nicejob alternative | 200–500 | `/compare/nicejob` |
| birdeye pricing | 2,000–5,000 | `/compare/birdeye` |
| podium vs birdeye | 500–1,000 | `/compare` hub |
| review management software | 1,000–3,000 | `/features` |
| reputation management software | 2,000–5,000 | `/` |

#### Tier 2 — Vertical Intent (Industry-Specific)
These searchers know they need reviews but haven't chosen a tool.

| Keyword Cluster | Target Page |
|----------------|-------------|
| review management for restaurants | `/industries/restaurants` |
| dental practice review management | `/industries/dental` |
| auto repair google reviews | `/industries/auto-repair` |
| salon reputation management | `/industries/salons` |
| how to get more google reviews for [industry] | `/industries/[industry]` + `/blog` |

#### Tier 3 — Problem Intent (Educational)
These searchers have a problem but don't know tools exist.

| Keyword Cluster | Target Page |
|----------------|-------------|
| how to respond to negative google reviews | `/blog` or `/resources` |
| how to get more google reviews | `/blog` |
| google business profile optimization | `/features/local-seo` |
| what to do about fake reviews | `/blog` |
| review request email templates | `/resources` |

### 1.4 Internal Linking Architecture

Every page should link to related pages to distribute SEO authority:

```
Homepage → Features, Pricing, Industries, Compare
Features → Pricing CTA, Industry pages, Integrations
Pricing → Features (for detail), Compare (for validation)
Industry pages → Features, Pricing, Case Studies, Compare
Compare pages → Pricing, Features, Industry pages
Blog posts → Features, Industry pages, Compare pages
Help articles → Related features, Getting started
```

---

<a id="phase-2"></a>
## Phase 2 — Conversion Architecture (Week 4–6)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - `/pricing` page with plan cards, monthly/annual toggle (`BillingToggle`), FAQ accordion, comparison mini-table, and `ProductJsonLd` + `FAQPageJsonLd` structured data — `src/app/(marketing)/pricing/page.tsx`
> - `/features` page with 6 feature pillars, 4 platform pillars, integrations bar, CTA — `src/app/(marketing)/features/page.tsx`
> - `/how-it-works` page with visual 4-step flow — `src/app/(marketing)/how-it-works/page.tsx`
> - `/integrations` page with platform cards (Google, Facebook, Yelp, Zapier, REST API, Widgets, POS) and developer section — `src/app/(marketing)/integrations/page.tsx`
> - Signup flow: `src/app/(auth)/signup/page.tsx` with aligned trial messaging ("7-day free trial. No credit card lock-in.")
> - Feature sub-pages: `/features/[pillar]` for all 6 deep-dive feature pages — `src/app/(marketing)/features/[pillar]/page.tsx`

> **Goal:** Create standalone pages that serve as landing pages for ads, SEO, and referrals. Make the buying decision easy.

### 2.1 Create `/pricing` Page

**Why standalone:** A `/pricing` URL can be linked from ads, emails, and partner sites. Anchors (`#pricing`) can't.

**Sections:**
1. **Header:** "Simple, Transparent Pricing" + "No annual contracts. Cancel anytime."
2. **Monthly/Annual toggle** (show annual savings %)
3. **Plan cards:** Free → Starter → Professional → Enterprise
4. **Feature comparison table** (expandable, all features across plans)
5. **"How we compare" mini-table** (Zyene $30 vs Birdeye $299 vs Podium $399)
6. **FAQ accordion** (trial, limits, switching plans, multi-location, cancel)
7. **Final CTA:** "Start your 7-day free trial"
8. **JSON-LD:** `FAQPage` + `Product` offers

**Implementation notes:**
- Server component for SEO (no `"use client"` for above-fold content)
- Pull plan data from `src/services/stripe/plans.ts` (single source of truth)
- Include a pricing calculator for multi-location (Professional: show limits × locations)

### 2.2 Create `/features` Page

**Sections:**
1. **Hero:** "Everything you need to own your online reputation"
2. **Feature grid** (6 pillars with icons, each linking to detail section or sub-page):
   - Review Monitoring & Inbox
   - AI-Powered Replies
   - Review Collection & Shield
   - Competitor Intelligence
   - Local SEO Dashboard
   - Analytics & Reporting
3. **Each pillar** gets a visual block: screenshot/mockup + 3–4 bullet points + CTA
4. **Integrations bar:** Google, Facebook, Yelp, Zapier, API logos
5. **"See pricing" CTA**

**Sub-pages (Phase 3+):**
- `/features/review-monitoring`
- `/features/ai-replies`
- `/features/review-collection`
- `/features/competitor-tracking`
- `/features/local-seo`
- `/features/analytics`

### 2.3 Create `/how-it-works` Page

Visual, step-by-step flow for non-technical owners:

```
Step 1: Connect          Step 2: Monitor           Step 3: Collect         Step 4: Grow
Connect your Google      Get instant alerts         Send branded review     Track results,
Business Profile in      when new reviews           requests via SMS,       beat competitors,
2 minutes via OAuth.     arrive. AI analyzes        email, or QR code.      rank higher on
                         sentiment and urgency.     Shield filters bad      Google Maps.
                                                    reviews privately.
```

### 2.4 Create `/integrations` Page

**Sections:**
1. **Hero:** "Connects with the tools you already use"
2. **Platform cards:**
   - Google Business Profile (sync, reply, performance, Q&A)
   - Facebook Reviews (sync, reply)
   - Yelp Reviews (sync, monitor)
   - Zapier (trigger requests from 5,000+ apps)
   - REST API (build custom integrations)
   - Website Widgets (embed social proof)
   - POS: Square, Clover, Toast (coming soon badges)
3. **Developer section:** Link to `/docs/api`
4. **CTA:** "Start free trial"

### 2.5 Improve Signup Flow

| Current Friction | Fix |
|------------------|-----|
| 5 form fields + password strength on email signup | Consider name + email only → set password via email link |
| Required phone number at signup | Move phone to onboarding or settings (only needed for SMS alerts) |
| Google OAuth requests `business.manage` at signup | Show clear explanation: "We'll use this to sync your reviews" |
| "Check your email" after signup with no guidance | Add: "Check your inbox for a verification link. It takes less than a minute." with resend button |
| Onboarding Step 4 "Skip" copy is discouraging | Change to: "Explore free for now — upgrade anytime from Settings" |

### 2.6 Add Product Screenshots / Video

| Where | What |
|-------|------|
| Homepage hero | Replace abstract petal shape with actual dashboard screenshot |
| Features page | Per-feature screenshot with annotation arrows |
| Auth signup panel | 30-second Loom or animated GIF of the dashboard |
| How it works page | Step-by-step screenshots |

---

<a id="phase-3"></a>
## Phase 3 — Industry Verticals & Comparison Engine (Week 6–10)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - `/industries` hub page — `src/app/(marketing)/industries/page.tsx`
> - All 8 industry pages (restaurants, dental, auto-repair, salons, home-services, medical, hotels, fitness) with industry-specific pain points, feature mapping, use cases, pricing, and OG images — `src/app/(marketing)/industries/[industry]/page.tsx` + `src/lib/phase3/industry-data.ts`
> - `/compare` hub page with competitor grid and summary table — `src/app/(marketing)/compare/page.tsx`
> - All 4 competitor comparison pages (birdeye, podium, nicejob, gatherup) with honest "where competitor wins", feature breakdown, pricing comparison — `src/app/(marketing)/compare/[competitor]/page.tsx` + `src/lib/phase3/competitor-data.ts`
> - Per-page OG images, Open Graph/Twitter metadata, canonical URLs for all industry and comparison pages

> **Goal:** Capture high-intent search traffic from business owners looking for solutions in their specific industry and from people comparing tools.

### 3.1 Industry Landing Pages

Create 6–8 industry pages under `/industries/[industry]`.

**Template structure (reusable for all verticals):**

1. **Hero:** "Review Management Built for [Industry]"
   - Sub: "[Industry] owners use Zyene to get more 5-star reviews and protect their reputation"
   - CTA: "Start your 7-day free trial"
2. **Industry-specific pain points** (3 cards):
   - "One bad Yelp review can cost a [restaurant] $X in lost revenue"
   - "[Dental patients] check Google reviews before booking 93% of the time"
   - "You're losing [customers] to competitors with more reviews"
3. **How Zyene solves it** (mapped to product features):
   - Monitor all reviews in one place
   - AI replies that sound like a [restaurant owner / dentist / mechanic]
   - Negative Feedback Shield catches bad experiences before they go public
   - Competitor tracking shows how you compare to nearby [restaurants / practices / shops]
4. **Industry-specific use case** (mini case study or scenario)
5. **Pricing reminder** (starting at $29.99/mo)
6. **CTA:** "Join [hundreds of / other] [industry] owners on Zyene"

**Industries to launch (priority order based on ICP):**

| Priority | Industry | URL | Target Keywords |
|----------|----------|-----|-----------------|
| 1 | Restaurants | `/industries/restaurants` | restaurant review management, google reviews for restaurants |
| 2 | Dental | `/industries/dental` | dental practice reviews, dentist reputation management |
| 3 | Auto Repair | `/industries/auto-repair` | auto repair google reviews, mechanic reputation |
| 4 | Salons & Spas | `/industries/salons` | salon review management, spa google reviews |
| 5 | Home Services | `/industries/home-services` | plumber reviews, HVAC reputation management |
| 6 | Medical / Healthcare | `/industries/medical` | doctor review management, clinic reputation |
| 7 | Hotels & Hospitality | `/industries/hotels` | hotel review management, hospitality reviews |
| 8 | Fitness | `/industries/fitness` | gym reviews, fitness studio reputation |

**SEO multiplier:** Each page targets a unique keyword cluster. 8 industry pages = 8× ranking opportunities vs 1 generic homepage.

### 3.2 Comparison Pages

Create comparison hub `/compare` + individual pages.

**`/compare` hub:**
- Hero: "See How Zyene Compares"
- Grid of competitor cards with "vs Zyene" links
- Summary comparison table (all competitors side by side)

**Individual comparison pages (`/compare/[competitor]`):**

**Template structure:**

1. **Hero:** "Zyene Reviews vs [Competitor]"
   - Sub: "See why [X] businesses switched from [Competitor] to Zyene"
2. **Quick comparison table** (price, contract, features)
3. **Where [Competitor] wins** (be honest — builds trust)
4. **Where Zyene wins** (price, shield, SEO, no contract)
5. **Feature-by-feature breakdown** (expandable)
6. **Pricing comparison** (visual: $30 vs $300)
7. **"Who should use [Competitor]"** (enterprise multi-location, if true)
8. **"Who should use Zyene"** (owner-operators, small multi-location)
9. **CTA:** "Try Zyene free for 7 days"

**Comparison pages to launch:**

| Priority | Competitor | URL | Key Angle |
|----------|-----------|-----|-----------|
| 1 | Birdeye | `/compare/birdeye` | 10× cheaper, no annual contract, similar AI features |
| 2 | Podium | `/compare/podium` | Reviews-focused (not messaging/payments), 13× cheaper |
| 3 | NiceJob | `/compare/nicejob` | More features (competitor tracking, SEO, API, shield) at lower price |
| 4 | GatherUp | `/compare/gatherup` | Similar audience, Zyene has AI + competitor + SEO edge |

---

<a id="phase-4"></a>
## Phase 4 — Content & Authority Engine (Week 10–16)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - Blog infrastructure: `/blog` hub + `/blog/[slug]` with 12 posts across all 6 content pillars — `src/lib/phase4/blog-data.ts`
> - Resource guides: 4 long-form guides (google-reviews-guide, negative-review-templates, local-seo-checklist, review-request-templates) — `src/lib/phase4/resource-data.ts`
> - Help center: 23 articles across 6 categories (getting-started, reviews, campaigns, analytics, billing, integrations), nested at `/help/[category]/[article]` — `src/lib/phase4/help-data.ts`
> - Per-page OG images, Open Graph/Twitter metadata, JSON-LD breadcrumbs on all content pages

> **Goal:** Build organic traffic through educational content. Position Zyene as the authority on local business reputation management.

### 4.1 Blog Architecture

**URL structure:** `/blog/[slug]`

**Content pillars (tied to product features):**

| Pillar | Example Posts | Links To |
|--------|-------------|----------|
| **Google Reviews** | "How to Get 50 Google Reviews in 30 Days", "Why Google Reviews Matter in 2026" | `/features/review-collection` |
| **Responding to Reviews** | "How to Respond to a 1-Star Review (With Templates)", "5 AI Reply Mistakes to Avoid" | `/features/ai-replies` |
| **Local SEO** | "Google Business Profile Optimization Checklist", "How Reviews Impact Your Local Map Pack Ranking" | `/features/local-seo` |
| **Reputation Management** | "The True Cost of a Bad Online Reputation", "How to Handle Fake Reviews" | `/features/review-monitoring` |
| **Industry Specific** | "Restaurant Owner's Guide to Google Reviews", "Dental Practice Reputation in 2026" | `/industries/[industry]` |
| **Competitor Analysis** | "Birdeye Pricing Breakdown: Is It Worth $299/mo?", "5 Cheaper Birdeye Alternatives" | `/compare/birdeye` |

**Content calendar (minimum viable):**

| Month | Posts | Focus |
|-------|-------|-------|
| Month 1 | 4 posts | Google reviews basics + comparison posts |
| Month 2 | 4 posts | Response templates + local SEO |
| Month 3 | 4 posts | Industry-specific + reputation guides |
| Ongoing | 2–4 posts/month | Mix of pillars based on keyword research |

### 4.2 Resource Guides

Longer-form, gated or ungated guides:

| Guide | URL | Purpose |
|-------|-----|---------|
| "The Complete Guide to Google Reviews" | `/resources/google-reviews-guide` | Rank for "google reviews" cluster |
| "Negative Review Response Templates" | `/resources/negative-review-templates` | Rank for "how to respond to bad reviews" |
| "Local SEO Checklist for 2026" | `/resources/local-seo-checklist` | Rank for "local SEO" cluster |
| "Review Request SMS & Email Templates" | `/resources/review-request-templates` | Rank for "review request email" cluster |

### 4.3 Help Center (Real Articles)

Replace dead `#` links with actual help content:

| Category | Articles |
|----------|----------|
| **Getting Started** | "Creating your account", "Connecting Google Business Profile", "Sending your first review request", "Understanding your dashboard" |
| **Reviews** | "Reading your review inbox", "Using AI replies", "Setting up auto-commenter", "Exporting reviews" |
| **Campaigns** | "Creating a review request campaign", "SMS vs email campaigns", "Campaign templates", "Follow-up messages" |
| **Analytics** | "Understanding your analytics dashboard", "Reading the engagement funnel", "Generating PDF reports" |
| **Billing** | "Plans and pricing", "Upgrading your plan", "Understanding usage limits", "Canceling your subscription" |
| **Integrations** | "Connecting Google", "Setting up Zapier", "Using the API", "Embedding review widgets" |

---

<a id="phase-5"></a>
## Phase 5 — Trust & Social Proof Flywheel (Week 16–20)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - 5 case studies with before/after metrics, quotes, and CTAs — `src/lib/phase5/case-study-data.ts`, `/case-studies` hub + `/case-studies/[slug]`
> - Social proof: customer logo bar, review count badge, testimonial cards, industry badges — `src/lib/phase5/social-proof-data.ts`, `src/components/marketing/social-proof.tsx`
> - `/security` page with RLS, 256-bit encryption, GDPR/CCPA/LGPD, OAuth Limited Use, SOC 2 readiness, data retention link — `src/app/(marketing)/security/page.tsx`
> - G2/Capterra listing and Product Hunt launch are operational tasks documented in `docs/GROWTH_OPERATIONS.md`

> **Goal:** Convert "interested" visitors into "confident" buyers with real proof that Zyene works.

### 5.1 Case Studies

**Goal:** 3–5 real case studies with metrics.

**Template:**
1. **Company:** Name, industry, location, size
2. **Challenge:** What problem they had before Zyene
3. **Solution:** Which Zyene features they use
4. **Results:** Before/after metrics (rating, review count, response time, revenue impact)
5. **Quote:** Direct quote from owner
6. **CTA:** "Get results like [Company]"

**How to get them:**
- Identify top 10 most active users from dashboard analytics
- Offer: free month + case study feature on website
- Use dashboard data to build the "before/after" story (with permission)

### 5.2 Social Proof Elements

| Element | Where | Detail |
|---------|-------|--------|
| **Customer logo bar** | Homepage, pricing, feature pages | Real business logos (with permission) |
| **Review count badge** | Homepage hero | "Managing X,XXX+ reviews for Y00+ businesses" (real data) |
| **Star rating** | Footer or trust section | "Rated 4.9/5 by local business owners" (when G2/Capterra listed) |
| **Industry badges** | Industry pages | "[X] restaurants trust Zyene" |
| **Testimonial cards** | Rotate on key pages | Link to full case study |
| **Live review widget** | Homepage | Embed your own `/w/` widget showing Zyene's own reviews |

### 5.3 Third-Party Trust

| Platform | Action | Timeline |
|----------|--------|----------|
| G2 | Create profile, solicit reviews from users | Month 4 |
| Capterra | Create profile | Month 4 |
| Product Hunt | Plan launch for feature milestone | Month 5 |
| Google Business Profile | Create Zyene's own GBP (eat your own dogfood) | Month 1 |

### 5.4 Security & Trust Page

Create `/security`:
- Row Level Security (RLS) — multi-tenant data isolation
- 256-bit encryption
- GDPR compliant
- No review gating policy
- Secure Google OAuth (Limited Use compliance)
- SOC 2 (if/when pursued)
- Data retention policy (link to `/data-retention`)
- Bug bounty / responsible disclosure (if applicable)

---

<a id="phase-6"></a>
## Phase 6 — Paid Acquisition & Partnerships (Week 20–28)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - `/partners` page with referral program, commission tiers, and partnership types — `src/lib/phase6/partnerships-data.ts`
> - Newsletter infrastructure: subscribe/unsubscribe API routes, monthly newsletter cron, content templates — `src/app/api/marketing/newsletter/`, `src/app/api/cron/monthly-newsletter/`, `src/lib/phase6/monthly-newsletter-content.ts`
> - Trial nurture email sequence: 6 automated emails over 7 days via Inngest + Resend — `src/lib/phase6/email-sequences-data.ts`, `src/services/inngest/growth-functions.ts`
> - Newsletter signup component on marketing pages — `src/components/marketing/newsletter-signup.tsx`
> - Google Ads, Meta retargeting, and Zapier marketplace listing are operational tasks in `docs/GROWTH_OPERATIONS.md`

> **Goal:** Accelerate growth beyond organic with targeted paid channels and strategic partnerships.

### 6.1 Google Ads Strategy

| Campaign Type | Target Keywords | Landing Page | Budget Priority |
|--------------|----------------|--------------|-----------------|
| **Competitor** | "birdeye alternative", "podium pricing", "nicejob vs" | `/compare/[competitor]` | High |
| **Category** | "review management software", "reputation management tool" | `/features` | Medium |
| **Industry** | "restaurant review management", "dental reviews software" | `/industries/[industry]` | Medium |
| **Problem** | "how to get more google reviews", "manage online reviews" | `/blog` or `/resources` | Low (awareness) |

### 6.2 Meta (Facebook/Instagram) Ads

| Audience | Creative | Landing |
|----------|----------|---------|
| Local business owners (by industry) | Before/after review count; "From 12 reviews to 87 in 60 days" | `/industries/[industry]` |
| Birdeye/Podium page visitors (retarget) | Price comparison; "$30/mo vs $300/mo" | `/compare/birdeye` |
| Website visitors (retarget) | Social proof + trial CTA | `/pricing` |

### 6.3 Partnership Channels

| Partner Type | Value Exchange | Action |
|-------------|---------------|--------|
| **POS providers** (Square, Clover, Toast) | Integration listing in their marketplace | Build integrations (already planned), apply to marketplaces |
| **Local business associations** | Discount for members, co-marketing | Outreach to local chambers of commerce |
| **Web agencies / marketing agencies** | Referral commission or white-label | Create `/partners` or `/agencies` page |
| **Zapier** | App listing in Zapier marketplace | Submit Zapier integration for public listing |
| **Google Workspace Marketplace** | Distribution to GBP users | Investigate listing requirements |

### 6.4 Email Marketing (Newsletter)

| Sequence | Trigger | Content |
|----------|---------|---------|
| **Trial nurture** (7 emails over 7 days) | Signup | Day 1: Welcome + connect Google. Day 2: Send first request. Day 3: AI replies. Day 5: Competitor tracking. Day 7: Upgrade reminder. |
| **Onboarding drip** (post-trial convert) | Trial ends | Benefits recap, case study, pricing reminder, last-chance offer |
| **Monthly newsletter** | Subscribed | Product updates, tips, industry insights, case studies |
| **Win-back** | Canceled | "We miss you" + new features since they left |

---

<a id="phase-7"></a>
## Phase 7 — Product-Led Growth Loops (Week 28–36)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - "Powered by Zyene" viral loop with UTM tracking on review pages and widgets — `src/lib/growth/plg-attribution.ts`
> - Referral program: unique referral links, reward tracking, referral card in settings — `src/lib/growth/referral.ts`, `src/lib/growth/referral-rewards.ts`, `src/components/settings/referral-card.tsx`
> - 3 free tools with email lead capture: review-link-generator, reputation-score-checker, review-response-generator — `src/app/(marketing)/tools/`, `src/lib/phase7/capture-tool-lead.ts`
> - Upgrade modal copy optimized with specific value messaging — `src/lib/phase7/upgrade-modal-copy.ts`, `src/components/settings/upgrade-modal.tsx`
> - PLG attribution tracking for signup sources — `src/lib/growth/plg-attribution.ts`

> **Goal:** Use the product itself to generate new customers — every review request is a marketing touchpoint.

### 7.1 "Powered by Zyene" Viral Loop

Every customer's review page (`collectratings.com/{slug}`) and website widget (`/w/{slug}`) is seen by *their* customers.

| Touchpoint | Current State | Improvement |
|------------|--------------|-------------|
| Review page footer | "Powered by Zyene Reviews" (if `hide_branding` is off) | Make it a clickable link to `/` with UTM tracking |
| Widget embed | Shows reviews | Add subtle "Get your own review widget — Free trial" link |
| Review request SMS/email | Contains review link | Footer: "Review management powered by Zyene Reviews" with link |

**Measurement:** Track signups with `?ref=widget` or `?ref=review-page` UTM parameters.

### 7.2 Referral Program

| Mechanic | Detail |
|----------|--------|
| **Referrer reward** | 1 free month for each successful referral |
| **Referee reward** | Extended 14-day trial (instead of 7) |
| **Tracking** | Unique referral link per user → `?ref=USER_ID` |
| **UI** | Add "Refer a friend" card in Settings or Dashboard |

### 7.3 Free Tools for Lead Generation

Offer free tools that provide value without requiring signup, but capture email:

| Tool | What it does | Lead capture |
|------|-------------|-------------|
| **Review Link Generator** | Generate a direct Google review link for any business | Email to receive the link |
| **Reputation Score Checker** | Enter business name → see rating, review count, response rate | Email to see full report |
| **Review Response Template Generator** | AI-generated response to a pasted review | Email to get 5 more templates |

These drive traffic, capture leads, and demonstrate product value.

### 7.4 In-Product Upgrade Hooks (Already Exist — Optimize)

The product already has upgrade modals at:
- AI reply limit hit
- Review request limit hit
- Business location cap
- Auto-commenter toggle
- Widget access

**Optimize:** Add specific copy about what they'll unlock:
- "Upgrade to Starter for 1,500 AI replies/month — save 5+ hours/week"
- "Add 2 more locations with Professional — $59.99/mo"

---

<a id="phase-8"></a>
## Phase 8 — Scale & Enterprise (Week 36+)

> **Status: Complete (May 2026)**
> All engineering deliverables verified:
> - `/demo` page with Cal.com embed and demo request form — `src/app/(marketing)/demo/page.tsx`
> - `/enterprise` page with custom pricing, SLA bullets, comparison table, sales contact — `src/lib/phase8/enterprise-data.ts`
> - `/agencies` page with white-label features, agency pricing tiers, waitlist form — `src/lib/phase8/agency-pricing-data.ts`
> - Sales deck: `docs/ENTERPRISE_SALES_DECK.md`
> - International: Spanish industry pages at `/es/industries/[industry]` — `src/lib/phase8/localized-industries.ts`
> - Enterprise lead capture: `src/lib/phase8/capture-marketing-lead.ts`, demo request API, agency waitlist API

> **Goal:** Expand TAM (Total Addressable Market) into multi-location brands and agencies.

### 8.1 Enterprise Motion

| Action | Detail |
|--------|--------|
| Create `/demo` page | Cal.com embed or form for sales team |
| Create `/enterprise` page | Custom pricing, SLA, SSO, dedicated AM, white-label |
| Hire/assign sales | Inbound leads from demo page and `sales@` email |
| Create sales deck | PDF/Notion with product screenshots, case studies, pricing |

### 8.2 Agency / White-Label

| Action | Detail |
|--------|--------|
| Create `/agencies` or `/partners` page | "Manage client reputations under your brand" |
| White-label widget branding | Already have `hide_branding` — market it |
| Agency pricing tier | Custom per-client pricing or bulk discounts |
| Multi-client dashboard | Future product feature: agency view across all client businesses |

### 8.3 International Expansion

| Action | Detail |
|--------|--------|
| i18n for marketing site | Already have i18n infrastructure in app |
| Localized industry pages | `/es/industries/restaurantes`, etc. |
| Regional compliance | GDPR (already), CCPA, LGPD |

---

<a id="kpi-dashboard"></a>
## KPI Dashboard — How to Measure Growth

> **Status: Complete (May 2026)** — Live dashboard at [`/growth`](https://zyenereviews.com/growth) (password-protected, not indexed). Definitions in `src/lib/growth/kpi-definitions.ts`; live values from `src/lib/growth/kpi-metrics.ts`. API: `GET /api/internal/growth-metrics`. Runbook: [`docs/GROWTH_OPERATIONS.md`](./GROWTH_OPERATIONS.md).

### Acquisition Metrics

| Metric | Source | Target (6 months) |
|--------|--------|--------------------|
| Organic sessions/month | Vercel Analytics / GA | 10,000+ |
| Organic keywords ranking top 20 | Google Search Console | 200+ |
| Comparison page visits | Analytics | 2,000/month |
| Industry page visits | Analytics | 1,500/month |

### Conversion Metrics

| Metric | Source | Target |
|--------|--------|--------|
| Visitor → signup rate | Signup events / sessions | 3–5% |
| Signup → Google connected rate | Onboarding completion | 60%+ |
| Trial → paid conversion rate | Stripe events | 25–35% |
| Time to first review request | Product analytics | < 24 hours |

### Retention & Revenue Metrics

| Metric | Source | Target |
|--------|--------|--------|
| Monthly churn rate | Stripe | < 5% |
| MRR growth rate | Stripe | 15%+ month-over-month |
| Net Promoter Score | In-app survey | 50+ |
| Average revenue per user (ARPU) | Revenue / users | $40+ |

### Viral / PLG Metrics

| Metric | Source | Target |
|--------|--------|--------|
| Signups from "Powered by" links | UTM tracking | 10% of new signups |
| Widget embed count | `/w/` page views | 500+/month |
| Referral signups | Referral tracking | 5% of new signups |

---

<a id="page-architecture-map"></a>
## Page Architecture Map — Complete URL Inventory

> **Status: Complete (May 2026)** — Canonical inventory: `src/lib/growth/page-inventory.ts` (100+ routes including blog, help, tools, ES pages, PLG surfaces). Browse and filter on `/growth` → **Page architecture** tab. Sitemap: `src/app/sitemap.ts`.

### Existing Pages (Keep & Improve)

| URL | Status | Phase to Improve |
|-----|--------|------------------|
| `/` | Exists — long scroll | Phase 2 (refine, not rebuild) |
| `/about` | Exists — not in nav | Phase 0 (add to nav) |
| `/contact` | Exists — not in nav | Phase 0 (add to nav) |
| `/help` | Exists — dead links | Phase 0 (fix) → Phase 4 (real articles) |
| `/privacy` | Exists | — |
| `/terms` | Exists | — |
| `/data-retention` | Exists | — |
| `/docs/*` | Exists (11 pages) | Phase 4 (cross-link to marketing) |
| `/login` | Exists | — |
| `/signup` | Exists | Phase 2 (reduce friction) |
| `/forgot-password` | Exists | — |
| `/onboarding` | Exists | Phase 2 (improve copy) |
| `/r/[slug]` | Exists | Phase 7 (add viral branding) |
| `/w/[slug]` | Exists | Phase 7 (add viral branding) |

### New Pages to Create

| URL | Phase | Priority | Type |
|-----|-------|----------|------|
| `/pricing` | Phase 2 | P0 | Conversion |
| `/features` | Phase 2 | P0 | Conversion |
| `/how-it-works` | Phase 2 | P1 | Conversion |
| `/integrations` | Phase 2 | P1 | Conversion |
| `/reset-password` | Phase 0 | P0 | Auth fix |
| `/industries` | Phase 3 | P0 | SEO |
| `/industries/restaurants` | Phase 3 | P0 | SEO |
| `/industries/dental` | Phase 3 | P0 | SEO |
| `/industries/auto-repair` | Phase 3 | P1 | SEO |
| `/industries/salons` | Phase 3 | P1 | SEO |
| `/industries/home-services` | Phase 3 | P1 | SEO |
| `/industries/medical` | Phase 3 | P2 | SEO |
| `/industries/hotels` | Phase 3 | P2 | SEO |
| `/industries/fitness` | Phase 3 | P2 | SEO |
| `/compare` | Phase 3 | P0 | SEO + Conversion |
| `/compare/birdeye` | Phase 3 | P0 | SEO + Conversion |
| `/compare/podium` | Phase 3 | P1 | SEO + Conversion |
| `/compare/nicejob` | Phase 3 | P1 | SEO + Conversion |
| `/compare/gatherup` | Phase 3 | P2 | SEO + Conversion |
| `/case-studies` (case studies) | Phase 5 | P1 | Trust — **live** (blueprint originally `/customers`) |
| `/case-studies/[slug]` | Phase 5 | P1 | Trust |
| `/blog` | Phase 4 | P1 | SEO + Authority |
| `/blog/[slug]` | Phase 4 | P1 | SEO + Authority |
| `/resources` | Phase 4 | P2 | SEO + Lead gen |
| `/resources/[slug]` | Phase 4 | P2 | SEO + Lead gen |
| `/help/[category]` | Phase 4 | P1 | Support + SEO — **live** (e.g. `/help/getting-started`) |
| `/help/[category]/[article]` | Phase 4 | P1 | Support + SEO — **live** (canonical nested URLs) |
| `/security` | Phase 5 | P1 | Trust |
| `/demo` | Phase 8 | P2 | Enterprise |
| `/enterprise` | Phase 8 | P2 | Enterprise |
| `/agencies` | Phase 8 | P2 | Enterprise |
| `/tools` + `/tools/*` | Phase 7 | P1 | Lead gen |
| `/es/industries/*` | Phase 8 | P2 | SEO (ES) |
| `/growth` | Ops | — | Internal KPI dashboard (noindex) |

---

<a id="implementation-priority-matrix"></a>
## Implementation Priority Matrix

> **Status: Complete (May 2026)** — All Phase 0–8 engineering deliverables marked **complete** in `src/lib/growth/implementation-matrix.ts`. View timeline and task status on `/growth` → **Priority matrix** tab. Ongoing/external items (GSC, G2, paid ads, agency dashboard) documented in [`docs/GROWTH_OPERATIONS.md`](./GROWTH_OPERATIONS.md).


### Must Do First (Phase 0–1) — Foundation

```
Week 1                          Week 2                         Week 3-4
┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│ Fix dead help links│         │ Create sitemap.ts   │         │ Per-page metadata   │
│ Add nav links      │         │ Create robots.ts    │         │ JSON-LD structured  │
│ Fix copy conflicts │         │ Add OG/Twitter meta │         │ Internal linking    │
│ Resolve domain     │         │ OG image template   │         │ Keyword research    │
│ /reset-password    │         │ Global metadata fix │         │ Search Console setup│
└────────────────────┘         └────────────────────┘         └────────────────────┘
```

### Build Next (Phase 2–3) — Conversion + SEO Pages

```
Week 4-5                        Week 6-8                       Week 8-10
┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│ /pricing page      │         │ /industries (3 key) │         │ /compare/birdeye   │
│ /features page     │         │  - restaurants      │         │ /compare/podium    │
│ /how-it-works      │         │  - dental           │         │ /compare (hub)     │
│ /integrations      │         │  - auto-repair      │         │ More industry pages│
│ Signup flow improve│         │ Nav/footer redesign │         │ Product screenshots│
└────────────────────┘         └────────────────────┘         └────────────────────┘
```

### Scale (Phase 4–5) — Content + Trust

```
Week 10-14                      Week 14-16                     Week 16-20
┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│ Blog infrastructure│         │ Help center articles│         │ 3-5 case studies   │
│ First 4 blog posts │         │ Resource guides     │         │ Customer logo bar  │
│ Content calendar   │         │ Cross-linking audit │         │ /security page     │
│                    │         │                     │         │ G2/Capterra listing│
│                    │         │                     │         │ Review count badge │
└────────────────────┘         └────────────────────┘         └────────────────────┘
```

### Accelerate (Phase 6–8) — Paid + PLG + Enterprise

```
Week 20-28                      Week 28-36                     Week 36+
┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│ Google Ads setup   │         │ Referral program    │         │ /enterprise page   │
│ Meta retargeting   │         │ Free tools (lead gen│         │ /agencies page     │
│ Trial email nurture│         │ "Powered by" optimize│        │ Sales deck         │
│ Newsletter setup   │         │ Upgrade copy optimize│        │ International      │
│ Partnership outreach│        │ Viral loop tracking │         │ Agency dashboard   │
└────────────────────┘         └────────────────────┘         └────────────────────┘
```

---

## Summary: The Path from Inside to Outside

```
TODAY                    MONTH 1-2                MONTH 3-4                MONTH 5+
─────                    ─────────                ─────────                ────────
Strong product           SEO foundation           Content engine           Growth flywheel
Weak marketing           Conversion pages         Industry + compare       PLG loops
1 homepage               Pricing + Features       Blog + case studies      Paid + partnerships
No SEO                   Sitemap + OG + meta      Help center              Enterprise
Dead help links          Fixed copy + nav         Social proof             Agency expansion
No comparisons           /compare/birdeye         Authority content        International
```

**The product is ready. The outside needs to match the inside.**

Every phase builds on the previous one. Don't skip phases — the foundation must be solid before content works, and content must exist before paid acquisition is efficient.

**Phases 0–8 are shipped.** Operate growth via `/growth`, this blueprint, and `docs/GROWTH_OPERATIONS.md`.

---

*This document is the growth source of truth for Zyene Reviews. Update it as metrics evolve and new routes ship.*

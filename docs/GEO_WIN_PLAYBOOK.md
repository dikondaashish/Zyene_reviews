# Zyene Reviews — GEO Win Playbook

> **Purpose:** Phase-by-phase plan to win in **Generative Engine Optimization (GEO)** and **omni-channel distribution** — so Zyene stays visible in Google AI Overviews, ChatGPT, Perplexity, and Gemini while **not** depending on a single algorithm.
>
> **Source framework:** Chiraayuu GEO + omni-channel survival guide (Seema Choudhary).
>
> **Companion docs:** [GROWTH_BLUEPRINT.md](./GROWTH_BLUEPRINT.md) (product growth Phases 0–8), [GROWTH_OPERATIONS.md](./GROWTH_OPERATIONS.md) (weekly KPI rhythm).
>
> **Last updated:** May 2026

---

## Table of Contents

1. [How to Win (Principles)](#1-how-to-win-principles)
2. [Where We Stand Today](#2-where-we-stand-today)
3. [GEO vs SEO (What Changes)](#3-geo-vs-seo-what-changes)
4. [Architecture Overview](#4-architecture-overview)
5. [Phase 0 — Baseline & Audit (Week 1)](#geo-phase-0)
6. [Phase 1 — GEO Content Infrastructure (Weeks 2–3)](#geo-phase-1)
7. [Phase 2 — Inverted Pyramid on All Content (Weeks 3–5)](#geo-phase-2)
8. [Phase 3 — Uncopyable Assets (Weeks 5–8)](#geo-phase-3)
9. [Phase 4 — Machine-Readable & Schema (Weeks 6–9)](#geo-phase-4)
10. [Phase 5 — Own Your Traffic (Weeks 8–11)](#geo-phase-5)
11. [Phase 6 — Omni-Channel Repurposing (Weeks 10–14)](#geo-phase-6)
12. [Phase 7 — Product-Led Proof & Research (Weeks 12–18)](#geo-phase-7)
13. [Phase 8 — Measure, Refresh, Scale (Ongoing)](#geo-phase-8)
14. [Repurpose Workflow (Every Piece)](#repurpose-workflow)
15. [Engineering Checklist (By File)](#engineering-checklist)
16. [Content Standards (Writers)](#content-standards)
17. [KPI Dashboard](#kpi-dashboard)
18. [Phase Dependency Map](#phase-dependency-map)

---

<a id="1-how-to-win-principles"></a>
## 1. How to Win (Principles)

| # | Principle | What it means for Zyene |
|---|-----------|-------------------------|
| 1 | **Uncopyable beats generic** | AI can rewrite “10 tips for Google reviews.” It cannot invent your case study metrics, Birdeye price breakdowns, or anonymized product benchmarks. |
| 2 | **Answer first, depth second** | Every major section starts with a **50–70 word direct answer** (AI bait), then templates, steps, and opinion (human click-through). |
| 3 | **Structure for machines** | Tables, numbered steps, FAQ blocks, JSON-LD — not walls of prose. |
| 4 | **Canonical on zyenereviews.com** | One authoritative URL per topic; social/email/video point back to it. |
| 5 | **Own the list** | Newsletter and lead magnets reduce reliance on AI citations and Google alone. |
| 6 | **Repurpose in three formats** | Text (LinkedIn/Threads), audio/visual (YouTube/podcast script), email-exclusive value. |
| 7 | **Product is proof** | Negative Feedback Shield, AI visibility audit, competitor alerts — show them in public content. |

**North-star outcome:** Local business owners find Zyene via **AI answers**, **organic search**, **email**, and **social** — and convert on a **7-day trial** without us paying rent to one platform.

---

<a id="2-where-we-stand-today"></a>
## 2. Where We Stand Today

| Asset | Status | Code / URL |
|-------|--------|------------|
| Blog (12 posts, 6 pillars) | Shipped | `src/lib/phase4/blog-data.ts`, `/blog` |
| Resource guides (4) | Shipped | `src/lib/phase4/resource-data.ts`, `/resources/*` |
| Compare pages | Shipped | `src/lib/phase3/competitor-data.ts`, `/compare/*` |
| Case studies (5) | Shipped | `src/lib/phase5/case-study-data.ts`, `/case-studies/*` |
| Help center (23 articles) | Shipped | `src/lib/phase4/help-data.ts`, `/help/*` |
| Article + FAQ JSON-LD | Partial | Home + pricing + help; **blog posts lack FAQ schema** |
| Newsletter signup | Shipped | `NewsletterSignup`, `/api/marketing/newsletter/subscribe` |
| Inverted pyramid summaries | **Pilot live** | `summary` type in `blog-types.ts`; post `how-to-get-50-google-reviews-in-30-days` |
| Blog FAQ + FAQPage JSON-LD | **Pilot live** | `BlogFaq` on posts; `FAQPageJsonLd` on `/blog/[slug]` |
| Lead magnets (gated PDF) | **Not yet** | — |
| Repurpose packs | **Not yet** | — |
| `/research` benchmark reports | **Not yet** | — |

**GEO phases below close these gaps without replacing [GROWTH_BLUEPRINT.md](./GROWTH_BLUEPRINT.md) Phases 0–8 — they **stack on top** once marketing foundation is live.

---

<a id="3-geo-vs-seo-what-changes"></a>
## 3. GEO vs SEO (What Changes)

| SEO (still required) | GEO (add this) |
|----------------------|----------------|
| Unique title/description, canonical, sitemap | Quotable **summary blocks** under headings |
| Keywords in H1/H2 | **Explicit answers** AI can extract |
| Backlinks | **Original data + opinions** |
| Page speed, CWV | **Tables, lists, FAQ** for parsing |
| Rank in blue links | **Cited in AI synthesis** + still earn clicks |

**Do not:** Publish more commodity listicles. **Do:** Refresh existing 12 posts + 4 guides with summaries, FAQ, and data.

---

<a id="4-architecture-overview"></a>
## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CANONICAL (zyenereviews.com)                 │
│  Blog · Resources · Compare · Case Studies · Industries · Tools  │
│         ↑ summaries · tables · FAQ · JSON-LD · dateModified      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   LinkedIn/Threads         YouTube/Podcast          Email list
   (summary extracts)        (how-to scripts)        (exclusive drops)
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                         Trial signup / PLG
```

**Operational owner:** Marketing + content (phases 2–3, 6–7); Engineering (phases 1, 4–5); Leadership (phase 8 KPIs).

---

<a id="geo-phase-0"></a>
## Phase 0 — Baseline & Audit (Week 1)

> **Goal:** Know what to fix before writing new content.

### Tasks

| # | Task | Owner | Output |
|---|------|-------|--------|
| 0.1 | Export GSC top 50 queries + pages (28 days) | Ops | Spreadsheet |
| 0.2 | List top 10 URLs by traffic (Vercel/GA4) | Ops | Priority refresh list |
| 0.3 | Run **seo** / **on-page-seo-auditor** on: `/`, `/pricing`, `/compare/birdeye`, top blog, top case study | Eng | Fix list |
| 0.4 | Run **content-quality-auditor** (CORE-EEAT) on 3 blog posts | Content | Score + veto items |
| 0.5 | Manual AI citation test: ask ChatGPT/Perplexity “best Birdeye alternative for restaurants” — note if Zyene appears | Ops | Baseline screenshot |
| 0.6 | Confirm newsletter API + `marketing_subscribers` receiving `source` UTM | Eng | ✅ or bug ticket |

### Engineering

- None required (audit only).

### Exit criteria

- [ ] Priority URL list agreed (max 15 pages)
- [ ] Baseline AI mention log (yes/no per 5 test queries)
- [ ] GEO phase owners assigned

---

<a id="geo-phase-1"></a>
## Phase 1 — GEO Content Infrastructure (Weeks 2–3)

> **Goal:** Ship the **building blocks** every future post uses.

### 1.1 Schema: summary section type

**Add to** `src/lib/phase4/blog-types.ts`:

```ts
// New section type
| "summary"  // 50–70 word AI-quotable lead under an h2

// Optional on BlogPost
faqs?: Array<{ question: string; answer: string }>;
dateModified?: string; // ISO date for Article JSON-LD
```

**Render in** `src/components/marketing/content-renderer.tsx`:

- Distinct visual: bordered block, label “Key takeaway” or “In short”
- Placed immediately after matching `h2` when `summary` follows in `body[]`

### 1.2 FAQ on blog posts

- Extend `BlogPost` with `faqs[]`
- In `src/app/(marketing)/blog/[slug]/page-view.tsx`, render `<FAQPageJsonLd faqs={post.faqs} />` when present
- Add FAQ UI section above footer CTA (accordion or plain Q&A)

### 1.3 Article freshness

- Update `src/components/seo/json-ld-article.tsx` to include `dateModified` when set
- Content process: set `dateModified` on every substantive refresh

### 1.4 Sitemap & robots

- New routes (later phases): add to `src/app/sitemap.ts`
- Follow `.cursor/rules/seo.mdc` for all new marketing pages

### Exit criteria

- [x] `summary` type renders on one pilot post (`how-to-get-50-google-reviews-in-30-days`)
- [x] One blog post ships with `FAQPageJsonLd`
- [ ] `pnpm typecheck && pnpm test && pnpm build` pass (run each release)
- [ ] **react-doctor** on changed UI files

---

<a id="geo-phase-2"></a>
## Phase 2 — Inverted Pyramid on All Content (Weeks 3–5)

> **Goal:** Every high-traffic page is **AI-quotable** and **human-deep**.

### Content backlog (priority order)

| Priority | URL / content | Action |
|----------|---------------|--------|
| 1 | `/` homepage | Add 3 FAQ if missing; ensure H1 → H2 hierarchy |
| 2 | `/pricing` | FAQ already — add 50-word summary under each pricing FAQ answer in visible copy |
| 3 | `/compare/birdeye`, `/compare/podium` | Lead paragraph = 60-word “who wins” summary |
| 4 | Top 4 blog posts (by GSC) | Add `summary` after every `h2`; add 4–5 FAQs each |
| 5 | All 4 `/resources/*` guides | Summary per section + FAQ block |
| 6 | Remaining 8 blog posts | Same template |
| 7 | 5 case studies | Opening “Results in 60 words” block |

### Writer template (per `h2`)

1. **`summary`** — 50–70 words, standalone answer (no “In this section…”)
2. **`p` / `ul` / `ol` / `table`** — depth, templates, examples
3. **`tip` or `warning`** — optional expertise signal

### Exit criteria

- [ ] 12/12 blog posts have ≥3 summary blocks + FAQs
- [ ] 4/4 resource guides have FAQ schema
- [ ] 4/4 compare pages have comparison table + opening summary
- [ ] Re-run on-page SEO audit — zero critical issues on priority URLs

---

<a id="geo-phase-3"></a>
## Phase 3 — Uncopyable Assets (Weeks 5–8)

> **Goal:** Content AI **cannot** fabricate from training data alone.

### 3.1 Asset catalog (create minimum 6)

| Asset | Description | URL (proposed) | Owner |
|-------|-------------|----------------|-------|
| **Case study expansion** | Add $ spend, channels, timeline to existing 5 | `/case-studies/*` | Content |
| **Birdeye pricing breakdown** | Line-item vs Zyene (honest “where they win”) | `/blog/birdeye-pricing-2026` or refresh existing | Content |
| **Shield deep-dive** | Flow diagram + conversion stats (if available) | `/blog/negative-feedback-shield` | Content + Product |
| **Template pack (exclusive)** | 20 SMS/email review requests — **email-only** | Deliver via Resend | Content |
| **Industry snapshot** | “Restaurant Google reviews: 2026 benchmarks” | `/blog/...` | Content |
| **Comparison matrix** | All competitors one table | `/compare` hub | Eng (table component) |

### 3.2 Optional: Research hub

| Item | Engineering |
|------|-------------|
| `/research` index page | New route under `src/app/(marketing)/research/` |
| First report: “State of Local Reviews” (even n=50–100 survey) | PDF + landing page |
| Metadata + OG + sitemap entry | Per SEO rules |

### Exit criteria

- [ ] 6 uncopyable assets published and linked from homepage/blog sidebar
- [ ] Each asset has unique title/description + JSON-LD where applicable
- [ ] At least 2 assets linked from `/compare` and `/industries/*`

---

<a id="geo-phase-4"></a>
## Phase 4 — Machine-Readable & Schema (Weeks 6–9)

> **Goal:** Maximize structured understanding for Google, Bing, and AI crawlers.

### 4.1 JSON-LD expansion

| Page type | Schema | File |
|-----------|--------|------|
| Blog | `Article` + `FAQPage` | `json-ld-article.tsx`, `json-ld-faq-page.tsx` |
| Resources | `Article` or `HowTo` | New helper `json-ld-howto.tsx` |
| Compare | `FAQPage` (common objections) | Per compare `page-view` |
| Case studies | `Article` + `Organization` author | case study views |

### 4.2 HowTo schema

- For guides with numbered steps (`ol` sections), add `HowToJsonLd` matching steps
- Validate with Google Rich Results Test before ship

### 4.3 Visual / multimodal

- One infographic per pillar (6 total over 2 months)
- Store under `public/images/content/`, use `next/image`, descriptive `alt`
- Reference image in Article `image` property in JSON-LD

### 4.4 IndexNow

- After publishing/refreshes: run **indexnow-pinger** skill or project script for new URLs

### Exit criteria

- [ ] HowTo JSON-LD on ≥2 resource guides
- [ ] FAQ schema on all compare pages
- [ ] 6 infographics live with alt text
- [ ] No duplicate FAQ content (visible text = JSON-LD text)

---

<a id="geo-phase-5"></a>
## Phase 5 — Own Your Traffic (Weeks 8–11)

> **Goal:** **Email list** as primary owned channel; reduce platform risk.

### 5.1 Newsletter productization

| Step | Implementation |
|------|----------------|
| Double opt-in | Confirm endpoint + Resend template |
| Welcome series (3 emails) | Day 0: best guide; Day 2: Shield explainer; Day 5: trial CTA |
| Segmentation | `source` + optional `industry` on subscribe form |
| Monthly “Reputation Brief” | Editorial calendar: 1 tip + 1 template + 1 link |

**Existing:** `NewsletterSignup`, `/api/marketing/newsletter/subscribe`, `marketing_subscribers` table.

### 5.2 Lead magnets (gated)

| Magnet | Gate | Delivery |
|--------|------|----------|
| Negative review response pack (PDF) | Email | Resend link |
| Local SEO checklist (PDF) | Email | Resend link |
| Review request swipe file | Email | Resend link |

**Engineering (new):**

- `POST /api/marketing/lead-magnet` — validate email, tag `source`, send template
- Optional: `src/lib/marketing/lead-magnets.ts` config map
- Thank-you page `/resources/thank-you`

### 5.3 On-site capture

- Exit-intent or scroll CTA on top 5 posts (reuse `NewsletterSignup`)
- Resource pages: inline gate for PDF download

### Exit criteria

- [ ] Welcome series live
- [ ] ≥1 gated lead magnet shipped
- [ ] Subscriber growth tracked in `/growth` dashboard (leads by `source`)
- [ ] Trial attribution from `utm_medium=email` measurable

---

<a id="geo-phase-6"></a>
## Phase 6 — Omni-Channel Repurposing (Weeks 10–14)

> **Goal:** One canonical piece → three distribution formats **every time**.

See [Repurpose Workflow](#repurpose-workflow) below.

### 6.1 Channel playbook

| Channel | Cadence | Content type |
|---------|---------|--------------|
| **LinkedIn** | 3×/week | Summary blocks + one stat + link |
| **Threads/X** | 2×/week | Single quotable sentence from summary |
| **YouTube** | 2×/month | Screen recording: inbox, Shield, AI reply |
| **Email** | 1×/month digest + exclusives | Not on blog |
| **Communities** | 1×/week | Answer questions; link resources only |

### 6.2 UTM discipline

All off-site links:

```
?utm_source={linkedin|youtube|email}&utm_medium=social|video|email&utm_campaign=geo-{slug}
```

Already supported via `UTM_COOKIE_NAME` on newsletter — extend to shared link builder doc.

### 6.3 Engineering helper (optional)

- `content/repurpose/{slug}.md` template in repo
- Future: script `pnpm content:repurpose --slug=...` extracts summaries from `blog-data`

### Exit criteria

- [ ] Repurpose checklist used for 8 consecutive publishes
- [ ] YouTube channel has ≥4 videos with link in description
- [ ] Email list CTR to blog ≥5% (benchmark)

---

<a id="geo-phase-7"></a>
## Phase 7 — Product-Led Proof & Research (Weeks 12–18)

> **Goal:** Marketing claims backed by **product data** and flagship features.

### 7.1 Feature ↔ content map

| Product capability | Public proof content |
|--------------------|----------------------|
| Negative Feedback Shield | Dedicated landing section + case study metric |
| AI visibility audit (beta) | `/features/local-seo` + blog “AI search for local business” |
| Competitor alerts | Blog trend post + screenshot |
| Embeddable widget | “Powered by Zyene” + developer doc link |
| collectratings.com | LocalBusiness schema on public `/r/[slug]` docs |

### 7.2 Annual benchmark (stretch)

- Anonymized aggregates: median reviews after 30 days, SMS vs email open rates
- Published at `/research/2026-local-reviews`
- PR angle: local business press, podcast pitches

### 7.3 Entity / brand

- Run **entity-optimizer** skill: Knowledge Panel, consistent NAP, `Organization` schema (already on home)
- G2/Capterra profiles (from GROWTH_BLUEPRINT external ops)

### Exit criteria

- [ ] Shield mentioned in 100% of compare + industry pages (hero or above fold)
- [ ] One benchmark report published OR scheduled with data pipeline ticket
- [ ] AI visibility audit CTA on local SEO pillar posts

---

<a id="geo-phase-8"></a>
## Phase 8 — Measure, Refresh, Scale (Ongoing)

> **Goal:** GEO is a **loop**, not a project.

### Weekly (add to [GROWTH_OPERATIONS.md](./GROWTH_OPERATIONS.md))

| Check | Tool |
|-------|------|
| AI citation spot-check (5 queries) | Manual |
| GSC impressions/clicks on FAQ-rich URLs | GSC |
| Newsletter signups by `source` | `/growth` or DB |
| Top pages losing traffic | GSC compare week-over-week |

### Monthly

| Action |
|--------|
| Refresh 2 blog posts (`dateModified` + new stat) |
| Publish 2–4 new posts (pillar rotation) |
| One repurposed video + 12 LinkedIn posts |
| IndexNow on all new/changed URLs |

### Quarterly

| Action |
|--------|
| CORE-EEAT audit on top 10 URLs |
| Competitor content gap analysis |
| Update comparison pricing table |

### KPI targets (6 months)

| Metric | Target |
|--------|--------|
| Organic sessions | 10,000+/mo (aligned with growth blueprint) |
| Email subscribers | 2,000+ |
| Pages with FAQ schema | 80% of priority URLs |
| AI test queries mentioning Zyene | 2/5 → 4/5 |
| Trial signups from `email` / `linkedin` UTM | 15% of signups |
| Blog posts with summary blocks | 100% |

---

<a id="repurpose-workflow"></a>
## Repurpose Workflow (Every Piece)

Use this **checklist** when any canonical URL ships or updates.

### Step 1 — Publish canonical (web)

- [ ] Unique title ≤60 chars (segment only; template adds brand)
- [ ] Meta description ≤160 chars
- [ ] `openGraph` + `twitter` set
- [ ] Every `h2` preceded by `summary` (50–70 words)
- [ ] ≥1 comparison `table` or numbered `ol` with action headers
- [ ] 3–5 FAQs in body + `FAQPageJsonLd`
- [ ] 3+ internal links (`/features`, `/compare`, `/signup`)
- [ ] `dateModified` if refresh
- [ ] Sitemap includes URL
- [ ] IndexNow ping

### Step 2 — LinkedIn / Threads (text)

- [ ] Post 1: Strongest summary block verbatim + link
- [ ] Post 2: One table row or stat as image/carousel
- [ ] Post 3: Opinion hook (“Why we don’t recommend $299/mo for one location”)
- [ ] UTM: `utm_source=linkedin&utm_medium=social&utm_campaign=geo-{slug}`

### Step 3 — YouTube / podcast (script)

- [ ] Hook (15 sec): problem
- [ ] Demo or story (5–7 min)
- [ ] CTA: trial + link in description with UTM `utm_source=youtube`

### Step 4 — Email (exclusive)

- [ ] Teaser paragraph not copy-pasted from blog
- [ ] Attach or link **exclusive** template/checklist
- [ ] CTA button → canonical URL or trial

### File template (repo)

Create alongside new post:

```
content/repurpose/{slug}.md
---
canonical: https://zyenereviews.com/blog/{slug}
linkedin:
  - |
    {paste summary 1}
youtube_script_outline:
  - Hook
  - ...
email_subject: ...
email_exclusive: ...
---
```

---

<a id="engineering-checklist"></a>
## Engineering Checklist (By File)

| Phase | File / area | Change |
|-------|-------------|--------|
| 1 | `src/lib/phase4/blog-types.ts` | `summary` type, `faqs`, `dateModified` |
| 1 | `src/components/marketing/content-renderer.tsx` | Render `summary` |
| 1 | `src/app/(marketing)/blog/[slug]/page-view.tsx` | `FAQPageJsonLd` |
| 1 | `src/components/seo/json-ld-article.tsx` | `dateModified` |
| 4 | `src/components/seo/json-ld-howto.tsx` | New HowTo helper |
| 4 | Resource `page-view` files | Wire HowTo + FAQ |
| 5 | `src/app/api/marketing/lead-magnet/route.ts` | Gated download |
| 5 | `src/lib/resend/templates/` | Lead magnet + welcome emails |
| 6 | `content/repurpose/` | Templates (docs only) |
| 7 | `src/app/(marketing)/research/` | Research hub (optional) |

**Quality gates (every phase):**

```bash
pnpm typecheck && pnpm test && pnpm build
npx react-doctor@latest --verbose --diff   # if React/UI touched
```

**SEO gate (marketing changes):** invoke **seo** or **on-page-seo-auditor** skill before commit.

---

<a id="content-standards"></a>
## Content Standards (Writers)

### Summary block rules

- **Length:** 50–70 words (aim 280–420 characters)
- **Voice:** Declarative, third person or “you” — no fluff
- **Must stand alone:** Readable without rest of article
- **Include:** One number or concrete fact when possible
- **Avoid:** “In this article”, “We will discuss”, rhetorical questions only

### FAQ rules

- Questions match real People Also Ask / sales calls
- Answers 40–80 words, factual
- Last FAQ can soft-CTA trial

### Uncopyable test

Before publish, ask: *Could ChatGPT write this without Zyene data?* If yes, add data, quote, screenshot, or opinion.

---

<a id="kpi-dashboard"></a>
## KPI Dashboard

Track in `/growth` + spreadsheet until automated.

| KPI | Phase introduced | Target (6 mo) |
|-----|------------------|---------------|
| % blog posts with `summary` | 2 | 100% |
| % priority URLs with FAQ schema | 4 | 80% |
| Email subscribers | 5 | 2,000+ |
| Lead magnet conversions | 5 | 200+ |
| AI brand mention rate (5 queries) | 0, 8 | 80% |
| Organic sessions | 8 | 10,000+/mo |
| Signups from email/social UTM | 6 | 15% of signups |
| YouTube videos | 6 | 8+ |

---

<a id="phase-dependency-map"></a>
## Phase Dependency Map

```
Phase 0 (audit)
    ↓
Phase 1 (infra: summary, FAQ schema)
    ↓
Phase 2 (refresh all content) ──────┐
    ↓                               │
Phase 3 (uncopyable assets)         │
    ↓                               │
Phase 4 (HowTo, infographics) ←────┘
    ↓
Phase 5 (email, lead magnets)
    ↓
Phase 6 (repurpose all channels)
    ↓
Phase 7 (product proof, research)
    ↓
Phase 8 (ongoing measure + refresh)
```

**Parallel allowed:** Phase 3 content writing can start during Phase 2 refresh. Phase 6 repurposing starts as soon as Phase 2 publishes first refreshed post.

---

## Quick Start (This Week)

If you only do five things:

1. Complete **Phase 0** audit list.
2. Ship **Phase 1** `summary` + blog FAQ schema (one pilot post).
3. Refresh **top 4 GSC pages** with inverted pyramid (Phase 2).
4. Publish **one** uncopyable asset — expanded case study or Birdeye breakdown (Phase 3).
5. Send **first** monthly Reputation Brief email (Phase 5).

---

## Related Skills (AI agents)

| Skill | When |
|-------|------|
| **geo-content-optimizer** | Writing or rewriting for AI citation |
| **content-quality-auditor** | EEAT/CORE scoring before publish |
| **schema-markup-generator** | FAQ, HowTo, Article JSON-LD |
| **seo** / **on-page-seo-auditor** | Pre-commit marketing audit |
| **indexnow-pinger** | After publish |
| **entity-optimizer** | Phase 7 brand presence |

---

*Questions or phase status updates: track in `/growth` implementation matrix or add `geoPhase` field to `src/lib/growth/implementation-matrix.ts` in a follow-up engineering task.*

# Growth operations runbook

Internal guide for measuring and operating the growth blueprint after Phases 0–8. Complements the live dashboard at **`/growth`** (password: `GROWTH_DASHBOARD_SECRET`).

---

## Weekly rhythm (30 minutes)

| Day | Action |
|-----|--------|
| Monday | Open `/growth` → KPI tab; note signups, PLG %, referral %, leads |
| Tuesday | Google Search Console → Performance (last 28 days); export top queries |
| Wednesday | Vercel Analytics → top pages; filter `/compare`, `/industries`, `/tools` |
| Thursday | Stripe → MRR, churn, trial conversions |
| Friday | Update targets in leadership notes; file 1 content or partnership action |

---

## KPI sources (external)

| Metric | Where to measure | Cadence |
|--------|------------------|---------|
| Organic sessions | [Vercel Analytics](https://vercel.com/analytics) or GA4 | Weekly |
| Keywords top 20 | [Google Search Console](https://search.google.com/search-console) → Performance | Bi-weekly |
| Compare / industry visits | GA4 path report: `/compare/*`, `/industries/*` | Weekly |
| Widget embed views | Vercel path filter `/w/` | Monthly |
| NPS | PostHog survey (when launched) | Quarterly |
| Google Ads / Meta | Ad platform dashboards + UTM on `/signup` | Weekly when live |

---

## KPI sources (in-product)

| Metric | How we compute it |
|--------|-------------------|
| Signups | `events` where `event_type = user.signed_up` |
| PLG signups | Signup metadata `plg_ref` or `attribution.utm_source = plg` |
| Referral signups | `referral_conversions` in period ÷ signups |
| Google connected | Orgs with `review_platforms.platform = google` and `google_location_id` set |
| Time to first request | Median hours org created → first `review_requests` |
| Trial → paid | New orgs with `plan_status = active` (non-free) |
| Churn / MRR / ARPU | Stripe API (when `STRIPE_SECRET_KEY` set) |
| Leads | `marketing_subscribers` by `source` |

API (automation): `GET /api/internal/growth-metrics` with `Authorization: Bearer <GROWTH_DASHBOARD_SECRET>`.

---

## Page architecture

- **Canonical inventory:** `src/lib/growth/page-inventory.ts` (used by `/growth` Page tab).
- **Sitemap:** `src/app/sitemap.ts` — keep in sync when adding marketing routes.
- **Robots:** `/growth` and `/api/` disallowed; app routes blocked from crawlers.

Blueprint note: case studies at `/case-studies`; `/customers` and `/customers/[slug]` redirect there. Help: category hubs `/help/{category}`, canonical articles `/help/{category}/{article}`, flat `/help/{slug}` still works.

---

## Implementation matrix

- **Canonical tasks:** `src/lib/growth/implementation-matrix.ts`
- **Status meanings:** `complete` = shipped; `ongoing` = operational loop; `external` = third-party; `deferred` = roadmap

Remaining external ops: GSC property verification, G2/Capterra profiles, paid ads accounts, agency product dashboard (waitlist → build).

---

## Targets (6-month north star)

From `docs/GROWTH_BLUEPRINT.md` § KPI Dashboard:

- Organic sessions: **10,000+/month**
- GSC keywords top 20: **200+**
- Compare visits: **2,000/month**
- Industry visits: **1,500/month**
- Visitor → signup: **3–5%**
- Signup → Google connected: **60%+**
- Trial → paid: **25–35%**
- Time to first review request: **< 24h**
- Churn: **< 5%/month**
- MRR growth: **15%+ MoM**
- NPS: **50+**
- ARPU: **$40+**
- PLG signups: **10%** of new signups
- Widget views: **500+/month**
- Referral signups: **5%** of new signups

---

## Production checklist

1. Set `GROWTH_DASHBOARD_SECRET` (dedicated; falls back to `CRON_SECRET` if unset).
2. Visit `https://www.zyenereviews.com/growth` and sign in.
3. Confirm `GET /api/internal/growth-metrics` returns 200 with Bearer token.
4. Do not link `/growth` from public marketing nav or sitemap.

---

*Update this runbook when adding routes, KPIs, or new lead sources.*

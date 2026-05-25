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

## GSC baseline export (automated)

Regenerate Search Console top queries/pages for [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md):

```bash
pnpm geo:gsc-baseline
```

Outputs under `reports/gsc/` (JSON + CSV + `GSC_BASELINE_SUMMARY.md`). Never commit credentials, OAuth client secrets, or cached tokens.

### Auth order (script)

1. **Service account** — if `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` is set.
2. **OAuth user (recommended)** — otherwise Desktop-app OAuth with your personal Google account that already has Search Console access.

Service accounts often fail in Search Console with **“email not found”** when adding users. Prefer OAuth for local baseline exports.

### OAuth setup (recommended)

1. [Google Cloud Console](https://console.cloud.google.com/) → project **zyene-reviews** → **APIs & Services** → enable **Google Search Console API**.
2. **Credentials** → **Create credentials** → **OAuth client ID** → application type **Desktop app** → create.
3. Download the client JSON (or copy Client ID + Client secret). Keep it **outside the repo**.
4. Add to `.env.local` (do not commit):

```bash
# Option A: path to downloaded Desktop client JSON
GOOGLE_OAUTH_CLIENT_JSON="/path/to/client_secret_XXXXX.json"

# Option B: explicit ID/secret
# GOOGLE_OAUTH_CLIENT_ID="....apps.googleusercontent.com"
# GOOGLE_OAUTH_CLIENT_SECRET="...."

# Optional (default http://localhost — must match Desktop client redirect in GCP)
# GOOGLE_OAUTH_REDIRECT_URI="http://localhost"

# Optional token cache (default .cache/google-gsc-token.json)
# GOOGLE_OAUTH_TOKEN_PATH=".cache/google-gsc-token.json"
```

5. **Unset** `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` if you want OAuth instead of service account.
6. Run `pnpm geo:gsc-baseline`:
   - Script prints a Google authorization URL.
   - Open it, sign in with the Google account that owns the Search Console property.
   - After approve, copy the `code` from the redirect URL (`http://localhost/?code=...&scope=...`).
   - Paste the code into the terminal when prompted.
   - Token is cached in `.cache/google-gsc-token.json` (gitignored); later runs reuse it.

Do **not** commit `.cache/google-gsc-token.json`, client secrets, or service account JSON.

### Service account (optional / CI)

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
pnpm geo:gsc-baseline
```

Or `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` for Vercel/CI only — do not log.

### Property URL

Default: `https://www.zyenereviews.com/`

If you get **403**, try the domain property:

```bash
GSC_SITE_URL="sc-domain:zyenereviews.com" pnpm geo:gsc-baseline
```

The signed-in Google account (OAuth) or service account must have permission on that exact property in Search Console.

---

## KPI sources (external)

| Metric | Where to measure | Cadence |
|--------|------------------|---------|
| Organic sessions | [Vercel Analytics](https://vercel.com/analytics) or GA4 | Weekly |
| Keywords top 20 | [Google Search Console](https://search.google.com/search-console) → Performance, or `pnpm geo:gsc-baseline` | Bi-weekly |
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
| Template pack funnel | `marketing_events` + `docs/TEMPLATE_PACK_LEAD_MAGNET.md` |

API (automation): `GET /api/internal/growth-metrics` with `Authorization: Bearer <GROWTH_DASHBOARD_SECRET>`.

Template pack report: `GET /api/internal/marketing/template-pack-report?days=30` (same auth).

---

## Optional: `GROWTH_MARKETING_SESSIONS_30D`

This variable is **optional**. It affects **only** the **Visitor → signup rate** row on `/growth` (and the same field in `GET /api/internal/growth-metrics`). All other KPIs, lead counts, blueprint matrix, and template-pack funnel metrics work without it.

### What it does

- **Formula:** `user.signed_up` events in the dashboard period ÷ `GROWTH_MARKETING_SESSIONS_30D`.
- **Example:** 30 signups and `GROWTH_MARKETING_SESSIONS_30D=1000` → **3.0%** visitor → signup for the last 30 days.
- **Not wired to Vercel Analytics or GA4 automatically** — you paste an approximate session count from your analytics tool.

### Where to set it (Vercel)

1. Vercel → project **zyene-reviews** → **Settings** → **Environment Variables**.
2. Add **`GROWTH_MARKETING_SESSIONS_30D`** (Production; Preview optional if you use `/growth` on previews).
3. Value: positive integer — total **marketing-site sessions** for the **same window** as the dashboard (default **30 days**), e.g. `4200`.
4. **Redeploy** production (or wait for the next deploy) so `/growth` picks up the new value.

Local: add to `.env.local` (see `.env.example`). Never commit real values.

### How often to update manually

| Cadence | Action |
|---------|--------|
| **Weekly** (recommended) | After Monday `/growth` review, copy last-30-day sessions from Vercel Analytics or GA4 (marketing host only: `www.zyenereviews.com`, exclude `app.` / `auth.` if your report allows). Update the env var if the number changed materially. |
| **Monthly** (minimum) | If traffic is flat, updating once per month is enough for directional tracking. |
| **When running campaigns** | Update after a major paid or launch spike so the conversion % denominator matches reality. |

**Session sources:**

- [Vercel Analytics](https://vercel.com/analytics) → filter marketing domain, last 28–30 days.
- **GA4** → sessions where hostname is `www.zyenereviews.com` (or your marketing property), same date range.

If the variable is unset, `/growth` shows **—** for Visitor → signup and a neutral helper (not an error): set `GROWTH_MARKETING_SESSIONS_30D` to calculate visitor → signup conversion.

### Related optional env vars

| Variable | Affects |
|----------|---------|
| `GROWTH_MRR_PREVIOUS_MONTH_CENTS` | MRR month-over-month % only |
| `GROWTH_MARKETING_SESSIONS_30D` | Visitor → signup % only |

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

1. Set `GROWTH_DASHBOARD_SECRET` (strong random value, ≥32 characters; required for `/growth` and internal report APIs).
2. Visit `https://www.zyenereviews.com/growth` and sign in.
3. Confirm `GET /api/internal/growth-metrics` returns 200 with Bearer token.
4. Do not link `/growth` from public marketing nav or sitemap.

---

*Update this runbook when adding routes, KPIs, or new lead sources.*

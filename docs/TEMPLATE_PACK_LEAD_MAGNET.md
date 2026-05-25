# Review request template pack — lead magnet measurement

Internal reference for `/resources/review-request-templates` funnel tracking.

## Storage

| Store | Purpose |
|-------|---------|
| **`marketing_events`** | Append-only event log (views, clicks, submits). Migration: `supabase/migrations/20260524120000_marketing_events.sql` |
| **`marketing_subscribers`** | Lead emails with `source = review_request_templates` and UTM columns |

Rows are inserted via **service role** only (API routes). RLS blocks direct client access.

## Event names

| Event | When recorded |
|-------|----------------|
| `template_pack_view` | Page load (once per browser session) |
| `template_pack_form_view` | Lead capture section visible (IntersectionObserver, once per session) |
| `template_pack_submit` | Valid email POST to `/api/marketing/newsletter/subscribe` |
| `template_pack_subscribe_success` | New insert or reactivation from unsubscribed (not duplicate active subscribers) |
| `template_pack_signup_click` | Click on `/signup` from this page |
| `template_pack_pricing_click` | Click on `/pricing` from this page |

## Attribution fields

Every `marketing_events` row includes:

- `source`: `review_request_templates`
- `page_path`: `/resources/review-request-templates`
- `utm_source`, `utm_medium`, `utm_campaign` (from `zyene_utm` cookie when present)
- `created_at` (timestamp)
- `metadata` (optional JSON; client clicks may add keys later)

## APIs

| Endpoint | Role |
|----------|------|
| `POST /api/marketing/events/track` | Client page/click events (allowlisted names only) |
| `POST /api/marketing/newsletter/subscribe` | Subscribe + server-side submit/success events |
| `GET /api/internal/marketing/template-pack-report?days=30` | Funnel report (requires growth dashboard auth) |

## Conversion rate

**Yes — when page views are tracked.**

Report formula:

```text
conversionRatePercent = (template_pack_subscribe_success / template_pack_view) × 100
```

Requires `template_pack_view` events in the period. Use Vercel Analytics for cross-check on raw traffic.

## Example queries (Supabase SQL)

**Event counts (last 30 days):**

```sql
SELECT event_name, COUNT(*) AS n
FROM marketing_events
WHERE page_path = '/resources/review-request-templates'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY n DESC;
```

**Latest 20 leads:**

```sql
SELECT email, source, utm_source, utm_medium, utm_campaign, subscribed_at
FROM marketing_subscribers
WHERE source = 'review_request_templates'
ORDER BY subscribed_at DESC
LIMIT 20;
```

**Submit → success rate:**

```sql
SELECT
  COUNT(*) FILTER (WHERE event_name = 'template_pack_submit') AS submits,
  COUNT(*) FILTER (WHERE event_name = 'template_pack_subscribe_success') AS new_leads
FROM marketing_events
WHERE page_path = '/resources/review-request-templates'
  AND created_at >= NOW() - INTERVAL '30 days';
```

## HTTP report (production / staging)

**Auth:** `Authorization: Bearer <secret>` where the secret is `GROWTH_DASHBOARD_SECRET` on Vercel, or `CRON_SECRET` if the dedicated variable is unset (`getGrowthDashboardSecret()` in `src/lib/growth/growth-dashboard-auth.ts`).

```bash
# Prefer GROWTH_DASHBOARD_SECRET when set in Vercel production
curl -s -H "Authorization: Bearer $GROWTH_DASHBOARD_SECRET" \
  "https://zyenereviews.com/api/internal/marketing/template-pack-report?days=30" | jq
```

**Response fields (top-level):**

| Field | Meaning |
|-------|---------|
| `pageViews` | `template_pack_view` count (QA excluded) |
| `submissions` | `template_pack_submit` count |
| `subscribeSuccesses` | `template_pack_subscribe_success` count |
| `conversionRatePercent` | `subscribeSuccesses / pageViews × 100`, or `null` if no views |
| `signupClicks` | `template_pack_signup_click` |
| `pricingClicks` | `template_pack_pricing_click` |
| `latestSubmissions` | Up to 20 recent `marketing_subscribers` rows for this source |
| `excludesQaTraffic` | Always `true` — metrics omit internal QA patterns |

Without a valid Bearer token the API returns **401**.

Or open `/growth` (password-protected) and call the same API from the browser when logged in.

## QA / test traffic (do not count as real performance)

Internal activation runs use UTM `utm_source=qa`, `utm_medium=funnel_test`, and emails like `template-pack-prod-qa-*@zyenereviews.com`. The report API **excludes** these automatically (`src/lib/marketing/template-pack-qa-filters.ts`).

**SQL (production metrics — exclude QA):**

```sql
SELECT event_name, COUNT(*) AS n
FROM marketing_events
WHERE page_path = '/resources/review-request-templates'
  AND created_at >= NOW() - INTERVAL '30 days'
  AND COALESCE(utm_source, '') NOT IN ('qa', 'test', 'internal')
  AND COALESCE(utm_medium, '') NOT IN ('funnel_test', 'qa_test')
GROUP BY event_name;
```

After a QA run, delete test rows if you want a clean table (optional; report already ignores them):

```sql
DELETE FROM marketing_events
WHERE page_path = '/resources/review-request-templates'
  AND (utm_source IN ('qa', 'test', 'internal') OR utm_medium IN ('funnel_test', 'qa_test'));

DELETE FROM marketing_subscribers
WHERE email LIKE 'template-pack-prod-qa-%@zyenereviews.com';
```

## What counts as a real lead

A **real lead** for this funnel is:

1. A row in `marketing_subscribers` with `source = review_request_templates`, **and**
2. Not matching QA filters (email prefix / QA UTMs above), **and**
3. Preferably backed by a `template_pack_subscribe_success` event with non-QA UTMs in the same period.

**Duplicate active subscribers:** API returns `{ "ok": true, "newLead": false }` — no second welcome email and no second `template_pack_subscribe_success` event.

**Dedicated email subject:** `Your Review Request Template Pack` (only when `newLead` is true).

## Code map

| File | Role |
|------|------|
| `src/lib/marketing/template-pack-events.ts` | Constants + event name guard |
| `src/lib/marketing/record-marketing-event.ts` | DB insert helper |
| `src/lib/marketing/track-marketing-event-client.ts` | Browser `fetch` helper |
| `src/components/marketing/template-pack-page-analytics.tsx` | View / form view / CTA clicks |
| `src/lib/marketing/newsletter-subscribe.ts` | Subscribe + funnel events |
| `src/lib/marketing/template-pack-qa-filters.ts` | QA UTM/email exclusion for reports |
| `src/lib/marketing/template-pack-lead-report.ts` | Report aggregation |

## PDF delivery

Still **web-only**. Email points to the resource URL; no PDF attachment until Phase 5.

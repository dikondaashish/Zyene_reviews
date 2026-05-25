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

## Dev report (JSON)

```bash
curl -s -H "Authorization: Bearer $GROWTH_DASHBOARD_SECRET" \
  "https://zyenereviews.com/api/internal/marketing/template-pack-report?days=30" | jq
```

Or open `/growth` (password-protected) and call the same API from the browser when logged in.

## Code map

| File | Role |
|------|------|
| `src/lib/marketing/template-pack-events.ts` | Constants + event name guard |
| `src/lib/marketing/record-marketing-event.ts` | DB insert helper |
| `src/lib/marketing/track-marketing-event-client.ts` | Browser `fetch` helper |
| `src/components/marketing/template-pack-page-analytics.tsx` | View / form view / CTA clicks |
| `src/lib/marketing/newsletter-subscribe.ts` | Subscribe + funnel events |
| `src/lib/marketing/template-pack-lead-report.ts` | Report aggregation |

## PDF delivery

Still **web-only**. Email points to the resource URL; no PDF attachment until Phase 5.

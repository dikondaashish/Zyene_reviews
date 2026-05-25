# Phase 3 distribution package

Launch and repurpose copy for Phase 3 marketing assets. Use alongside [GEO_WIN_PLAYBOOK.md](./GEO_WIN_PLAYBOOK.md) § Repurpose Workflow.

## Assets in this package

| Asset | Canonical URL | Repurpose file |
|-------|---------------|----------------|
| Review request template pack | `/resources/review-request-templates` | [content/repurpose/review-request-templates.md](../content/repurpose/review-request-templates.md) |
| Negative Feedback Shield | `/blog/negative-feedback-shield` | [content/repurpose/negative-feedback-shield.md](../content/repurpose/negative-feedback-shield.md) |
| Birdeye pricing breakdown | `/blog/birdeye-pricing-breakdown-2026` | [content/repurpose/birdeye-pricing-breakdown-2026.md](../content/repurpose/birdeye-pricing-breakdown-2026.md) |
| Compare hub | `/compare` | [content/repurpose/compare.md](../content/repurpose/compare.md) |

**Measurement (template pack):** [TEMPLATE_PACK_LEAD_MAGNET.md](./TEMPLATE_PACK_LEAD_MAGNET.md)

---

## UTM link builder

Base: `https://www.zyenereviews.com`

Append query string (no trailing `?` on path):

```text
?utm_source={SOURCE}&utm_medium={MEDIUM}&utm_campaign={CAMPAIGN}
```

| Campaign | Use for |
|----------|---------|
| `template-pack-launch` | Template pack only — required UTMs below |
| `geo-negative-feedback-shield` | Shield blog |
| `geo-birdeye-pricing-breakdown-2026` | Birdeye pricing blog |
| `geo-compare-hub` | Compare hub |

### Template pack (required)

| Channel | `utm_source` | `utm_medium` | `utm_campaign` |
|---------|--------------|--------------|----------------|
| LinkedIn | `linkedin` | `social` | `template-pack-launch` |
| Email | `email` | `email` | `template-pack-launch` |
| Threads / X | `threads` | `social` | `template-pack-launch` |

**Example (LinkedIn):**

```text
https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch
```

UTMs are stored on subscribe via the `zyene_utm` cookie when the visitor lands with query params.

---

## Where to post

| Channel | Cadence (Phase 3 launch) | Primary assets |
|---------|--------------------------|----------------|
| **LinkedIn** (company + founder) | 3× template pack week 1; then 1×/week rotating Shield, Birdeye, Compare | All repurpose files |
| **X / Threads** | 2–3 short posts/week | Template pack + one-liners from blogs |
| **Newsletter** | 1 dedicated send + mention in monthly digest | Template pack email draft in repurpose file |
| **Email signature / outbound** | Ongoing | Template pack link with `utm_source=email` |
| **Communities** (Reddit, Facebook groups, local biz forums) | Answer questions; link only when helpful | Compare hub, Shield (compliance angle) |

**Do not** claim downloads, PDFs, or fabricated metrics. Template pack is a **web swipe file** on the site; optional email sends a link back to the page (no PDF).

---

## Compliance (all review-request copy)

Include where you mention outreach or Shield:

- **No incentives** for reviews (no discounts, gifts, or “leave a review for X”).
- **No happy-customer-only routing** — ask customers the same way; use private feedback for issues, not to hide criticism from Google.
- Shield is for **early private feedback**, not review suppression.

---

## Track results — template pack report API

**Endpoint:** `GET /api/internal/marketing/template-pack-report?days=30`

**Auth:** `Authorization: Bearer <GROWTH_DASHBOARD_SECRET>` (or `/growth` session cookie). See [TEMPLATE_PACK_LEAD_MAGNET.md](./TEMPLATE_PACK_LEAD_MAGNET.md).

```bash
curl -s -H "Authorization: Bearer $GROWTH_DASHBOARD_SECRET" \
  "https://www.zyenereviews.com/api/internal/marketing/template-pack-report?days=30" | jq
```

### Fields to review weekly

| Field | What it tells you |
|-------|-------------------|
| `pageViews` | Traffic to the swipe file (`template_pack_view`) |
| `submissions` | Email form submits |
| `subscribeSuccesses` | New or reactivated leads |
| `conversionRatePercent` | Successes ÷ views (null if no views) |
| `signupClicks` / `pricingClicks` | Bottom-of-funnel intent |
| `latestSubmissions` | Recent emails + UTM columns |
| `excludesQaTraffic` | Should be `true` (QA UTMs excluded) |

### Tie UTMs to subscribers

Check `latestSubmissions[].utm_source` / `utm_medium` / `utm_campaign` for `linkedin`, `email`, `threads`, and `template-pack-launch`.

Supabase cross-check (last 30 days):

```sql
SELECT utm_source, utm_medium, utm_campaign, COUNT(*) AS leads
FROM marketing_subscribers
WHERE source = 'review_request_templates'
  AND subscribed_at >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2, 3
ORDER BY leads DESC;
```

### Other assets (no dedicated report yet)

- **Vercel Analytics** — page paths: `/blog/negative-feedback-shield`, `/blog/birdeye-pricing-breakdown-2026`, `/compare`
- **GSC** — impressions/clicks by URL
- **Newsletter** — `marketing_subscribers.source` for non–template-pack sources when you add list segments later

---

## Launch sequence (suggested)

1. **Day 1–3:** Template pack — LinkedIn posts 1–3, Threads posts 1–3, founder note, newsletter send.
2. **Week 2:** Shield blog — LinkedIn + Threads from [negative-feedback-shield.md](../content/repurpose/negative-feedback-shield.md).
3. **Week 3:** Birdeye pricing — buyer-intent audiences on LinkedIn.
4. **Week 4:** Compare hub — “choosing a review tool” post + link to `/compare/birdeye` in comments when relevant.

---

## Copy rules

| Do | Don't |
|----|-------|
| Say “web swipe file”, “template pack”, “copy-paste scripts” | Say “download PDF” or “free ebook” |
| Cite public pricing ($29.99/mo) with “confirm with vendor” for competitors | Guarantee competitor quotes |
| Link with UTMs on every off-site CTA | Strip UTMs or use generic short links without campaign |
| Note optional email capture on template pack | Imply gated content for all templates (preview is ungated) |

# GEO weekly report template

Copy this file each week (or duplicate into Notion/Sheets). Fill **manual** fields from GSC, AI tools, and `/growth`.

**Related:** [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) · [GEO_WIN_PLAYBOOK.md](./GEO_WIN_PLAYBOOK.md) · [TEMPLATE_PACK_LEAD_MAGNET.md](./TEMPLATE_PACK_LEAD_MAGNET.md)

---

## Week metadata

| Field | Value |
|-------|-------|
| Week number | |
| Date range | |
| Report owner | |
| Production deploy URL / commit | |

---

## 1. New URLs published

| URL | Type (blog / resource / compare) | IndexNow pinged? (Y/N) |
|-----|----------------------------------|------------------------|
| | | |

---

## 2. Changed URLs (content refresh)

| URL | What changed | dateModified updated? | IndexNow pinged? |
|-----|--------------|----------------------|------------------|
| | | | |

---

## 3. Schema validation

| Check | Result | Notes |
|-------|--------|-------|
| `node scripts/validate-geo-faq-build.mjs` | | After `pnpm build` |
| `node scripts/validate-geo-faq-production.mjs` | | After deploy |
| Rich Results Test (spot-check 1 URL) | | |

---

## 4. Google Search Console (manual)

| Metric | This week | Prior week | Δ |
|--------|-----------|------------|---|
| Impressions | | | |
| Clicks | | | |
| Average position (top query) | | | |
| Top gaining page | | | |
| Top losing page | | | |

**Top 5 queries this week**

| Query | Clicks | Impressions |
|-------|--------|-------------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

---

## 5. AI citation check (5 baseline queries)

From [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md). Record **Yes / No / Partial** per surface.

| Query | ChatGPT | Perplexity | Gemini | AI Overview | Notes |
|-------|---------|------------|--------|-------------|-------|
| best Birdeye alternative for restaurants | | | | | |
| Birdeye pricing alternatives | | | | | |
| best review management software for small businesses | | | | | |
| how to get more Google reviews | | | | | |
| Google review request templates | | | | | |

---

## 6. Template pack funnel (`/growth` or API)

Source: `/growth` dashboard → Template pack section, or `GET /api/internal/marketing/template-pack-report?days=7` (GROWTH auth).

| Metric | Value |
|--------|-------|
| Page views | |
| Form submits | |
| Subscribe successes | |
| Conversion rate % | |
| Signup clicks | |
| Pricing clicks | |
| New leads (count) | |

**Notes on latest submissions:** (no PII in shared docs—reference count only)

---

## 7. Subscriber count

| Metric | Value |
|--------|-------|
| New marketing subscribers (week) | |
| Total active subscribers | |
| Unsubscribes | |

---

## 8. Signup & pricing clicks

| Source / page | Signup clicks | Pricing clicks |
|---------------|---------------|----------------|
| Template pack | | |
| Blog CTAs | | |
| Compare pages | | |
| Other | | |

---

## 9. IndexNow pings sent

| Date | URLs pinged | Method (CLI / API) | Response OK? |
|------|-------------|-------------------|--------------|
| | | | |

Command reference:

```bash
pnpm indexnow:ping
# or POST /api/indexnow with CRON_SECRET
```

---

## 10. Next week actions

- [ ] 
- [ ] 
- [ ] 

---

## Instructions for manual fields

- **GSC:** Search Console → Performance → last 7 days vs previous period.
- **AI citations:** Fresh session per tool; screenshot evidence optional.
- **Template pack:** Requires `GROWTH_DASHBOARD_SECRET` or cookie auth on `/growth`.
- **Do not** mark baseline complete in the playbook until [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) tables contain real data.

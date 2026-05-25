# GEO weekly report template

Copy this file each week (or duplicate into Notion/Sheets). Fill **manual** fields from GSC, AI tools, and `/growth`. **Do not invent metrics.**

**Related:** [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) · [GEO_WIN_PLAYBOOK.md](./GEO_WIN_PLAYBOOK.md) · [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md) · [GEO_CONTENT_REFRESH_QUEUE.md](./GEO_CONTENT_REFRESH_QUEUE.md)

---

## Week metadata

| Field | Value |
|-------|-------|
| Week number | |
| **Week date range** (Mon–Sun) | |
| Report owner | |
| Production deploy URL / commit | |

---

## 1. New URLs published

| URL | Type (blog / resource / compare) | IndexNow pinged? (Y/N) |
|-----|----------------------------------|------------------------|
| | | |

---

## 2. URLs refreshed

| URL | What changed | dateModified updated? | IndexNow pinged? |
|-----|--------------|----------------------|------------------|
| | | | |

See also [GEO_CONTENT_REFRESH_QUEUE.md](./GEO_CONTENT_REFRESH_QUEUE.md).

---

## 3. IndexNow URLs pinged

| Date | URLs (list or count) | Method (`pnpm indexnow:ping` / API) | OK? |
|------|----------------------|-------------------------------------|-----|
| | | | |

---

## 4. Schema validation

| Check | Result | Notes |
|-------|--------|-------|
| `node scripts/validate-geo-faq-build.mjs` | | After `pnpm build` |
| `node scripts/validate-geo-faq-production.mjs` | | After deploy |
| Rich Results Test (spot-check 1 URL) | | |

---

## 5. Google Search Console

**Source:** GSC UI or `reports/gsc/GSC_BASELINE_SUMMARY.md` from `pnpm geo:gsc-baseline`.

| Metric | This week | Prior week | Δ |
|--------|-----------|------------|---|
| Impressions | | | |
| Clicks | | | |
| Average position (top query) | | | |

### GSC top query changes (top 5)

| Query | Clicks | Impressions | Δ vs prior week | Notes |
|-------|--------|-------------|-----------------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

### GSC top page changes (top 5)

| Page URL | Clicks | Impressions | Δ vs prior week | Notes |
|----------|--------|-------------|-----------------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

---

## 6. AI citation checks

Spot-check from [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) § 4 (or full re-run monthly).

| Query | ChatGPT | Perplexity | Gemini | AI Overview | Google Search | Notes |
|-------|---------|------------|--------|-------------|---------------|-------|
| (pick 2–3 priority queries this week) | | | | | | |

---

## 7. Template pack funnel

**Source:** `/growth` → Template pack section, or `GET /api/internal/marketing/template-pack-report?days=7`.

| Metric | Value |
|--------|-------|
| Page views | |
| Form submits | |
| Subscribe successes | |
| Conversion rate % | |
| Signup clicks | |
| Pricing clicks | |

---

## 8. Local SEO checklist funnel

**Source:** `/growth` → Local SEO section, or `GET /api/internal/marketing/local-seo-checklist-report?days=7`.

| Metric | Value |
|--------|-------|
| Page views | |
| Form submits | |
| Subscribe successes | |
| Conversion rate % | |
| Signup clicks | |
| Pricing clicks |

If no traffic yet, write `—` (not zero unless report shows zero).

---

## 9. Newsletter subscribers

| Metric | Value |
|--------|-------|
| New marketing subscribers (week) | |
| New by source (template pack / checklist / other) | |
| Unsubscribes | |

---

## 10. Signup & pricing clicks

| Source / page | Signup clicks | Pricing clicks |
|---------------|---------------|----------------|
| Template pack | | |
| Local SEO checklist | | |
| Blog CTAs | | |
| Compare pages | | |
| Other | | |

---

## 11. Trial signups & product KPIs

**Source:** `/growth` KPI tab · `GET /api/internal/growth-metrics`.

| Metric | Value |
|--------|-------|
| Trial signups (week) | |
| Visitor → signup % (if `GROWTH_MARKETING_SESSIONS_30D` set) | |
| MRR / MoM (if configured) | |

---

## 12. Content / technical issues found

| Issue | URL | Severity | Owner | Status |
|-------|-----|----------|-------|--------|
| | | | | |

---

## 13. Distribution (manual)

From [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md):

| Channel | Posted? | Post URL | Clicks (UTM) | Notes |
|---------|---------|----------|--------------|-------|
| LinkedIn | | | | |
| Email | | | | |
| X / Threads | | | | |

---

## 14. Next week actions

- [ ] 
- [ ] 
- [ ] 

---

## Instructions

- **GSC:** `pnpm geo:gsc-baseline` after OAuth setup ([GROWTH_OPERATIONS.md](./GROWTH_OPERATIONS.md)).
- **AI citations:** Fresh session per tool; link screenshots in baseline doc.
- **Funnels:** Requires `GROWTH_DASHBOARD_SECRET` on `/growth`.
- **Baseline “complete”:** **No** until [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) has real GSC export + filled citation log.

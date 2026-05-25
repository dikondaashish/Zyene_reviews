# GEO baseline audit

**Status:** Baseline is **not complete** until every section below has real data entered (not placeholders).

Use this document as the repeatable starting point for measuring GEO and SEO improvement. Update after major content ships and monthly thereafter.

**Related:** [GEO_WIN_PLAYBOOK.md](./GEO_WIN_PLAYBOOK.md) · [GEO_ON_PAGE_AUDIT.md](./GEO_ON_PAGE_AUDIT.md) · [GEO_WEEKLY_REPORT_TEMPLATE.md](./GEO_WEEKLY_REPORT_TEMPLATE.md)

---

## How to use this doc

1. Export data from **Google Search Console** (last 28 days) and your analytics tool.
2. Run the **AI citation queries** manually in ChatGPT, Perplexity, Gemini, and Google (check for AI Overviews).
3. Record results in the tables below — use `—` or `Pending` until filled.
4. Do **not** mark the baseline complete in the playbook until this file shows real entries.

---

## Baseline completion checklist

| Section | Status | Owner | Date completed |
|---------|--------|-------|----------------|
| GSC top queries/pages | Not started | | |
| Top 10 traffic pages | Not started | | |
| AI citation queries (5) | Not started | | |
| SEO / on-page audit | See [GEO_ON_PAGE_AUDIT.md](./GEO_ON_PAGE_AUDIT.md) | | |
| CORE / EEAT content audit | Not started | | |
| Priority URL index | Listed below (static) | | |

---

## 1. Google Search Console — top queries (manual)

**Instructions:** GSC → Performance → Search results → Last 28 days → Export. Paste top 50 queries (or top 25 if volume is low).

| # | Query | Clicks | Impressions | CTR | Avg position | Notes |
|---|-------|--------|-------------|-----|--------------|-------|
| 1 | _Pending_ | | | | | |
| 2 | | | | | | |
| … | (add rows 3–50) | | | | | |

---

## 2. Google Search Console — top pages (manual)

**Instructions:** GSC → Performance → Pages → Last 28 days. Or use Vercel Analytics for top paths.

| # | Page URL | Clicks | Impressions | Notes |
|---|----------|--------|-------------|-------|
| 1 | _Pending_ | | | |
| … | (add rows 2–10) | | | |

---

## 3. Top 10 traffic pages (manual)

**Instructions:** Vercel Analytics / GA4 → top pages by sessions, last 28 days.

| Rank | Path | Sessions | Notes |
|------|------|----------|-------|
| 1 | _Pending_ | | |
| 2 | | | |
| … | 10 | | |

---

## 4. AI citation baseline queries

**Instructions:** Run each query in a **fresh** session (or incognito). Record whether **Zyene Reviews** or **zyenereviews.com** is mentioned. Save screenshots to a shared folder and link in Notes.

**Do not** claim baseline is complete until all five rows are tested on all four surfaces.

| Query | ChatGPT | Perplexity | Gemini | Google AI Overview | Notes / screenshot |
|-------|---------|------------|--------|-------------------|-------------------|
| best Birdeye alternative for restaurants | Pending | Pending | Pending | Pending | |
| Birdeye pricing alternatives | Pending | Pending | Pending | Pending | |
| best review management software for small businesses | Pending | Pending | Pending | Pending | |
| how to get more Google reviews | Pending | Pending | Pending | Pending | |
| Google review request templates | Pending | Pending | Pending | Pending | |

**Mention values:** `Yes` · `No` · `Partial` (brand named but not linked) · `Pending`

---

## 5. SEO / on-page audit status

| Item | Status | Doc |
|------|--------|-----|
| Priority marketing URLs | Tracked in on-page audit | [GEO_ON_PAGE_AUDIT.md](./GEO_ON_PAGE_AUDIT.md) |
| Production FAQ/schema validation | Run after deploy | `node scripts/validate-geo-faq-production.mjs` |
| Build-time FAQ validation | Run after build | `node scripts/validate-geo-faq-build.mjs` |

---

## 6. CORE / EEAT content audit status

**Instructions:** Run **content-quality-auditor** skill on top 10 URLs when ready. Score key pages; do not invent scores here.

| URL | Audit date | GEO score | SEO score | Top gaps | Status |
|-----|------------|-----------|-----------|----------|--------|
| `/` | | | | | Pending |
| `/pricing` | | | | | Pending |
| `/compare` | | | | | Pending |
| `/resources/review-request-templates` | | | | | Pending |
| `/blog/birdeye-pricing-breakdown-2026` | | | | | Pending |

---

## 7. Indexed priority URLs (reference)

Static list from [src/app/sitemap.ts](../src/app/sitemap.ts). Confirm in GSC → Pages → Indexing.

| URL | In sitemap | Indexed (GSC) | Notes |
|-----|------------|---------------|-------|
| `/` | Yes | Pending | |
| `/pricing` | Yes | Pending | |
| `/compare` | Yes | Pending | |
| `/compare/birdeye` | Yes | Pending | |
| `/blog/birdeye-pricing-breakdown-2026` | Yes | Pending | |
| `/blog/negative-feedback-shield` | Yes | Pending | |
| `/resources/review-request-templates` | Yes | Pending | |
| `/resources/local-seo-checklist` | Yes | Pending | |
| `/resources/google-reviews-guide` | Yes | Pending | |
| `/resources/negative-review-templates` | Yes | Pending | |
| `/features/review-collection` | Yes | Pending | |
| `/signup` | Yes | Pending | |

---

## 8. IndexNow workflow (post-publish)

Ping Bing after publishing or materially updating marketing URLs.

| Step | Command / action |
|------|------------------|
| CLI (production API) | `pnpm indexnow:ping` (see [scripts/ping-indexnow.mjs](../scripts/ping-indexnow.mjs)) |
| API | `POST /api/indexnow` with `Authorization: Bearer $CRON_SECRET`, body `{ "urls": ["https://www.zyenereviews.com/..."] }` |
| Key file | `public/b72e9354a8674d819712a48dc7b06b52.txt` |

**URLs to ping after this GEO batch (update when shipped):**

- _Add paths here after each deploy — do not ping until live_

Post–GEO batch (ping after deploy):

```text
https://www.zyenereviews.com/resources/google-reviews-guide
https://www.zyenereviews.com/resources/negative-review-templates
https://www.zyenereviews.com/resources/local-seo-checklist
https://www.zyenereviews.com/blog/ai-visibility-audit-local-businesses
```

---

## Revision log

| Date | Change | By |
|------|--------|-----|
| 2026-05-25 | Initial template created (no baseline data) | |

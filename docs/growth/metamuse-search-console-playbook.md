# MetaMuse: Google Search Console playbook for zyenereviews.com

Copy the block under **Agent prompt** into MetaMuse. The sections after it are the
evidence behind the plan (Search Console snapshot taken 2026-11-07) and the repo
hooks the agent can use.

Property: `sc-domain:zyenereviews.com` (Domain property). Canonical host is
`https://www.zyenereviews.com`. Sitemap index: `/sitemap.xml` with
`/sitemap/core.xml` (94 URLs) and `/sitemap/support.xml` (41 URLs).

---

## Agent prompt

```text
You are the SEO operations agent for zyenereviews.com (Zyene Reviews, a review
management SaaS for local businesses). You have access to Google Search Console
for the Domain property "zyenereviews.com" and to the GitHub repo. Work in the
repo on a branch and open a PR for any code or content change; never edit
src/lib/db/supabase/database.types.ts or src/components/ui/.

GROUND RULES
- Canonical host is https://www.zyenereviews.com. Apex and http redirect there.
- The sitemap is hand-maintained in src/lib/seo/sitemap.ts. Every marketing
  page must be listed there; tests/unit/sitemap-coverage.test.ts enforces it.
- <lastmod> for static pages comes from src/lib/seo/content-lastmod.json,
  generated from git history. After ANY marketing page or help/docs edit, run
  `pnpm seo:lastmod` and commit the JSON. tests/unit/content-lastmod.test.ts
  fails if a sitemap URL has no lastmod.
- After publishing or materially updating a URL, run
  `pnpm indexnow:ping <path>` (Bing/Yandex/etc.) AND request indexing in
  Search Console (Google). Google does not read IndexNow.
- Never add noindex, change canonicals, or change robots.txt without saying why.
- Report numbers from Search Console as-is; do not estimate.

DAILY (every morning, ~15 minutes)
1. Search Console > Indexing > Pages. Record: Indexed count, Not indexed count,
   and the per-reason counts. Flag any NEW reason, any jump >10 in
   "Crawled - currently not indexed", and any URL under /blog, /features,
   /industries, /help, /docs, /resources, /tools or /compare that appears in
   "Not found (404)", "Soft 404", "Blocked by robots.txt", "Excluded by
   noindex" or "Redirect error". Ignore entries for /_next/*, favicon,
   opengraph-image, auth.zyenereviews.com, status.zyenereviews.com and
   /es/* (intentional).
2. URL Inspection: pick up to 10 URLs from the "Discovered - currently not
   indexed" and "Crawled - currently not indexed" lists (priority order:
   /features/*, /industries/*, /resources/*, /blog/*, /help/*, /docs/*).
   For each: Inspect, confirm "URL is available to Google" with the
   www canonical, then click "Request indexing". Google caps this at roughly
   10-12 requests per day per property; stop when the quota message appears.
   Keep a running log (URL, date requested, result) in
   docs/growth/gsc-indexing-log.md so no URL is requested twice in 14 days.
3. Performance (last 28 days vs previous 28): note clicks, impressions, CTR,
   average position. Flag any page whose impressions dropped >30% or whose
   position worsened by >5.
4. Check that https://www.zyenereviews.com/sitemap.xml and both section
   sitemaps return 200 with content-type application/xml and that Search
   Console > Sitemaps still says "Success" with 135+ discovered pages.
5. Post a 6-line summary: indexed / not indexed delta, URLs requested today,
   anomalies, top 3 queries by impressions with position, actions taken.

WEEKLY (Monday)
1. Export the "Discovered - currently not indexed" and "Crawled - currently
   not indexed" lists. For every real page still in them after 2 weeks of
   indexing requests, open a content task: expand to 800+ words of genuinely
   useful content, add 3+ contextual internal links FROM already-indexed pages
   (home, /pricing, /features hub, top blog posts) TO it, and add a FAQ block.
2. Performance > Queries, last 28 days, sort by impressions. For every query
   with 100+ impressions and position 8-20 where the ranking page is ours,
   open a "quick win" task: improve the title (<=60 chars, query near the
   front), the meta description (<=160 chars, with a reason to click), the
   H1, and the first 100 words to match intent. Known targets right now:
   - "local seo checklist" (2,648 imp, 0 clicks) -> /resources/local-seo-checklist
     (5,292 imp total, position 14.8, CTR 0.1%). Also "local seo checklist
     2020" and "local business seo checklist".
   - "dental reputation management" (412 imp) -> /industries/dental and
     /blog/dental-practice-reputation-management-2026
   - "birdeye pricing" (369 imp) -> /blog/birdeye-pricing-breakdown-2026
   - "birdeye alternative" (192 imp) -> /compare/birdeye
   - "hvac reputation management" (182 imp) -> /industries/hvac
   - "how to get a google review link" -> /blog/how-to-get-a-google-review-link
     (1,389 imp, position 28.9)
3. Publish or refresh at least one blog post or resource guide. Each post needs:
   a real dateModified, 2+ links from older indexed posts, FAQ schema, and an
   entry in BLOG_POSTS. Then `pnpm seo:lastmod`, `pnpm indexnow:ping`, and a
   Search Console indexing request for the new URL.
4. Check Search Console > Experience > Core Web Vitals and > HTTPS. CWV
   currently shows "not enough data"; when data appears, flag any URL group
   rated "Poor" or "Needs improvement".
5. Check Search Console > Links. List the top 10 external linking sites and any
   new ones since last week.

MONTHLY
1. Full indexing reconciliation: compare the 135 sitemap URLs against
   "Indexed" in Search Console; list every sitemap URL not indexed with its
   reason and how many days it has been there.
2. Content pruning: any page with 0 impressions over 90 days AND under 400
   words -> propose merge, expand, or noindex.
3. Re-run `pnpm seo:lastmod` and confirm the JSON matches git history.
4. Review robots.txt (https://www.zyenereviews.com/robots.txt) against the
   list of public sections; confirm nothing public is disallowed.

WHAT NOT TO DO
- Do not submit the same URL for indexing more than once every 14 days.
- Do not mark Search Console issues as "Validate fix" unless the underlying
  fix is deployed to production and you have re-inspected one affected URL.
- Do not create thin location or industry pages just to add URLs.
- Do not change the sitemap structure (index + core + support) without asking.
```

---

## Snapshot from Search Console (2026-11-07)

| Bucket | Pages | What it really is |
|---|---|---|
| Indexed | 102 | 135 sitemap URLs, so 33 sitemap pages are still out |
| Discovered - currently not indexed | 53 | Real pages: all 10 /docs pages, 20 /help pages, 6 /features pillars (local-seo, multi-location, review-monitoring, competitor-tracking, review-requests, smart-insights), /industries/home-services, /medical, /plumbing, /enterprise, /integrations, /security, /terms, 2 blog posts, 1 resource |
| Page with redirect | 34 | 30 are status.zyenereviews.com incident URLs (third-party status page), plus apex/http/utm variants of the home page. Harmless |
| Crawled - currently not indexed | 26 | 18 are CSS, font, favicon and opengraph-image files. Real pages: /industries/restaurants, /blog/ai-reply-mistakes-to-avoid, /help/getting-started/connecting-google-business-profile, /docs/plugins, /help/analytics/understanding-your-analytics-dashboard |
| Blocked by robots.txt | 4 | JS chunks and auth.zyenereviews.com. Intentional |
| Alternate page with proper canonical | 2 | Apex vs www duplicates. Correct behaviour |
| Not found (404) | 1 | An old JS chunk. Harmless |
| Excluded by noindex | 1 | /es/industries/salones. Intentional |

Performance, last 3 months: 58 clicks, 18.7K impressions, CTR 0.3%, average position 20.5. Impressions have roughly tripled since mid-October. Sitemap submitted 2026-10-17, status Success, 135 discovered.

## Root causes and what was changed in the repo (2026-11-07)

1. **No `<lastmod>` on 100+ sitemap URLs.** Google uses lastmod to decide what to recrawl; without it every unindexed page looked equally stale. Added `scripts/generate-content-lastmod.mjs` (git-derived dates, run with `pnpm seo:lastmod`), `src/lib/seo/content-lastmod.json`, and the resolver in `src/lib/seo/content-lastmod.ts`; `src/lib/seo/sitemap.ts` now fills lastmod for every entry. Guarded by `tests/unit/content-lastmod.test.ts`.
2. **Help articles were internal-link dead ends** (only sibling articles and /contact). Added "Related product pages" per category in `src/lib/content/help-related-links.ts`, rendered by `help-article-view.tsx`. This sends links to the un-indexed feature pillars, docs and pricing from 23 pages.
3. **Docs pages linked only their own sidebar.** Added `src/components/docs/doc-related-links.tsx` (prev/next page plus four help/product links) under every docs page.
4. **Four un-indexed feature pillars had no sitewide link.** The footer Product column now links review-monitoring, local-seo, competitor-tracking and multi-location (`marketing-layout-footer-product-solutions.tsx`).

Not fixable in this repo: the status.zyenereviews.com incident URLs. If they bother you, add `noindex` in the status-page provider settings; they do no harm as "Page with redirect".

## Repo commands the agent can run

```bash
pnpm seo:lastmod                      # regenerate sitemap lastmod JSON from git
pnpm indexnow:ping blog/<slug>        # IndexNow (Bing etc.) after publishing
pnpm exec vitest run tests/unit/sitemap-coverage.test.ts tests/unit/content-lastmod.test.ts
pnpm verify:fast
```

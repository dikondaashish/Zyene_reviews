# SEO remediation — September 13, 2026

## Outcome and release state

The website is already partly indexed; the main problem is incomplete discovery/crawling and weak external references, alongside specific technical defects. Changes in this working tree address those defects. **These changes have not been pushed or deployed.** Search Console observations below describe the currently deployed site and Google's dated reports, not the local fixes.

Brand colors and customer-portal styling are unchanged by this SEO work.

## Search Console evidence

Read directly from the signed-in `sc-domain:zyenereviews.com` property on September 13, 2026:

| Report | Observed result |
|---|---|
| Settings → Ownership verification | You are a verified owner |
| Homepage URL Inspection | URL is on Google; last crawled September 12, 2026, 12:04:02 AM by Googlebot smartphone; fetch successful, crawling/indexing allowed; Google selected the inspected HTTPS www URL as canonical |
| Page indexing, last updated September 3 | 24 indexed; 98 not indexed |
| Discovered, currently not indexed | 89 URLs; examples include `/agencies`, `/blog`, and multiple articles; last crawled N/A |
| Crawled, currently not indexed | 3 URLs, including the restaurant review guide, Wolfpack case study, and an older generated OG image URL |
| Blocked by robots.txt | 3 examples: a public Next.js JavaScript chunk, an auth favicon, and auth login |
| Page with redirect | 3 URLs; redirects are not inherently errors |
| Sitemaps | Existing `/sitemap.xml` submission successful; submitted May 25, read September 5, 115 discovered pages |
| Merchant listings, September 11 | One invalid item missing `image`; optional offer warnings |
| External links | One reported link, from zyene.com to the homepage; branded anchor “zyene reviews” |
| Internal links | 234 reported links |
| Manual actions | No issues detected |
| Security issues | No issues detected |

The current live sitemap contains 119 URLs. Its total differs from Google's older processed count. A successful sitemap submission does not mean all URLs have been indexed.

## Crawl findings and changes

The production audit fetched all **119 sitemap pages** and examined **188 unique outgoing URL targets**, including 69 targets outside that sitemap. Every sitemap page returned HTTP 200, had a unique title and description, one H1, and image alt attributes. No public sitemap page had `noindex`. The homepage canonical's optional terminal slash is equivalent, not a defect.

| Requested area | Finding and implementation |
|---|---|
| Sitemap | Already existed. Kept all public URLs; replaced per-request fabricated modification dates with actual article/resource dates; omitted unknown dates. |
| Robots | Removed `/_next/` and `/favicon_io/` exclusions from public-host rules so Google can load rendering assets. Private/auth routes remain excluded. |
| Noindex | No unwanted noindex found on the 119 public pages. Kept intentional dashboard, auth, and internal-operation exclusions. |
| Canonicals | Public canonicals already pointed to HTTPS www URLs. Hardened the metadata helper so language alternates cannot accidentally remove its default canonical. |
| Titles and descriptions | All crawled titles/descriptions were unique. Shortened two overlong blog descriptions and the root fallback. |
| Headings | Retained one H1 per public page. Corrected documentation TOC heading skips and omitted the closed search dialog from initial document headings. |
| Alt text | No missing alt attributes in the public crawl. Decorative images intentionally retain empty alt to avoid redundant screen-reader narration. |
| OG/Twitter | Added shared social metadata, including the existing OG image, to all 11 documentation pages. Existing marketing OG images retained. |
| Schema | Added Product image/URL; sourced public offers from the actual plan catalog; omitted unpriced Enterprise offers and unsupported hardcoded rating data. Industry landing pages now describe a Service for a BusinessAudience instead of pretending to be physical LocalBusinesses. Removed a nonfunctional website SearchAction. |
| Broken links | Replaced `/product` and `/features/feedback-shield` links with valid destinations and added permanent legacy redirects. Corrected one nonexistent related-article slug. |
| Internal navigation | Fixed 41 broken fragment-link occurrences by sharing heading-anchor generation, adding explicit resource IDs, and aligning template download links with the real section ID. No sitemap page was orphaned in the live link graph. |
| Images | Added optimized WebP equivalents for 32 large marketing/blog assets and updated references. Combined source payload fell from 27,412,515 to 2,692,780 bytes (90.2%). Original URLs remain available. Enabled responsive logo optimization and content-image sizes. |
| Rendering/performance | Moved website schema into public layouts, removing a root-level request-header dependency that forced dynamic rendering. Kept the hero copy outside the animated client boundary, replaced homepage Framer Motion dependencies with small native scroll/pointer/reveal behavior, stopped preloading the secondary monospace font, and deferred Meta Pixel loading. |
| Mobile and accessibility | Corrected pricing-table screen-reader labels escaping their scroll container on narrow screens; retained horizontally scrollable comparison tables. Added semantic roles to labeled rating/chart graphics and improved small tour-step labels without changing brand orange. |
| HTTPS | Production already redirects HTTP to HTTPS with 308 and sends HSTS (`max-age=31536000; includeSubDomains`). Kept this behavior. |
| URL slugs | Current public slugs are readable and consistently hyphenated. Retained working URLs and added only the two evidence-based legacy redirects. |
| Backlinks | Created `docs/SEO_BACKLINK_STRATEGY.md`, grounded in Search Console's current baseline and verified vendor-listing entry points. No outreach sent. |

Google recommends keeping resources needed to render public pages crawlable and using accurate sitemap modification dates. See [robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro) and [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Validation

- `pnpm verify`: TypeScript, all 178 test files / 1,288 tests, and file-size limits passed.
- React Doctor changed-file scan: 93/100, no issues found.
- Static marketing SEO audit reviewed; decorative empty alt attributes are intentional.
- Production build passed, generating 269 static pages across the application. Public marketing pages now prerender.
- Rendered link recheck: 186 unique targets, no broken URLs, no broken fragments, no orphaned sitemap pages. All referenced local image files exist; rendered JSON-LD parses successfully.
- Final `pnpm build` passed; final `pnpm verify` again passed all 1,288 tests. React Doctor again reported 93/100 with no issues.
- Final rendered crawl: all 119 sitemap URLs returned HTTP 200; no missing/overlong metadata, incorrect canonicals, public noindex, heading skips, missing alt attributes, or JSON-LD parse failures found by the crawl checks.
- Mobile checks at 390px: homepage, pricing, blog article, resource guide, and docs fit the viewport. Pricing also fits at 768px. Pricing page overflow fell from 607px to 390px at a 390px viewport. Documentation search opens, filters to Quickstart, and closes correctly. These are representative template checks, not exhaustive device coverage.
- Both legacy paths return 308 to their intended canonical feature destinations; public robots no longer blocks Next.js assets or favicon resources.
- Production visual checks passed for the hero at nine desktop/mobile viewports and for the product-tour's replies, automatic replies, requests, keyboard controls, scroll progression, and narrow-screen controls. The navigation dropdown now remains open after a mouse click following hover.

Page-level evidence: `docs/seo-audit-2026-09-13/production-pages-before.csv`, `local-production-pages-after.csv`, and `image-optimization.csv`. The after file describes the local production build, not a deployed release.

The new regression tests cover crawler access to assets, private-host exclusions, resource anchors, real sitemap dates, canonical defaults, schema images/priced offers, article description lengths, and valid internal/related links.

## Performance evidence and limits

Initial live mobile Lighthouse diagnostic: performance 43, accessibility 94, SEO 100; LCP 10.0 seconds, FCP 1.8 seconds, TBT 1,260 milliseconds, CLS 0. Hero paragraph reveal timing was a significant measured LCP delay. Lighthouse's SEO score did not catch the Search Console indexing problem or all cross-page link defects.

An earlier local production-build run scored performance 62, accessibility 97, SEO 100, with LCP 7.0 seconds, FCP 1.7 seconds, TBT 480 milliseconds, and CLS 0. After replacing the homepage animation-library work with browser-native motion, a fresh local production run scored **performance 72, accessibility 97, SEO 100**, with LCP 6.6 seconds, FCP 1.7 seconds, TBT 200 milliseconds, and CLS 0. The local-versus-live environments differ, so these are diagnostic measurements, not a controlled production performance claim. LCP remains above the good threshold; deployment and production remeasurement are required before claiming Core Web Vitals are fixed. Four existing small orange text/white-on-orange controls remain contrast findings; brand orange was preserved as requested. The invalid ARIA-role findings were corrected.

These are lab measurements from a single run, not a field Core Web Vitals pass. Real-user LCP, INP, and CLS must be reassessed after deployment and sufficient traffic. Google's [Core Web Vitals guidance](https://web.dev/articles/vitals) distinguishes these real-user metrics from lab diagnostics.

## After deployment

1. Check production `/robots.txt`, `/sitemap.xml`, the two legacy redirects, documentation OG metadata, and `/pricing` schema against this report.
2. In Search Console, confirm the sitemap's next successful read. Resubmit the existing canonical sitemap if needed; do not create duplicate properties.
3. Use URL Inspection → Test live URL on the homepage, `/features`, `/pricing`, `/blog`, the restaurant guide, and the Wolfpack case study. Confirm rendering, crawl allowance, and canonical selection before requesting indexing for the important eligible pages.
4. Validate the repaired Product image issue once live. Do not request validation of intentional auth exclusions as though those routes should be public.
5. Recheck indexed/discovered totals and impressions after Google processes the site. Prioritize improving thin or unsupported content on pages that remain excluded, using actual product evidence rather than producing more near-duplicate pages.
6. Measure production Lighthouse again under comparable conditions, then use real-user measurements to assess Core Web Vitals.

Google can take days or weeks to recrawl and does not guarantee indexing after a request. See [Google's recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

# Zyene Reviews: SEO findings and growth plan

**Audit date:** September 29, 2026. **Audience:** U.S. local businesses across industries and U.S. agencies managing multiple businesses. **Business model:** fully online platform, as clarified by the owner today. Earlier information about in-person visits is superseded.

## Decision

Prioritize the existing local SEO checklist, then commercial comparison and agency pages. Build nationwide organic visibility around review management. Do not use a nationwide Google Maps service area or invent local offices. No tool can guarantee first place, and this audit does not claim a ranking increase.

Two content improvements are implemented locally and tested. They have **not been deployed**. Search Console validation of an already-live pricing schema fix has been started. Performance and indexing issues remain open.

## 1. Search Console baseline

Property: `sc-domain:zyenereviews.com`. Web search, June 28–September 27, 2026.

| Scope | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| All countries | 25 | 8,639 | 0.29% calculated | 20.8 UI rounded |
| United States | 10 | 7,490 | 0.13% calculated | 21.58 exported country row |

The U.S. accounts for approximately 87% of impressions. The opportunity is converting existing visibility into qualified visits, alongside expanding commercial relevance.

### Existing pages with visibility

| Page | Global clicks / impressions | U.S. impressions | U.S. average position |
|---|---:|---:|---:|
| `/resources/local-seo-checklist` | 1 / 5,115 | 4,482 | 17.02 |
| `/blog/birdeye-alternatives-for-local-businesses` | 0 / 556 | 447 | 35.41 |
| `/industries/hotels` | 0 / 421 | 333 | 45.30 |
| `/compare` | 0 / 387 | 232 | 52.85 |
| `/tools` | 0 / 311 | 203 | 22.88 |
| `/blog/how-to-get-a-google-review-link` | 1 / 558 | 122 | 37.62 |

**Data limitation:** The U.S. chart, country and device exports total 10 clicks, but the exported query and page tables each total zero clicks. The visible page table also shows zero clicks. Preserve that discrepancy: do not allocate those 10 clicks to individual URLs or interpret the table as proof of zero U.S. traffic. Exported query/page impressions also do not sum to property impressions. This report does not invent a reconciliation.

The checklist is the strongest near-term candidate: the U.S. query `local seo checklist` has 2,660 impressions, zero reported clicks and average position 13.80; `local business seo checklist` has 279 impressions at 11.83; the 2026 variant has 66 at 11.00. These are measured opportunities, not an organic difficulty score or a promise of easy rankings. Older year queries and unrelated third-party brand queries are not recommended targets.

Raw evidence: [global export](seo-audit-2026-09-29/gsc/), [U.S. export](seo-audit-2026-09-29/gsc-us/), [keyword priorities](seo-audit-2026-09-29/keyword-priorities-us.csv).

## 2. Changes implemented locally

### Local SEO checklist

- Revised title and description to match the main query and make the free checklist clear.
- Added a first-week plan and agency task ownership guidance.
- Removed arbitrary review, photo and word-count quotas; corrected profile/address guidance and outdated listing advice.
- Replaced recommendations for selectively requesting positive reviews with an honest, consistent request process.
- Added useful agency and official Google links; recorded the real update date.

### Google review link article

- Rewrote the steps around the official review link and free desktop QR-code download.
- Added location checks, troubleshooting and a register for agencies handling multiple clients.
- Removed unsupported conversion statistics, permanent-link claims and rating-filtering promotion.
- Added a neutral invitation template and official sources. Kept the original publication date and set the modification date to September 29.

Google prohibits incentives and selectively soliciting positive reviews. Private support should not restrict access to a public review link. [Google review policy](https://support.google.com/contributionpolicy/answer/7400114). Link and QR instructions follow [Google's review-request help](https://support.google.com/business/answer/3474122).

**Validation:** `pnpm verify:fast` and the full `pnpm test` suite passed: 193 test files, 1,350 tests. SEO checks cover metadata length, sitemap links, resource section anchors, canonical handling and schema helpers. The shared templates retain canonical, Open Graph, Twitter and article metadata. No route or component changes were made; a production build was not required by this repository's copy-change workflow. No production performance improvement has been measured.

## 3. Crawl and indexing

A free Python HTML crawl covered all **123 sitemap URLs** with three concurrent requests. All returned HTTP 200. Checks found no duplicate titles/descriptions, missing core SEO tags, incorrect canonical targets, multiple/missing H1s, skipped heading levels, missing image alt attributes, malformed JSON-LD, noindex directives or Googlebot robots blocks on these URLs. Checked 6,462 anchor occurrences and their same-host marketing destinations/fragments; no broken targets were found.

**Scope:** raw server HTML and same-host marketing links. This is not a JavaScript-rendered crawl, an external-link audit, an authenticated-app audit or proof that Google indexed every URL. Saved [crawl results](seo-audit-2026-09-29/crawl-pages.csv), [summary](seo-audit-2026-09-29/crawl-summary.json) and [additional checks](seo-audit-2026-09-29/crawl-extra-checks.json). The saved `crawl.py` can be run from the repository root using Python 3 and the saved sitemap; refresh that sitemap first for a future audit.

Search Console's indexing report, last updated September 20, shows:

| State | Count |
|---|---:|
| Indexed | 32 |
| Discovered, currently not indexed | 85 |
| Crawled, currently not indexed | 4 |
| Blocked by robots | 4 |
| Redirect | 3 |
| Not found | 1 |

These are property-wide counts at an earlier date, not a partition of today's 123 sitemap pages. The sitemap report was successful, last read September 25, with 122 discovered URLs. The one displayed 404 example was an old Next.js JavaScript deployment chunk, not a missing marketing article. Do not redirect that asset to the homepage.

Next: inspect indexing and Google-selected canonical for `/agencies`, the checklist, pricing and the comparison article individually. For excluded pages, assess unique value and internal links before adding more pages. The audit has not established a single cause for the 85 discovered URLs. Do not repeatedly resubmit unchanged pages or publish city/industry variations solely to increase URL count.

## 4. Speed and rich results

[Live PageSpeed report](https://pagespeed.web.dev/analysis/https-www-zyenereviews-com/kedn4z3udc?form_factor=mobile):

| Lab metric | Mobile | Desktop |
|---|---:|---:|
| Performance score | 68 | 70 |
| First contentful paint | 2.6 s | 0.4 s |
| Largest contentful paint | 5.2 s | 1.0 s |
| Total blocking time | 270 ms | 770 ms |
| Cumulative layout shift | 0 | 0 |

Accessibility 97, best practices 96, SEO 100 on mobile. No CrUX field dataset was available; do not describe these lab results as a field Core Web Vitals pass or fail.

The reported LCP element is the homepage description paragraph. Diagnostics flag render-blocking resources (estimated 760 ms saving) and 226 KiB unused JavaScript, including about 153 KiB first-party and 73 KiB Facebook code. These are diagnostic estimates, not additive guaranteed savings. Review CSS/font delivery and the first-party bundle in a controlled production preview. Evaluate delayed loading of optional UI and analytics with consent/conversion behavior preserved. Compare at least three equivalent mobile runs before choosing a fix. No speculative JavaScript or popup refactor was shipped in this audit.

The [pricing Rich Results Test](https://search.google.com/test/rich-results/result?id=qxwLAhdQM7qDF4CuN4I91g) detected **two valid items**: one product snippet and one merchant listing, with noncritical warnings. GSC's older missing-image error was based on a September 12 crawl. Validation was started September 29; it has not yet passed. [Saved confirmation](seo-audit-2026-09-29/schema-validation-started.png).

Passing a test establishes technical eligibility, not a promise of stars, a featured snippet or a ranking. Do not fabricate product ratings or add physical shipping details to this SaaS offer. [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

## 5. Research tools and access

| Requested tool | Completed work / limitation |
|---|---|
| Google Search Console | Downloaded global and U.S. performance exports; reviewed indexing, sitemap and merchant listing issue; started validation. |
| Keyword Planner | No Ads account initially existed. At the owner's request, began setup under `zyene.inc@gmail.com`; Google assigned account **167-733-8323**. Business name and website are filled in. Planner still redirects to unfinished onboarding. No campaign launched or billing entered. |
| Google Trends | Exported U.S., past-12-month web-search comparison of review management, google reviews and AI review response. |
| AnswerThePublic | Used free U.S./English search for google reviews; saved visible question and estimate output. |
| Ubersuggest | Used actual GSC positions plus free question research instead; no paid subscription and no invented difficulty metric. |
| Screaming Frog | Used the saved free Python crawler for the defined HTML checks. |
| PageSpeed Insights | Completed live mobile and desktop homepage tests; problems remain open. |
| Rich Results Test | Verified current pricing eligibility; initiated GSC validation of the stale error. |
| Yoast | Used the site's Next.js metadata/schema checks and SEO audit instead of installing a WordPress plugin. |
| Google Business Profile | Inspected existing parent Zyene listing; no edits. Fully online business clarification changes eligibility. |

### Keyword Planner checkpoint

Google's current help says completing account setup and entering billing information is required for keyword ideas. The setup page includes rights/terms notices. The owner must complete the necessary terms and billing steps; no advertising budget has been authorized. Keep campaigns unpublished. [Google Keyword Planner access requirements](https://support.google.com/google-ads/answer/7337243). [Setup screenshot](seo-audit-2026-09-29/keyword-planner-setup.png).

Once access is available, use United States, English, Google search network and the last 12 months. Start with [prepared seeds](seo-audit-2026-09-29/keyword-planner-seeds.txt), export monthly volume ranges and seasonality, and preserve the settings. Ads competition/CPC are advertising metrics, not organic ranking difficulty. Until then, Keyword Planner volumes remain unavailable.

### Trends and questions

The Trends sample does **not** show an impending surge. For the latest complete week, September 20, the shared normalized index is 3 for review management, 15 for google reviews and below 1 for AI review response. The September 27 week is incomplete and excluded from that comparison. A value below 1 is not zero searches. Scores are relative interest, not monthly volume. This was a targeted comparison, not a scan of every Google trend. [Saved export](seo-audit-2026-09-29/google-trends-us-12-months.csv).

AnswerThePublic surfaced useful questions around getting review links, removal, disappearing reviews and required review counts. Its displayed estimates include 1,600 for `can google reviews be deleted`, 1,300 for `can google reviews be removed` and 90 for `how many google reviews do i need`. These are vendor estimates, not verified Keyword Planner data. Use them to improve relevant existing articles; do not treat generated AI prompt suggestions as observed Google queries. [Saved free results](seo-audit-2026-09-29/answerthepublic-snapshot.txt).

## 6. Business Profile decision

The inspected listing is the parent **Zyene**, linking to `zyene.com`, with a public San Francisco address, software-company category and one review. It is not a separate verified Zyene Reviews listing.

The owner's latest clarification is that the platform is fully online. Google requires eligible in-person customer contact; an online-only platform should pursue nationwide organic search rather than a service-area profile. A mailing or virtual office does not supply eligibility. [Google business representation guidelines](https://support.google.com/business/answer/3038177).

No address, category, service area, website, business name or profile deletion was submitted. The parent listing needs owner review: establish whether the parent has a distinct eligible operation, or work with Google support on the appropriate correction if it is also online-only. Hiding an address alone does not make an online-only operation eligible. Do not mark the business permanently closed while it is still operating online.

Local SEO educational content still serves Zyene's target customers. It does not imply Zyene itself has a local storefront. Use genuine customer product reviews and authorized case studies to build trust, without presenting them as Google Maps reviews or manufacturing aggregate ratings.

## 7. Priorities for the next 90 days

| When | Action | Completion evidence |
|---|---|---|
| Week 1 | Release the two verified content updates through the normal deployment process | Live titles, copy, canonicals and modification dates verified |
| Week 1 | Inspect the four priority URLs in GSC; resolve page-specific indexing issues | Recorded indexed status, canonical and last crawl |
| Weeks 1–2 | Profile homepage production CSS/JS; test the most relevant speed fix | Repeatable lab comparison and working lead/conversion flows |
| Weeks 2–3 | Strengthen `/agencies` with verified multi-client workflow, screenshots, permissions, onboarding and pricing details | Product evidence and clear demo/trial path; no unsupported white-label claims |
| Weeks 2–4 | Refresh the existing Birdeye comparison with dated official sources and original evaluation | Verified prices/features and a useful suitability comparison |
| Weeks 3–6 | Improve hotel page only with genuine sector-specific workflow/evidence | Original examples or consented customer case study |
| Weeks 4–8 | Improve review-link and review-removal content using actual questions; link naturally to relevant product pages | Task completion, qualified visits and assisted conversions |
| Weeks 6–12 | Evaluate what earns visits and trials, then expand the proven cluster | 28-day U.S. comparison and page-level conversion evidence |

The brand is early in organic search. Do not spend the first month mass-producing general articles, location doorway pages or paid link placements. First improve the pages Google is already showing and add concrete product/customer evidence where commercial pages are weak.

### Measurement

Use weekly checks and a 28-day U.S. Web-search comparison. Track priority-page impressions, clicks and CTR alongside query positions; compare within consistent devices and countries. Record indexed status separately. Track organic demo requests, signups and activation with the existing analytics setup, verifying those events before claiming conversion impact. GSC clicks alone do not prove revenue.

For the checklist, use 4,482 U.S. impressions and position 17.02 as the current page baseline, preserving the click-table discrepancy. For the main checklist query, use 2,660 impressions and position 13.80. Initial success means measurable improvement in relevant visits and conversions, not an arbitrary promise of position one. No recurring monitoring automation was created.

## Files to use

- [Keyword priorities with observed U.S. metrics](seo-audit-2026-09-29/keyword-priorities-us.csv)
- [Keyword Planner seed list](seo-audit-2026-09-29/keyword-planner-seeds.txt)
- [Agency/client checklist template](seo-audit-2026-09-29/agency-checklist-template.csv)
- [Crawl inventory](seo-audit-2026-09-29/crawl-pages.csv)
- [Global GSC evidence](seo-audit-2026-09-29/gsc/) and [U.S. evidence](seo-audit-2026-09-29/gsc-us/)

The evidence folder contains private search-performance exports. Review sharing before committing it to a public repository. No commit, push or deployment was performed during this audit.

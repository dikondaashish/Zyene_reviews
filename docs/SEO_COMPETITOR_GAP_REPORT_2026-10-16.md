# SEO / AEO competitor gap report: Birdeye, Podium, NiceJob (2026-10-16)

**Goal:** own "review management software for local businesses" and the queries around it.
**Method:** the `keyword-research` and `content-gap-analysis` skills (intent, KD/MSV tiers, gap matrix, priority scoring), applied to competitor homepages, sitemaps and page source fetched on 2026-10-16, plus the Zyene repo inventory.

> **Data caveat.** No Ahrefs, Semrush or GSC was connected, so every volume (MSV) and difficulty (KD) figure is a **directional estimate** (H/M/L tiers). SERP observations came from a web-search tool, not Google. Validate against GSC impressions before committing large resources.

## 1. What changed this round (shipped in code)

| Area | Change |
|---|---|
| Help center (23 articles) | Each article now has `TechArticle` and `BreadcrumbList` JSON-LD in one `@graph`, alongside the existing `FAQPage`. The TechArticle carries headline, description, `articleSection`, `timeRequired` and publisher = Organization. Help data has no real dates, so no dates are emitted. |
| `/docs/*` (11 pages) | Titles, descriptions and schema now come from one place, `src/lib/seo/docs-page-seo.ts`. Thin titles ("API Reference \| Zyene Reviews") are replaced with keyword titles of 60 characters or fewer, e.g. "Review Management REST API Reference". Each page gets `TechArticle` and `BreadcrumbList`. |
| Accuracy fix | The `/docs/install` description no longer claims MCP support. The page is about using the API with AI coding tools. |
| Tests | `tests/unit/tech-article-schema.test.ts`: every help article and docs route is checked for its schema, title length and the absence of invented dates. |

No new routes were added, so `src/lib/seo/sitemap.ts` is unchanged. Help and docs URLs were already in the sitemap.

## 2. Competitor positioning (verified 2026-10-16)

- **Birdeye** has moved upmarket. Its homepage reads "AI Coworkers for Multi-location Brands", and `/review-management/` is now titled "AI Review Response Agent for Multi-Location Brands". It keeps free tools such as a Google reviews calculator and a review link generator, and 13 alternatives pages, **none for NiceJob**. Its 129-term glossary has only about 5 review-related entries.
- **Podium** has repositioned. Its H1 is "The #1 converting AI Employee for local businesses", and the homepage has no JSON-LD (its articles do have Article schema). Its roughly 100 review articles are **going stale**: by sitemap lastmod, 3 were updated in 2025 and none in 2026. Its "review management software" pillar was last modified 2024-11 and still says "2025" in the title. It still owns the "review gating" SERP with an old article.
- **NiceJob** is the active SMB content competitor: 159 URLs were updated in 2026, including 14 "how to get more reviews for your {trade} business" posts. Its homepage has no JSON-LD, but `/product/reviews` has Product and AggregateRating schema. The repo's verified facts list its Starter plan at $75/mo, against Zyene's $29.99.
- **Head commercial SERPs are dominated by directories and listicles** (Capterra, G2, GetApp, BrightLocal's tool comparison). No vendor clearly owns "review management software for local businesses" or "…for small business".

## 3. Gap matrix (summary)

| Topic | Zyene | Birdeye | Podium | NiceJob | Read |
|---|---|---|---|---|---|
| Small-business landing page | ❌ | thin | thin | partial | **Open; transparent price wins** |
| "Best review management software" | ❌ | partial | stale | partial | **Open** |
| Category pricing guide | ❌ | ❌ | ❌ | ROI calc | **Open** |
| Podium / NiceJob alternatives | compare pages only | Podium ✅ / NiceJob ❌ | n/a | ✅ | Need listicles |
| How to get more Google reviews (head term) | narrower post only | partial | stale | ✅ trades | **Open** |
| Review gating / Google policy | ❌ | ❌ | ✅ (old) | partial | **Strategic + defensive** |
| Google review calculator | ❌ | ✅ | ❌ | ❌ | Build |
| Standalone QR code generator | feature page only | ❌ | ❌ | blog | Build |
| Review-specific glossary | ❌ | generic | ❌ | ❌ | Open, low KD |
| Trade verticals (roofing, cleaning, landscaping, pest control) | ❌ | ❌ | partial | ✅ | Selective |

## 4. Prioritized page plan

The titles below leave out " | Zyene Reviews" and are at most 60 characters. When you build any of these pages:
- use `buildMarketingMetadata`, which applies `fitMarketingTitle` and the social defaults;
- add the URL to `src/lib/seo/sitemap.ts`;
- add JSON-LD through `@/components/seo/json-ld`.

### P0: core money queries plus defensive AEO

| # | Page | Status | Primary keyword (intent, est. MSV/KD) | Title |
|---|---|---|---|---|
| 1 | `/small-business` | New landing | review management software for small business (C/T, M–H / 50–65) | Review Management Software for Small Business |
| 2 | `/` homepage | Title upgrade | review management software for local businesses (C/T, L–M / 35–50) | Review Management Software for Local Businesses ¹ |
| 3 | `/blog/best-review-management-software` | New listicle | best review management software (C, M–H / 60–75) | Best Review Management Software for Small Business (2026) |
| 4 | `/blog/review-management-software-pricing` | New guide | review management software pricing (C, M / 30–45) | Review Management Software Pricing: 2026 Cost Guide |
| 5 | `/blog/podium-alternatives-for-local-businesses` | New listicle | Podium alternatives (C, M / 35–50) | Podium Alternatives for Local Businesses (2026) |
| 6 | `/blog/how-to-get-more-google-reviews` | New pillar | how to get more Google reviews (I, H / 45–60) | How to Get More Google Reviews (2026 Playbook) |
| 7 | `/blog/review-gating-google-policy` | New explainer | review gating (I, L–M / 25–40) | Is Review Gating Allowed? Google's Policy Explained ² |

¹ "Review Management Software for Local Businesses" is 47 characters, so adding " | Zyene Reviews" would push it past 60 and `fitMarketingTitle` would drop the brand. Decide whether the homepage keeps the brand in its title (current: "Review Management for Local Businesses | Zyene Reviews", 54 chars) or takes the keyword.
² Before publishing, product and legal must confirm how Negative Feedback Shield behaves for low ratings, specifically whether the customer still sees a public-review option. Google prohibits review gating, so the page must describe the product accurately. Cite Google's policy page directly.

### P1: next wave

| # | Page | Status | Primary keyword | Title |
|---|---|---|---|---|
| 8 | `/resources/negative-review-templates` | Upgrade | how to respond to negative reviews (I, H) | How to Respond to Negative Reviews (20+ Templates) |
| 9 | `/tools/google-review-calculator` | New tool | Google review calculator (I, M / 20–35) | Google Review Calculator: Reviews Needed for 4.5+ |
| 10 | `/tools/google-review-qr-code-generator` | New tool | free Google review QR code generator (T, M) | Free Google Review QR Code Generator |
| 11 | `/blog/birdeye-vs-podium-vs-nicejob` | New comparison | Birdeye vs Podium (C, L–M) | Birdeye vs Podium vs NiceJob: Which Fits a Local Business? |
| 12 | `/blog/nicejob-alternatives` | New listicle | NiceJob alternatives (C, L / 10–25) | NiceJob Alternatives for Service Businesses (2026) |
| 13 | `/blog/what-is-review-management` | New definition | what is review management (I, M) | What Is Review Management? A Local Business Guide |
| 14 | `/blog/how-to-use-ai-to-respond-to-reviews` | New how-to | AI review response (I/C, M) | How to Use AI to Respond to Google Reviews (Safely) |
| 15 | `/blog/can-you-offer-incentives-for-google-reviews` | New (or merge into #7) | incentives for Google reviews (I, L–M) | Can You Offer Incentives for Google Reviews? (2026 Rules) |
| 16 | `/industries/{roofing,cleaning-services,landscaping,pest-control}` | New ×4 | {trade} review management software (C, L each) | e.g. Roofing Review & Reputation Management Software |

### P2: long tail

| # | Page | Notes |
|---|---|---|
| 17 | `/resources/review-management-glossary` | DefinedTermSet schema. Birdeye's glossary is generic marketing terms, and Podium and NiceJob have none. |
| 18 | `/industries/med-spa` | Podium covers med spas; Birdeye and NiceJob don't. Watch patient-privacy wording. |
| 19 | `/blog/google-vs-yelp-vs-facebook-reviews` | Podium's version is stale. Zyene's inbox covers all three platforms. |
| 20 | `/integrations/square` | **Only once the Square integration is generally available.** It is in early access today. |

**AEO pattern for every page:**
- Lead with a 40–60 word answer that can be quoted directly.
- Add FAQPage schema.
- Comparison pages need an ItemList and verified pricing with a "checked on" date. Use only `verified-competitor-facts.ts`, never third-party price snippets.
- Tool pages reuse `FreeToolJsonLd`.

## 5. Quick wins on existing pages

1. **Homepage title.** Decide footnote ¹. Add a one-sentence answer under the H1 to "What is review management software for local businesses?".
2. **`/features/qr-code-reviews`.** The metaTitle "Google Review QR Code Generator" targets tool intent on a feature page and cannibalises the QR blog post. Retitle to "Google Review QR Codes & NFC Stands", then point "generator" intent at a tool.
3. **`/compare` hub.** Retitle to "Review Management Software Comparison (2026)". Add an ItemList of the compare pages and show `COMPETITOR_FACTS_CHECKED_ON` visibly.
4. **Negative-review templates resource and the 1-star post.** Retarget the resource to the head term, link up to it from the 1-star post, and add a 5-step answer block.
5. **HVAC, plumbing, electricians and home-services industry pages.** Add a "How do {trade} businesses get more Google reviews?" FAQ with two SMS templates each.

## 6. Open items and caveats

- All MSV and KD figures are estimates. Check GSC first.
- A `site:zyenereviews.com` search returned no results in the research search tool. That is probably that tool's index, but confirm coverage in Google Search Console and Bing Webmaster Tools.
- Third-party competitor prices seen in snippets (Birdeye $299–449, Podium $289/$399) are unverified and conflict with the repo's verified facts ("Custom quote", checked 2026-10-11). Do not publish them.
- Correction to the earlier audit: Podium articles and NiceJob's `/product/reviews` page **do** ship JSON-LD. Only the homepages lack it.
- Podium freshness is based on sitemap `lastmod`, which may not match actual content edits.

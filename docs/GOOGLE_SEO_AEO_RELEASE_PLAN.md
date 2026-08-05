# Google SEO/AEO Module — Release Plan

**Owner:** Product · **Status:** Draft for approval · **Date:** 2026-08-05
**Surface:** `app.zyenereviews.com/google-seo-aeo`
**Code:** `src/app/(dashboard)/google-seo-aeo/`, `src/components/google-seo-aeo/`, `src/services/inngest/sync-workers/google-seo-aeo-*.ts`, migration `20260421120000_google_seo_aeo_tables.sql`

---

## 0. Executive summary

### 0.1 The finding that gates everything

**Two of the three headline features on this page produce fabricated data and present it as measurement.** This is a launch blocker and must be resolved before any new feature work ships.

| Feature | What the UI implies | What the code actually does | Evidence |
|---|---|---|---|
| AI Visibility (ChatGPT, Claude, Gemini, Grok, Llama, Perplexity) | We queried 6 AI engines and report whether you were found, and at what position | Calls **zero** AI engines. Compares your `average_rating` to the max competitor rating; if yours is higher, writes `found=true, position=2` for ChatGPT and `found=false` for the other five. Every run. | `google-seo-aeo-ai-visibility-worker.ts:56-80` |
| Local Heatmap | Geo-grid rank tracking across your service area | Calls **zero** SERP or Maps APIs. Generates six labels by string-concatenating `city` (`North {city}`, `Downtown {city}`…) and derives rank from `21 - average_rating`, visibility from `100 - rank*4`. | `google-seo-aeo-heatmap-worker.ts:63-88` |
| SEO/AEO Score | 11-point audit | Real, but **5 of 11** items are hard-coded `status: "pending"` and excluded from the score. Score is computed over **6 measured** items, one of which (`services-list`) is an admitted proxy — place action links standing in for a services list. | `google-seo-aeo-build-audits.ts:60-90` |

Both cards do carry a "Beta estimate" line in the UI ("Beta estimate from internal scoring heuristics", "Beta estimated geo-grid"). That is weaker than it needs to be but it is not nothing. The real problem is that "beta" reads as *early*, not as *not measured*: nothing discloses that the figures are derived from the customer's own review rating, so when a rating moves and "AI visibility" moves with it, the user reads causation. Selling this as AI visibility tracking is a trust exposure, not just tech debt.

**Recommendation (Phase 0, week 1):** feature-flag both surfaces off by default, and when re-enabled replace "beta" with an explicit method disclosure, until Phase 1 real sampling ships. Do not build on top of these tables' current semantics.

**Status: implemented 2026-08-05.** See §10.

### 0.2 Strategic position

Zyene Reviews is a **local, multi-location reputation platform** at $29.99 (Starter) / $59.99 (Professional). The named benchmarks are a different market:

| Competitor | Buyer | Rough entry price | Unit of analysis |
|---|---|---|---|
| Profound | Enterprise brand / agency | ~$500–$3,000+/mo | Brand across the open web |
| Semrush AI Toolkit | SEO team | ~$99–$500+/mo add-on | Domain + keyword universe |
| Ahrefs Brand Radar | SEO team | Bundled with Ahrefs plans | Brand mentions in a large prompt index |
| Scrunch AI | Enterprise / mid-market | Enterprise quote | Brand + AI-agent content delivery |
| Peec / Otterly / AthenaHQ / Rankability | SMB / solo marketer | ~$30–$150/mo | Prompt list + competitors |

Copying Profound feature-for-feature at $59.99/mo is not financially possible (see §6). **The defensible position is "the AEO product for local and multi-location businesses"** — the one thing none of the five benchmarks do well, because AI answers to local queries ("best dentist near me", "who does emergency plumbing in Round Rock") are driven by exactly the assets Zyene already owns: Google Business Profile, review corpus, competitor sets, and Places data. Feature parity with Peec/Otterly at the prompt-tracking layer, plus local geo-grid and GBP/review integration nobody else has, is a category-defining position. Feature parity with Profound is not.

**Confirmed 2026-08-05 (Q1):** local + multi-location owners, local-first AEO. The cost model in §6.2 independently validates this — the geo-grid that none of the five benchmarks offer costs $0.18/business/month.

### 0.3 What we are shipping

- **Phase 1 (12 weeks):** real multi-engine sampling for 5 engines, real citation extraction, real local geo-grid, prompt library, honest technical AEO audit, dashboard, CSV, email alerts. Everything in Phase 1 is *measured*, not estimated.
- **Phase 2 (10 weeks):** competitive parity — sentiment, share of voice, AI-crawler log analytics, JS-render diffing, scheduled PDF reports, public API, Slack.
- **Phase 3 (10 weeks):** differentiation — review-corpus → AI-citation loop, multi-location AEO rollup, white-label, anomaly detection, impact attribution.

---

## 1. Current-state inventory

| Asset | State | Reusable for this plan? |
|---|---|---|
| `google_seo_ai_visibility_runs` / `_results` | Schema OK (run/result split, RLS SELECT-only). Data is synthetic. | Schema **extends**; data must be **truncated** at cutover |
| `google_seo_heatmap_runs` / `_cells` | `cell_label` is a text string, no lat/lng. Cannot store a real grid. | **Replace** — needs lat/lng/radius columns |
| `buildGoogleSeoAeoAudits` | 5 real checks (description, review freq, rating, reply rate, profile activity); 6 stubs | Keep 5, implement the 6 |
| `getGoogleSearchKeywords` / `getGooglePerformanceTotals` | Real GBP Performance API data | **Core input** for prompt seeding |
| `competitors` table + Places enrichment | Real (`external-metrics.ts`) | **Core input** for competitor set |
| `DescriptionOptimizerCard` + `/api/ai/optimize-business-description` | Real Gemini-backed optimizer | Seed for content engine (F6.6) |
| Inngest workers + `runGoogleSeoAeoSyncNow` action | Real queueing, role-gated (`owner/admin/manager`) | **Core** orchestration |
| Vertex/Gemini adapter (`vertex-adapter.ts`) | Real, with primary/fallback + JSON schema mode | **Core** for extraction/classification |
| Upstash Redis | Configured | Use for quota + rate limiting |
| GSC integration | **Does not exist** | Must build (E-2) |
| Web crawler | **Does not exist** | Must build (E-3) |
| SERP / AI Overview data source | **Does not exist**, no API key in `env.ts` | Must procure (Q3) |
| OpenAI / Anthropic / Perplexity API keys | **Do not exist** in `env.ts` | Must procure (Q3) |

**Architectural constraint carried into all estimates:** project standards cap pages/API at 100 lines, components at 150, lib/services at 200 (`.claude/rules/project-standards.md`). Every service below is specified as a set of small modules, and estimates include that decomposition.

---

## 2. Feature matrix

Phase key: **P1** = must-have to be usable at launch · **P2** = competitive parity · **P3** = differentiation.
Effort: **XS** ≤2d · **S** 3–5d · **M** 1.5–2.5w · **L** 3–5w · **XL** ≥6w (one senior fullstack engineer-equivalent).

> Competitor claims below reflect these products as of this writing; this space ships fast. Re-verify at build time before using any of these as a spec.

### Pillar 1 — Multi-engine tracking

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F1.1 | Run orchestrator: scheduled prompt × engine sampling, retries, partial-failure handling, per-plan cadence | P1 | L | Table stakes; every one of the five benchmarks runs scheduled sampling |
| F1.2 | Classic Google SERP position tracking (organic top-100, local pack, featured snippet, PAA presence) | P1 | M | Semrush and Ahrefs both anchor AI data to classic rank; users will not trust AEO numbers without the SEO baseline |
| F1.3 | Google AI Overview: presence, our-brand mention, cited sources | P1 | M | Semrush AI Toolkit and Ahrefs Brand Radar both track AIO — highest-volume AI surface for local intent |
| F1.4 | Google AI Mode capture | P2 | M | Semrush and Profound have added AI Mode; growing share, but not yet where local buyers are |
| F1.5 | ChatGPT sampling via API, with browsing/search tool enabled | P1 | M | Every benchmark; #1 engine users ask about |
| F1.6 | Perplexity sampling via API (returns citations natively) | P1 | S | Every benchmark; cheapest high-quality citation source |
| F1.7 | Gemini sampling with Google Search grounding | P1 | S | Semrush tracks Gemini; we already have the Vertex client and grounding flag |
| F1.8 | Claude sampling with web search tool | P2 | S | Profound and Scrunch track Claude |
| F1.9 | Copilot sampling | P3 | M | Profound and Scrunch track Copilot; low local-query volume, no clean API |
| F1.10 | Engine coverage & freshness panel (which engines ran, when, what failed, what your plan includes) | P1 | S | Peec/Otterly make freshness explicit; required for trust after §0.1 |
| F1.11 | Geo/locale-scoped sampling (city, region, language) per business location | P2 | M | Semrush and Profound offer market selection; for us it is the core local unlock |
| F1.12 | **Real local geo-grid rank tracking** — lat/lng grid around the business, per-point local-pack rank, replaces the simulated heatmap | P1 | L | None of the five do this (it is BrightLocal/Local Falcon territory) — our differentiation, and it removes a fabricated feature |
| F1.13 | Repeat sampling (N runs per prompt) with variance reporting | P2 | S | Profound and Peec repeat-sample; single samples of LLMs are not reproducible and will generate false alerts |
| F1.14 | Answer volatility index per prompt | P3 | S | Profound surfaces stability; tells users which prompts are worth optimizing for |

### Pillar 2 — Citation & source tracking

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F2.1 | Citation extraction: URL, domain, title, ordinal position, inline-vs-footnote, per answer | P1 | M | Core of Ahrefs Brand Radar and Profound; without it "visibility" is unactionable |
| F2.2 | Own-domain citation rate + mean citation position, trended | P1 | S | Ahrefs and Profound headline metric |
| F2.3 | Cited-URL leaderboard: which of our pages get cited, for which prompts, how often | P1 | S | Ahrefs; the single most actionable AEO report |
| F2.4 | Uncited-relevant-page gap report (page targets the topic, never cited) | P2 | M | Ahrefs content recommendations |
| F2.5 | Third-party source dependency: which domains get cited *instead of us* (Yelp, Reddit, TripAdvisor, directories, competitor blogs) | P1 | S | Profound and Scrunch; for local businesses this is usually the whole answer |
| F2.6 | Citation → organic traffic correlation (join GSC + citation events) | P3 | M | Profound ties AI presence to outcomes |
| F2.7 | AI crawler/agent log analytics (GPTBot, ClaudeBot, PerplexityBot, Google-Extended hit volume) | P2 | L | Profound and Scrunch both sell this; needs log ingestion (see Q5) |
| F2.8 | **Review-corpus citation tracking**: detect when an AI answer quotes or paraphrases our Google reviews | P2 | M | Nobody does this — only possible because we already own the review corpus |
| F2.9 | Citation history/diff per URL (gained, lost, position moved) | P2 | S | Profound; feeds F8.2 alerts |

### Pillar 3 — Competitor intelligence

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F3.1 | Competitor set management with Places auto-suggest (reuse existing `competitors` table) | P1 | S | Semrush and Peec require competitor sets; we already have the table + enrichment |
| F3.2 | Share of voice by engine and overall (mention share across all sampled answers) | P1 | M | Semrush AI Toolkit and Profound headline metric; Peec's core screen |
| F3.3 | Sentiment classification of each brand mention (positive/neutral/negative + rationale) | P2 | M | Semrush and Profound both ship sentiment |
| F3.4 | Mention prominence (first-mention ordinal, mentioned-in-answer vs mentioned-in-citations only) | P2 | S | Profound and Peec differentiate a passing mention from a recommendation |
| F3.5 | Competitor citation-source overlap (what sources cite them but not us) | P2 | M | Ahrefs; converts directly into a link/listing action list |
| F3.6 | Head-to-head prompt drill-down (single prompt → all engines → who was named, verbatim answer) | P1 | S | Peec and AthenaHQ's fast-time-to-value screen; also our evidence UI |
| F3.7 | Competitor page tracking (their new/updated pages that gain citations) | P3 | L | Ahrefs Brand Radar + Site Explorer |
| F3.8 | Attribute extraction: what AI says we are good/bad at, vs competitors (price, speed, quality, service) | P2 | M | Profound conversation-level analysis; extremely strong local narrative |
| F3.9 | Competitor overlay on the geo-grid (who outranks us, where) | P2 | M | Local-tool territory; pairs with F1.12 |

### Pillar 4 — Prompt-level analytics

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F4.1 | Prompt library: CRUD, bulk paste/CSV import, enable/disable, per-plan quota | P1 | M | Every benchmark; the product's primary object |
| F4.2 | AI-suggested prompts seeded from GBP category, services, city, and GSC/GBP search terms | P1 | M | Semrush and AthenaHQ auto-suggest; our seeds are better because we have real GBP query data |
| F4.3 | Topic/cluster tagging (manual + AI-assigned) with cluster rollup | P1 | S | Semrush tracks by topic; Profound by conversation theme |
| F4.4 | Funnel-stage + intent classification (discovery / comparison / transactional / branded) | P2 | S | Profound segments by intent; changes which pages we recommend |
| F4.5 | Prompt-level visibility trend chart (per engine, over time) | P1 | S | Every benchmark |
| F4.6 | Cluster-level visibility score and share of voice | P2 | S | Semrush; how SEO teams actually plan work |
| F4.7 | Prompt discovery from real demand (GSC queries + GBP search terms + AI expansion) | P2 | M | Ahrefs Brand Radar's prompt index is its moat; ours is grounded in the customer's own query data |
| F4.8 | Prompt demand/volume estimate | P3 | L | Ahrefs and Profound estimate prompt volume; requires panel or third-party data we do not have |
| F4.9 | Quota & cost meter (prompts × engines × cadence against plan allowance, with projected spend) | P1 | S | Operationally required (§6); Otterly/Peec expose credit meters |

### Pillar 5 — Technical AEO/SEO audit

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F5.1 | Site crawler: sitemap + link discovery, raw HTML fetch, politeness/robots-respecting, per-plan page cap | P1 | L | Semrush and Ahrefs site audits; prerequisite for F5.2–F5.8 and all of Pillar 6 |
| F5.2 | Crawlability/indexability checks: robots.txt, meta robots, canonical, HTTP status, redirect chains, orphan pages | P1 | M | Semrush Site Audit, Ahrefs Site Audit |
| F5.3 | **AI-crawler access audit**: robots.txt rules for GPTBot / ClaudeBot / PerplexityBot / Google-Extended / CCBot, plus CDN/WAF AI-blocking detection | P1 | S | Scrunch and Profound; single highest-impact AEO blocker and trivially checkable |
| F5.4 | Schema/JSON-LD extraction + validation (LocalBusiness, Organization, FAQPage, Product, Article, BreadcrumbList, AggregateRating) | P1 | M | Semrush and Scrunch validate structured data; we already have generators in `src/lib/seo/` |
| F5.5 | JS-rendering delta (raw HTML vs headless-rendered DOM; flag content only visible after JS) | P2 | L | Semrush and Ahrefs both render; AI crawlers largely do not execute JS, so this is a real AEO blocker |
| F5.6 | Core Web Vitals + page experience via CrUX/PageSpeed Insights API | P2 | S | Semrush Site Audit; free data source |
| F5.7 | GSC indexation status join (indexed / discovered-not-indexed / excluded per URL) | P2 | M | Semrush; needs GSC OAuth (E-2) |
| F5.8 | **Answerability audit**: question-form headings, direct-answer paragraph within N words, extractable lists/tables, chunk length, entity clarity, publish/update dates, author markup | P1 | M | Scrunch audits AI-readiness; this is the AEO analogue of an on-page audit and maps to our existing CORE-EEAT skill rubric |
| F5.9 | `llms.txt` / AI-content-endpoint presence and validity | P3 | XS | Scrunch; low cost, emerging standard, good marketing |
| F5.10 | **GBP completeness audit — 5 stubs + 1 proxy replacement.** (a) Implement the 5 stubbed checks with real Google data: photo count/recency, post frequency, post keyword coverage, service descriptions, service-area radius. (b) **Replace the `services-list` proxy**, which today scores `actionLinkCount >= 25` — place action links standing in for a services list — with a real Google services check. (b) is not optional: it is already scored, so it will not surface as a `pending` row and cannot be found by "finish the stubs". Acceptance criterion #29 is not met while any proxy remains. | P1 | M | Local-tool parity (BrightLocal/Semrush Local); removes 5 `pending` rows and the one measured-but-indirect signal that inflates confidence in the score |
| F5.11 | NAP consistency across major directories | P3 | L | Local-tool parity; large third-party data dependency |
| F5.12 | Blocker severity triage: critical/high/medium with "this is why you are not being cited" linkage to affected prompts | P1 | S | Semrush and Ahrefs prioritize by severity; the linkage to prompts is ours |

### Pillar 6 — Content optimization engine

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F6.1 | Page-level citation-gap brief: for a target URL + prompt, what the cited pages contain that ours does not, as a concrete edit list | P1 | L | Ahrefs content recommendations, Scrunch optimization; must be page-specific per brief constraint |
| F6.2 | Prompt → page mapping (which existing page should own each prompt; flag prompts with no owner) | P1 | M | Semrush and AthenaHQ map prompts to content |
| F6.3 | Rewrite suggestions with side-by-side diff and copy-to-clipboard | P2 | M | Scrunch delivers optimized content; reuse `geo-content-optimizer` skill rubric |
| F6.4 | FAQ/Q&A block generator from prompts where we are absent, with FAQPage JSON-LD output | P1 | M | Scrunch; FAQ blocks are the highest-yield AEO edit and we already have `schema-markup-generator` logic |
| F6.5 | Schema patch generator: exact JSON-LD to paste, validated against the page's existing markup | P1 | S | Semrush flags missing schema but does not generate it — a parity-plus item; we already have `src/lib/seo/*-schema.ts` |
| F6.6 | GBP optimizer: description, services, posts, Q&A — extends the existing `DescriptionOptimizerCard` | P1 | M | Local parity; the existing card is the seed |
| F6.7 | **Review-mining content briefs**: turn recurring themes/questions in our review corpus into page content and FAQ entries | P2 | M | Unique to us — no benchmark has the customer's review corpus |
| F6.8 | Content freshness/decay queue (pages losing citations or rank, sorted by opportunity) | P2 | M | Ahrefs content decay reporting |
| F6.9 | Impact tracking: mark a recommendation as applied, measure citation/rank delta over the next N sampling cycles | P2 | M | Profound ties actions to outcomes; makes retention argument concrete |
| F6.10 | One-click publish to GBP (description, post, Q&A answer) using existing write scopes | P2 | M | Local parity; we already hold GBP write access (`listing-patch-api.ts`, `qanda.ts`) |

### Pillar 7 — Reporting & exports

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F7.1 | Module dashboard: AI Visibility Score, SEO Score, trend sparklines, engine breakdown, top movers | P1 | M | Every benchmark |
| F7.2 | CSV export on every table (prompts, results, citations, competitors, audit findings, geo-grid) | P1 | S | Every benchmark; `src/services/competitors/export-api.ts` is the pattern |
| F7.3 | PDF/HTML report generation (branded, date-ranged) | P2 | M | Semrush and Otterly; agency requirement |
| F7.4 | Scheduled email reports (weekly/monthly, per-recipient) | P2 | S | Semrush and Peec; reuse Resend + `weekly-digest-email` pattern |
| F7.5 | White-label: logo, colors, sender domain, "powered by" removal | P3 | M | Agency-tier competitors; upsell lever |
| F7.6 | Public REST API + scoped API keys + rate limits, covering prompts, results, citations, scores | P2 | L | Profound's enterprise wedge; our comparison pages already claim "REST API on all paid plans" |
| F7.7 | Outbound webhooks on alert/run-complete events | P3 | S | Profound |
| F7.8 | Looker Studio connector / BigQuery export | P3 | L | Profound; enterprise/agency reporting |
| F7.9 | Multi-location rollup (org-level AEO scorecard across all businesses) | P2 | M | Nobody in the five does multi-location AEO — direct fit with our multi-location plans |
| F7.10 | **Methodology & provenance panel**: for every number, show engine, model version, sample count, timestamp, and raw answer | P1 | S | No benchmark exposes this well; after §0.1 it is non-negotiable for us |

### Pillar 8 — Alerting

| ID | Feature | Phase | Effort | Justification / who does this |
|---|---|---|---|---|
| F8.1 | Visibility/SoV threshold alerts (absolute and relative change) | P1 | S | Otterly and Peec lead with alerting |
| F8.2 | Citation gained/lost alerts per URL | P1 | S | Ahrefs and Otterly |
| F8.3 | Rank movement alerts (classic organic + local pack + geo-grid cell drops) | P1 | S | Semrush position tracking alerts |
| F8.4 | Technical blocker alerts (AI crawler newly blocked, noindex on a money page, schema break, 5xx) | P1 | S | Scrunch and Semrush; highest-severity class |
| F8.5 | Competitor overtake alerts ("X passed you on 4 prompts") | P2 | S | Peec |
| F8.6 | Negative sentiment spike alert | P2 | S | Semrush sentiment tracking |
| F8.7 | Channels: in-app + email (P1); Slack + webhook (P2) | P1/P2 | S/M | Otterly and Peec are email/Slack-first |
| F8.8 | Noise control: significance gate on sample variance, per-alert cooldown, daily digest bundling | P1 | M | Required by F1.13 — LLM sampling noise will otherwise make alerts worthless |
| F8.9 | Statistical anomaly detection (baseline deviation, not fixed thresholds) | P3 | M | Profound; only credible once we have ≥90 days of history |

**Totals:** 62 features — 27 P1, 24 P2, 11 P3.

---

## 3. PRDs — major features

### PRD-1 · Answer Engine Visibility Tracker (F1.1, F1.5–F1.7, F4.1, F4.5)

| | |
|---|---|
| **User problem** | A local business owner has no idea whether ChatGPT, Gemini, or Perplexity recommends them when a customer asks "best {category} in {city}". Their Google rank tells them nothing about it, and today our own product answers the question with a fabricated number. |
| **User story** | As a business owner, I want to see, for each question my customers actually ask an AI, whether my business was named — and by which engine — so I know where I am invisible. |
| **Inputs** | Prompt text; business identity bundle (name, address, website domain, aliases, GBP category); engine set enabled for the plan; locale/city; cadence (weekly Starter, daily Professional — see Q2). |
| **Processing** | For each (prompt × engine): call the engine API with web-search/grounding enabled → persist the full raw answer + citations → run a Gemini extraction pass (JSON schema, `vertex-adapter` `requireJson`) that returns `{ brand_mentioned, mention_ordinal, mention_context, competitors_mentioned[], citations[] }` → deterministic post-check that string/alias-matches the brand and domain to guard against extractor hallucination. |
| **Outputs** | `visibility_samples` row per (prompt, engine, run); Visibility Score = weighted % of samples where brand appeared, weighted by engine (configurable, default equal); per-prompt/per-engine trend; verbatim answer viewable in the drill-down. |
| **Success metric** | ≥70% of activated businesses view the tracker ≥2×/month in month 1. ≥95% of scheduled (prompt × engine) samples complete successfully per run. Extraction agreement with human label ≥95% on a 200-sample audit set. |
| **Edge cases** | Engine refuses/returns no answer → `status: no_answer`, excluded from denominator, shown in F1.10. Engine API 429/5xx → exponential backoff, then `status: failed` and excluded, never silently counted as "not found". Brand name is a common word ("Bloom", "Apex") → require alias/domain/address corroboration, and warn at setup. Brand mentioned negatively → still counts as visible, flagged for F3.3. Multi-location org with the same brand name in 3 cities → sample per location with locale scoping (F1.11); do not deduplicate. Prompt returns a personalized/memory-dependent answer → not reproducible; disclose in F7.10. Business has no website → citation metrics degrade to GBP/Maps-only; UI states this rather than showing 0%. |

### PRD-2 · Citation & Source Tracker (F2.1–F2.3, F2.5)

| | |
|---|---|
| **User problem** | Being mentioned is not the same as being the source. Owners cannot tell which of their pages AI engines actually cite, or which third-party sites are being cited *in their place*. |
| **User story** | As a marketer, I want to see which URLs get cited for my target prompts — mine and everyone else's — so I know whether to fix a page or go get listed somewhere. |
| **Inputs** | Raw answer payloads and native citation arrays from PRD-1; our verified domain list; competitor domain list; known-directory domain dictionary (Yelp, TripAdvisor, Reddit, Nextdoor, Yellow Pages, industry directories). |
| **Processing** | Normalize citation URLs (strip UTM/tracking, resolve redirects, canonicalize host); classify each as `own` / `competitor` / `directory` / `social` / `other`; record ordinal position; for engines without structured citations (some ChatGPT modes), extract inline links and, where absent, mark `citations_unavailable` for that engine rather than inferring. |
| **Outputs** | Citation rate (% of our appearances that cite our domain); mean citation ordinal; cited-URL leaderboard with prompt attribution; "cited instead of you" source table ranked by frequency; per-URL history. |
| **Success metric** | ≥60% of Phase 1 accounts open the cited-URL leaderboard within 14 days of activation. Citation-URL normalization false-merge rate <0.5% on a labeled set. |
| **Edge cases** | Redirect chains and link shorteners → resolve up to 5 hops, timeout 5s, else store raw. Engine cites a page that 404s → flag as `stale_citation` (a real, sellable finding). Same URL cited twice in one answer → dedupe per answer, keep first ordinal. Subdomain vs root ownership → user confirms owned domains at setup; `blog.x.com` is not assumed to be `x.com`'s. Engine returns paraphrase with no citation → `mentioned_uncited`, tracked as its own metric. |

### PRD-3 · Share of Voice & Competitive Position (F3.1, F3.2, F3.6)

| | |
|---|---|
| **User problem** | "Am I invisible, or is everyone invisible?" Without a denominator, a visibility score is meaningless. |
| **User story** | As an owner, I want to see what share of AI answers name me versus each named competitor, per engine, so I can tell whether I have a problem or an opportunity. |
| **Inputs** | Competitor set (max 10 per location, matching existing product limits); competitor aliases and domains; all samples in the period. |
| **Processing** | For each sample, extract every brand named (open extraction, then match against competitor set + fuzzy-match unknowns into an "emerging competitor" bucket); SoV = our mentions ÷ total tracked-brand mentions; compute per engine, per cluster, and overall; surface unknown brands appearing ≥3× as suggested competitors to add. |
| **Outputs** | SoV % with trend; per-engine SoV bars; competitor rank table; emerging-competitor suggestions; per-prompt head-to-head with verbatim evidence. |
| **Success metric** | Emerging-competitor suggestion accepted by user ≥30% of the time (validates extraction quality). SoV chart is the most-viewed dashboard element by session count. |
| **Edge cases** | Zero brands named in an answer (generic advice) → excluded from SoV denominator, counted separately as "no brands named" (itself an opportunity signal). Franchise/parent brand naming ("a Marriott property") → map to parent, flag ambiguity. Competitor with multiple legal/DBA names → alias list per competitor. Only 1 competitor configured → suppress SoV, prompt to add more (below 3, the metric misleads). |

### PRD-4 · Prompt Library & Clusters (F4.1–F4.3, F4.9)

| | |
|---|---|
| **User problem** | Users do not know what to track. A blank prompt box is the #1 activation killer in this category. |
| **User story** | As a new user, I want the product to propose the 20 questions my customers actually ask an AI about my category and city, so I get value on day one without writing anything. |
| **Inputs** | GBP primary/secondary categories, services list, city/state, business description; top GBP search terms (`getGoogleSearchKeywords`); GSC top queries (once E-2 ships); competitor names. |
| **Processing** | Gemini generation (JSON schema) producing candidate prompts across discovery/comparison/transactional/branded intents; dedupe by embedding similarity; auto-cluster into topics; user accepts/edits/rejects in a review step (never auto-activate — quota is money). |
| **Outputs** | Prompt list with cluster tag, intent, engines enabled, last-run timestamp, current visibility; quota meter showing prompts × engines × cadence vs. plan allowance and projected monthly credits. |
| **Success metric** | ≥80% of new activations have ≥10 active prompts within 24h of connecting GBP. Median time from GBP connect → first completed run <15 minutes. |
| **Edge cases** | Business with no services/description → fall back to category + city templates, warn that suggestions are generic. Multi-location → suggest per location with city substitution, not duplicates. User pastes 500 prompts on Starter → hard block at plan limit with an explicit upgrade path; never silently truncate. Prompt in a non-English locale → pass through, tag locale, warn if engine coverage differs. Near-duplicate prompts → flag and offer merge (avoid burning quota twice). |

### PRD-5 · Local Geo-Grid Rank Tracker (F1.12) — *replaces the simulated heatmap*

| | |
|---|---|
| **User problem** | Local visibility is not one number — a business can be #1 at its own address and #17 three miles away. The current heatmap invents this data. |
| **User story** | As a local business owner, I want a real map grid showing where I rank in the local pack for my key terms, so I know which neighborhoods I am losing. |
| **Inputs** | Business lat/lng; keyword; grid shape (5×5 / 7×7 / 9×9) and spacing (0.5 / 1 / 2 mi); Place ID for identity matching. |
| **Processing** | For each grid point, query a local-pack SERP source with that coordinate → find our Place ID in the results → store rank (1–20 or null) with the raw top-3 competitor Place IDs per point. |
| **Outputs** | Map heatmap; ATRP (average total rank position); % of points in top-3; per-point competitor overlay (F3.9); run-over-run diff. |
| **Success metric** | Grid rank at the business's own coordinate matches a manual spot-check ≥95% of the time. Feature used by ≥50% of single-location accounts monthly. |
| **Edge cases** | Business is service-area (no storefront) → grid centers on service-area centroid, disclosed in UI. Grid point falls in water/uninhabited area → still queried, flagged low-signal. Business not in top-20 at a point → store `null` rank, render as "not found" (never as a high number). Provider rate limit mid-run → partial run persisted with `partial` status, missing cells rendered as gaps, not zeros. Cost control: 9×9 = 81 queries per keyword per run — hard per-plan cap, cost shown before running. |
| **Schema note** | Requires new columns on `google_seo_heatmap_cells`: `lat`, `lng`, `grid_row`, `grid_col`, `place_id_found`, `top_competitors jsonb`. Current `cell_label TEXT` cannot represent a grid. |

### PRD-6 · Technical AEO/SEO Audit (F5.1–F5.4, F5.8, F5.10, F5.12)

| | |
|---|---|
| **User problem** | Users are told to "optimize for AI" while their robots.txt blocks GPTBot and their key content only renders after JS. They cannot see the blockers. |
| **User story** | As a site owner, I want an automatic audit that tells me exactly what is stopping AI engines from reading and citing my site, ranked by severity. |
| **Inputs** | Verified domain; sitemap.xml; robots.txt; crawl budget by plan (Starter 100 pages, Professional 1,000 — see Q2); GBP location data. |
| **Processing** | Fetch robots.txt → parse per-agent rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bingbot, Googlebot → crawl sitemap + discovered links, respecting robots and a ≤1 req/s per-host politeness limit → per page extract status, canonical, meta robots, headings, JSON-LD, word count, dates, author, tables/lists → run answerability heuristics → emit findings with severity and affected-prompt linkage. |
| **Outputs** | Findings list (severity, page, rule, evidence snippet, fix instruction, affected prompts); SEO Score and AEO Score with the full rubric shown; per-run diff. |
| **Success metric** | ≥90% of audited sites receive ≥1 critical/high finding that the user marks "fixed" within 30 days. Zero false-positive "AI crawler blocked" findings in QA set of 50 sites. |
| **Edge cases** | Site behind Cloudflare bot protection blocks *us* → distinguish "we were blocked" from "AI crawlers are blocked"; never report our own block as the customer's misconfiguration. No sitemap → fall back to link discovery from the homepage, cap depth 3. SPA with no server HTML → flag as critical AEO blocker (this is the correct finding, not a crawler error). robots.txt returns 5xx → do not assume allow; retry, then report as unknown. Very large site exceeding crawl cap → crawl by sitemap priority + GSC-top-pages first, disclose coverage %. |

### PRD-7 · Content Optimization Engine (F6.1, F6.2, F6.4–F6.6)

| | |
|---|---|
| **User problem** | Knowing you are not cited does not tell you what to write. Generic "add more content" advice is worthless. |
| **User story** | As a marketer, I want, for a specific prompt I am losing, a specific page and a specific list of edits that would plausibly make me citable. |
| **Inputs** | A prompt where we are absent or uncited; the cited competitor/third-party URLs for that prompt (from PRD-2); our crawled page corpus; our answerability findings (F5.8); GBP data; review corpus themes. |
| **Processing** | Select or propose the owning page (embedding similarity + GSC relevance) → fetch and structure the cited sources → Gemini brief generation constrained to: missing entities, missing question-form headings, missing direct-answer paragraph, missing schema types, missing statistics/citations, missing FAQ pairs → output as a discrete checklist with paste-ready snippets (FAQ block, JSON-LD patch), each item tied to the evidence that produced it. |
| **Outputs** | Per-prompt brief: target page, ranked edit checklist, paste-ready FAQ HTML + FAQPage JSON-LD, schema patch, GBP field edits where relevant. "Mark as applied" → feeds F6.9. |
| **Success metric** | ≥40% of generated briefs have ≥1 item marked applied within 30 days. Of prompts with an applied brief, ≥25% show a visibility improvement within 60 days (measured by F6.9). |
| **Edge cases** | No suitable owning page exists → recommend a new page with an outline, do not force-fit an unrelated URL. Cited sources are paywalled or block us → generate from the answer text alone and label the brief lower-confidence. Recommendation would conflict with an existing page (cannibalization) → flag. AI proposes factual claims about the business we cannot verify → briefs must use placeholders (`{{insert your actual response time}}`) rather than invented specifics. Never auto-publish to the customer's site. |

### PRD-8 · Dashboard, Exports & Provenance (F7.1, F7.2, F7.10)

| | |
|---|---|
| **User problem** | After §0.1, users have a legitimate reason to distrust our numbers. Every metric must be traceable to a raw artifact. |
| **User story** | As a skeptical user, I want to click any number and see the exact prompt, engine, model version, timestamp, and verbatim answer behind it. |
| **Inputs** | All persisted samples, citations, findings, and run metadata. |
| **Outputs** | Dashboard (Visibility Score, SEO Score, SoV, citation rate, top movers, engine freshness); CSV per table; provenance drawer on every metric showing engine, model id, sample count, run timestamps, and raw answers; explicit "Estimated" vs "Measured" badge on every metric. |
| **Success metric** | Provenance drawer opened by ≥25% of users in their first session (indicates trust-building is working). Support tickets questioning data accuracy <2% of active accounts/month. |
| **Edge cases** | Metric computed from <5 samples → show the number with a low-confidence badge and the sample count, or suppress below 3. Period with a failed run → chart shows a gap, never interpolates. Engine deprecated/model version changed mid-period → annotate the trend line at the changeover date. Export >50k rows → async job + email link, not a blocking download. |

### PRD-9 · Alerting (F8.1–F8.4, F8.7, F8.8)

| | |
|---|---|
| **User problem** | Nobody logs in daily. Value must be pushed, but LLM sampling is noisy enough that naive alerts will train users to ignore us. |
| **User story** | As an owner, I want to be emailed only when something meaningfully changed — not because an LLM answered differently on a Tuesday. |
| **Inputs** | Current vs. baseline sample sets; user-configured thresholds; per-metric variance from repeat sampling (F1.13). |
| **Processing** | Compute delta → gate on significance (delta must exceed measured noise band, minimum sample count met) → apply per-alert-type cooldown → bundle into a daily/weekly digest → deliver via in-app + Resend. |
| **Outputs** | In-app alert feed; digest email with the change, the evidence link, and the recommended action; per-alert mute. |
| **Success metric** | Digest email open rate ≥35%, click-through ≥12%. Alert mute rate <10% (proxy for noise). Zero alerts fired from runs with <3 successful samples. |
| **Edge cases** | Run failure → send a *run health* notice, never a "your visibility dropped" alert. New prompt with no baseline → suppress alerts for the first 2 cycles. Rating-driven and sampling-driven changes must be distinguishable in the email copy. Alert storm after adding 50 prompts → cap alerts per digest, link to full list. Email deliverability failure → surface in-app so the user is not silently uninformed. |

### PRD-10 · Data Integrity Remediation (Phase 0)

| | |
|---|---|
| **User problem** | Customers currently see fabricated AI-visibility and heatmap numbers described as measurements. |
| **User story** | As the business, I need to stop presenting synthetic data as measurement before we ship anything else on this page. |
| **Inputs** | Existing `google_seo_ai_visibility_*` and `google_seo_heatmap_*` rows; account list with any completed runs. |
| **Processing** | (a) Feature-flag both cards off, or relabel with an explicit "Directional estimate — not an engine measurement" banner plus the estimation logic; (b) mark all pre-cutover rows `is_estimated = true`; (c) exclude estimated rows from every score, chart, and export once real sampling lands; (d) purge or archive estimated rows at Phase 1 cutover; (e) implement the 6 `pending` audit items or remove them from the UI so the score stops appearing broken. |
| **Outputs** | Clean cutover; no metric mixes estimated and measured data. |
| **Success metric** | 100% of visible AI/heatmap metrics after cutover trace to a real engine or SERP call. |
| **Edge cases** | Customers who have referenced these numbers in their own reporting → decide on proactive notification (Q6). Any marketing page or sales deck claiming live multi-LLM tracking must be corrected in the same release. |

---

## 4. Technical requirements & architecture

### 4.1 Data sources

| Source | Purpose | Status | Risk |
|---|---|---|---|
| Google Business Profile API | Categories, services, photos, posts, Q&A, performance keywords | ✅ In place (`src/services/google/`) | Quota; already managed |
| Google Places API (New) | Competitor discovery, Place ID identity, local-pack matching | ✅ In place (`external-metrics.ts`) | Per-call cost |
| **Google Search Console API** | Query data, indexation status, CTR/position baseline | ❌ **Build (E-2)** — new OAuth scope + consent screen change | Scope addition may require Google re-verification; start early |
| **SERP/AI Overview provider** (DataForSEO, SerpApi, Serper, or equivalent) | Classic SERP rank, local pack, AI Overview text + sources, geo-grid | ❌ **Procure (Q3)** | Single-vendor dependency; abstract behind an interface from day one |
| **OpenAI API** | ChatGPT sampling (web-search tool) | ❌ Procure | API ≠ consumer ChatGPT (no memory/personalization); disclose |
| **Anthropic API** | Claude sampling (web search tool) | ❌ Procure (P2) | Same caveat |
| **Perplexity API** | Perplexity sampling | ❌ Procure | Returns citations natively — best signal/cost ratio |
| Google Vertex / Gemini | Gemini sampling **and** all extraction/classification passes | ✅ In place (`vertex-adapter.ts`) | Reuse; already has JSON-schema + grounding support |
| **Own crawler** | Page HTML, schema, answerability | ❌ **Build (E-3)** | Must be polite, robots-respecting, IP-reputation managed |
| **Headless renderer** | JS-render delta (F5.5) | ❌ Build/procure (P2) | Expensive; Phase 2 |
| PageSpeed Insights / CrUX API | Core Web Vitals | ❌ Build (P2) | Free, rate-limited |
| Customer server logs / CDN | AI crawler analytics (F2.7) | ❌ Build (P2) | Needs customer-side integration (Cloudflare/Vercel log drain) — see Q5 |

### 4.2 Enablers (infrastructure, not user-facing features)

| ID | Enabler | Phase | Effort |
|---|---|---|---|
| E-1 | Engine adapter interface + registry (`AnswerEngineAdapter`: `sample(prompt, locale) → RawAnswer`) so engines are pluggable and the SERP vendor is swappable | P1 | M |
| E-2 | Google Search Console OAuth + sync service | P1 | M |
| E-3 | Crawler service (fetch queue, robots parser, politeness, per-plan budget, content extractor) | P1 | L |
| E-4 | Schema: `aeo_prompts`, `aeo_prompt_clusters`, `aeo_runs`, `aeo_samples`, `aeo_citations`, `aeo_brand_mentions`, `aeo_competitor_aliases`, `crawl_runs`, `crawl_pages`, `crawl_findings`, `geo_grid_runs`, `geo_grid_points`, `aeo_alerts`, `aeo_quota_ledger` — all with org-scoped RLS matching the existing `get_user_org_ids()` pattern | P1 | M |
| E-5 | Quota & cost ledger (per-org credit accounting, pre-flight cost estimate, hard stop) | P1 | M |
| E-6 | Extraction evaluation harness (labeled fixture set, regression-tested on every prompt/model change) | P1 | M |
| E-7 | Inngest fan-out orchestration (run → per-engine → per-prompt steps with independent retry, concurrency limits, partial-failure semantics) | P1 | M |
| E-8 | Raw-answer object storage (Supabase Storage) — answers are large; store payloads out-of-row with DB pointers | P1 | S |
| E-9 | Stripe metered billing + credit-pack SKUs for the add-on (Q2 decision); no metered price ids exist in the current `STRIPE_*` env set | P1 | M |
| E-10 | **Sampling scheduler — weekly smoothing + daily budget guard.** Assigns each business a deterministic sampling slot and refuses to exceed a vendor's free daily allowance without an explicit override. Split out of E-7 on 2026-08-05: it is a billing control, not an orchestration detail. See §4.5. | **P1** | **M** |

### 4.3 Scalability

- **Fan-out volume:** 1,000 businesses × 25 prompts × 5 engines × weekly = **125,000 samples/week**, ~18k/day. Each is an external API call of 3–30s. This must be a queue with per-engine concurrency limits and per-vendor rate-limit budgets — not a cron loop. Existing workers use `concurrency: { limit: 2 }`; that will need per-engine tuning and a global scheduler that spreads runs across the week rather than firing all accounts Monday 00:00.
- **Storage:** raw answers average 2–8 KB; 125k/week ≈ 500 MB–2 GB/week uncompressed. Store payloads in Supabase Storage (E-8), keep structured extractions in Postgres. Define retention now: raw answers 90 days (Starter) / 13 months (Professional); structured metrics retained indefinitely.
- **Read path:** the dashboard must not aggregate raw samples at request time. Pre-aggregate into daily rollup tables per (business, engine, cluster). The existing page already does 8 parallel queries in `load-google-seo-aeo-page-data.ts`; adding raw-sample aggregation on top will not hold.
- **Crawling:** 1,000 sites × 100–1,000 pages = 100k–1M fetches per audit cycle. Monthly cadence for Starter, weekly for Professional. Requires an outbound IP pool with managed reputation and a per-host politeness limit.
- **Cost control is a scalability constraint here, not just a finance one** — see §6.

### 4.4 Third-party dependencies & risks

| Dependency | Failure mode | Mitigation |
|---|---|---|
| SERP/AIO vendor | Price change, outage, or shutdown | Adapter interface (E-1); qualify a second vendor before Phase 1 GA; cache aggressively |
| LLM provider ToS | Scraping consumer UIs is prohibited; API-only is the compliant path | API-only, no consumer-UI automation, and disclose the API-vs-product difference in F7.10 |
| Model deprecation | A tracked model is retired, breaking trend continuity | Store `model_id` on every sample; annotate trend lines at changeover; never silently substitute |
| Google OAuth scope expansion (GSC) | Verification delay blocks Phase 1 | Submit scope change in week 1, before the code is ready |
| Gemini extraction drift | Silent accuracy regression | E-6 eval harness gates every prompt/model change in CI |

### 4.5 E-10 — Sampling scheduler (weekly smoothing + daily budget guard)

**Status as of 2026-08-05: unbuilt, and nothing in the repo approximates it.** `src/services/aeo/` contains only `engines/`. There are no cron-scheduled Inngest functions anywhere in the codebase; scheduling today is two Vercel crons hitting digest endpoints. Promoted here from "documented risk" to a Phase 1 build item.

**Do not mistake `REQUEST_SMOOTHING_DELAY_MS` for this.** `src/services/google/constants.ts` defines a 700 ms pause between paginated Google API calls inside a single sync (`sync-service/pagination.ts`). That is intra-request pacing against a per-minute rate limit. It has no effect on a per-*day* quota bucket and does not spread load across accounts or days. The retry jitter in `business-profile-core.ts` is likewise unrelated.

**Why it is a billing control.** Gemini's grounding allowance is 10,000 prompts/day (§6.4). Spread across a week that covers ~4,600 Professional businesses at zero cost. Fire every account on the same day and the ceiling collapses by 7× to ~660, and everything past it bills at $35/1,000 — roughly **$3.50/business/month created purely by scheduling shape**, with no change in what the customer receives.

**Requirements:**

1. **Deterministic slot assignment.** Each business gets a stable `(day_of_week, hour)` slot derived from a hash of `business_id`. Stability matters beyond load spreading: a business that drifts between slots is sampled at irregular intervals (6 days one week, 8 the next), which injects noise into every trend line and into the F8.8 significance gate. Same business, same slot, every week.
2. **Daily budget guard.** Before dispatch, project the day's billable units per engine via `estimateDailyCostMicroUsd()`. If a free allowance would be breached, defer the lowest-priority runs to the next slot rather than silently paying overage. Paying is allowed, but only behind an explicit per-org override that the E-5 ledger records.
3. **Enrolment without a thundering herd.** A newly connected business must be assigned a slot and wait for it, not run immediately and then drift. Backfill/first-run is a separate, rate-limited path.
4. **Rebalancing.** Slot distribution must be re-checkable as the account base grows, with a migration path that does not reshuffle every existing business at once.

**Interaction with E-5 and E-7.** E-7 owns fan-out, retry and partial-failure semantics *within* a run. E-10 owns *when* a run fires and whether it may fire at all today. E-5 is the ledger both write to. Keeping them separate is deliberate — folding the budget guard into orchestration is what would let a scheduling change quietly become a billing change.

---

## 5. Prioritized roadmap

Assumes **2 senior fullstack engineers + 1 designer (0.5) + 1 PM (0.5)**. Effort is engineer-weeks (EW) total across the team.

### Phase 0 — Integrity remediation (Week 1–2 · 3 EW)

| Item | Effort |
|---|---|
| PRD-10: flag off / relabel simulated AI-visibility + heatmap | S |
| Mark existing rows `is_estimated`; exclude from all outputs | XS |
| Remove or implement the 6 `pending` audit rows (interim: hide) | S |
| Audit marketing/sales collateral for claims this page cannot back | XS |
| Kick off Google OAuth scope change for GSC (long lead time) | XS |

### Phase 1 — Usable at launch (Week 3–14 · ~46 EW)

| Item | Effort | Notes |
|---|---|---|
| E-1 engine adapter interface + registry | M | Gates everything |
| E-4 schema + RLS | M | |
| E-7 Inngest fan-out orchestration | M | |
| E-8 raw answer storage | S | |
| E-5 quota & cost ledger (per-engine weighted) | M | Must land before any paid engine goes live |
| E-9 Stripe metered billing + credit packs | M | Q2 decision; new SKUs required |
| **E-10 sampling scheduler (weekly smoothing + daily budget guard)** | **M** | **Critical path — gates any paid engine going live (§4.5)** |
| E-6 extraction eval harness | M | |
| F1.1 run orchestrator | L | |
| F1.5–F1.7 ChatGPT / Perplexity / Gemini sampling | M+S+S | |
| F1.2 classic SERP tracking · F1.3 AI Overview | M+M | |
| F1.12 real geo-grid (PRD-5) | L | Replaces fabricated heatmap |
| F1.10 engine coverage & freshness panel | S | |
| F2.1–F2.3, F2.5 citation tracking (PRD-2) | M+S+S+S | |
| F3.1, F3.2, F3.6 competitor set, SoV, head-to-head | S+M+S | |
| F4.1–F4.3, F4.5, F4.9 prompt library, suggestions, clusters, trends, quota meter | M+M+S+S+S | |
| E-2 GSC integration | M | |
| E-3 crawler | L | |
| F5.1–F5.4, F5.8, F5.10, F5.12 technical audit (PRD-6) | L+M+S+M+M+M+S | |
| F6.1, F6.2, F6.4–F6.6 content briefs (PRD-7) | L+M+M+S+M | |
| F7.1, F7.2, F7.10 dashboard, CSV, provenance (PRD-8) | M+S+S | |
| F8.1–F8.4, F8.7 (email/in-app), F8.8 alerting (PRD-9) | S×4+S+M | |

**Phase 1 exit = the page contains zero estimated numbers and five real engines.**

### Phase 2 — Competitive parity (Week 15–24 · ~34 EW)

F1.4 AI Mode · F1.8 Claude · F1.11 geo/locale scoping · F1.13 repeat sampling · F2.4 uncited-page gaps · F2.7 AI crawler logs (L) · F2.8 review-corpus citations · F2.9 citation history · F3.3 sentiment · F3.4 prominence · F3.5 source overlap · F3.8 attribute extraction · F3.9 grid competitor overlay · F4.4 intent classification · F4.6 cluster SoV · F4.7 prompt discovery · F5.5 JS-render delta (L) · F5.6 CWV · F5.7 GSC indexation · F6.3 rewrite diffs · F6.7 review-mining briefs · F6.8 freshness queue · F6.9 impact tracking · F6.10 GBP one-click publish · F7.3 PDF · F7.4 scheduled reports · F7.6 public API (L) · F7.9 multi-location rollup · F8.5, F8.6, F8.7 (Slack/webhook)

### Phase 3 — Differentiation (Week 25–34 · ~30 EW)

F1.9 Copilot · F1.14 volatility index · F2.6 citation→traffic correlation · F3.7 competitor page tracking (L) · F4.8 prompt demand estimates (L) · F5.9 llms.txt · F5.11 NAP consistency (L) · F7.5 white-label · F7.7 webhooks · F7.8 Looker/BigQuery (L) · F8.9 anomaly detection

---

## 6. Unit economics & vendor selection

### 6.1 Recommended vendors (answers Q3)

**Primary SERP / AI Overview / geo-grid vendor: DataForSEO.** Qualified secondary: SerpApi.

| Criterion | DataForSEO (recommended) | SerpApi (secondary) | Serper (rejected) |
|---|---|---|---|
| Classic SERP cost | **$0.60/1K** standard queue (~5 min), $1.20/1K priority, $2.00/1K live | ~$9–25/1K depending on plan; Developer plan $75/mo for 5K = $15/1K | $1.00/1K prepaid, down to $0.30/1K at scale |
| AI Overview | `load_async_ai_overview: true` on SERP Advanced, **+$0.0006/keyword** on top of base | Supported | Thin coverage |
| Google AI Mode | Dedicated endpoint, ~**$1.20/1K** | Partial | No |
| Geo-grid support | **Google Maps endpoint with `location_coordinate` (`lat,lng,zoom`)** — one task per grid point, up to 100 tasks per POST, 2,000 calls/min | GPS-targeted local SERP supported | No |
| Billing model | Pay-as-you-go, no monthly minimum | Fixed monthly subscription | Prepaid credits |
| Other SEO APIs on same account | Backlinks, on-page, keyword volume — useful for Phase 2/3 | No | No |
| **Verdict** | **Primary.** Cheapest at our volume, only vendor covering SERP + AIO + AI Mode + coordinate-level Maps on one account, and the async queue is fine for weekly batch sampling | **Qualify as fallback** behind E-1. Higher cost, but a genuine second source with a long tail of engines | Google-only, no AIO/geo-grid depth — does not meet requirements |

**Why the async queue matters:** our sampling is scheduled and weekly, not interactive. Standard queue at $0.60/1K vs live at $2.00/1K is a **3.3× cost reduction for zero user-visible latency cost**. Design E-7 around callback/polling from the start; do not use live mode.

**Answer engines:**

| Engine | Vendor / API | Phase | Note |
|---|---|---|---|
| Perplexity | Sonar API | P1 | Bills tokens **plus** a per-request search fee (~$5–14/1K by search-context depth). Native citations make it the best signal-per-dollar source — use low search-context tier. |
| ChatGPT | OpenAI Responses API + `web_search` tool | P1 | **Dominant variable cost** (~60% of module spend). Token-billed with a metered search tool. |
| Gemini | Vertex, Google Search grounding, **pinned to `gemini-2.5-pro`** | P1 | **Confirmed 2026-08-05:** 10,000 grounding prompts/day free on 2.5 Pro (1,500/day on 2.0/2.5 Flash tiers), then **$35 per 1,000**. One grounding prompt may fan out to several search queries but is billed once. See §6.4. |
| Claude | Anthropic Messages API + web search tool | P2 | Token-billed |
| Copilot | No clean API | P3 | Deferred for this reason |
| Extraction/classification | Vertex Gemini Flash-Lite (already in `vertex-adapter.ts`) | P1 | Cheap, JSON-schema mode already supported |

### 6.2 Revised cost model

25 prompts, 3 engines, weekly sampling, 1 crawl/month, 3 geo-grid keywords biweekly at 7×7.

| Cost line | Assumption | Monthly cost/business |
|---|---|---|
| Classic SERP + AI Overview | 25 kw × 4 runs × ($0.0006 + $0.0006), standard queue | **$0.12** |
| Geo-grid (Maps, `location_coordinate`) | 3 kw × 49 pts × 2 runs × $0.0006 | **$0.18** |
| Perplexity Sonar | 100 requests × ~$0.0067 (search fee + tokens) | **$0.67** |
| ChatGPT (Responses + web_search) | 100 requests × ~$0.025 | **$2.50** |
| Gemini (grounded, 2.5 Pro) | 100 requests — **$0 inside the free daily bucket, $3.50 beyond it** | **$0.00 – 3.50** |
| Gemini extraction pass | ~500 extractions × ~$0.0006 | $0.30 |
| Crawl + audit | 200 pages/mo, bandwidth + compute | $0.15 |
| Storage + overhead | | $0.20 |
| **Total** | | **$4.12 – $7.62/mo** |

**Three findings that change the plan:**

1. **The geo-grid — our differentiator — costs $0.18/business/month.** I had modeled it at ~5× that. A 7×7 grid on 3 keywords is essentially free. This should be a headline Phase 1 feature and a generous plan allowance, not a rationed one. It is also the feature none of the five benchmarks offer.
2. **SERP + AI Overview data is ~$0.12/month, not $0.60.** The classic-SEO half of this module is nearly costless. There is no economic reason to skimp on keyword coverage.
3. **LLM sampling is ~85% of variable cost, and ChatGPT alone is ~60%.** This means **the engine count is the correct metered dimension**, not the prompt count. A user tracking 50 prompts on Perplexity + Gemini costs less than one tracking 15 on ChatGPT. Meter credits by (prompt × engine × run), weighted per engine — not by prompt count, which is what most competitors do and would misprice us badly.

**Cost risk closed 2026-08-05.** The Gemini grounding rate is confirmed and, at our scale, is the *cheapest* line in the table rather than the largest — see §6.4. ChatGPT is now unambiguously the dominant variable cost at ~60% of module spend.

### 6.4 Gemini grounding economics — confirmed 2026-08-05

Quoted rate: **free daily allowance, then $35 per 1,000 grounding prompts.** The allowance depends on model generation:

| Model tier | Free grounding prompts/day |
|---|---|
| Gemini 2.0 Flash / 2.5 Flash / 2.5 Flash-Lite (combined) | 1,500 |
| **Gemini 2.5 Pro** | **10,000** |

**We pin to `gemini-2.5-pro`.** Two reasons, both load-bearing:

1. **The quote covers 2.0/2.5 only.** The rest of this codebase runs Gemini 3.x (`vertex-adapter.ts` defaults to `gemini-3.1-flash-lite`, with `gemini-3.1-flash-lite-preview` used across the competitor-insight services). Letting the AEO adapter inherit that default would price us against a rate that does not cover the model we actually call. The adapter therefore pins its model explicitly rather than inheriting. Accepted cost: two Gemini generations coexist in the codebase until a Gemini 3 grounding rate is confirmed.
2. **Grounding fees dominate token fees in this workload.** Pro's token rate is roughly $0.0065/sample higher than Flash's, but its free bucket is 6.7× larger. Avoiding a single $0.035 grounding charge more than pays for the token difference, so Pro is cheaper than Flash anywhere between roughly 420 and 2,800 tracked businesses — our entire realistic growth range. *(Token rates behind that figure are list-price estimates, not part of the written quote; confirm before contracting.)*

**The allowance is a daily bucket, which makes scheduling a cost lever.**

Free-tier ceiling = `free_per_day × 7 ÷ prompts_per_business`, assuming weekly sampling smoothed across the week:

| Tier | Prompts/business | Businesses covered free (2.5 Pro) |
|---|---|---|
| Professional | 15 | **~4,600** |
| Modeled scenario | 25 | **~2,800** |
| Starter | 5 | — (Gemini not included) |

Bursting every account into one day collapses that ceiling by 7×. This is now tracked as **E-10** (§4.5), a Phase 1 critical-path item with its own acceptance criteria, rather than an assumed property of E-7. Nothing in the repo currently implements it.

**Effect on the tier allowances in §6.3:**

| Tier | Gemini included? | COGS below ceiling | COGS above ceiling | Revenue |
|---|---|---|---|---|
| Professional (15 prompts × 3 engines weekly) | Yes | **~$2.82** | ~$4.92 | $59.99 |
| Starter (5 prompts × Perplexity + AI Overview monthly) | **No** | ~$0.35 | ~$0.35 | $29.99 |

**The §6.3 allowances hold unchanged.** Gemini does not need to come out of Professional — at 5–8% of plan revenue it is comfortable, and below ~4,600 Professional businesses the grounding line is $0.00. Gemini was never in Starter, and that call now has a sharper justification: at the $0.035 overage rate Gemini is **58× the DataForSEO AI Overview rate** ($0.0006/keyword), and for local intent AI Overview is the higher-traffic Google surface anyway. Starter gets the cheap Google surface; Professional gets both.

**Modelling requirement this creates:** a flat per-sample cost cannot express "free to N/day, then $X per 1,000" — assuming worst case would overstate Gemini COGS by 100% at current scale and wrongly argue for cutting it from Professional. `engine-catalog.ts` therefore carries `{ overageMicroUsd, freePerDay, confidence }` per engine, with `estimateDailyCostMicroUsd()` honouring the allowance.

### 6.3 Pricing structure (Q2 — decided: metered add-on)

Credit-metered add-on, base allowance included on Professional, overage in credit packs. Implementation requirements now locked into Phase 1:

- **E-5 cost ledger** must meter in (prompt × engine × run) units with **per-engine weighting**, per §6.2 finding 3.
- **F4.9 quota meter** must show projected monthly credits *before* the user activates prompts, and must break spend down by engine so users self-select toward cheaper engines.
- Pre-flight hard stop: a run that would exceed the org's remaining credits is rejected **before** any paid API call (acceptance criterion #5).
- Stripe metered billing / credit-pack SKUs are a Phase 1 dependency — flag to whoever owns billing now, as it is not in the current `STRIPE_*` env set.

Suggested starting allowances, **re-validated 2026-08-05 against the confirmed Gemini rate (§6.4) and unchanged**: **Professional** — 15 prompts × 3 engines weekly + 3 geo-grid keywords biweekly + 500-page monthly crawl ≈ **$2.82/mo COGS below the Gemini free-tier ceiling, $4.92 above it**, on ~$60 revenue. **Starter** — 5 prompts × 2 cheap engines (Perplexity + AI Overview) monthly + 1 geo-grid keyword ≈ $0.35/mo COGS, positioned as a taste that drives the upgrade. Starter deliberately excludes Gemini: at the $0.035 overage rate it is 58× the AI Overview rate for the same Google-shaped question.

---

## 7. QA / acceptance criteria — Phase 1

Each criterion is pass/fail and independently verifiable. Test IDs map to the feature matrix.

### F1.1 / F1.5–F1.7 — Engine sampling
1. **PASS** if a manually triggered run for a business with 5 prompts × 3 engines produces exactly 15 `aeo_samples` rows, each with non-null `engine`, `model_id`, `raw_answer_ref`, and `sampled_at`. **FAIL** on any row with a null model id.
2. **PASS** if a forced 500 from one engine results in that engine's samples marked `failed` and **excluded** from the visibility denominator, with the other two engines completing. **FAIL** if failed samples are counted as `brand_not_found`.
3. **PASS** if two consecutive runs with an unchanged prompt produce two distinct raw answers stored separately (no dedup/overwrite).
4. **PASS** if no code path in the module writes a `found`/`position` value derived from `average_rating`. Verified by grep + code review. **FAIL** otherwise. *(Direct regression test for §0.1.)*
5. **PASS** if a run exceeding the org's quota is rejected pre-flight with a quota error and **zero** paid API calls are made.

### F1.2 / F1.3 — SERP & AI Overview
6. **PASS** if, for a keyword where the business demonstrably ranks in the local pack (manual check in an incognito, location-set browser), the stored `local_pack_position` matches within ±1 on 9 of 10 test keywords.
7. **PASS** if AI Overview absence for a keyword is stored as `aio_present: false` and rendered as "No AI Overview shown", not as position 0 or a blank.

### F1.12 — Geo-grid
8. **PASS** if a 7×7 grid produces exactly 49 `geo_grid_points` rows, each with distinct lat/lng, and the center point's rank matches a manual local-pack check.
9. **PASS** if a business not present in the top 20 at a point stores `rank: null` and renders as a distinct "not found" color — **FAIL** if rendered as rank 20 or 0.
10. **PASS** if a provider rate-limit mid-run persists a `partial` run with completed points intact and missing points rendered as gaps.
11. **PASS** if the cost estimate shown before running matches actual credits consumed within ±5%.

### F2.1–F2.3, F2.5 — Citations
12. **PASS** if, for a Perplexity answer with N native citations, exactly N `aeo_citations` rows are created with correct ordinals.
13. **PASS** if `https://example.com/page?utm_source=x` and `http://www.example.com/page/` normalize to the same canonical citation key, while `blog.example.com/page` does **not** merge into `example.com`.
14. **PASS** if a cited URL that returns 404 on verification is flagged `stale_citation` and appears in the findings list.
15. **PASS** if an engine that provides no citation data stores `citations_unavailable` for that sample and the citation-rate metric excludes it from the denominator. **FAIL** if it is counted as zero citations.

### F3.1, F3.2, F3.6 — Competitors & SoV
16. **PASS** if SoV over a hand-labeled fixture set of 50 answers matches the manual count exactly.
17. **PASS** if answers naming zero tracked brands are excluded from the SoV denominator and reported separately.
18. **PASS** if SoV is suppressed with an explanatory message when fewer than 3 competitors are configured.
19. **PASS** if the head-to-head drill-down displays the verbatim engine answer with the brand mention highlighted.

### F4.1–F4.3, F4.5, F4.9 — Prompts
20. **PASS** if a new business with GBP connected receives ≥15 suggested prompts, ≥80% of which contain the business's city or category (measured on 20 test businesses).
21. **PASS** if suggested prompts require explicit user activation and consume zero quota until activated.
22. **PASS** if attempting to activate beyond the plan limit is blocked with an upgrade CTA and no partial activation occurs.
23. **PASS** if the quota meter's projected monthly consumption matches the actual consumption of a full cycle within ±5%.

### F5.1–F5.4, F5.8, F5.10, F5.12 — Technical audit
24. **PASS** if a test site with `User-agent: GPTBot / Disallow: /` produces a **critical** "AI crawler blocked" finding naming GPTBot, with the exact robots.txt line as evidence.
25. **PASS** if a site allowing all AI crawlers produces **zero** AI-crawler-blocked findings across a 50-site QA corpus (zero false positives).
26. **PASS** if a page with invalid FAQPage JSON-LD (missing `acceptedAnswer`) is flagged with the specific missing property, not a generic "schema error".
27. **PASS** if the crawler respects robots.txt `Disallow` for our own agent and never exceeds 1 req/s per host (verified in access logs).
28. **PASS** if a crawl hitting the plan page cap reports `coverage: X of Y pages` in the UI rather than presenting partial results as complete.
29. **PASS** if all 11 audit items return a real measured status — **zero** items with `status: "pending"` remain in the shipped UI.
29a. **PASS** only if every scored item measures the thing its label names. Specifically, `services-list` must read the business's actual Google services, not `actionLinkCount`. **FAIL** while any audit is scored from a stand-in signal, even though such an item is not `pending` and so passes #29. This criterion exists because #29 alone cannot detect a proxy: the item is already scored, so finishing the stubs would leave it in place indefinitely.
30. **PASS** if an SPA serving an empty `<body>` in raw HTML is flagged critical for AEO.

### F6.1, F6.2, F6.4–F6.6 — Content engine
31. **PASS** if a brief for a prompt where we are absent names a specific existing URL (or explicitly recommends a new page) and lists ≥3 concrete, page-specific edits. **FAIL** if any recommendation is generic advice such as "improve content quality" or "add more keywords".
32. **PASS** if generated FAQPage JSON-LD validates against Google Rich Results Test with zero errors for 10 of 10 test generations.
33. **PASS** if generated content contains no invented factual claims about the business (audited on 25 briefs); unverifiable specifics must appear as explicit placeholders.
34. **PASS** if no brief action writes to the customer's website; GBP publishing (Phase 2) requires an explicit confirmation step.

### F7.1, F7.2, F7.10 — Dashboard, export, provenance
35. **PASS** if every metric tile has a provenance drawer showing engine, model id, sample count, and run timestamps.
36. **PASS** if every metric on the page is badged either **Measured** or **Estimated**, and zero Phase 1 metrics carry **Estimated**.
37. **PASS** if a metric computed from fewer than 3 samples is suppressed with an explanatory message.
38. **PASS** if a failed run renders as a gap in the trend chart, never interpolated.
39. **PASS** if CSV export row counts exactly match the on-screen table for the same filters, across all 6 exportable tables.

### F8.1–F8.4, F8.7, F8.8 — Alerting
40. **PASS** if a run with <3 successful samples fires zero visibility alerts and instead fires a run-health notice.
41. **PASS** if a change within the measured noise band fires no alert.
42. **PASS** if a newly added prompt fires no alert for its first 2 cycles.
43. **PASS** if the same alert type for the same entity does not fire twice within its cooldown window.
44. **PASS** if every alert email contains a deep link to the evidence (the specific prompt/engine/answer that changed).

### E-10 — Sampling scheduler (§4.5)

49. **PASS** if, with 700 businesses enrolled at 15 prompts each, no single day's projected grounding prompts exceeds `ceil(total ÷ 7) × 1.15`. **FAIL** on any day carrying more than 15% above an even share.
50. **PASS** if a given business resolves to the identical `(day_of_week, hour)` slot across 10 consecutive scheduling runs. **FAIL** if slots reshuffle, since irregular sampling intervals corrupt every trend line.
51. **PASS** if a projected day that would breach an engine's `freePerDay` allowance defers the excess runs and fires **zero** billable requests for that engine, unless an explicit per-org overage override is set.
52. **PASS** if that override, when set, is recorded in the E-5 ledger with the org, engine, and unit count before the first billable call is made.
53. **PASS** if a newly connected business is assigned a slot and waits for it, rather than dispatching immediately — verified by enrolling 50 businesses in one minute and observing zero same-minute sampling runs.
54. **PASS** if `estimateDailyCostMicroUsd()` projections match actual ledger-recorded consumption for a full simulated week within ±5%.

### Cross-cutting
45. **PASS** if `pnpm typecheck && pnpm test && pnpm build` succeed with zero `any` and zero new ESLint suppressions in module code.
46. **PASS** if all new tables have RLS enabled with org-scoped policies, verified by a cross-org access test that must return zero rows.
47. **PASS** if no new file exceeds the standards caps (pages/API 100, components 150, lib/services 200 lines).
48. **PASS** if a first-run user with GBP connected reaches a populated dashboard in under 15 minutes with no manual configuration beyond accepting suggested prompts.

---

## 8. Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | **Existing fabricated data has already been shown to paying customers** and possibly cited in our own marketing | Critical | Phase 0 remediation; audit collateral; decide on customer notification (Q6) |
| R2 | **Unit economics** (§6) — resolved to metered add-on; Gemini grounding rate now confirmed | Medium | Metered add-on decided (Q2); E-5 + E-9 remain Phase 1 gates. Gemini priced and unblocked (§6.4). Scheduling exposure **promoted out of this row into E-10** (§4.5) on 2026-08-05 — it is now a tracked build item on the Phase 1 critical path with its own acceptance criteria (#49–54), not a risk we are carrying. |
| R3 | LLM API answers ≠ what consumers see in ChatGPT/Gemini apps (no memory, no personalization, different retrieval) | High | Disclose in F7.10; market as "engine sampling", never "what your customer saw"; never automate consumer UIs (ToS) |
| R4 | Sampling noise generates false alerts and destroys trust a second time | High | F1.13 repeat sampling + F8.8 significance gating, both required before alerts go live |
| R5 | SERP/AIO vendor concentration (price hike, shutdown, blocking) | High | E-1 adapter abstraction; qualify a second vendor pre-GA |
| R6 | Scope is ~78 EW for Phase 1 + 2 against a small team | High | Phase 1 is already cut to the minimum honest product; if the team is smaller than assumed, cut engines (ship Perplexity + Gemini + AIO only) before cutting integrity work |
| R7 | Crawler IP reputation / getting blocked by customer WAFs | Medium | Documented user-agent, verifiable IP range, published crawler docs page, per-host politeness |
| R8 | GSC OAuth scope expansion requires Google re-verification | Medium | Submit in Phase 0 week 1 |
| R9 | Extraction model drift silently degrades accuracy | Medium | E-6 eval harness in CI, gating every prompt/model change |
| R10 | Competitor feature velocity — these five ship monthly | Medium | Re-baseline the matrix at each phase boundary; our moat is GBP + review data, not feature count |
| R11 | Multi-location AEO reporting is unsolved by competitors *because* it is hard (identity disambiguation across locations) | Medium | Phase 2 (F7.9), after single-location identity matching is proven |
| R12 | Storing verbatim third-party AI answers and crawled pages raises copyright/retention questions | Low-Medium | Retention limits, evidence-only display, no republication; legal review before GA |

---

## 9. Decisions & open questions

### 9.1 Resolved (2026-08-05)

| # | Question | **Decision** | Effect on plan |
|---|---|---|---|
| **Q1** | Target user & scope | **Local + multi-location owners; local-first AEO** | Plan stands as written. Geo-grid (F1.12), GBP audit (F5.10), and review-corpus features (F2.8, F6.7) are the moat. Reinforced by §6.2: the geo-grid costs $0.18/business/month, so our differentiator is also our cheapest feature. |
| **Q2** | Pricing & gating | **Credit-metered add-on**, base allowance on Professional | E-5 + F4.9 locked into Phase 1. Meter by (prompt × engine × run) with **per-engine weighting**, not prompt count (§6.2 finding 3). Stripe metered-billing SKUs are a new Phase 1 dependency — not in the current `STRIPE_*` env set. |
| **Q3** | Paid data budget & vendors | **Approved; vendors recommended in §6.1** | Primary: **DataForSEO** (standard queue, `load_async_ai_overview`, Maps `location_coordinate` for the grid). Secondary qualified behind E-1: **SerpApi**. Engines: Perplexity Sonar + OpenAI Responses/web_search + Vertex Gemini in Phase 1; Anthropic in Phase 2. **Vertex grounding quote received 2026-08-05** — 10,000 prompts/day free on 2.5 Pro, then $35/1,000; Gemini pinned to `gemini-2.5-pro` and unblocked (§6.4). DataForSEO, OpenAI and Perplexity rates remain list-price estimates pending contracts. |
| **Q4** | Team & deadline | **2 senior fullstack + 0.5 design + 0.5 PM; Phase 1 in 12 weeks after Phase 0** | Roadmap in §5 stands unchanged. |

### 9.2 Still open

Each of these changes the plan materially. Working assumptions are stated so the plan is executable, but none are decided.

| # | Question | Working assumption | What changes if the answer differs |
|---|---|---|---|
| **Q5** | **AI crawler log analytics (F2.7) — how do we get customer server logs?** Cloudflare/Vercel log drain integration, a JS pixel, or a DNS/proxy product? | Deferred to Phase 2, integration route undecided | This is one of Profound's strongest differentiators; if it is a priority, it is a Phase 1 item and needs its own integration design (+L) |
| **Q6** | **Do we proactively notify customers who saw the simulated AI-visibility/heatmap data?** | Silent remediation + relabel, no outbound notice | A proactive notice is the higher-trust path and I would recommend it if any customer has used those numbers in their own reporting — your call, and it affects Phase 0 comms |
| **Q7** | **Does "Claude answers" in the brief mean the Claude consumer product, or Claude via API with web search?** Only the API path is compliant. | API with web search, clearly labeled | If the expectation is consumer-product parity, we must set expectations now — no vendor can legitimately deliver that |
| **Q8** | **Is white-label (F7.5) needed for an agency motion at launch?** | No — Phase 3 | If agencies are a launch channel, F7.5 + F7.9 + F7.6 move to Phase 1 (+8 EW) |
| **Q9** | **How much of this must work for multi-location orgs at launch?** Zyene supports multiple businesses per org. | Phase 1 is per-location; org rollup in Phase 2 | Org-level rollup at launch adds identity disambiguation and aggregation work (+M to L) |
| **Q10** | **Retention policy for raw AI answers and crawled pages?** | 90 days Starter / 13 months Professional | Affects storage cost, trend depth, F8.9 anomaly detection viability, and R12 |

---

## 10. Phase 0 implementation log — 2026-08-05

Integrity remediation is complete. `pnpm typecheck` clean, 233/233 tests pass, `pnpm build` succeeds, and the `google-seo-aeo` module now carries zero ESLint warnings.

| Change | File | Effect |
|---|---|---|
| Provenance columns | `supabase/migrations/20260805200155_add_aeo_estimated_provenance.sql` | `is_estimated` + `method` on all four AEO tables. Existing rows backfilled to estimated; **default flips to `FALSE` afterwards** so a Phase 1 writer that forgets the flag fails loudly in QA instead of silently mislabelling real data. Partial indexes added for the measured read path. **Applied to production** — see §10.1. |
| Feature gate | `src/lib/features/aeo-surfaces.ts` (new) | `AEO_SHOW_ESTIMATED_SURFACES`, **off unless the value is exactly `true`**. First flag infrastructure in the repo. Also exports the disclosure copy and run-status constants so UI, actions, and workers cannot drift. |
| UI gating + disclosure | `estimated-aeo-surfaces.tsx` (new), `google-seo-aeo-bottom-section.tsx` | Cards hidden by default. When enabled they carry an "Estimated" badge and state the method. Removed the fabricated ordinal ("2nd position") and the fabricated `visibility_score` percentage — the heuristic cannot know either. |
| Query skip | `google-seo-aeo-secondary-fetch.ts` | Stops reading result/cell rows that will not render. |
| Worker gating | `google-seo-aeo-ai-visibility-worker.ts`, `google-seo-aeo-heatmap-worker.ts` | When disabled, record the run as `disabled` with a reason and write **zero** result rows. When enabled, rows persist as `is_estimated = true` with no fabricated position or visibility score. |
| Fan-out gating | `google-seo-aeo-sync-worker.ts` | Returns early when disabled rather than queueing two no-op runs. |
| Server-action gating | `src/app/actions/google-seo-aeo.ts` | `runAiVisibilityAuditNow` / `runHeatmapAuditNow` were exported server actions with **no UI callers** — reachable endpoints that wrote fabricated rows. Now refused when disabled. |
| Audit honesty | `google-seo-aeo-score-audit-section.tsx` | The **5** unimplemented checks no longer render beside real pass/fail rows with a "Fix" button (which implied we had measured them). They move to a "Not yet measured" section, and the score card reads **"Scored on 6 of 11 checks · 5 not yet measured"**. |
| Sync button | `google-seo-aeo-score-audit-section.tsx` | Hidden when disabled — it only ever drove the estimated surfaces; the page audit recomputes on load. |
| Dead code | all three workers, `google-seo-aeo-build-audits.ts` | Removed ~13 unused imports per worker plus 3 unused constants/helpers copied from the review sync worker. |
| Regression test | `tests/unit/aeo-surfaces.test.ts` (new) | 11 cases pinning default-off, explicit-opt-in-only, and that the disclosure states its method rather than saying "beta". |

### Deliberately not done in Phase 0

- **No data purge.** Estimated rows are marked, not deleted, pending the Q6 decision on customer notification. Purge is a one-line follow-up once that is settled.
- **Geo-grid schema** (`lat`, `lng`, `grid_row`, `grid_col`, `place_id_found`) is Phase 1 / PRD-5, not Phase 0.
- **Marketing collateral audit** is a content task, not a code change — still open, and it is on the Phase 0 checklist in §5.
- **GSC OAuth scope change** must be submitted by a human with Google Cloud console access. Long lead time; start now.

### 10.1 Production migration applied — 2026-08-05

Applied to the single Supabase project **Zyene Reviews** (`snielpllhrppdqzkzjwf`, us-west-2, ACTIVE_HEALTHY) via the Supabase MCP, registered as version `20260805200155 add_aeo_estimated_provenance`. The local file was renamed to match that version so a later `supabase db push` does not treat it as unapplied.

**Verified post-apply:**

| Table | Rows | Stamped estimated | Method |
|---|---|---|---|
| `google_seo_ai_visibility_runs` | 8 | 8 | `heuristic_rating_comparison` |
| `google_seo_ai_visibility_results` | 48 | 48 | `heuristic_rating_comparison` |
| `google_seo_heatmap_runs` | 8 | 8 | `heuristic_city_label` |
| `google_seo_heatmap_cells` | 48 | 48 | `heuristic_city_label` |

All four tables now default `is_estimated = false` / `method = 'unspecified'` for new writes. Security advisors show no new findings; the 13 outstanding items are all pre-existing and unrelated (RLS-enabled-no-policy on `opt_outs`, `sms_opt_outs`, `stripe_webhook_events`; public-executable `SECURITY DEFINER` functions; leaked-password protection disabled).

**Migration defect caught during apply:** the draft contained an explicit `UPDATE ... SET is_estimated = TRUE WHERE is_estimated IS DISTINCT FROM TRUE` backfill. It was redundant — `ADD COLUMN ... DEFAULT TRUE` already stamps existing rows — and actively dangerous on replay, since re-running it after Phase 1 would flip every measured row back to estimated. Removed before applying.

### 10.2 Blast radius — feeds Q6

The fabricated data reached **5 distinct businesses**, 112 rows total, with the most recent run on **2026-07-26**. This is live customer data, not test data, which makes Q6 (proactive notification) a decision that needs making rather than a hypothetical. Rows are marked, not deleted, so notification and purge remain fully open options.

---

## 11. Phase 1 log — E-1 engine adapter interface & registry (2026-08-05)

E-1 complete. `pnpm typecheck` clean, **260/260 tests pass** (27 new), `pnpm build` succeeds, zero lint warnings, all files well under the 200-line services cap.

| File | Lines | Role |
|---|---|---|
| `src/services/aeo/engines/engine-types.ts` | 141 | The contract: `AnswerEngineAdapter`, `EngineSampleResult`, `EngineCitations` |
| `src/services/aeo/engines/engine-catalog.ts` | 147 | All 8 engines with vendor, phase, per-sample cost, cost confidence |
| `src/services/aeo/engines/engine-registry.ts` | 109 | Registration, availability, `resolveRunnable` |
| `src/services/aeo/engines/engine-result.ts` | 118 | Result factories enforcing invariants |
| `src/services/aeo/engines/adapters/fixture-engine-adapter.ts` | 130 | Zero-cost scripted adapter |
| `tests/unit/aeo-engine-contract.test.ts` | — | 27 cases pinning the invariants below |

### Three design decisions worth defending

**1. Adapters return what an engine said, never whether we appeared.** There is no `brandMentioned` field anywhere in the contract. Presence is decided by a separate extraction pass. This makes the pre-Phase-1 bug class — a data-producing component asserting visibility from something other than an engine response — structurally impossible rather than merely discouraged.

**2. `failed` carries no answer payload.** `EngineSampleResult` is a discriminated union in which the failure variant has no `answerText` and no citations. A caller cannot misread a 503 as "brand not found" (QA criterion #2) because there is no field there to misread. `isObservation()` is the only sanctioned way to build a denominator, and it excludes `no_answer` as well as `failed` — a refusal is not evidence of absence either.

**3. Citations are tri-state.** `{ availability: "present", items: [] }` (engine returned no sources) and `{ availability: "unavailable", items: [] }` (engine exposes no sources at all) are different values. Modelling citations as a bare array would collapse them and silently corrupt the citation-rate denominator (QA criterion #15).

### The cost guard

`engine-catalog.ts` carries `cost: { overageMicroUsd, freePerDay, confidence }` per engine, and `resolveRunnable()` **withholds any engine whose pricing is unverified even when its adapter is fully wired and configured**. An unquoted vendor cannot start billing customers by accident.

**Updated 2026-08-05:** Gemini's grounding rate is confirmed, so it is now `verified` and resolves to `available` (§6.4). Claude and Copilot remain `unverified` and stay withheld. The guard did its job — it blocked Gemini for exactly as long as we could not state its price, and clearing it was the one-line edit the design promised.

### Why no live paid adapter yet

Deliberate sequencing, not an omission. The Vertex grounding fee is still unquoted (Q3 follow-up) and DataForSEO/OpenAI/Perplexity contracts are not signed. The fixture adapter implements the full contract at zero cost, including failure paths, so **E-5 (ledger), E-6 (eval harness), and E-7 (orchestration) can all be built and tested before any vendor commitment**. Real adapters then drop in behind the same interface.

`vertex-adapter.ts` was not extended: it is already 217 lines (over the services cap) and its `generateContentWithFallback` discards `groundingMetadata`, which is precisely where grounded-Gemini citations live. The Gemini adapter will need its own response path.

### Next

E-4 (schema for `aeo_prompts` / `aeo_runs` / `aeo_samples` / `aeo_citations`) and E-7 (Inngest fan-out) are both unblocked and can proceed in parallel against the fixture adapter.

---

## 12. Phase 1 log — E-4 sampling schema (2026-08-05)

Migration written: `supabase/migrations/20260805230000_aeo_phase1_sampling_schema.sql`. Ten tables covering the prompt library, runs and samples, citations, brand mentions, competitor aliases, the real geo-grid, and the quota ledger.

**Deliberately NOT applied to production.** The tables are empty and nothing reads them yet. Applying now would recreate exactly the gap we spent Phase 0 closing — schema live in production while the code that gives it meaning sits unmerged. It should be applied when E-5/E-7 are ready to ship, in the same release.

Consequence: `database.types.ts` cannot be regenerated until the migration lands. It is on the never-hand-edit list, so any service touching these tables before then must not assume generated types exist.

### Schema encodes the E-1 contract as database constraints

Where `engine-types.ts` makes an error impossible in TypeScript, the schema makes the same error impossible in Postgres — so a bad write cannot enter through the service-role admin client or a manual query, neither of which passes through the TS contract.

| Invariant | Constraint |
|---|---|
| Anything reaching a model records which one | `aeo_samples_model_id_required_unless_failed` |
| A failure carries no answer payload | `aeo_samples_payload_only_when_ok` |
| An answered sample declares citation availability | `aeo_samples_ok_declares_citations` |
| Error detail belongs only to failures | `aeo_samples_error_kind_only_when_failed` / `_failed_requires_error_kind` |
| A competitor mention resolves to a competitor | `aeo_brand_mentions_competitor_id_matches_kind` |
| Billable never exceeds sampled | `aeo_quota_ledger_billable_within_sampled` |

**`aeo_samples` has no brand-presence column at all.** Presence is extracted separately into `aeo_brand_mentions`, which carries its own `extraction_model_id` for provenance. This is the schema-level form of the rule that produced the pre-Phase-1 incident: nothing that writes raw engine output may also assert visibility.

**Geo-grid ranks are nullable with `CHECK (rank_position >= 1)`.** NULL means "not found in the local pack" and must render as a distinct state; a sentinel of 0 or 20 would silently average into ATRP (QA criterion #9).

### Validation method

Executed the full DDL plus nine negative-path inserts inside a transaction rolled back against the production database — real FK targets, real `get_user_org_ids()`, real `businesses`/`competitors`/`organizations` tables. All nine constraint tests passed and zero `aeo_*` tables persisted, confirmed by a follow-up count.

This is worth reusing: it validates a migration against production's actual schema without a branch, a local stack, or any write. Verify rollback works first with a throwaway probe table, since the technique is only safe if the transaction is genuinely honoured.

### Not in this migration

- `crawl_runs` / `crawl_pages` / `crawl_findings` — deferred to E-3, whose crawler defines their shape.
- `aeo_alerts` — deferred to the P8 alerting build; its shape depends on the significance gate in F8.8.

---

## 13. Correction — audit check counts (2026-08-05)

The plan stated throughout that the module had **5 measured and 6 pending** audit checks. It is **6 measured and 5 pending**. Verified against `origin/main`:

| | Count | IDs |
|---|---|---|
| Total | 11 | — |
| Hard-coded `status: "pending"` | **5** | `images`, `post-frequency`, `post-keywords`, `service-descriptions`, `service-area` |
| Computed pass/fail | **6** | `business-description`, `review-frequency`, `google-rating`, `review-replies`, `profile-performance`, `services-list` |

**Cause:** `services-list` computes a real pass/fail from `actionLinkCount >= 25`, but does so through an admitted proxy — Google place-action links standing in for a services list. The original §0.1 assessment recorded that caveat *and* counted the item as pending, so one check was represented twice.

**Blast radius: prose only.** `buildGoogleSeoAeoAudits` derives `measuredCount` from `status !== "pending"` at runtime, and the UI partitions the same way, so the shipped score has always read "Scored on 6 of 11 checks · 5 not yet measured" — which is what production shows. No code, score, or customer-facing value was ever affected.

The incorrect figure also appears in the merged commit message for `4fb1ab37` and in the body of PR #4. Both are immutable; this entry is the correction of record.

**What this surfaced, and what was done about it.** `services-list` is scored but is not a real services audit — it counts place action links. That is a smaller instance of the problem Phase 0 addressed: a number that looks measured and is not quite.

It was nearly left as a caveat with no owner. F5.10 was tagged P1 but scoped as *"implement the 6 stubbed checks"* — wrong count, and wrong in a way that mattered: `services-list` is **not** stubbed, so a task defined as "finish the stubs" would have shipped complete with the proxy untouched. QA criterion #29 ("zero `pending` items") had the same blind spot and would have passed.

Both are fixed. F5.10 now explicitly carries "(b) replace the `services-list` proxy" as non-optional scope, and criterion **#29a** fails the audit while any item is scored from a stand-in signal. The proxy now has an owner and a test that can detect it, rather than a note in a document.

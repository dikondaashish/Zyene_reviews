# AEO Phase 0 Collateral Integrity Audit

**Completed:** 2026-08-15
**Scope:** Repository-controlled marketing, sales-positioning, comparison, industry, blog, and resource copy
**Outcome:** Complete within the repository boundary

## Purpose

Phase 0 removed two product surfaces that presented heuristics as measurements:

- AI visibility derived from review ratings rather than answer-engine samples.
- A city-label heatmap that did not perform coordinate-level searches.

This audit checks that Zyene-controlled collateral does not sell either surface
as measured, live, beta, or capable of improving AI placement.

## Evidence standard

Claims were evaluated against:

- The shipped feature gates and disclosures in `src/lib/features/aeo-surfaces.ts`.
- The production provenance verification recorded in
  `docs/GOOGLE_SEO_AEO_RELEASE_PLAN.md`.
- [Google Business Profile local-ranking guidance](https://support.google.com/business/answer/7091?hl=en):
  relevance, distance, and prominence are the main factors; review count and
  positive ratings can help, but Google keeps detailed weighting confidential.
- [Google Search guidance for AI features](https://developers.google.com/search/docs/appearance/ai-features):
  established SEO fundamentals still apply, no special AI Overview optimization
  is required, and inclusion is not guaranteed.

No competitor marketing claim, correlation study, or internal estimate was
treated as proof of Google's ranking or AI Overview weighting.

## Repository scope reviewed

- `src/app/(marketing)/`
- `src/components/marketing/`
- `src/lib/comparisons/`
- `src/lib/content/`
- `src/lib/growth/`
- `src/lib/industries/`
- `src/lib/social-proof/`
- Repository email and sales-content paths where present

The search covered AI visibility, AEO/GEO, AI Overviews, ChatGPT, Perplexity,
Gemini, heatmaps, citations, rank tracking, measurement verbs, ranking promises,
and claims that Google had confirmed undisclosed algorithm behavior.

## Findings and resolution

### 1. Unsupported product capability

`src/lib/growth/product-foundation.ts` called AI visibility a Zyene beta and
promised higher rankings in Maps and AI search.

**Resolution:** Removed the AI visibility capability and replaced the outcome
promise with the measured GBP/Search performance and profile details the product
can actually support.

### 2. Unsupported AI Overview causation

`src/lib/content/blog-posts-month1.ts` claimed that reviews were heavily weighted
inputs to AI Overviews and that stronger review profiles were significantly more
likely to be included.

**Resolution:** Replaced those statements with Google's published position:
normal Search fundamentals apply, Business Profile information should be current,
no review-specific AI Overview weight is disclosed, and inclusion is not
guaranteed.

### 3. Undisclosed ranking formulas presented as fact

Repository content included universal review thresholds, a ninety-day freshness
weight, response rate as a confirmed ranking factor, deterministic competitor
overtake timelines, and guaranteed "rank higher" outcomes.

**Resolution:** Reframed these as responsible operating practices and customer
trust benefits. Copy now distinguishes Google's documented guidance from advice,
benchmarks, and variables that Google does not disclose.

### 4. Manual AI visibility guide

`src/lib/content/blog-posts-ai-visibility.ts` teaches readers to run and record
manual queries. It explicitly rejects a single automated score and guaranteed AI
placement, and it does not claim that Zyene currently provides the measurement.

**Resolution:** Retained. This is honest educational content, not a product claim.

### 5. Fabricated customer-style outcomes

`src/lib/industries/industry-data.ts` contained named customer-style quotes with
exact review, ranking, booking, and revenue outcomes. The page called them
"typical" illustrative results, but no repository evidence substantiated the
people, metrics, or typicality.

**Resolution:** Replaced the quote/testimonial presentation with explicitly
illustrative workflows. The pages now describe a starting point, responsible
workflow, and metrics the business should measure, with no promised outcome.

### 6. Public product pages

No repository-controlled public marketing or pricing page was found selling the
legacy heuristic AI visibility score or simulated heatmap. General local SEO
outcome language was softened where it implied guaranteed ranking improvement.

## Regression protection

`tests/unit/aeo-collateral-integrity.test.ts` blocks the specific fabricated or
unsupported claims found in this audit and pins the required disclosure language.

## Verification

The primary worktree contains macOS `dataless` placeholders that stall local
tooling, so the repository was cloned to an isolated temporary directory and
only the Phase 0 files were overlaid for verification on 2026-08-18. The dirty
worktree and all interleaved Phase 1 changes were left untouched.

- `pnpm typecheck` — passed.
- `pnpm test` — 110 files and 942 tests passed.
- `pnpm build` — passed; all 248 static pages generated.
- `pnpm lint` — passed with zero errors; existing repository warnings remain.
- `npx react-doctor@latest --verbose --diff` — 100/100, no findings across 13
  changed React files.
- `pnpm check:sizes` — passed repository-wide on the 2026-08-18 production
  readiness rerun.

## Boundary and closeout

This audit certifies collateral stored in this repository. It cannot certify
off-repository slide decks, CRM snippets, recorded calls, private email drafts,
or documents that were not provided. Those materials must follow the same rule:
do not describe Zyene as measuring AI visibility until the measured Phase 1 loop
has passed launch acceptance, and never promise placement or ranking.

Within the repository-controlled scope, the Phase 0 marketing/sales collateral
item is complete. Together with the shipped gate, provenance migration, customer
notification decision, and Google scope readiness recorded in the master plan,
Phase 0 has no remaining task. Google Auth Platform was checked directly on
2026-08-15: the Search Console scopes are configured and the Verification Center
reports that additional data-access verification is not required.

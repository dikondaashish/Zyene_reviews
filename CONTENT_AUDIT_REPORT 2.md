# Zyene Reviews content audit

Date: 2026-09-07

Reference: [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)

## Scope and method

This audit covered the public marketing site, documentation, help content, review-capture flows, widgets, dashboard/auth copy, structured blog/resource/industry data, email templates, campaign copy, AI prompts, metadata, navigation labels, forms, empty/error states, and reusable content components.

The Wikipedia reference is treated as an editorial checklist, not as an authorship detector. A phrase was flagged when it made a claim less specific, repeated a template, overstated the product, forced a conclusion, or added polish without useful information. Clean grammar alone was not treated as evidence of quality or evidence that text was AI-generated.

Inventory found 1,164 copy-bearing source files/units, including 801 structured blog, help, resource, industry, campaign, and template entries. Reusable source content was counted once rather than once for every route where it renders.

The worktree already contained extensive unrelated modifications before this audit. The changes below were applied on top of that state; no existing changes were reset or rewritten wholesale.

## Findings and changes

### 1. Negative Feedback Shield was repeatedly described as review suppression

Locations:

- `src/app/(marketing)/how-it-works/how-it-works-data.ts`
- `src/app/(marketing)/features/features-data.ts`
- `src/app/(marketing)/page.tsx`
- `src/lib/growth/feature-pillars.ts`
- `src/lib/industries/industry-data.ts`
- `src/app/(marketing)/industries/industries-shared-benefits-strip-section.tsx`
- `src/services/resend/templates/growth-marketing-emails.ts`
- `src/services/resend/templates/growth-emails.ts`
- `src/lib/campaign-content/monthly-newsletter-content.ts`
- `src/lib/campaign-content/email-sequences-data.ts`
- `src/lib/campaign-content/google-ads-data.ts`
- `src/lib/content/blog-posts-month3.ts`

Representative existing wording included:

> “Route bad ones privately.”

> “Negative Feedback Shield routes unhappy customers to private resolution before they go public on Google.”

> “The Negative Feedback Shield intercepts unhappy diners before they write a public 1-star review.”

Why this was a meaningful problem: the wording made a private feedback step sound like a mechanism for preventing public criticism. That conflicts with Zyene’s own compliance guidance in `blog-posts-shield.ts`, `resource-review-request-templates-body.ts`, and the security page, which says not to selectively ask satisfied customers or block legitimate public reviews. The copy also used a dramatic outcome (“before they go public”) instead of describing the actual workflow.

Relevant Wikipedia patterns: promotional language; vague conclusions attached to factual product descriptions; generic positive framing; repeated template language; and writing that makes a product sound more significant without adding operational detail.

Representative rewrite:

> “Negative Feedback Shield gives low ratings a private feedback path and alerts your team.”

> “When a customer reports a bad experience, the Negative Feedback Shield opens a private resolution flow and alerts your team so you can follow up quickly.”

Reason: this states what the customer sees and what the team can do. It does not promise that a customer will change a review or imply that public reviews are blocked. The wording was applied consistently across the high-risk surfaces above.

Content that was intentionally not changed: the compliance warnings that explicitly say the Shield is not review suppression, does not replace public responses, and must be used with fair review requests. Those passages are direct and useful.

### 2. Generated review copy forced SEO language and unnatural sentence shapes

Locations: `src/services/review-flow/generate-review-prompt.ts`, `src/services/review-flow/generate-review-api.ts`, and `src/lib/review-flow/ensure-complete-review.ts`.

Existing instructions required the generated review to be “optimized for SEO and AEO,” contain the full business name in the last sentence, use exactly two or three sentences, avoid starting with “I,” and include keywords. The fallback also generated:

> “Had a wonderful time at [business]. The [tags] was fantastic. Highly recommend [business].”

Why this was a meaningful problem: these constraints manufacture the exact behavior the prompt says to avoid. They make a customer review sound like marketing copy, force keyword placement, and produce repetitive sentence structures. They also encourage fabricated confidence when the available context may only contain a rating and a few selected tags.

Relevant Wikipedia patterns: predictable AI vocabulary; superficial optimization language; repeated structures; generic praise; and overly polished wording that is not appropriate to the practical task.

Rewrite applied:

> “Write 1–3 complete sentences ... Mention the business name or category only if it sounds natural. Do not force keywords. Vary sentence openings and length. Use only the selected tags, staff names, and provided context.”

The audit recommended removing these forced constraints, but those two prompt/API files were restored to their original content at the user’s request. The separate completion helper remains updated to preserve its tested business-name requirement without adding a “highly recommend” suffix.

### 3. AI reply and Q&A prompts contained SEO/AEO instructions unrelated to the user’s task

Location: `src/domains/ai/prompts/index.ts`.

Existing wording told the reply model to include the business name, category, and relevant keywords for SEO/AEO and to write for AI search snippets. The Q&A prompt called for an “SEO/AEO Friendly” answer.

Why this was a meaningful problem: a public reply should answer the reviewer and reflect the business context. Adding search-engine instructions invites keyword stuffing and makes otherwise direct responses sound like generated web copy.

Relevant Wikipedia patterns: predictable AI vocabulary; generic authoritative framing; and language that sounds like it is trying to signal optimization rather than communicate with a customer.

Rewrite applied:

> “Mention [business name] or the business category only when it fits the reply naturally. Do not add keywords for search engines.”

The Q&A instruction now simply requires a direct answer and limits business-name use to relevant cases.

### 4. Homepage and resource copy used broad claims where product details were available

Locations:

- `src/components/marketing/marketing-home/marketing-home-hero.tsx`
- `src/components/marketing/marketing-home/marketing-home-closing.tsx`
- `src/app/(marketing)/resources/page-view.tsx`
- `src/app/(marketing)/about/about-mission-section.tsx`
- `src/lib/content/resource-data.ts`
- `src/lib/content/blog-posts-month1.ts`
- `src/lib/content/blog-posts-month2.ts`
- `src/lib/content/blog-posts-month3.ts`

Representative existing wording:

> “The review management platform built for local businesses, helping owners monitor reviews, respond faster, and build trust.”

> “Join local businesses managing their reputation and growing their Google ratings every day.”

> “Comprehensive guides for ...”

> “Google Reviews have evolved from a nice-to-have into critical business infrastructure ... your most important marketing asset.”

> “The definitive guide ...”

Why this was flagged: the claims could describe almost any reputation-management product. They emphasize importance and broad benefit rather than naming the actual workflows Zyene supports. The copy also used “comprehensive,” “definitive,” “critical,” and similar authority signals without adding evidence.

Relevant Wikipedia patterns: regression to the generic mean; undue emphasis on importance; promotional language; inflated conclusions; and predictable generic SaaS phrasing.

Rewrites applied:

> “Monitor Google, Facebook, and Yelp reviews, send review requests, and draft replies from one workspace.”

> “Keep review alerts, requests, private feedback, and replies in one workspace.”

> “Practical guides for ...”

The blog and resource changes similarly replace “definitive,” “critical,” and guaranteed-sounding claims with descriptions of the actual topic or workflow. In the 50-review article, an unsupported “triple to quintuple” expectation was replaced with a baseline-and-measure approach.

### 5. Review-response tools contained unsupported ranking claims

Locations:

- `src/app/(marketing)/tools/review-response-generator/review-response-generator-client.tsx`
- `src/app/(marketing)/tools/review-link-generator/review-link-generator-client.tsx`
- `src/lib/free-tools/review-response-templates.ts`

Representative existing wording included the claim that Google factors response rate into local visibility, and that making review links easier would produce more five-star ratings.

Why this was flagged: the statements attached a positive SEO conclusion to a useful feature without evidence. The response templates also repeatedly used generic praise and “highly recommend,” which would make generated responses look templated.

Relevant Wikipedia patterns: vague conclusions attached to facts; promotional language; generic positive adjectives; and repeated sentence patterns.

Rewrite applied:

> “Replying to Google reviews shows customers how you handle feedback. Google does not publish response rate as a separate ranking factor. This generator drafts a reply from the rating and review text you provide.”

> “A direct ‘Write a review’ link removes a step for customers who want to leave honest feedback. They can tap once instead of searching for your business on Maps.”

The templates now thank customers directly, ask for details when a rating is low, and avoid promises about earning a five-star review.

### 6. Integration copy overpromised native coverage and “thousands of apps” behavior

Locations:

- `src/app/(marketing)/integrations/page.tsx`
- `src/app/(marketing)/integrations/integrations-items-a.ts`
- `src/app/(dashboard)/settings/integrations/zapier/zapier-page-header.tsx`
- `src/components/integrations/zapier-card.tsx`
- `src/lib/content/help-articles-integrations.ts`
- `src/app/docs/api/page.tsx`
- `src/app/docs/cookbook/page.tsx`
- `src/app/docs/content-types/page.tsx`
- `src/app/docs/page.tsx`
- `src/app/docs/quickstart/page.tsx`

Representative existing wording included:

> “Connect Zyene to Google, Facebook, Yelp, Zapier, Square, and 5,000+ apps.”

> “The Zapier integration lets you trigger Zyene review requests automatically from any app in Zapier’s library ... and thousands more.”

> “Square is the most popular POS for local businesses.”

Why this was flagged: the repository’s implementation and documentation describe a generic webhook/API workflow for Zapier, not a native Zyene app with every listed connector. “5,000+ apps” and “most popular” are not necessary to explain the integration and create a broader impression than the product behavior supports.

Relevant Wikipedia patterns: advertisement-like language; generic SaaS claims; unsupported superlatives; and replacing concrete implementation details with broad coverage claims.

Rewrites applied:

> “Connect Zyene to Google, Facebook, Yelp, Zapier, and Square. Use the REST API or generic webhook for custom workflows.”

> “Use Zapier’s generic webhook to send a Zyene review request after an event in another app. The workflow can start with a sale, booking, or completed service, then map the customer’s name and contact details before sending the request.”

Documentation metadata now names review requests, webhooks, analytics, locations, and API objects directly.

### 7. Industry pages reuse the same abstract feature pattern

Locations: `src/lib/industries/industry-data.ts` and the shared industry components.

Repeated structure:

> “AI replies that sound like a real [business owner]”

> “Track nearby competitors”

> “Stay ahead of ...”

> “The Negative Feedback Shield ... before they post.”

Why this was flagged: repeated title/description pairs make the pages appear generated from one template with industry nouns substituted. Some pages also used “#1 source,” “most common,” “most powerful,” or “most complaints” claims without a cited study or product data.

Relevant Wikipedia patterns: repeated sentence structures; generic wording that could be moved to another company; inflated significance; and superficial analysis.

Changes applied to the highest-risk Shield descriptions: they now describe a private form, the alert to the team, and follow-up. The repeated AI-reply and competitor descriptions were left where they are factually serviceable, because the underlying features are genuinely shared across industries.

Recommended next step: rewrite each industry page around one or two real workflows for that industry, then remove or source the unsupported “#1,” percentage, and “most common” claims. This needs product/marketing evidence, so the audit did not invent replacements for the statistics.

### 8. Blog and resource entries sometimes repeat a summary and then restate it

Locations: `src/lib/content/blog-posts-month1.ts`, `blog-posts-month2.ts`, `blog-posts-month3.ts`, and several resource data files.

Pattern:

1. A summary block makes a broad claim.
2. The next paragraph repeats the same claim with slightly different wording.
3. A later tip or conclusion repeats the claim again.

Example: the 50-review article previously presented “triple to quintuple” growth in the summary, repeated the same expected result in the body, and then prescribed a fixed monthly target. That was rewritten to use the reader’s own baseline and to distinguish an operating goal from a ranking promise.

Relevant Wikipedia patterns: superficial analysis, repeated conclusions, rule-of-three accumulation, and adding words without adding information.

Not every summary/body pairing is a defect. Summaries are useful for cards, previews, and structured content when the body adds detail. The issue is when the summary and following paragraph make the same claim and neither adds evidence or an example.

## Findings intentionally not changed

### Unsupported proof-point statistics

Location: `src/app/(marketing)/how-it-works/how-it-works-data.ts` and `how-it-works-proof-points-section.tsx`.

The page currently presents figures such as `+0.4` average rating lift after 90 days, `+140%` review volume in three months, `9 in 10` low ratings routed privately, and `4 hrs/wk` saved. The component says they are platform averages, but no sample, date range, methodology, or source is present in the audited content.

These are not merely style issues. They may be true, but the repository did not provide enough context to rewrite them safely. Recommended action: publish the measurement definition and sample/methodology, or replace each number with a directly observable product metric. Do not soften the adjectives while leaving unsupported numbers in place.

### Industry and editorial statistics

Several industry articles contain percentages and market claims, including review conversion rates, patient/diner behavior, ranking effects, and “#1 source” statements. These should be source-checked before stylistic rewriting. A natural sentence with an unsupported statistic is still a content-quality problem.

### Case-study results

Case-study figures and rankings in `src/lib/social-proof/case-study-data.ts` should be checked against source records and labeling. The audit did not rewrite those figures because changing a result would alter a factual claim, not merely improve style.

### Legal, privacy, security, and operational UI copy

Terms, privacy, security, billing, auth, onboarding, error, loading, empty-state, and account-management copy was generally direct and functional. Legal and compliance wording was left unchanged unless it was a marketing claim covered above. Phrases such as “Connection expired,” “No reviews found,” and “An unexpected error occurred” are not AI-like; they are concise interface states.

### Formatting

Lists, headings, tables, and short checklists are appropriate for docs and dashboards. The Wikipedia reference warns about excessive formatting, but this product’s operational content benefits from scan-friendly structure. No formatting was removed solely to make prose look more human.

## Site-wide patterns to fix systematically

1. Describe the customer action and the product response before describing the benefit.
2. Remove “complete,” “definitive,” “most powerful,” “most influential,” “critical,” and similar authority words unless the page supplies evidence.
3. Treat “before they post,” “protect your rating,” and “get more five-star reviews” as claims requiring careful compliance and factual review.
4. Keep SEO/AEO requirements out of customer-facing generated replies and review drafts. Product context should guide wording; keyword insertion should not.
5. Maintain one canonical description for shared workflows, especially Negative Feedback Shield, integrations, AI reply drafts, and competitor tracking.
6. Review all numeric claims as a separate evidence pass. Style editing cannot make an unsupported number reliable.
7. When a summary block is followed by a paragraph, require the paragraph to add an example, mechanism, limitation, or evidence.
8. Prefer “can,” “supports,” and “gives the team a way to” when the outcome depends on customer behavior or an external platform. Avoid implying guaranteed rankings, reviews, conversions, or retention.

## Counts

To avoid counting the same reusable content once per route, the audit uses one copy-bearing source unit as the counting unit: a page, component/data block, prompt/template file, or structured-content file.

- Copy-bearing source units inventoried: **1,164**
- Structured blog/help/resource/industry/campaign entries within that inventory: **801**
- Copy-bearing source units changed in this audit: **35**
- Copy-bearing source units intentionally left unchanged: **1,129**
- Most common problems: generic SaaS positioning, repeated Shield/review-gating implications, forced SEO/AEO language in generated copy, unsupported statistics, integration overclaims, and summary/body repetition.

The changed-unit count refers to source units, not individual rendered occurrences. A single shared data block may appear on multiple routes and is counted once.

## Verification

`pnpm verify:fast` passed after the edits:

- TypeScript typecheck: passed
- File-size guard: passed

The read-only `scripts/audit-marketing-seo.mjs` script could not complete because it currently throws `ReferenceError: f is not defined` at line 180. That is a script defect, not a content finding, and it was not changed as part of this audit.

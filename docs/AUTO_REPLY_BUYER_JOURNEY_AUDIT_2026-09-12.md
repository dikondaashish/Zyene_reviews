# Automatic Google replies: buyer journey and placement audit

Date: September 12, 2026

## Recommendation

Present **Automatic Google replies** as a named capability within **AI Review Replies**. Give it a visible homepage feature card, explicit pricing treatment, and a setup explanation on the existing `/features/ai-replies` page. A separate marketing URL is not necessary yet: manual AI drafts and automatic publishing answer closely related buyer questions, and the existing page can explain both.

Suggested homepage copy:

> **Your next Google reply, taken care of.**
>
> Automatically publish AI replies to new Google reviews that match your chosen star ratings. Pick Professional, Friendly, or Concise, and turn automatic replies off anytime.
>
> **See automatic replies in action →**

Show a small `New Google review → AI writes a reply → Published` illustration, linked to the interactive example. Label the example as a demo. Explain that existing reviews are excluded in the detail section.

## Scope and evidence

This is a source-based content and placement audit of the local working tree, including the changes made in the preceding task. The inventory covers all **37 route templates** under `src/app/(marketing)`, and an import/text scan covers 310 marketing route, component, and catalog files. Detailed review focused on buyer-facing claims, pricing, help content, and the production automatic-reply implementation.

Dynamic blog, industry, comparison, resource, and help URLs are represented by their shared templates and content catalogs below. This is not a rendered visual QA pass of every generated URL, a production crawl, buyer survey, keyword-volume study, or verification of competitors' current products. Priorities are product/content judgment, not measured conversion lift. No production Google replies were sent.

## What a buyer needs to understand

| Buyer question | What the site should communicate | Best location |
|---|---|---|
| Will this reduce daily work? | Eligible new Google reviews can receive a published reply without approving each one. | Homepage card and demo |
| Is this just a writing assistant? | Two modes: generate a draft to edit yourself, or enable automatic publishing. | AI Replies feature page |
| Will it sound like my business? | Professional, Friendly, and Concise tones, shown with example replies. | Demo and feature page |
| Can I choose what gets answered? | Thresholds of 3 stars and up, 4 stars and up, or 5 stars only; settings apply to the selected business. | Feature page and help |
| Does it work on my review platform? | Automatic publishing is for Google. Facebook and Yelp monitoring should not imply automatic replies there. | Integrations and feature page |
| Is it included in my subscription? | Clearly name the feature on eligible plans and explain actual allowances consistently. | Pricing cards and pricing FAQ |
| Will it answer old reviews? | Existing reviews are excluded from automatic mode; manual drafts remain available. | Feature FAQ and help |
| What happens when I disable it? | Explain future automatic-reply behavior without promising recall of an already executing/public reply. | Help and settings explanation |
| Can I see it before signing up? | An interactive example with tone, threshold, typing, skipped-review and published states. | Homepage demo; already added |

Do not make unmeasured promises such as a guaranteed response rate, guaranteed ranking improvement, or a fixed number of hours saved.

## Highest-priority findings

### 1. The homepage still presents the main AI card as draft assistance

The tour and FAQ now explain automatic replies, but `marketing-home-feature-constellation.tsx:65` says **AI-assisted replies**, and line 69 says **Review before publishing**. The separate workflow story also describes editing a draft before publishing (`marketing-home-workflow.tsx:18–24`). A visitor who skims those sections can still miss the automation.

Give automatic publishing its own named card or a clearly labeled second mode inside the AI card. Update the workflow story to explain both modes and link to the feature page. Keep the overall homepage hero broad enough to represent review requests, inbox, replies, and reporting.

### 2. Pricing already includes the feature, but allowance claims need reconciliation

This is not a missing-feature-row problem: `src/services/stripe/plan-catalog.ts:45` and `:69` already say **Unlimited business reply suggestions & automatic replies**, and pricing cards render those arrays directly. The competitor matrix separately calls it **Auto-commenter (hands-free)** (`pricing-client-constants.ts:49`).

However, `process-auto-reply-review-function.ts:126` calls `checkLimit(orgId, "smart_replies")`. That checker reads `max_ai_replies_per_month` and counts customer review-request rows containing `ai_review_text` (`src/lib/stripe/check-limits.ts:93–96, 128–137`). The catalog separately lists 1,500/2,000 customer-draft allowances. Therefore, the automatic-reply job can be blocked by customer-draft usage even though the plan copy calls automatic replies unlimited. This is a concrete source inconsistency; actual organization settings were not inspected.

Resolve the intended entitlement/metering behavior before expanding the unlimited claim. Then use separate labels for **AI customer review drafts**, **AI business reply suggestions**, and **Automatic Google replies**, with one pricing FAQ explaining the distinction.

### 3. Product naming varies across the site

The same capability appears as **Automatic Google replies**, **Auto-commenter**, **Auto commenter**, and **Auto-reply bot**. The navigation still says **One-click drafts and auto-commenter** (`marketing-layout-nav-data.ts:32`).

Use **AI Review Replies** for the feature family and **Automatic Google replies** for the publishing mode. Suggested navigation description: **Draft replies or publish automatically to Google.** Preserve existing URLs unless a redirect is deliberately introduced.

### 4. The help article describes an older setup flow

`src/lib/content/help-articles-reviews.ts:67–87` directs people to **Settings → AI Replies → Auto-Commenter**, asks them to turn it on before choosing settings, and mentions **Save Settings**. The current control is in the Reviews page header, uses the selected business, offers a rating threshold and three tones, and opens an enable-confirmation dialog. The article also makes absolute quality promises that should be checked against implementation before retaining them.

Rewrite `/help/reviews/setting-up-auto-commenter` around the actual flow. Keep its URL for existing links, update its visible title, and cross-link from the feature page. Review `/help/reviews/using-ai-replies` too: its tone names and suggestion that publishing works on other connected platforms do not match the Google-specific publishing surfaces reviewed here.

### 5. Comparison claims disagree internally

The pricing matrix marks competitors as lacking automatic replies, while another foundation table and the NiceJob comparison catalog describe different support. This audit establishes disagreement within local copy, not which competitor claim is correct. Reverify primary vendor sources before changing comparison claims; meanwhile, describe Zyene's Google scope and control options precisely.

## Complete route-template placement inventory

| Route/template | Finding and recommended treatment |
|---|---|
| `/` | Highest priority. Tour and FAQ now cover automation; main feature card and workflow still emphasize manual drafting. Name automatic replies visibly and link to details. |
| `/features` | Already lists automatic replies and rating selection in AI Replies bullets. Make the two modes easier to scan and link directly to the explanation. |
| `/features/[pillar]` | `/features/ai-replies` is the main destination; new setup section and demo are present. Add clear mode comparison, plan eligibility, and help link. On review-monitoring/analytics pages, use a contextual cross-link; do not repeat a full automatic-reply section on every pillar. |
| `/pricing` | Already included in plan-card text. Standardize the label, clarify platform and allowances, and add a pricing FAQ after resolving the meter inconsistency. |
| `/how-it-works` | Respond step currently explains drafting/editing. Show a fork: approve a draft yourself, or enable automatic Google publishing. |
| `/integrations` | Google card says approved responses. Add optional automatic Google replies; retain Facebook/Yelp sync-only distinctions. |
| `/demo` | Walkthrough description mentions AI assistance. Include automatic reply setup in the agenda and offer a link to the safe interactive tour before booking. |
| `/compare` | Automation is buried in AI assistance wording. Separate drafting and automatic publishing when comparing capabilities; reconcile competitor evidence. |
| `/compare/[competitor]` | Several comparison rows already mention optional automatic replies; Prosperly copy is more draft-focused. Explain Google scope consistently and verify competitor-specific availability separately. |
| `/industries` | Shared benefits say AI-assisted Google replies. Introduce automatic replies as an optional time-saving mode and link to the main feature page. |
| `/industries/[industry]` | Tailor examples for restaurants, salons, auto repair, home services, hotels, and fitness. Keep healthcare pages explicit about review and public-response responsibility; do not imply automation provides guaranteed privacy compliance. Existing restaurant tone names differ from the real controls. |
| `/es/industries` | Secondary priority. Add a short localized capability mention only when it leads to an understandable localized explanation. |
| `/es/industries/[industry]` | Translate the two-mode distinction and Google scope. Do not merely translate the old generic AI assistance claims. |
| `/agencies` | Explain per-business settings as a way to manage client tone and eligible ratings. Keep the separate multi-client dashboard roadmap labeled as in development. |
| `/enterprise` | Add a concrete location-by-location automatic-reply workflow to the existing rollout narrative. Avoid suggesting bulk policy administration unless supported. |
| `/partners` | Optional linked benefit for reputation-service partners; a dedicated feature section is unnecessary here. |
| `/about` | A one-line addition in the product overview is enough. Keep the page focused on the company and its purpose. |
| `/contact` | No dedicated automatic-reply section needed. Existing support/sales routing is appropriate. |
| `/case-studies` | Use an automatic-reply workflow example as a discovery link if a relevant example is added. |
| `/case-studies/[slug]` | Show an illustrative eligible-review → published-response sequence, clearly labeled as an example. Existing composites must not become invented customer results. |
| `/blog` | Surface a useful reply-automation article through existing topic navigation; no repeated sales section required. |
| `/blog/[slug]` | Add contextual links in positive-review and AI-reply articles; reconcile draft-only advice with optional automation. Preserve manual-response guidance for complex complaints. Do not insert the feature into unrelated articles. |
| `/resources` | Existing generic automation CTA can link to the feature explanation. Lower priority than pricing and homepage. |
| `/resources/[guide]` | Add a short two-mode explanation where guides discuss routine replies. Keep negative-review templates focused on thoughtful, situation-specific responses. |
| `/tools` | Upgrade CTA currently emphasizes drafts. Mention optional Google publishing and link to the AI Replies page. |
| `/tools/review-response-generator` | Already mentions optional automatic replies. This is a strong bridge from free template drafting to the paid publishing workflow; make the distinction and CTA explicit. |
| `/tools/reputation-score-checker` | Contextual next step for a low response rate: explain drafts and optional automatic replies. Do not promise that automation itself raises ratings/rankings. |
| `/tools/review-link-generator` | Keep focus on requesting reviews. A secondary related-feature link is enough. |
| `/help` | Ensure searches for “automatic replies” and “auto reply” can discover the updated setup article. |
| `/help/[slug]` | Reviews category description still uses auto-commenter terminology. Rename visible copy and surface the setup article. |
| `/help/[slug]/[article]` | Highest-priority documentation fix: current setup path, actual tones/thresholds, Google scope, existing-review exclusion, eligibility, and troubleshooting. |
| `/security` | Explain authorization and public publishing only where relevant to existing Google access copy. No extra promotional card. |
| `/privacy` | No marketing insertion. Review factual AI-data explanations only through a separate privacy-content review if needed. |
| `/terms` | No marketing insertion. Product/billing statements should remain consistent with the final entitlement decision. |
| `/data-retention` | No automatic-reply sales copy needed. |
| `/newsletter/unsubscribe` | No promotion; preserve the focused unsubscribe task. |
| `/growth` | Internal gated operations page, not a buyer-facing landing page. No promotional placement. |

## Suggested order of work

1. Reconcile automatic-reply allowance/metering claims and correct the setup help article.
2. Standardize naming in navigation, homepage feature card/workflow, pricing, and feature overview.
3. Complete the existing AI Replies page with two modes, plan eligibility, and help links.
4. Update how-it-works, Google integration copy, and demo agenda.
5. Add tailored industry/agency examples, then relevant tool/resource/blog links.
6. Reverify competitor evidence before revising comparison tables.

The previous implementation already supplies the interactive tour, feature-page setup section, updated feature bullets, and homepage FAQ. This audit recommends the next improvements; it does not change the website or production behavior.


## Implementation update — September 12, 2026

Implemented the recommended homepage card/workflow, navigation naming, pricing FAQ, two-mode feature explanation, setup guide, Google integration copy, demo links, industry/agency/enterprise examples, and relevant tool/blog/resource links. The existing help URL is preserved. A Spanish industry-page explanation links to the English detail page.

Removed the customer-draft quota gate from the automatic business-reply worker while retaining subscription, platform, rating, enabled-state and review-age checks. A regression test proves exhausted customer-draft quota no longer blocks an otherwise eligible automatic reply. Business-reply usage telemetry remains intact.

Comparison wording now acknowledges automatic replies on NiceJob Pro and autonomous replies in Birdeye; Podium plan/platform scope is left for confirmation. Sources checked: [NiceJob help](https://help.nicejob.com/en/articles/10324617-ai-review-replies), [Birdeye help](https://support.birdeye.com/en/articles/12654785-how-to-configure-and-use-the-review-response-agent), [Podium reviews](https://www.podium.com/product/reviews). These updates do not independently validate the other existing pricing/comparison claims.

Legal, unsubscribe, internal operations, and unrelated pages remain focused on their own tasks. No new marketing route was necessary. Changes are local and are not deployed.

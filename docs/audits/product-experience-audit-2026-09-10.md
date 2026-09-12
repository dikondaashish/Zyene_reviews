# Zyene Reviews — candid product experience audit

Audit date: September 10, 2026. Evaluated production marketing, the signed-in Starter workspace, customer-facing collection and widget pages, and supporting source. This is an analysis; no product code, customer records, settings, subscriptions, or campaigns were changed.

**Owner clarification after this audit:** The owner reports documented Google approval and attorney review for the existing rating-based routing. The routing recommendation below is excluded from the authorized remediation; preserve that behavior. See `product-remediation-2026-09-10.md` for implementation status. The audit remains a dated record of the original observations.

## Verdict

**There is a useful reputation-management product here, but it loses credibility by presenting illustrations as proof, clicks as completed reviews, and experimental diagnostics as finished customer features. Fix trust and the everyday workflow before adding more surface area.**

The visual foundation is considerably better than the product discipline. The warm marketing identity, working Google review inventory, contact history, editable replies, branded collection page, and visible plan limits give you something worth improving. The product currently makes a small-business owner navigate an enterprise-sized feature catalogue to answer three basic questions: What needs my attention? Did my requests work? What should I do next?

My recommendation is a narrower promise: **Collect honest feedback, reply faster, and know what needs attention across your locations.** Treat advanced AI visibility as an optional, clearly bounded product until its evidence and recommendations are dependable.

## What was actually covered

- Crawled all **119 sitemap URLs**: all returned HTTP 200 and each server-rendered document contained one H1. Captured page text, headings, metadata, and links. This establishes reachability and content coverage, not complete functional verification.
- Manually inspected the main marketing journeys, pricing, feature and industry templates, comparison and case-study content, tools, help, docs, and public trust pages. The accompanying ledger identifies the entire public URL inventory; repeated editorial pages received template/content checks rather than every possible interaction.
- Inspected the authenticated dashboard, reviews, requests, customers and a customer detail, CSV import entry, campaigns and unsaved creation flow, businesses, competitors, analytics, Google SEO/AEO sections, and settings including Zapier.
- Inspected the live collection page and widget. Exercised positive and negative collection paths **inside the safe profile preview**, without submitting customer feedback or posting to Google.
- Checked settled mobile layouts at **390 × 844** for the landing page, dashboard, reviews, and collection page. No document-level horizontal overflow was observed on the landing page, dashboard, or reviews in those samples. This was not a complete device, keyboard, screen-reader, or performance audit.
- Source review supplemented unavailable or consequential states: new-account onboarding, password recovery completion, campaign detail with recipients, attribution logic, widget content, and AI scoring.

The existing account had no campaigns, so a real populated campaign detail and delivery lifecycle were not tested. New signup, OAuth permissions, paid checkout, cancellation, role changes, publishing replies, sending requests, importing real contacts, deleting data, and metered AI runs were not executed. Findings distinguish observed behavior from recommendations; this report does not certify every transaction, role, tenant, or backend integration.

There are substantial pre-existing local changes. Some address issues below but were not present in the production pages inspected. They must be validated after deployment rather than assumed fixed.

## Fix these first

### 1. The public widget invents words for real reviewers — urgent

**Observed:** Rating-only reviews become a positive written testimonial in the live widget. The same reviewers have no written comment in the review inbox. The loader explicitly substitutes a positive sentence for empty text, under a header claiming verified reviews.

**Why it matters:** This is fabricated testimonial content attributed to a real person. It is substantially more serious than an unlabeled dashboard mockup.

**Change:** Preserve the rating and reviewer attribution, but omit the quotation when the original has no text. Show a neutral rating-only label. Link to the original source when available, and define what “verified” means. Never generate missing customer testimony.

**Acceptance:** A rating-only source review produces no invented quotation anywhere: widget, exports, marketing reuse, structured data, or AI summaries.

Evidence: `src/app/w/[slug]/load-widget-page-data.ts:84`; `src/components/widgets/review-carousel-header.tsx`; live `/w/wolfpack-bbq-burgers`.

### 2. Review collection gives unhappy customers a materially different path — urgent

**Observed:** Public Profile recommends a minimum of four stars for the public-review path. Lower ratings go to private feedback; higher ratings go through positive tags and a generated review toward Google. In the preview, the unhappy path also displayed a configured recovery offer. A Google link still exists on the negative path, but it is much less prominent.

**Why it matters:** An available secondary link does not make the two solicitations equivalent. This conflicts with marketing assurances about avoiding review gating. Google prohibits discouraging negative reviews and selectively soliciting positive reviews. This is a product-policy concern, not a legal determination. [Google Maps contribution policy](https://support.google.com/contributionpolicy/answer/7400114?hl=en-GB).

**Change:** Give every rating the same clearly visible public-review and private-feedback choices. Separate service recovery from review solicitation. Remove the recommended positive-rating threshold. Replace “Negative Feedback Shield” messaging with honest private-feedback/service-recovery language. Let customers write in their own words; do not steer them into preselected praise.

**Acceptance:** One-star and five-star customers have equivalent publishing choices, with no incentive conditioned on leaving, changing, or withholding a review. Marketing descriptions accurately explain this flow.

Evidence: public-profile Rating settings; embedded preview; `src/app/r/[slug]/review-flow/use-review-flow-actions.ts`; negative-step footer/offer components.

### 3. A trip to Google is being counted as a review left — urgent

**Observed:** The Google-post handler records `review_left: true` and completion before redirecting to Google. The dashboard and customer pages use review-conversion language.

**Why it matters:** The product can know that a customer clicked through. That does not establish that Google received or published a review. The displayed conversion rates therefore imply stronger evidence than this event supplies. This does not prove any particular customer's review is false; it proves the event definition is insufficient.

**Change:** Track Sent → Delivered → Opened → Visited Google → Review verified, where supported. Keep unknowns explicit. Use attribution only when there is a defensible matching method, and explain its limits.

**Acceptance:** Clicking an outbound Google link cannot increment a metric labeled “Reviews left” or “Verified review conversion.” Historical data is relabeled or recalculated consistently.

Evidence: `src/app/r/[slug]/review-flow/use-review-flow-google-post.ts:54`; customer and request dashboards.

### 4. Remove unsupported customer proof — urgent

**Observed:** The live homepage places major chains under a customer-trust heading. Their source dataset explicitly says they are illustrative brands, not customers or endorsers. A local, uncommitted component now adds disclosure; production still showed the old claim during inspection.

The case studies disclose that names, quotes, and metrics are composites. That disclosure is good, but the pricing page reuses composite personas as owner proof without comparable nearby context. Some illustrative arithmetic is internally inconsistent: the salon scenario claims 56 reviews at 4.4 became 118 at 4.9. With the same original reviews retained, even 62 additional five-star ratings would yield roughly 4.72, not 4.9. Rounded starting values do not bridge that gap. A review-removal scenario is not described.

**Change:** Remove the major-brand strip. Publish permissioned customer evidence, even if there are only one or two customers. Rename composite stories as example workflows, remove testimonial-style invented identities, and make numbers internally coherent. Verify the separate homepage testimonials against owner records and permissions; their source says the site owner supplied them, so this audit does **not** establish that they are fabricated.

**Acceptance:** Every customer logo, quote, outcome, and numerical uplift has an evidence owner and permission record, or is unambiguously illustrative wherever reused.

Evidence: `src/lib/social-proof/illustrative-brands-data.ts`; `src/lib/social-proof/case-study-data.ts`; `src/components/marketing/marketing-home/home-testimonials.ts`; homepage, pricing, case-study pages.

### 5. Advanced AI pages overstate certainty and actionability — high

**Observed:** Competitive insights showed review-to-answer matches at 100% confidence even when the answer discussed competitors and the purported matching review was generic. The matcher uses lexical overlap; this is similarity, not proof that an AI engine cited that review. Repeated sampling displayed a 95% interval of 0–0% after only three unsuccessful observations. The formula collapses at all-zero/all-one samples.

Recommendations also included refreshing a competitor's website, which this customer cannot edit. Technical audits and alerts were disabled but exposed internal environment-variable names. Differentiation displayed sparse diagnostics and an internal phase-refresh label.

**Change:** Replace citation certainty with evidence-backed source attribution or clearly labeled potential similarity. Use an appropriate interval for sparse binary samples and show insufficient evidence. Recommend actions on assets the customer controls. Hide disabled features from normal navigation or give an honest availability state. Move developer/export infrastructure into advanced settings.

**Acceptance:** No confidence claim exceeds what the evidence supports; every recommendation names an actionable destination and explains why it helps.

Evidence: `src/services/aeo/analytics/review-citation-matcher.ts`; `src/services/aeo/analytics/sampling-variance.ts`; live Competitive insights, Technical audits, Alerts, and Differentiation.

## Marketing and acquisition, page by page

| Page or family | Candid assessment | Improvement |
|---|---|---|
| Landing page | Attractive and coherent, but the headline is vague. Two large feature narratives repeat the same job. Unlabeled example percentages and the unsupported brand strip weaken trust. | Say what it does and for whom immediately. Keep one concise workflow, one labeled interactive demo, real proof, pricing, and FAQ. |
| Interactive homepage tour | One of the strongest parts: clearly fictional, safe to try, editable replies. | Keep it. Make sure surrounding mock metrics have the same explicit sample labels. |
| How it works | Useful overview, but the rating-based routing story carries the core policy problem. | Explain a neutral request → customer choice → reply → measure journey. Show actual screens. |
| Features hub | Internal pillar numbering and architecture language make the product sound assembled from a roadmap. Broad all-included promises conflict with gated or metered features. | Organize around customer jobs; publish a reliable availability/plan matrix. |
| Six feature pages | Several reuse the same large generic demo rather than explaining their specific feature. Competitor/local-SEO pages particularly need concrete evidence. | Give each page its own screenshot, example task, limitation, and clear result. |
| Pricing | Accessible starting price; allowances are visible. Composite owner proof and conflicting help/billing language are the main problems. | One canonical plan definition across website, checkout, help, and app. Show billing cadence, trial terms, overages and feature boundaries. Explain the crossed-out reference price. |
| Integrations | Some limitations are honestly described publicly, but dashboard readiness differs. | State separately: connect/import, sync, reply, and automate. Mark live, early access, unavailable, and third-party setup clearly. |
| Industries: eight English pages | Broad coverage, but generic structure and unsubstantiated business outcomes make them feel less tailored than their titles. | Use relevant triggers and real industry screenshots; substantiate revenue/customer estimates. Scope healthcare privacy claims carefully. |
| Spanish industry hub and eight pages | Translation reaches landing copy, while much of the navigation and subsequent journey is English. Content is thin and repetitive. | Localize the full conversion/support path, or explicitly describe language availability. Remove implied guaranteed rating outcomes. |
| Comparison hub and five pages | Acknowledging competitor strengths is good. Price and capability comparisons need dated evidence. | Add last-verified dates and primary source links; distinguish native capability from integrations and enterprise add-ons. |
| Case-study hub and five stories | Composite disclosures exist, but the case-study framing and precise invented outcomes still imitate customer proof. Some arithmetic and plan/location examples conflict. | Publish true customer stories or clearly titled workflow simulations. Keep all reuses consistently labeled. |
| About | Generic values provide little human accountability; ethical claims conflict with the capture flow. | Add real team/founder context, customer focus, and support ownership. Correct behavioral contradictions first. |
| Partners | Contains internal acquisition strategy: marketplace application plans, paid acquisition instructions, and tracking conventions. | Remove this internal playbook from public navigation/content. Replace with partner benefits, eligibility, real programmes and an application path. |
| Agencies | Potentially useful expansion, but implementation terms and broad branding promises distract from buyer tasks. | Show actual multi-client management, access boundaries, report examples, and currently available branding. |
| Enterprise | References an internal sales-deck filename and process details. | Use buyer-facing capabilities, delivery scope, security evidence, and a concrete contact path. |
| Demo | Scheduling and a fallback contact path are useful. The invitation should accurately signal a booked sales session. | Distinguish instant product tour from a scheduled demo. Explain duration and what will be covered. |
| Contact | Clear support channel and response expectation. | Preserve this clarity; link help context from the app's error states. |
| Blog: index and 17 articles | Useful breadth, but content promises must match the current product. Repeated gating narratives and exact growth claims need review. | Maintain a claim/source register; update feature instructions with releases. Favor first-hand examples over more generic articles. |
| Resources: hub and four guides | Good acquisition assets if they deliver practical value. | Let users preview useful content before capture. Keep templates editable, realistic, and aligned with the actual UI. |
| Free tools hub | A useful acquisition direction. | Deliver the result before optional email capture; be precise about calculation and generation methods. |
| Response generator | Source confirms fixed rules/templates. The tested negative response did not address the specific complaint. | Call it a template builder or make it genuinely text-aware. Give immediate copy/edit controls and a better example. |
| Review-link generator | Email capture adds friction to obtaining a simple utility result. | Immediately return a usable link/QR; make emailing it optional. |
| Reputation checker | A precise score can look authoritative even when some ingredients are estimated. | Show fetched versus estimated inputs, formula, data age, and limitations. No live business lookup result was validated in this pass. |
| Privacy, terms, security, retention | Necessary coverage exists. Some security copy reads like implementation notes; retention summaries need clearer record-type distinctions. | Explain practical controls and retention per data category. Keep certification/readiness distinctions honest. This was not a legal compliance audit. |
| Status | Working public page with separate web, background, and infrastructure components. | Keep it. Link incidents and relevant status from in-app failures; do not imply this audit independently verified uptime figures. |

## Help and documentation

The issue is reliability more than page count. A help centre that describes controls users cannot find increases support work.

- **Billing / usage limits:** Says email requests are unlimited, while live Starter billing has a 500-email allowance. Reset wording also mixes calendar-month and billing-date concepts. Correct this from one plan source.
- **Analytics / PDF reports:** Describes a PDF export workflow; the inspected Analytics UI offered CSV. Either expose the documented flow with appropriate plan access, or correct the article.
- **Campaigns, integrations, reviews, getting started:** Reconcile step names, automatic fallback promises, and available integrations with production. Add screenshots and a “what you should see next” result to each recipe.
- **Docs overview, quickstart, how it works:** Too much high-level description, too little runnable input/output. Start with creating a key, making a safe test, interpreting the response, and finding the resulting request.
- **Install / Use with AI, Review Graph, content types, sync:** These concepts are thin standalone pages. Merge them unless each solves a distinct developer task. Explain actual data fields, freshness, and recovery behavior.
- **API and cookbook:** Include response schemas, error examples, pagination, scopes, rate limits, retries, and duplicate-send prevention. Remove the instruction suggesting a hosted customer deploy a version that changes CSRF handling.
- **Plugins/widgets:** Show copyable, accessible embed examples with sizing and source requirements.
- **Changelog:** The inspected content mainly described an April documentation navigation update. Publish meaningful product changes and known availability limits.

All 11 docs URLs and the help URL inventory are listed in the coverage ledger. This audit did not send authenticated API requests to prove every documented contract.

## Signup and onboarding

The signed-in workspace provided the mature-account experience. Fresh signup and paid onboarding were source-reviewed, not completed as a new customer.

The source has a multi-step sequence for business setup, Google connection, category, subscription, and finish. Google connection can be skipped, which is useful, but the user then needs a persistent checklist explaining what remains unavailable and how to finish later. Avoid putting a large empty app in front of a user who has not reached their first value.

Recommended first-session goal: **connect the business → see real synced reviews → preview one reply → preview one request → understand the next charge.** Defer optional profile decoration and advanced AI setup. Preserve entered information after OAuth/payment cancellation; provide clear retry and resume paths. Verify these states in a dedicated test account before declaring onboarding release-ready.

Login, signup, forgot-password, and reset-password need consistent field labels, password-manager support, readable helper text, expired-link recovery, and a clear return route. Several relevant controls already have local edits; validate the deployed flows rather than duplicating that work.

## Authenticated product, page by page

| Area | Observation and user impact | Recommended change |
|---|---|---|
| Dashboard | Oversized AI narrative, QR presentation and NFC promotion precede much of the operating information. Urgent reviews can be very old. On mobile, the AI story consumes nearly the whole initial viewport. | Lead with current reply queue, delivery failures, sync health, and Request review. Put compact metrics next. Move QR/NFC to collection tools. Prioritize urgency with recency and status. |
| Dashboard metrics | Labels, scopes, and time windows are not consistently obvious. Animated counters initially show zero but settle correctly; those transient zeros were **not** treated as a data bug. | Stable accessible values; explicit date range, source, and denominator. Resolve mismatched comparison labels before interpreting growth. |
| Reviews | Real data and filters are useful. Large cards, 71 pages, and an all-reviews default make triage laborious. Internal AI-analysis action competes with everyday work. | Default to Needs reply, add prominent text/author search, compact list plus detail pane, and remove internal processing language. |
| AI replies / auto commenter | Helpful capability, but automation scope deserves clearer presentation. | Rename to Automatic replies. Preview examples, excluded ratings, publication destination, and current enabled scope. Validate the existing local enable-dialog work. |
| Private feedback | A separate count/tab exists, but the collection funnel prioritizes private handling based on sentiment. | Keep a service-recovery inbox with ownership and follow-up status; fix equal public-review access upstream. Individual private cases were not processed in this audit. |
| Review requests | Good place for outreach history, weakened by overstated conversion attribution. Send modal lacks a full message/sender/cost review. | Distinguish actual delivery events and Google visits. Preview content, active business, sender, channel, schedule, and quota impact before sending. |
| Campaigns list | Empty state implies the business has not received its first review, despite over 1,400 existing reviews. | Make copy state-specific: no campaigns yet. Offer a small safe setup checklist with a preview. |
| New campaign | Preview used Sunrise Café and a sample link instead of the active business. The inspected launch review lacked a clear recipient count/audience step. | Use the active business plus explicitly fictional customer data. Show audience, exclusions, deduplication, schedule/timezone, exact content and quota impact. Explain Create draft versus Queue sends. Local fixes are already underway. |
| Campaign detail | No campaign existed to inspect live; source exposes contacts, stats, funnel and send controls. | Validate a populated test campaign, partial failures, retries, duplicate prevention and cancellation before release. Do not mark delivery proven by this audit. |
| Customers | Search/filter structure is useful. Likely internal/test contacts and same-name split records can distort metrics. One row showed a sent request but Last Sent as Never. | Add explicit test-contact tagging and KPI/campaign exclusion. Reconcile date/status definitions. Surface the existing merge action and provide safe duplicate suggestions. Do not auto-delete based on names. |
| Customer detail | Clear identity, summary, tags and chronological request event; a stronger, simpler page than many dashboards. | Keep this pattern. Make opt-out/consent and verified versus inferred outcomes equally clear. |
| CSV import | Entry step does not sufficiently explain format before choosing a file. | Provide downloadable template, accepted fields, size limit, example rows, deduplication policy and validation preview. Validate existing local mapping improvements. |
| Businesses / add business | Active context and plan gate are reasonably clear. | Keep account-versus-location context visible in consequential actions and explain location charges before checkout. |
| Competitors | Valuable adjacency to the core product, but comparisons need an obvious time/source basis. | Prioritize a small set of relevant local competitors and changes worth acting on; explain sampling and update age. |
| Analytics | Useful metrics/export direction, but conversion cannot currently establish published reviews. Help promises a PDF workflow not found in the UI. | Correct metric semantics first. Put one takeaway beside each chart. Align export capabilities and date/source definitions across pages. |
| Google Q&A | The listing-specific unavailable state explains the limitation and offers a return path. | Keep this honest gating pattern and apply it to disabled AEO features. |
| Settings shell | Expanded sidebar plus horizontal settings navigation duplicates choices; horizontal items clip at common desktop widths. | One responsive settings navigation, grouped by account and active business. Give each screen a clear page heading. |
| General | Settings and account controls are present, but edit ownership and section-save boundaries need clarity. | Group independent saves, explain support-only account changes, and clearly summarize consequences of account deletion. Deletion was not exercised. |
| Business information | The inspected business timezone was UTC despite a US local business. Description text included irrelevant cuisine/search phrases. | Prompt for the business's local timezone. Keep descriptions accurate and useful; do not encourage irrelevant keyword stuffing. Separate Google-published fields from internal preferences. |
| Public profile | Live preview is useful. Rating threshold is the central policy defect. Displayed collection-domain guidance differs from the live collectratings URL. | Neutralize rating routing, standardize the canonical share URL, preserve business branding, and simplify preview controls. |
| Notifications | SMS appeared enabled with no notification phone set. Quiet-hour timezone was not sufficiently obvious. | Validate usable delivery details, expose timezone, and distinguish staff alerts from customer-campaign quiet hours. |
| Competitor alerts | Another settings destination competing with the main competitor workflow. | Link directly from competitors; explain alert thresholds, delivery destination and business scope together. |
| Team | Roles, member limit and activity context are useful. | Keep the permissions matrix, show invitation states clearly, and verify restricted roles separately. No invitations/role changes were made. |
| Billing | Helpful channel quotas, but an AI usage meter sits beside unlimited-reply language. No equally prominent next-charge/reset summary was seen. | Name each billable AI operation precisely. Show next billing date, amount, reset date, included usage and enabled overage policy. |
| Integrations | Google has real connected data. Facebook App Review and Clover sandbox/phase language expose unfinished readiness. Yelp response wording differs from public limitations. | Hide engineering status, use customer-readable availability labels, and prevent unsupported actions. Explain sync freshness and recovery. |
| Zapier / API setup | More practical than the docs: clear trigger, authenticated webhook and example body. | Add a safe test mode/destination, duplicate-send handling and delivery diagnostics. Label generic third-party logos as compatible via Zapier rather than verified customer usage unless substantiated. |

## Google SEO/AEO: keep the useful part, reduce the rest

| Screen | Finding | Action |
|---|---|---|
| Overview | Scored checks with direct fixes are useful; visibility sample counts and caveats are a good start. Description text included irrelevant restaurant categories. | Keep explicit checks; clarify what the score measures. Prioritize accurate hours, category, services, description and links. Google asks for relevant, useful business descriptions. [Google Business Profile guidelines](https://support.google.com/business/answer/3038177?hl=en). |
| Prompt library | A projected monthly cost of $75.83 appeared against a $5 allowance in a $29.99 Starter workspace. Overage was disabled, so this was **not an observed charge**. | Explain projection assumptions, current cap, what runs within budget, and expected sample cadence before adding prompts. Remove scheduler implementation notes. |
| Prompt detail | Source includes trend, most recent engine answers and a content brief. It correctly distinguishes gaps from measured zeros. Not exercised live in this pass. | Preserve evidence visibility. Link every interpretation to answer/date/source and customer-controlled next actions. |
| Geo grid | Average rank 1.9 applied to only 9 of 25 cells where the business was found. | Display 36% coverage alongside rank; show not-found cells, radius, timestamp and conditional-average definition prominently. |
| Technical audit | Disabled state exposed an environment variable while retaining old findings. | Hide unavailable feature or explain availability plainly; date old findings and show what a customer can do now. |
| Alerts | Disabled state exposed another environment variable; a quiet page can be mistaken for monitoring working successfully. | Separate Monitoring off from No issues found. |
| Competitive insights | Weak citation matches, unjustified statistical precision, raw redirect URLs, and recommendations to edit competitor sites. | Fix evidence semantics and actionable scope before promoting this as a reason to purchase. |
| Differentiation | Sparse records, infrastructure fields, and phase labels look like an internal admin console. | Move behind an advanced/agency entry point or hide until it delivers a specific usable outcome. |

## Customer collection and public widgets

The live collection page fits a phone and has recognizable business branding. The initial card repeats the business name and has substantial whitespace, but it is understandable. Keep the initial decision simple and make the next step predictable. Positive and negative routes must receive equal care and access; do not frame an AI-generated paragraph as the customer's own testimony without active review and editing.

For widgets, fix invented text immediately. Then prioritize reading: static cards or user-controlled movement, pause controls, source links, accessible rating labels, sensible truncation, and a way to read the complete original. A moving wall of testimonials is less useful than a small number of authentic, readable reviews. Some marquee/card improvements already exist locally; their deployment was not verified.

## What to remove, label, and keep

**Remove from production-facing content:** invented widget sentences; unsupported customer-brand endorsements; composite quotes presented as real proof; internal partner acquisition plans; environment variable and phase labels; recommendations to edit someone else's website; unsupported certainty and confirmed-review labels.

**Keep only with clear context:** fictional tour workspaces, sample customers, demonstration metrics, template-generated responses, estimated costs, sparse AI samples, beta integrations, and composite workflow examples. The label must travel with the content wherever it is reused.

**Investigate before deleting:** apparent employee/test contacts, duplicate contacts, old requests, and historical reviews. Identity resemblance does not establish that a record is disposable. Tag and exclude confirmed test data before any later authorized cleanup.

**Keep and improve:** the visual identity, safe interactive tour, real Google review inventory, customer timeline, branded collection preview, role information, explicit usage meters, direct SEO checks, and public status page.

## Recommended order of work

1. **Trust and truthfulness:** widget fallback, equal review paths, conversion semantics, social proof, misleading AI evidence. Done means all affected surfaces tell the same defensible story.
2. **First useful session:** connect Google, see reviews, preview a reply/request, understand plan and next charge. Verify with a fresh test workspace and failed/cancelled setup states.
3. **Daily operation:** compact dashboard, needs-reply inbox, reliable campaign audience/preview, contact deduplication, clear delivery outcomes. Verify using a small isolated end-to-end test campaign.
4. **Product consistency:** one capability/plan matrix, matching help instructions, correct integration availability, timezone and domain consistency, mobile and keyboard checks.
5. **Growth after evidence:** replace composites with permissioned customer stories; tighten industry pages; publish dated comparisons; expand AI visibility only after its recommendations and measurements are credible.

Measure activation by successful connection plus a completed useful task, not page views. Measure ongoing value through verified delivery, real response coverage, independently supported review attribution, task completion time, and support requests caused by product confusion. Track mobile completion separately.

The next improvement should make a business owner trust the numbers and finish the core job with less effort. More pages and more AI cards will not compensate for that foundation.

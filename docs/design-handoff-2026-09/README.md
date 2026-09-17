# Zyene Reviews: interior-page design implementation brief

Prepared 13 September 2026. Status: **planning handoff, not an approved visual comp or completed redesign**.

## The decision

Do not buy or generate a photograph for every page. Invest first in six accurate feature demonstrations, discoverable help, usable tools, and clear buying information. Use existing industry photography where it tells the right story. Generate only the missing editorial assets specified in ASSETS.md. Real company/customer photography must come from the owner, never an image generator.

A visitor should understand the page's subject, see credible evidence, and find the next action. Empty space is acceptable when it improves those three things. Decoration is not a completion criterion.

## Scope and evidence

This handoff covers every route template in `src/app/(marketing)/`, including the actual dynamic content listed in `content-inventory.json`, and the public `/docs` routes. The marketing group currently has 37 `page.tsx` route templates. Three receive preservation-only treatment: `/`, `/growth`, and `/newsletter/unsubscribe`. Canonical dynamic content includes 6 features, 8 industries, 8 Spanish industries, 17 posts, 4 resources, 6 help categories, 23 help articles, 5 comparisons, and 5 illustrative case studies. The route ledger resolves individual URLs and assigns task IDs.

The homepage is explicitly excluded from redesign. Auth, onboarding, authenticated dashboards, review capture, and widgets are also excluded from this marketing brief. They are inventoried in `protected-routes.csv` so “all pages” cannot accidentally become authorization to redesign customer workflows. Use dashboard code only as a visual/behavioral reference for fictional product demos. Preserve the original customer portal colors and structure.

Evidence comes from the current working tree, not an assumption that production matches it:

- All marketing route definitions and their entry components/catalogs were inventoried in source.
- `browser-audit.json` records local browser route status, headings, image references and overflow at 1440 and 390 CSS pixels. It is not a backend test or a Core Web Vitals field measurement. Image `loaded` flags are instantaneous observations, not a conclusive broken-image test for lazy images.
- `evidence/` contains selected desktop/mobile screenshots. Human visual review is representative; a successful automated route load does not mean every state was visually reviewed.
- `content-inventory.json` is generated from actual exported catalogs, not copied from comments. Some source comments contain stale item counts.
- Existing uncommitted hero changes are part of the baseline. Do not reset them indiscriminately. Read the current diff before implementing any task.

Coverage is explicit: 118 public design URLs, 32 legacy aliases, and 43 protected route templates. The local browser crawl completed 50 URLs; 20 timed out and 48 were not reached. Source inventory covers the full planned scope, while complete browser acceptance remains future work. See [AUDIT_FINDINGS.md](AUDIT_FINDINGS.md) for limitations and priorities.

## Read order

1. Repository `AGENTS.md` and `PRODUCT.md`.
2. This brief, then [DESIGN_SPEC.md](DESIGN_SPEC.md): exact dimensions and architectural decisions.
3. [PAGE_PLAN.md](PAGE_PLAN.md): purpose, content order and visual per route family.
4. [ASSETS.md](ASSETS.md): create/reuse decisions, dimensions, prompts and asset acceptance.
5. [TASKS.md](TASKS.md): small, independently reviewable implementation packets.
6. [VALIDATION.md](VALIDATION.md): completion criteria and checks.
7. `route-ledger.csv`: each URL, source template, assigned task and treatment.

For a visual overview, open [wireframes.html](wireframes.html): six responsive composition sketches for Help, product, pricing, industry, reading and booking pages. They are layout diagrams, not approved final UI. [AUDIT_FINDINGS.md](AUDIT_FINDINGS.md) separates observed problems from proposed changes.

The dimensional values are proposed design decisions, not claims that the current website already meets them. Keep them stable during implementation; do not let each model invent a new scale.

## Priority order

| Wave | Work | Why first |
|---|---|---|
| 0 | M00 baseline and M01 scoped foundations | Prevent shared CSS changes from harming unrelated pages |
| 1 | M02 demo frame, M03–M08 six feature scenes, M09 feature overview | Demonstrate what people are buying |
| 2 | M10 workflow, M11 pricing, M12 Help, M13 help articles | Answer purchase/setup questions and reduce friction |
| 3 | M14 blog, M15 resources, M16–M18 free tools | Make research and self-service pages useful |
| 4 | M19–M20 industries/localization, M21 integrations, M22 comparisons | Make relevance and limitations clear |
| 5 | M23 workflows, M24 company pages, M25 contact/demo, M26 trust, M27 docs | Complete evidence, conversion and reading experiences |
| 6 | M28 site-wide acceptance | Verify the assembled site, not just isolated parts |

Keep the dependency order in TASKS.md. Parallel implementation is optional after foundations stabilize; models touching the same source file must run sequentially.

## Fixed constraints for every implementing model

- Preserve exact orange `#ff4f00`, existing logo, and the existing Inter marketing font. Do not import a new font or globally recolor the app. Use the marketing tokens, not stale dashboard values from older design notes.
- Do not edit the homepage, customer portal, dashboard shells, authentication, billing catalog/prices, database, external submissions, or backend business logic as part of a visual task.
- Do not ship generic desk photography as evidence of product capabilities. Do not fabricate screenshots, customers, testimonials, support response times, certifications or competitor claims.
- Keep current canonical URLs, aliases/redirects, metadata, JSON-LD, localization and tracking behavior.
- Match the real auto-reply scope: new, unanswered Google reviews at the selected business, configured rating threshold, Professional/Friendly/Concise tone, automatic publishing explicitly enabled. Facebook/Yelp synchronization does not imply publishing support.
- Use fair review requests. Do not depict only happy customers being sent to Google or a guarantee of first place in Google/AI answers.
- Every visible control works, or is clearly identified as an example. Marketing scenes use fictional local data and do not call live AI, send messages, publish reviews, or connect accounts.
- Existing real free tools and forms retain their actual endpoints. Test writes with intercepted/local fixtures; do not replace real tools with fake success states.
- No push/deployment is part of these implementation packets. Return reviewable local changes and evidence.

## How to delegate

Copy the launcher from TASKS.md and choose exactly one packet ID. Provide the model access to this folder and the repository. If it cannot read files, paste the packet plus the relevant DESIGN_SPEC, ASSETS and VALIDATION sections. A packet is complete only when its stated behavior, visual evidence and checks are delivered; a list of intentions is not completion.

Use the first completed Help or feature page as a visual review checkpoint before replicating templates. This is a review of concrete output, not a request for each model to ask open-ended design questions. A model may finish independent work while an owner-provided photo is unavailable.

## What success looks like

A buyer can distinguish monitoring from AI replies, understand the real plan limits, and book a demo without hunting. A current customer can find a relevant setup guide or use a free tool immediately. Industry visuals are relevant, articles are readable, and every page looks related without sharing the same photograph or oversized hero.

## Reproducing the inventory

`python3 docs/design-handoff-2026-09/build-ledgers.py` rebuilds CSV coverage from the route files and saved catalog/browser inventory. To retry browser gaps after the preview is stable, use `node docs/design-handoff-2026-09/audit-public-pages.mjs --resume`; it stops after three consecutive navigation errors. Set `AUDIT_BASE_URL` to a known preview origin if needed. The crawler does not submit forms. Run without `--resume` for a fresh baseline; do not mix environments in one accepted run. Saved narrative counts describe this dated snapshot and must be updated after a new audit.

Handoff artifact checks are recorded in `handoff-validation.json`. No application source was edited in this planning pass.

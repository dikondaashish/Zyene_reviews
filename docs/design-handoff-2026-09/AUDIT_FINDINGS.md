# Current-state findings and evidence limits

Snapshot: 13 September 2026, local working tree, including the preceding uncommitted hero iteration. These findings describe presentation and buyer tasks; they are not a security audit, full product capability verification, or a production availability report.

## Coverage

- Source census: 88 exact `page.tsx` files, including 37 marketing templates and 11 docs pages. Files named `phase2-page.tsx`/`phase3-page.tsx` are implementation components, not additional route definitions.
- Design coverage: 118 resolved public URLs, plus 32 legacy aliases. Each has an assignment in route-ledger.csv. Catalog counts and exact titles/assets are in content-inventory.json.
- Protected scope: 43 route templates, including home, internal growth, unsubscribe, auth, onboarding, dashboard, review capture and widgets. Dashboard was referenced for accurate product representations; it was not exhaustively visually audited in this interior-marketing planning pass.
- Browser coverage: 70 URLs attempted locally; 50 completed with HTTP 200, one H1 and no detected document overflow at 1440 and 390. Twenty navigations timed out. Forty-eight design URLs were not reached. Legacy redirects were inventoried in source, not all exercised in the browser.
- Screenshots: 22 first-viewport captures across 11 selected routes, desktop/mobile. They are baseline evidence, not final designs or proof of every interaction state. Automated collection is not equivalent to human inspection of each screenshot.
- The development server was consuming sustained CPU and navigations repeatedly exceeded 30 seconds. The crawl was stopped to avoid continuing ineffective requests. This does not establish that production pages are broken. A stable-preview retry is assigned to M00/M28.

## Decisions grounded in the current site

| Priority | Current observation / source | User consequence | Design response |
|---|---|---|---|
| P1 | `interior-hero-scene.tsx` supplies generic scenes; browser saw this on blog, comparisons, contact, demo, resources, security and other pages | Visually filled space does not explain the page or help the next action | Explicit layout/media choice per intent; M01 and route packets |
| P1 | Four feature pillars already use ProductTour; competitor/local SEO use photographs in `feature-visual-data.ts` | Several different capabilities look like the same workspace, while two lack product evidence | Six focused, accurate interactive scenes; M02–M09 |
| P1 | Help hub has useful shortcuts but no search | A customer must browse categories to find a specific task | Local title/excerpt search and compact task-first hero; M12 |
| P1 | Contact/demo page composition places general hero content before the actual form/calendar | Visitor must scroll to perform the action they came for | First-section form or booking calendar; M25 |
| P1 | Pricing screenshot gives largest emphasis to daily equivalent and includes desk imagery | Actual billing comparison takes more effort | Monthly/annual charge first, compact intro, retain authoritative prices; M11 |
| P1 | Shared marketing H1 styles dominate several local utilities; observed desktop sizes 60/61.92/76px across sampled pages | Utility and reading headers inherit marketing-scale treatment | Explicit scoped type variants; M01/M26 |
| P1 | Existing small white-on-orange labels and small orange text have contrast concerns | Some labels are harder to read while preserving the desired brand color | Keep #ff4f00; use specified large bold filled-CTA text or dark underlined small links; header debt recorded separately |
| P2 | Blog already has 17 topic-specific cover assets and a featured-post component | More generic hero photography duplicates available editorial material | Bring useful featured content forward; reuse covers; M14 |
| P2 | Resource cover mapping uses unrelated cafe service imagery for request templates | Cover does not communicate a template library | One targeted editorial asset E01; usable copyable templates; M15 |
| P2 | Industry detail template repeats its photo lower down | Repetition adds length without answering another question | Replace second photo with sector-specific request/reply example; M19 |
| P2 | Spanish pages can inherit English generic-scene captions | Incomplete localization weakens consistency | Explicit localized config and text expansion checks; M20 |
| P2 | Case-study data explicitly labels composite/illustrative scenarios | Removing qualifiers would misrepresent fictional outcomes as customer proof | Preserve prominent disclaimers and historical slugs; M23 |
| P2 | Agency roadmap, integration status and security text contain material qualifiers | A visual redesign could accidentally imply unavailable features or certifications | Preserve source-backed live/roadmap/early-access distinctions; M21/M24/M26 |
| P2 | Privacy/terms render “Last Updated” from the current date | Date can imply a substantive revision occurred today | Record owner/legal date dependency; do not invent a date in a design packet |

P1/P2 are implementation priorities for this brief, not production incident severities.

## What the browser crawl did not verify

It did not submit forms, book calls, sync accounts, publish reviews, validate all link destinations, test every keyboard state, inspect production Search Console, measure field Core Web Vitals, or certify WCAG compliance. Image `loaded` is an instantaneous flag: lazy images may not have loaded yet. The `src` field alone does not prove the actual selected responsive image transfer size.

Inspect browser-audit.json for exact timeout paths. The CSV explicitly labels loaded, timeout/incomplete and not-attempted observations; none are silently promoted to full acceptance. M00/M28 must resolve this coverage gap on a stable preview before declaring the implemented site fully verified.

## Scope clarification

This brief follows the latest request about improving every interior public page and preparing work for smaller models. It deliberately does not reopen earlier dashboard redesign, SEO deployment or Search Console tasks. The homepage remains unchanged as requested. Proposed layouts, images and tasks are future work, not changes shipped by this document.

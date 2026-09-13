# Acceptance and verification

This is the implementation acceptance contract. The current design audit is not evidence that these future criteria already pass.

## Every packet must deliver

- Changed files and a short account of the user-visible behavior.
- The source of product claims, prices or statuses touched; preserve qualifiers.
- Desktop 1440×900 and mobile 390×844 before/after screenshots of its actual route. Capture meaningful interaction states, not only an empty hero.
- Check results, remaining limitations and any owner-supplied asset dependencies. Never mark a pending screenshot or untested interaction as passed.
- No unrelated changes to protected routes. Inspect the diff against the baseline, not only HEAD when earlier work is uncommitted.

## Visual and accessibility matrix

| Check | Acceptance |
|---|---|
| Widths | 320, 390, 768, 1024, 1440 CSS px; no document horizontal overflow |
| Zoom/reflow | 200% text/zoom remains usable; inspect 320px reflow; headings/actions wrap rather than clip |
| Hierarchy | Exactly one H1; meaningful H2/H3 sequence; visible H1 matches selected variant scale |
| Mobile priority | Task, primary action/search/form precede decoration; no tiny scaled desktop demo |
| Keyboard | Every control reachable, visible focus, logical order; tabs support arrow/Home/End; dialogs restore focus |
| Contrast | Normal text >=4.5:1, large text >=3:1; verify actual surfaces; keep #ff4f00 and use the specified type/surface treatment |
| Targets | Product design target >=44×44 for standalone controls; links have adequate spacing |
| Motion | Reduced motion removes entrances/transforms and finishes demo typing immediately |
| Feedback | Busy, empty, error, complete and reset states are truthful and accessible; status announcement once, not per character |
| Media | Accurate alt, reserved dimensions, no cropped subject/illegible screenshot, no duplicate eager images |
| Tables/code | Local scroll area with cue when needed; page itself does not overflow |
| Translation | Spanish routes include Spanish controls, captions, errors and samples; no fixed-height clipping |

Standards references: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Our 44px control target is stricter than the AA criterion's 24px minimum and exceptions.

## Behavioral checks by family

| Family | Required scenario |
|---|---|
| Monitoring | Select another review; combine filters; show zero matches; clear filters; reset |
| AI replies | Change tone; generate; edit; regenerate intentionally; publish in demo; reset during typing; toggle automatic reply off while pending |
| Auto reply scope | Only matching new unanswered sample Google review is eligible; nonmatching rating and other platform are excluded; status explains why |
| Requests | Choose SMS/email; edit message; preview; sample send; reset; network confirms no real send |
| Analytics/competitors | Change range/metric; visible totals match fixture; equivalent information on touch and keyboard |
| Help | Empty query, mixed case, surrounding spaces, match, no match, clear, correct canonical destination |
| Blog/resources | Search/category results correct, empty state, real article links, copy text success and failure, gated delivery preserved |
| Pricing | Monthly/yearly switching, current charges and limits from catalog, correct signup URLs; no client price calculation drift |
| Tools | Intercepted success/error/empty results; malformed input; preserve edits; copy/download uses real returned output |
| Contact/demo | Validation and intercepted responses; do not send real lead/booking; embed fallback works; dialog close/Escape/focus restored |
| Integrations | Status filters show correct items; unavailable connectors never look enabled; source links work |
| Reading/docs | TOC links reach correct headings; code copy exact; all legacy redirects and canonical destinations preserved |

Do not create shallow tests that merely assert a hardcoded class. For new Help search and demo state transitions, test actual behavior. Use existing Vitest/Playwright setup. Avoid live writes, paid AI calls or production review publishing in all tests.

## Repository checks

Read AGENTS.md again when implementing; it takes precedence if commands change.

1. Run `pnpm verify:fast` after code changes, plus the relevant existing/unit tests for changed behavior.
2. Component/hook structure changes: use the repo's react-doctor instructions. Marketing changes: run the relevant SEO skill audit before committing.
3. Route/config/env/middleware/API contract changes require `pnpm build`. New marketing URL requires full tests for sitemap coverage. These packets should normally preserve URLs/contracts.
4. Final release/full-check request: `pnpm verify && pnpm build`. Do not run a production build after every small visual edit.
5. If a check fails, investigate and fix the change-caused failure; report any independently reproduced baseline failure with evidence, never silently label it passed.

The planning handoff itself adds only documentation and a read-only audit script. It does not require application compilation or implementation test claims.

## SEO and page coverage

For every URL in route-ledger.csv: record final URL/status, single H1, title/description, canonical, image alt and document overflow. For aliases record the expected destination rather than demanding an independent page/H1. Verify metadata/OG/Twitter/JSON-LD stay intact; no new `noindex`, no accidental removal from sitemap. Do not rename slugs as part of design cleanup.

All dynamic entries are listed in content-inventory.json. Review every rendered title/crop on industry/blog cards; template sampling alone is insufficient for long-title and missing-asset failures. At least one representative interaction route per layout family receives full keyboard/mobile review; every feature scene receives interaction testing.

Regression-check `/` including its product tour and header booking overlay after shared component work. Dashboard/customer portal colors remain unchanged; compare source/diff and local safe fixtures if a shared dependency was touched. Do not log into or mutate a live business solely to satisfy screenshot coverage.

## Performance

Use a repeatable local production/preview build for comparative lab measurements, not a Next.js development server compilation delay. Record device/network preset and median of three runs for representative `/features/ai-replies`, `/help`, `/pricing`, `/blog`, one article, one industry and `/demo`.

Target real-user Core Web Vitals at the 75th percentile: LCP <=2.5s, INP <=200ms, CLS <=0.1. These are field targets, not a score this plan measured. Lab tests help diagnose; they cannot certify field INP. Reference: [web.dev Core Web Vitals](https://web.dev/articles/vitals).

Reject avoidable regressions: full article bodies shipped for Help search, all feature scenes mounted/eagerly loaded on every route, new animation libraries for fades, full-resolution card images, duplicated calendar embeds, layout shifts from unreserved media. Record route JS/image transfer before and after; investigate any >10% increase rather than treating it as automatically justified. Prefer HTML/server components and existing demo leaves.

## Completion record

For M28 create `implementation-results.md` with columns: URL, packet, desktop, mobile, behavior, SEO, accessibility, notes. Values are Passed / Failed / Not applicable / Pending with evidence, never blank. Attach failing steps and owner dependencies. A route timeout in a development crawl is an incomplete observation, not proof that the deployed URL is broken.

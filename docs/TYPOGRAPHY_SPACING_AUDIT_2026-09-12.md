# Typography and spacing audit — 2026-09-12

## What was inconsistent

- Dashboard page titles used five competing scales: 20 px, 24 px, 30 px, 32 px, and responsive combinations of those values.
- The dashboard shell used 12 px, 16 px, and 24 px outer padding depending on the breakpoint, while individual routes added a second padding layer.
- Supporting copy mixed 11.5 px, 12 px, 13 px, and 14 px without a shared semantic rhythm.
- Several dashboard routes used a large `h2` as their page title, which made hierarchy and keyboard/reader navigation inconsistent.
- Marketing pages intentionally use a separate editorial scale, but that distinction was not documented beside the product scale.

## Shared rules now in place

The `data-dashboard-shell` root establishes the product rhythm in `src/app/globals.css`:

| Role | Size | Leading | Use |
|---|---:|---:|---|
| Dashboard page title | 24 px | 1.2 | Every dashboard `h1` |
| Body copy | 14 px | 1.5 | Default dashboard paragraphs and list copy |
| Metadata | 12 px | 1.4 | Footer, timestamps, and explicit metadata hooks |
| Dashboard gutter | 16 / 20 / 24 px | — | Base / small / large breakpoints |

The shell also uses a 16 px base section gap and 20 px from the small breakpoint upward. Existing explicit microcopy classes remain available for badges, chart labels, and dense table cells.

New surfaces can opt into the same contract with `.ui-page-title`, `.ui-section-title`, `.ui-body-copy`, and `.ui-meta` from `src/app/globals.css`.

Primary dashboard route titles that were previously `h2` elements now use `h1`, including Competitor Monitoring, Google SEO/AEO utility pages, technical audit, alerts, prompt library, customer import, and route error states.

## Product-language guidance

- Name the user outcome first: “Request reviews”, “Reply to reviews”, and “View performance”.
- Use sentence case for headings, buttons, tabs, and helper text.
- Keep one term for each workflow: “review request”, “reply”, “sent”, “queued”, and “failed”.
- Keep descriptions to one or two short sentences. Put the next action in the button label instead of repeating it in helper copy.

## Scope decisions

Marketing hero headings, article titles, and campaign storytelling keep their responsive editorial sizes so the landing pages retain their visual hierarchy. The product shell is where users scan frequently, so it favors a stable 24/14/12 scale and predictable gutters.

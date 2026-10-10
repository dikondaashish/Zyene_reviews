# Review widget builder

Open **Settings → Integrations → Website Elements → Open widget builder**.

Choose one of 20 templates, then adjust the layout, theme, colors, review filters,
header, reviewer details, and typography. Use the desktop/mobile preview buttons
to check the result with the business's actual public reviews.

## Installation

Select **Add to website**, copy the installation code, and paste it into the
website's Custom HTML block. The script creates an isolated iframe, adjusts its
height, and supports floating badges at the bottom left or right. Each embed
has its own configuration, so a business can install multiple different designs.

The iframe alternative works where custom scripts are blocked. It has a fixed
height, allows scrolling, and does not float. Existing `/w/[slug]` and
`/w/[slug]?type=badge` embeds continue working.

**Save widget draft** saves the current design in that browser for that business.
This is a local draft, not an account-wide saved widget. Changing an installed
design requires replacing its embed code. Newly synced reviews appear on the
next page load without replacing the code.

## Review data

- Only visible reviews for the requested active business are loaded.
- Public-widget subscription eligibility is checked on the server.
- Filters and sorting operate on up to the latest 100 synced visible reviews.
- Aggregate ratings/counts represent the real source totals, not the filtered cards.
- Photos appear when they were included in the synced review data.
- AI summary templates display a cached aggregate of visible written reviews for
  this business. In the builder's **AI Features** controls, an authorized editor
  can choose **Generate review summary** after at least five written reviews are
  available. Generation checks plan eligibility, editing permission, rate and
  daily spend limits, and prevents concurrent generation for the same input.
- Public widgets only read cached summaries; viewing a widget never generates a
  summary or starts a model call. Changes to the summary's source review set,
  text or ratings invalidate the matching cache; regenerate to publish a summary
  for the updated input. Permission and reviews are rechecked before publication.
- Owner replies appear only after their response status is `responded`.
- Branding visibility remains a server-controlled business setting.

## Movement and accessibility

Autoplay is off by default and optional for carousel layouts. When enabled, it
pauses while the widget is hovered or focused, when the page is hidden, or when
the pause control is used. Reduced-motion preferences disable autoplay. Manual
navigation remains available without requiring motion to read the reviews.

See [the widget implementation reference](widget-reference-analysis-2026-09-30.md)
for template behavior, summary boundaries and dated browser evidence. Its
competitor measurements are historical research, not current vendor guarantees.

## Deployment and verification

No database migration or third-party widget account is needed. Deploy the app
and `public/widget-embed.js` together through the existing GitHub/Vercel flow.
Embeds use the canonical public `www` host so iframe resize origin checks match
the loaded page. The embed listener verifies both the sender origin and iframe
window before accepting bounded height updates.

Focused tests cover configuration validation, URL encoding, all template
round trips, public review scoping, display filters, legacy embeds, plan access,
embed message isolation, summary authorization, cache reuse and publication checks.
Model calls were mocked in summary tests; a live paid generation remains open as
WIDGET-1 in the [documentation follow-up tracker](DOCUMENTATION_FOLLOW_UP_2026-10-10.md).

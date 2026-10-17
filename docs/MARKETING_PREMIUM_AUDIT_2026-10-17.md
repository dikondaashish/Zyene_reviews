# Marketing site premium audit · 2026-10-17

Question from the owner: *"Why doesn't our website feel premium, like a Y Combinator company's site?"*

Method: walked the live dev build at 1440px (home, pricing, features, an industry page), read the
homepage component tree, and checked against the repo's own design rules (`PRODUCT.md`,
`docs/DESIGN.md`) plus the `design-taste-frontend`, `impeccable` and `emil-design-eng` skills.

## The short answer

The colors are not the problem. The site feels "made by a template" because it **says too much,
in too many styles, at once**. YC-grade sites (Linear, Ramp, Attio, Mercury, Resend) feel
expensive because of restraint: one idea per screen, one accent used sparingly, one type voice,
real product UI, and nothing that looks like decoration for its own sake.

## What's making it feel cheap (ranked by impact)

| # | Issue | Where | Why it hurts |
|---|-------|-------|--------------|
| 1 | **Busy hero collage**: laptop + phone + mug + plant + avatars + 3 handwritten scribble notes + floating stat cards | `marketing-home-hero`, `home-product-scene`, `home-scene-*` | Reads as a Canva mockup. Premium heroes show one crisp product view. |
| 2 | **Hero says too much**: 4-line H1 in two colors, 32-word paragraph, 3 check bullets *and* a fine-print line | `home-hero-content.tsx` | Nothing is the focal point. YC heroes: ~6-word headline, ≤20-word subtext, 2 buttons. |
| 3 | **Orange everywhere**: headline, eyebrows, nav link, icons, chips, borders, check marks | site-wide | When everything is the accent, nothing is. Orange should mean "act here". |
| 4 | **Repeated and duplicated sections**: "A reputation routine that keeps working" and "A review routine that keeps working" on the same page; 12 sections total | homepage | Feels padded and unedited. |
| 5 | **Template grid**: 8 identical icon + title + chips cards | `marketing-home-workspace` | Classic AI/template tell ("identical card grids"). |
| 6 | **Theme flip mid-page**: a dark bento with fake metrics, progress bars and "+28%" | `marketing-home-feature-constellation` | Breaks the page's single theme; fake precise numbers erode trust. |
| 7 | **Generic type voice**: Inter 600 at the default scale | `marketing.css` | Inter is the most common SaaS default. Typography is the biggest premium lever. |
| 8 | **Floating pill nav with heavy shadow** + orange "Book an appointment" link competing with the orange CTA | `marketing-header.css` | Two orange actions in the nav; the shadow makes it look like a widget. |
| 9 | **AI-scaffold micro-labels**: `01 / 03`, `01 / INVITE FEEDBACK`, "Scroll to explore", tiny uppercase eyebrows above every heading | tour, workflow | Section-numbering and scroll cues are well-known AI tells. |
| 10 | **Text-only "logos"**: Google, Facebook, Yelp typed as words | `marketing-home-trust-strip` | Weakest possible social proof. Real marks look established. |
| 11 | **Em dashes in body copy** | workflow, several pages | The #1 "written by AI" tell in 2026. |
| 12 | **Link-farm block** of 9+ bordered cards on the homepage | `popular-resources-block` | Useful for SEO, but the presentation looks like a directory. |
| 13 | **Timed popup** opens 12s after landing in production | `use-home-lead-wizard-timing.ts` | `docs/DESIGN.md` itself says "No timed marketing interruptions." Premium sites never interrupt. **Needs owner decision.** |

What is already good and should stay: the warm OptiMonk-matched palette, real interactive product
demos built from app components, honest copy (no fake testimonials or logos), solid FAQ +
JSON-LD, good photography in `public/marketing/home`, and strong SEO plumbing.

## Fix plan

### Phase 1 (this change): system + homepage

1. **Type**: Geist (sans) for the marketing site, tight display tracking, a calmer scale. Dashboard stays Inter.
2. **Accent discipline**: orange only on primary buttons and a few focal points. Eyebrows, icons, nav links go neutral.
3. **Header**: full-width bar, transparent at top, hairline + blur when scrolled. One orange action. "Book an appointment" becomes a quiet "Book a demo".
4. **Homepage, rebuilt into 8 distinct sections:**
   1. Hero: short headline (SEO keyword kept inside the H1 as a kicker), ≤20-word subtext, 2 CTAs, one line of trial terms.
   2. Product: the real interactive product tour in a browser frame over café photography.
   3. Platforms: real Google / Facebook / Yelp marks (logo fetcher), muted.
   4. How it works: Ask → Collect → Reply, each with a real UI fragment.
   5. Feature bento: 5 asymmetric cells (auto-replies, requests, QR/NFC stands photo, insights, AI search visibility), light theme.
   6. Industries: photographic scroll-snap gallery.
   7. Pricing teaser (daily price stays dominant, per `PRODUCT.md`), FAQ (kept, feeds FAQ JSON-LD), compact guides list (internal links kept for SEO).
   8. Closing: one committed orange CTA band.
5. **Copy**: no em dashes, no section numbers, no scroll cues, no duplicate headings.

### Phase 2 (follow-ups)

- Feature pages (`/features/*`): same hero rules, swap icon-card grids for bento/zig-zag, neutral eyebrows.
- Industry pages (`/industries/*`, `/es/industries/*`): tighten hero copy, remove "These aren't generic problems" style copy, one accent.
- Pricing: shorten the 20+ item checklists into grouped highlights + "compare all features" table; keep the daily price dominant.
- Compare, resources, blog hubs: unify card styles, remove remaining em dashes site-wide (`rg "—" src/app/(marketing) src/components/marketing`).
- Decide on the 12-second homepage popup and the exit-intent popup.

## SEO / AEO guardrails kept

- Same title, description, canonical, OG/Twitter metadata on `/`.
- H1 still contains "Review management software for local businesses".
- Organization, SoftwareApplication, FAQPage JSON-LD unchanged; FAQ answers rendered visibly and identical to schema.
- Internal links from the homepage to features, industries, pricing, compare and guides preserved.
- Images through `next/image` with descriptive alt text; hero has no image LCP penalty (text LCP).

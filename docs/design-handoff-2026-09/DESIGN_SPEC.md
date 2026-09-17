# Design and component specification

Authoritative proposal for this handoff. Read the current code first; the names marked **new** are proposed files, not claims that they already exist.

## 1. Design direction

Audience: a local business owner checking software between customer appointments, often on a phone in daylight. Keep the existing warm light canvas and familiar orange actions. Reference the product itself: a recognizable review, a useful draft, a real request flow. No glossy device pileups, floating statistics, background-photo gradients, glass panels, or unrelated cafés on every route.

Use six layout families, not one universal hero:

| Variant | Routes | Desktop composition | Mobile order |
|---|---|---|---|
| `product` | Features, how it works | 5-column copy / 7-column meaningful demo | Copy, CTA, demo, supporting explanation |
| `story` | Industries, About when genuine photo exists | 6-column copy / 6-column single photo | Copy, CTA, photo/caption |
| `directory` | Blog, resources, integrations, compare hub, industries hub, tools hub | Compact intro, then useful catalog/featured content | Intro, search/filter when provided, first useful result |
| `support` | Help hub | 5-column intro/search / 7-column popular tasks | Intro, search, popular tasks, categories |
| `conversion` | Contact/demo | 5-column intent/expectation / 7-column form/calendar | Compact intent, form/calendar, support details |
| `reading` | Blog/help articles, policies, docs | Compact article header, optional TOC and article body | Header, expandable TOC, body |

Pricing has a compact decision header and plans, not a lifestyle hero. Security uses a reading/structured evidence composition. Comparison details use an introduction followed immediately by their comparison table.

## 2. Grid, spacing and dimensions

All numbers are CSS pixels at 100% zoom. Use rem equivalents where appropriate. Height values are targets/minimums, never a clipping cap for translated content or zoom.

| Setting | >=1280 viewport | 1024–1279 | 768–1023 | <768 |
|---|---:|---:|---:|---:|
| Main container | max 1280, centered | width minus 80 | width minus 48 | width minus 40; use 32 gutter total below 360 |
| Section column gap | 48 | 32 | 24 | 24 stacked |
| Hero top padding, after header | 56 | 48 | 40 | 32 |
| Hero bottom padding | 64 | 56 | 48 | 40 |
| Normal section padding, block | 72 | 64 | 56 | 40 |
| Related sections gap | 32 | 32 | 24 | 24 |
| Inner panel padding | 24–32 | 24 | 24 | 20 |
| Reading width | max 720 | max 720 | max 720 | available width |
| TOC width / gutter | 240 / 48 | 220 / 32 | collapsed | collapsed |

Use a 12-column CSS grid with equal `minmax(0,1fr)` tracks at >=1024; use the spans in the variant table. At <1024 stack product scenes to keep their text usable. Story may remain two columns at >=768 only if the copy fits without shrinking below the type scale. Support/conversion stack below 1024.

At 1440×900: aim for header + hero + the beginning of the next meaningful section. Typical product hero content is 440–520 high, story 380–460, directory intro 180–240, conversion 480–640 depending on the actual embed. At 390×844 the primary action should appear before any decorative photo. Do not force all pages to `100vh`; do not use empty `min-height` blocks just to fill the screen.

Spacing ladder: 4, 8, 12, 16, 24, 32, 40, 48, 64, 72, 96. Eyebrow→H1 16; H1→lead 20; lead→actions 24; action→reassurance 12. Avoid stacking a hero's 80px bottom padding with another 80px top padding; a hero followed by a directory needs one 48–64px separation.

## 3. Typography

Keep the existing Inter font supplied by the application. No new font request. Current `marketing.css` broadly styles H1 and is more specific than some utility classes; M01 must remove that accidental competition within interior-page scope.

| Role | Desktop / tablet / mobile size | Line height | Weight / tracking |
|---|---|---|---|
| Marketing H1, product/story/support/conversion | 56 / 48 / 36 | 1.10 | 600 / -.045em |
| Directory, pricing and article H1 | 48 / 40 / 32 | 1.15 | 600 / -.035em |
| Section H2 | 36 / 32 / 28 | 1.20 | 600 / -.03em |
| Article H2 | 28 / 26 / 24 | 1.25 | 600 / -.02em |
| H3 | 22 / 22 / 20 | 1.30 | 600 / -.02em |
| Hero lead | 18 / 18 / 17 | 1.65 | 400 / normal |
| Article body | 18 / 17 / 16 | 1.75 | 400 / normal |
| Standard body | 16 at all widths | 1.60 | 400 / normal |
| Controls, product demo body | 14 desktop; inputs 16 mobile | 1.45–1.5 | 500 |
| Metadata/captions | 13 (never below 12) | 1.50 | 400–500 |
| Short eyebrow | 12 | 1.40 | 600 / .06em |

Implement discrete breakpoint overrides so models use the same sizes. Marketing H1 is not a mandate to make every dashboard/policy label 56px. Use exactly one semantic H1 per page; scope CSS by explicit variant. Two or three headline lines preferred; long titles can use four on narrow screens. Never truncate headings, use fixed-height text blocks, or insert unconditional `<br>` tags to fit English.

## 4. Color, controls and surfaces

Use active marketing tokens: background `#fffefb`, foreground `#201515`, muted foreground `#68615e`, border `#e4e1da`, muted `#f5f4f0`, primary `#ff4f00`, brand wash `#ffede4`. Existing dashboard token values differ; do not copy a marketing palette into global CSS. Preserve semantic status colors and recognizable third-party logos.

- One orange primary CTA per decision area. Supporting action is a neutral outlined button or text link. Do not change the orange on hover; use a modest shadow or underline.
- Primary CTA: min-height 52; horizontal padding 24; pill radius. Secondary/action controls: min-height 44. Inputs: height 48, textarea minimum 128, 16px mobile text. Focus: visible 2px ring + 3px offset with sufficient contrast on the actual adjacent surface.
- Border radius: scene/photo 20, functional panels 16, inputs 10. Use cards for independently selectable results, forms and bounded examples, not every paragraph.
- Small orange text on the light canvas and small white labels on orange are existing contrast debt, not automatically AA-compliant. Preserve the orange. For **new interior** filled CTAs with white text, use 19px/700 labels so the large-text 3:1 threshold applies. For small inline links use dark text with underline and orange decoration rather than recoloring the brand. Do not silently claim all existing header buttons pass contrast. Shared-header remediation is outside this pass if it changes the excluded homepage.
- Never introduce new green “guaranteed success” badges. Sample success messages say what occurred in the example.

Text contrast thresholds and the large-text definition come from [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Our 44px target is a product design minimum; WCAG 2.2 AA's minimum criterion is 24px with stated exceptions, not a blanket 44px law. See [W3C target sizes](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## 5. Component architecture

### Existing pieces to reuse

- `src/components/marketing/landing-hero.tsx`: outer hero composition.
- `src/app/(marketing)/marketing-layout-client.tsx`: main/header/footer and navigation behavior.
- `src/app/(marketing)/marketing-interior-hero.css`: currently recent split-hero styles; consolidate here or scoped modules, do not add another competing global override sheet.
- `src/components/marketing/product-tour/`: review, request, reporting, auto-reply, typing, tablet and reset examples.
- `src/lib/marketing/product-demo.ts`, `product-demo-data.ts`, `auto-reply-demo-data.ts`: existing fictional state/data; do not fork contradictory fixtures.
- `src/components/marketing/feature-visual-data.ts`: feature-to-scene source; migrate deliberately after the feature scenes are ready.
- `src/components/marketing/content-renderer.tsx` and `src/lib/content/blog-types.ts`: already support image content sections; use that for guides instead of inventing a second content engine.
- `src/components/marketing/demo-booking-calendar.tsx`, `marketing-appointment-dialog.tsx`: preserve real booking destination and existing close/focus handling.

### Target API (proposal; implement in M01)

```ts
type HeroMedia =
  | { kind: 'photo'; src: string; alt: string; caption?: string; objectPosition?: string }
  | { kind: 'product'; node: React.ReactNode; label: string }
  | { kind: 'none' };
type InteriorHeroVariant = 'product' | 'story' | 'directory' | 'support' | 'conversion' | 'reading';
```

Keep `LandingHero` server-renderable. Route/section server components explicitly select their media; remove pathname-based generic scene fallback after all affected callers migrate. A compatibility adapter may accept today's `image`/`visual` props during migration, with `visual` precedence preserved; remove it only after `rg` confirms zero old callers. Never ship both a photo and a product panel accidentally. `kind:none` intentionally produces a compact intro, not an empty second column.

Proposed files:

- `src/types/marketing-interior.ts`: types only.
- `src/components/marketing/interior/hero-media.tsx`: photo/media wrapper, server.
- `src/components/marketing/interior/feature-demo-frame.tsx`: optional tablet frame, label and accessible caption. No pathname lookup.
- `src/components/marketing/interior/directory-intro.tsx`: compact header and optional children for search/filter; server.
- `src/components/marketing/interior/reading-header.tsx`: breadcrumb/title/meta; server.
- `src/components/marketing/interior/feature-scene.tsx`: small registry composed from independently implemented scenes, final wiring in M09.
- `src/lib/marketing/interior-page-content.ts`: only shared copy/config that truly repeats. Do not create a universal page-schema renderer or CMS.

Keep existing feature demos intact for the homepage. Reuse leaf components or add an opt-in compact mode only when necessary; its default must preserve the current homepage. Do not import auth/data-fetching dashboard containers into marketing. Extract a pure display leaf only when its dependency graph contains no Supabase client, server action, active-business hook, live fetch or billing side effect. Otherwise create a faithful fictional presentation with the same typography and labels.

Use one tablet at most, no rotated laptop stacks. Frame: neutral charcoal rim 8 desktop / 6 mobile, radius 24 / 18, inner screen solid light. Min demo width 0; responsive internal layout replaces tiny scaled text. At <768 use a condensed single-column interaction with the same capabilities. Put full complex demos below the introduction if they cannot be read at 600px wide. No nested page-sized scroll traps.

File limits: pages/layouts/API routes <=100 lines, components <=150, lib/services <=200; existing baseline files may not grow. Split before implementation crosses a limit. Use `@/` paths, strict types, no vendored UI edits, no new dependency unless the packet specifically establishes a need.

## 6. Interaction and motion contract

- Entrance: optional opacity + translateY(8px), 220ms ease-out, once; content visible without JS. No continuous parallax, looping floating objects, auto-advancing tours or hover-only explanations.
- Button transitions: 120–180ms; panels: 180–220ms; animate opacity/transform only. Reuse existing motion primitives, do not load another animation library.
- Reply typing begins after user action. Approx. 20ms per character, cap total at 2.5s; show an immediate busy indicator. Preserve the user's edits; do not overwrite an edited draft without an explicit new-generation action. Reset cancels timers. Unmount cleans up timers.
- Do not announce each typed character to assistive tech. Announce “Sample draft ready” once. Reduced motion completes typing immediately and removes entrance/transforms.
- Tabs implement arrow/Home/End keyboard behavior and visible selection. Hidden panels are not focusable. Empty/error/busy/disabled/complete states are deliberate.
- Read-only scenes have no fake buttons. A visual annotation is text, not a control. If the scene contains a button, the button changes visible state.
- Tool and form validation stays inline near the field and preserves input on error. No fake form success, new external API call, or live customer action in visual QA.

## 7. Content and proof rules

Aim for hero headlines of 5–12 words, leads of 20–40 words and outcome lists of three concrete items. Exceptions are existing long article titles. Do not rewrite SEO keywords just to fit a line. Exactly one image must not be mandatory for legal, support articles or tools; useful content wins.

A claim links to its source catalog, implementation or verified owner material in the task report. Do not promote a roadmap item into a live feature. An illustrative workflow remains labeled next to its title. No generated human is identified as a founder, support agent or customer.

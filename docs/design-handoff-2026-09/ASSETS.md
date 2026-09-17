# Asset production brief

This is a production specification, not a request to generate every listed image. Complete the reuse audit first. Read PAGE_PLAN.md to understand where each asset belongs.

## What to make

| ID | Deliverable | Quantity | Owner / placement |
|---|---|---:|---|
| P01–P06 | Responsive HTML product scenes: inbox, AI replies, requests, analytics, competitors, listing checklist | 6 | M03–M08; feature heroes, selected workflow excerpts |
| S01–S06 | Sanitized screenshots of actual UI: Google connection, first request, AI suggestions, auto-reply settings, inbox, analytics | Up to 6 | M13; adjacent to the relevant help instruction |
| E01 | Review request templates editorial illustration | 1 | M15; replace the unrelated resource cover |
| B01 | Existing concept-specific blog covers | Reuse 17 | M14; inventory paths/alt/dimensions in content-inventory.json |
| I01 | Existing sector photography | Review/reuse 8 | M19/M20; same asset across corresponding English/Spanish pages |
| O01 | Real founder/team or working environment photograph | Optional 1 | M24a; owner supplied; no fictional people represented as employees |
| G01 | Existing OG/social image | Audit/reuse | All metadata; make a replacement only if missing, illegible or inconsistent |

Do not produce 118 hero images. Most routes need an improved layout or useful example, not another asset. Product scenes must remain responsive, selectable HTML; image generation cannot create the UI, logos, schema, real QR codes, charts, or proof of results.

## Dimensions and delivery

| Use | Source/export | On-page treatment | Initial file budget |
|---|---|---|---:|
| Story photograph | 1600×1200 WebP; AVIF optional | 4:3 desktop; mobile 4:3, natural height | <=220 KB |
| Editorial cover E01 | 1600×1000 WebP | 16:10 resource cards; caption separate | <=180 KB |
| Existing blog cover | Preserve current 1672×941 source unless inadequate | 16:9 article, 16:10 card with reviewed crop | <=220 KB optimized derivative |
| UI screenshot | Capture at 1440×900 CSS px, DPR 1 or 2; crop to relevant panel | Native aspect; <=720px reading width; expand link if needed | Aim <=400 KB; retain legible text |
| Small help detail crop | Approximately 1000×650; exact panel ratio wins | Native aspect, annotate in adjacent HTML | <=250 KB |
| OG only if replacement needed | 1200×630 PNG/WebP supported by current metadata delivery | Title/logo with 60px safe inset | <=300 KB |

Budgets are proposed limits, not measured results. Do not blur interface text to hit a byte target; prefer a smaller meaningful crop. Preserve source originals outside the runtime asset path if useful. Do not upscale a poor source.

Use `next/image`, known dimensions or a reserved aspect-ratio container, explicit responsive `sizes`, and descriptive alt for meaningful images. Decorative imagery uses empty alt. Only the actual above-fold candidate receives priority/preload; do not prioritize every image in a grid. No duplicated desktop/mobile downloads. Below-fold images stay lazy.

Example `sizes` for a half-width story image: `(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 46vw, 616px`. Tune against the actual grid, not blindly. A full reading image uses `(max-width: 767px) calc(100vw - 40px), 720px`.

## E01 generation prompt

Generate this only in M15, using the imagegen skill/tool and reviewing the result before placing it:

> An original editorial still life for a local-business review request template library. A warm ivory desktop with three neat blank paper message cards and a simple unbranded smartphone, photographed from a slight overhead angle. One restrained vivid orange #ff4f00 paper tab, warm natural daylight, realistic paper texture, precise but human arrangement. The visual idea is choosing a thoughtful message after serving a customer. Main objects in the central 70% of the frame, generous uncluttered margins, 16:10 landscape composition. No people, no text, no letters, no logos, no stars, no graphs, no QR codes, no glowing gradients, no fake software interface, no floating objects. Calm editorial photography, not a glossy technology advertisement.

Overlay the resource title only in HTML. Suggested alt: “Blank message cards and a phone arranged for planning customer follow-ups.” Export to proposed `/marketing/resources/review-request-templates.webp`; record generation provenance. The image supports the resource theme; it is not a screenshot or a real customer artifact.

## Conditional industry replacements

First inspect `src/lib/industries/industry-imagery.ts` and `docs/marketing-photography.md`. Existing licensed photography is preferred. Replacement is justified only for wrong subject, damaged image, poor crop, missing rights/provenance, or a conflict with claims. Stock photos are illustrative, never an identified customer.

If generating a clearly illustrative alternative, use the following base brief plus one sector line. Do not add visible interface text or invented customer branding:

> Candid editorial photograph illustrating an everyday local business experience, natural window light, believable anatomy and environment, warm neutral tones, authentic materials, restrained composition, 4:3 landscape. Subject within central 70% with room for responsive crop. No logos, slogans, testimonials, chart overlays, watermarks or celebratory success gestures. Not a portrait of a real Zyene customer or employee.

| Sector | Specific scene |
|---|---|
| Restaurants | Staff member checking an order at a neighborhood restaurant service counter |
| Dental | Calm, unoccupied reception and appointment desk; no treatment details |
| Auto repair | Service advisor with a work order at a tidy workshop counter; no readable plate numbers |
| Salons | Stylist preparing a station between appointments, ordinary tools and natural light |
| Home services | Tradesperson tidying tools after completing a household repair |
| Medical | Welcoming practice reception, no patients, records, medical procedures or claims |
| Hotels | Reception desk with luggage context, no identifiable guest information |
| Fitness | Coach preparing a training area, no transformation or health-outcome claims |

Generate one candidate for a justified gap, inspect, then refine. Do not bulk-generate eight images without a documented need. Do not synthesize founder/customer headshots. Keep the English and Spanish crops identical unless text layout changes the required framing.

## Screenshot capture protocol

1. Match an existing help instruction to its actual current dashboard component and supported state. Do not capture production customer data.
2. Use a local seeded/demo tenant or intercepted read responses containing clearly fictional names. Never bypass authentication or change production account settings to stage a shot.
3. Hide emails, phone numbers, tokens, customer identities, live review URLs, billing IDs and browser chrome. If no safe fixture exists, record the screenshot as pending; finish the text/layout.
4. Capture the exact relevant control at normal scale. Keep labels readable at 720px display width; crop a 1400px-wide dashboard down to the panel when necessary.
5. Add steps/callouts as accessible HTML beside the image, not tiny raster lettering. Captions state the action and mark sample data.
6. Check the screenshot against the written instructions. Automatic reply screenshots must retain threshold, tone and enabled/off state accurately.
7. Place proposed assets under `/marketing/help/`; list each file, source component, capture date, fixture and article path in the asset manifest.

## Asset manifest and review gate

Extend the existing photography documentation or add a small `docs/marketing-assets.md`; do not introduce a runtime asset-management system. Record asset ID, file path, dimensions, bytes, provenance/license, crop/object-position, alt/caption, consuming routes and review date. Do not duplicate sources in several folders.

Accept only if: subject matches the page; crop works at 390/768/1440; no anatomical/text artifacts; orange accents do not introduce a competing brand; content remains legible without the image; source rights/provenance are recorded; page layout is reserved before loading; screenshot data is fictional/sanitized.

Retire generic interior notebook/café/tablet photos from inappropriate heroes as pages migrate. Delete an asset only after checking all code/content references. Existing homepage assets remain protected even if shared with another page.

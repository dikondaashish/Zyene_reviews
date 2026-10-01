# Google Reviews widget reference analysis

Reference inspected interactively on September 30, 2026: https://elfsight.com/google-reviews-widget/ and its embedded Google Reviews configurator (v3.49.19). All 20 gallery templates and the 14 layout choices were opened. The carousel, review popup, and responsive preview were exercised. This records observed behavior, not a claim that every Elfsight backend service is reproduced.

| Template | Observed appearance and behavior |
| --- | --- |
| Carousel Widget | Centered 24px title; gray header with Google wordmark, rating/count and blue pill; three gray review cards; round arrows at card edges; dots below. |
| Badge | Google G above rating/stars; blue review count below; clicking opens a centered review-list dialog. No business-name footer inside badge. |
| Grid with AI Summary | Compact inline rating header; summary is the first card in an equal-height three-column grid. |
| Simple Carousel | No title/header; outlined cards; source wordmark inline with relative date; photo grids; edge arrows and dots. |
| Slider | One centered card; stars then text then avatar/name/date; title above; edge arrows and dots. |
| Floating Badge | Card badge with white rounded background and shadow, anchored bottom left. It is not the compact horizontal badge. |
| Carousel with AI Summary | No title; large rating header; outlined cards; summary occupies the first carousel slot. |
| Carousel with Photos | No title; centered inline Google/rating/count/button header; gray cards with 2-by-2 photo grids. |
| Light Sticker | Approximately 100px circular white sticker with four Google colors around its rim; rating, stars and Google wordmark. |
| Tag Sticker | Floating tag with a circular blue/Google-color head and white rectangular “Excellent on Google” tail. |
| Achievement Sticker | Approximately 100px shield with red/blue/yellow/green perimeter; rating, stars, label and Google G. |
| Floating Achievement | Bottom-left shield; label omitted; rating, stars and Google G remain. |
| Dark Carousel | Black widget background; charcoal speech-bubble cards with stars/text/photos; reviewer is below the bubble. Title shown, header omitted. |
| List | Centered approximately 640px column; large-rating header; summary first; full-width cards with text indented under the author. |
| Review Wall | Gray header centered around large rating; red accent; summary first; masonry columns with varying card heights. |
| Dark Grid with AI Summary | Black surface; charcoal large-rating header; bubble cards in a grid, including summary; title shown. |
| Sidebar Widget | Approximately 300px one-column outlined carousel; centered Google/rating header; no title/button. It is not a long list. |
| Dark Floating Badge | Bottom-left charcoal card badge on a transparent host; no business-name label. |
| Halloween Google Reviews | Black background; charcoal classic cards; orange CTA and Read more; yellow stars; verified mark hidden. |
| Halloween Google Reviews Badge | Charcoal rounded badge with orange review count and small pumpkin beside “Excellent on Google”. |

Additional layouts: compact badge is a horizontal G/rating/stars/count strip; review request has title/caption/outlined Google button/rating/overlapping reviewer pictures; reviews button is a Google G with “Reviews”; bold sticker is a colored circle; oval sticker is a colored capsule.

Measured foundations: card/header padding 24px, card radius 12px, gap 20px, light surface rgb(245,245,247), author 15px/18px weight 600, title 24px/31.68px weight 700, system font. The mobile preview is 375px wide with 20px side spacing and one carousel card. Long text truncates by rendered height; Read more opens the review list when photos/replies are enabled. Images use a 2-by-2 grid, fourth tile shows the remaining count, and clicking opens an image gallery. Popups have a dark backdrop, approximately 720px desktop width, rounded corners, scrollable content, a close button and a compact rating header.

Editor controls observed: rows and mobile rows; width/columns/gap; automatic slide; animation speed; item/page scrolling; dots/arrows/swipe/RTL; six themes; card/background/text/link/verified/source colors; review source style; reviewer/name/date/rating/image/reply toggles; short/full text; header styles; badge size/alignment/label/click action; filters and ordering.

| Before | Correction | Why |
| --- | --- | --- |
| Generic badges/stickers | Distinct circular, tag, oval and shield renderers | Shapes and content hierarchy differ in the reference. |
| Instant scrolling and numeric counter | Smooth edge-arrow navigation and clickable dots | Reference navigation is spatial and animated. |
| Inline badge expansion | Review-list dialog and image viewer | Clicking the reference opens an overlay. |
| Reloading iframe for each setting | Validated configuration messages to a stable preview | Template changes should update the existing preview without a network reload. |
| Individual AI review excerpts above feed | Aggregate summary card within feed | The reference summarizes the business, rather than quoting unrelated per-review summaries. |
| Generic miniature previews | Thumbnails rendered from the actual layout components | Template picker must show what selecting it produces. |

Boundaries: use only this business’s visible synced reviews; preserve plan/branding restrictions; never invent ratings, reviewer verification or generated summary text. OAuth connection and private account state are not controlled by public presentation settings. Copying UI behavior does not provide Elfsight’s Google scraper, translation service, account storage, analytics or custom JavaScript execution.

Verification: exercised all 20 templates at desktop width and in a 375px mobile iframe; no horizontal overflow in the 20 mobile previews. Checked real Vindu reviews, carousel navigation, badge placement, review-list popup, photo-gallery navigation/wrapping/close/focus restoration, and an installed floating badge expanding over its host page and restoring its original dimensions. The photo check used a disposable synthetic fixture because the loaded Vindu reviews contained no photos. Template-picker examples are labeled sample data; public widgets use the business’s actual reviews. Forty template screenshots and DOM measurements were saved locally in `/tmp/zyene-widget-parity-2026-09-30/`.

AI summaries require an authorized editor to generate them in AI Features. Generation uses the existing paid-plan, permission, rate and daily-budget checks, a bounded review input, and a concurrent-generation lock. Only cached summaries are read by public widgets; hiding or changing a review invalidates publication. Provider calls were mocked for tests; a live billable generation was not performed. Focused coverage includes authorized success, foreign business/viewer denial, unavailable limits, cache hits, concurrent generation, and access/review changes before publication. Public owner replies are included only after their response status is `responded`.

React Doctor: 84/100, unchanged from the baseline, with zero errors. Seven complexity warnings reflect bounded presentation variants in small components. The two interaction warnings target native `<dialog>` backdrop handlers; these dialogs provide native focus trapping/restoration and Escape dismissal, with visible close buttons. Gallery ArrowLeft/ArrowRight navigation, Escape, and reopening at the selected image were verified in the browser. No rules were suppressed.

The full unit suite passed: 275 files and 1,775 tests. Type checking, the file-size guard and the feature implementation’s production webpack build passed; 274 static pages generated successfully. Controls are restricted to layouts where they apply; sliders stay in one row, and rating/label visibility is honored in badges and stickers.

The final palette uses shared named design tokens for serialized widget settings and existing Google CSS tokens for logo fills. A numeric RGB assertion preserves the measured reference colors. The color and migration guards pass without changing or suppressing either guard.

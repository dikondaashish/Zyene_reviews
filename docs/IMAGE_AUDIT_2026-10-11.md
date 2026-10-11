# Image audit — October 11, 2026

The follow-up review found three places worth improving: the HVAC, plumbing, and electrician pages were all using a photograph of a window installer. That photograph is real and suitable for the general home-services page, but it does not clearly illustrate these three trades. Each now has its own realistic generated scene. This brings the refresh from 47 to **50 distinct generated scenes**.

The review also found a broken default sharing-preview image. `/og/og-default.png` returned HTTP 404 even though 106 of the 128 public sitemap pages referenced it. The existing Zyene sharing-card design was exported to that exact location as a 1200×630 PNG. This corrects the missing file without changing page titles, descriptions, or routes. The previous report's statement that sharing graphics needed no change was incomplete: the default static image was missing.

## What was checked

The starting point was commit `f520d7516b1200932a558c66e7ee1fc8aa942c40`, after [PR #12](https://github.com/dikondaashish/Zyene_reviews/pull/12). All **153 repository-owned image files** were inventoried and visually reviewed, including logos, favicons, product photos, mascots, decorative images, and unused older pictures. This consists of 152 raster files and one SVG. The SVG's source was also inspected.

All **128 public sitemap pages** were checked in a browser at 1440px and 390px, giving **256 page checks**. These checks scrolled through the pages to load images and checked that visible images loaded, had an alternative-text attribute, and did not cause horizontal overflow. Every checked page had one main heading. The blog's “Load more” button was exercised so that all 22 article covers were checked, including covers absent from the initial page HTML. All 47 scenes from the earlier refresh appeared in rendered pages.

The 29 distinct sharing-preview and icon URLs in the page metadata were checked separately. The default preview was the only failed URL. Browser checks covered customer-facing public pages; they did not log into tenants or inspect customer-uploaded photos and remote reviewer portraits. Remote company logos were checked as rendered elements, not regenerated.

The complete inventory, hashes, individual page results, decisions, and three new generation prompts are in [IMAGE_AUDIT_MANIFEST_2026-10-11.json](IMAGE_AUDIT_MANIFEST_2026-10-11.json). Screenshots and detailed crawl evidence are kept locally under the gitignored `output/image-audit-2026-10-11/` directory.

## Improvements made

| Location | What was found | Improvement | New file |
| --- | --- | --- | --- |
| HVAC page and industry-directory card | General window-installation photo | Technician inspecting an outdoor air-conditioning unit | `public/images/industries/hvac-candid-v2.webp` |
| Plumbing page and industry-directory card | Same window-installation photo | Plumber checking a drain pipe beneath a kitchen sink | `public/images/industries/plumbing-candid-v2.webp` |
| Electrician page and industry-directory card | Same window-installation photo | Electrician preparing cable and tools at a workshop bench | `public/images/industries/electricians-candid-v2.webp` |
| Default sharing previews and product metadata | Missing image, HTTP 404 | Static export of the existing branded sharing-card design | `public/og/og-default.png` |

The shared industry mapping and catalog both use the three new image paths. The existing hero, supporting story, and directory components consume that mapping. The electrician image has a specific crop adjustment to keep the subject's head visible in wider cards. No component structure or hooks changed.

The three new scenes were generated individually with the built-in `image_gen.imagegen` tool, reviewed for natural faces, hands, lighting, materials, and plausible business settings, then resized and compressed to 900×900 WebP files. Their combined size is 288,850 bytes, about 282 KiB. The sharing card is 221,493 bytes, about 216 KiB. These additions bring the image inventory to 157 files.

The new scenes are AI-generated illustrations with fictional people. A realistic appearance does not make them photographs of actual Zyene customers or staff. They are contextual business imagery, not customer evidence, interface screenshots, or instructions for performing technical work.

## What was kept, and why

- All 47 earlier replacements and their 57 compatibility encodings are byte-for-byte unchanged. The new audit found no further active business scene that needed replacement for its appearance.
- The four documentary photographs and their existing credits remain unchanged: café service, café conversation, restaurant guests, and window installation. The general home-services page continues to use the window-installation photograph.
- Logos, icons, the approved mascot, NFC product photos, the guide cover, decorative plant and mug cutouts, and the widget-preview SVG retain their intended roles. These are deliberately designed graphics or product imagery; they do not need to look like candid photographs.
- Seven older scenes survive in 14 unused PNG/WebP files: `home-services`, `restaurants`, `alert-emily-carter`, `hero-local-owner`, and `testimonial-1`, `testimonial-2`, `testimonial-3`. They were inspected again and none appeared in the rendered public pages. They are recorded as inactive in the manifest. They were not replaced or deleted because they are not part of the visible experience. Testimonial authors in the current site use initials.
- Customer-supplied and platform-supplied photos were not replaced. This report does not claim those runtime images were audited individually.

## Verification

- Typecheck and the file-size guard passed with `pnpm verify:fast`.
- All 1,940 tests in 303 files passed. The eight marketing SEO-integrity tests also passed separately.
- ESLint passed for the two changed TypeScript catalog files; `git diff --check` passed.
- Image-path validation covered all 22 blog records, their body images, 11 industry records, and replacement/compatibility assets: 109 distinct editorial URLs, no missing files or descriptions.
- All 256 baseline production browser checks passed. The three new industry pages and the directory also passed eight local desktop/mobile checks with the new images and final crops.
- The initial local development image optimizer stalled on three cold mobile variants. Restarting that development server resolved the stall; the eight affected-page checks then passed without application changes.
- The restored default preview returned HTTP 200 locally with the correct PNG content type and 1200×630 dimensions.
- Hash comparison confirmed that all 153 pre-existing image files remain unchanged. No image was deleted.

The source SEO review covered 38 marketing page files. Existing empty alternative text belongs to decorative images, adjacent brand labels, navigation thumbnails, or labelled example portraits. The earlier scanner's missing-alt warning for the composite case-study image is a parser false positive: the actual component supplies an illustrative description. No new marketing route, sitemap entry, robots rule, title, or structured-data schema was introduced.

These results describe the inspected production baseline and the verified follow-up changes. They are not evidence that an unmerged follow-up has already reached production; deployment is checked separately after merge.

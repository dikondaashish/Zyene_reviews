# Marketing photography

The October 10, 2026 image refresh adds 47 AI-generated illustrative scenes across blogs, industry pages, shared marketing imagery, and labelled example portraits. See [the refresh report](IMAGE_REFRESH_2026-10-10.md) for the complete replacement ledger and [the manifest](IMAGE_REFRESH_MANIFEST_2026-10-10.json) for prompts, provenance, dimensions, and consumer files. The four documentary photographs below remain unchanged. Generated scenes are not photographs of actual Zyene customers or staff.

The [October 11 follow-up audit](IMAGE_AUDIT_2026-10-11.md) reviewed all 153 repository-owned image files and 128 public sitemap pages. It adds distinct HVAC, plumbing, and electrician scenes, bringing the total to 50 generated scenes. These three trades now use their own images; general home services continues to use the window-installation photograph. Their final prompts, dimensions, hashes, and consumer locations are in [IMAGE_AUDIT_MANIFEST_2026-10-11.json](IMAGE_AUDIT_MANIFEST_2026-10-11.json). The audit also restores the missing default branded sharing-preview PNG from the existing code-defined design.

The restaurant, café, and home-services replacements are photographs sourced from Pexels on September 7, 2026. They illustrate everyday business settings; the people pictured are not identified as Zyene customers, team members, or testimonial authors.

| Local asset | Photographer | Original photograph |
| --- | --- | --- |
| `public/marketing/home/cafe-service.webp` | Mizuno K | [A Smiling Woman Serving a Customer](https://www.pexels.com/photo/a-smiling-woman-serving-a-customer-13736419/) |
| `public/marketing/home/cafe-conversation.webp` | Mike Jones | [Man and Woman Standing at the Counter](https://www.pexels.com/photo/man-and-woman-standing-at-the-counter-9050571/) |
| `public/images/industries/restaurant-guests.webp` | ELEVATE | [Group of People Sitting on Dining Table](https://www.pexels.com/photo/group-of-people-sitting-on-dining-table-1267321/) |
| `public/images/industries/window-installation.webp` | Ksenia Chernaya | [Handyman Installing Window Frame with Drill in House](https://www.pexels.com/photo/handyman-installing-window-frame-with-drill-in-house-5691544/) |

## Generated imagery

`public/marketing/home/hero-cafe-backdrop.webp` (2000 x 848, 62 KB) is a generated image (Google `gemini-3-pro-image`, 2026-10-17) used only as the soft backdrop behind the homepage product window. It shows no identifiable people, text or brands. Prompt summary: a wide, shallow-depth-of-field café interior in warm late-afternoon light, a calm out-of-focus center for the product window, no text, logos, screens or faces in focus.

## Video

Supplied by the site owner on 2026-10-17 and re-encoded for the web (H.264, 1600px wide, no audio, `+faststart`, poster frame from 0.4s):

| File | Source file | Used on |
| --- | --- | --- |
| `public/videos/ai-answer-urgent-care-chatgpt.mp4` | `hero-chatgpt.mp4` | Homepage feature bento, "Show up in AI answers" |
| `public/videos/ai-answer-car-dealership-claude.mp4` | `hero-claude.mp4` | `/features/ai-visibility`, "Your customers are asking AI for recommendations" |

Two other supplied clips were not used: one is a near-duplicate carrying a generator watermark, the other repeats the Claude dealership scene. `AmbientVideo` loads clips only near the viewport, pauses them offscreen and shows only the poster under reduced motion.

## Share images

Every marketing route's Open Graph/X card is rendered by `src/lib/seo/og-card.tsx` from the page's own title and, where it has one, its photo. Routes without their own `opengraph-image.tsx` use `public/og/zyene-reviews-share.jpg`, rendered from the same template. After deploying, re-scrape changed URLs in Facebook's Sharing Debugger and LinkedIn's Post Inspector; both cache old previews.

## License and treatment

All four source pages identify the photographs as free to use under the [Pexels license](https://www.pexels.com/license/), which permits website and marketing use and modification. It does not permit implying endorsement by the people or brands pictured. These photographs are used as contextual imagery; testimonial author portraits remain initials.

The photos are stored locally and converted to WebP without generative editing or retouching. Original colors and composition are retained; CSS object positioning adapts the visible crop to each layout. New filenames prevent the previous generated images from remaining in image-optimization caches. Next Image supplies responsive sizes and lazy loading. Only above-the-fold images receive priority.

The shared industry image mapping covers the homepage, industry menu, industry directory, landing heroes, and supporting stories. Café replacements also cover feature, resource, tools, and How It Works imagery. Existing composite case-study labelling remains intact.

## Verification

Typecheck, file-size checks, and ESLint passed. All 1,171 tests in 153 files passed in the synchronized clean preview workspace. The full test run caught an earlier change to the illustrative-workflow note; its expected wording was restored. The source SEO audit completed with only the existing intentionally empty alternative text on navigation thumbnails.

Browser inspection covered the desktop café hero, second café story, restaurant and home-services gallery cards, the restaurant landing hero, and the home-services landing photo at 390px. The checked pages had no horizontal overflow, and the replacement images loaded successfully. No deployment or new production build was run for this photography update.

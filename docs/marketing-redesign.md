# Marketing redesign · September 2026

## Current visual direction

This second pass responds to the request for a more visual, polished marketing site and a better top navigation. The original Zyene orange remains exactly `#ff4f00`. Orange buttons use white text (`#ffffff`) following the requested brand treatment, including their arrow icons and hover states. The existing logo and Inter family remain part of the identity. The public site uses a consistent light canvas, with dark text, rounded photography, larger display typography, pill actions, and a dark footer. These tokens are scoped to marketing; the authenticated dashboard retains its own theme.

The live [Podium](https://www.podium.com/), [Birdeye](https://birdeye.com/), and [Framer](https://www.framer.com/) sites informed the direction: photography that places software in a business context, visible product workflows, generous spacing, and menus that explain the available tools. No competitor branding, customer testimonials, or results were copied.

## Main changes

- Rebuilt the homepage around business photography, an interactive product example, alternating image stories, an industry gallery, straightforward pricing, FAQs, and an orange closing section.
- Replaced small dropdowns with wider menus containing product descriptions, industry thumbnails, and a photographic feature panel. Mobile navigation exposes all eight industries. Escape closes menus and restores focus.
- Added a product tour for reviews, review requests, and reporting. Review headers, review bodies, and the trend chart reuse actual application components. The reply editor offers three example tones and editable text; requests switch between SMS and email. All data is fictional and labelled. These examples never send messages, publish replies, or call the AI service.
- Reworked all six feature landing pages with contextual product or photographic heroes and image-led explanations. The platform overview includes a full interactive workspace example.
- Replaced the placeholder-style blocks in How It Works with product components and photography.
- Added photographic workflow sections to the eight industry landing pages, compressed industry images, and improved their supporting layouts.
- Added image covers to resource cards and guides, plus supporting imagery on integrations, free tools, and contact. Kept existing submission handlers intact and placed the contact form before supporting content on mobile.
- Added short menu and button transitions and once-per-view photo entrances. Reduced-motion preferences disable the new effects. Content remains visible if JavaScript or the motion observer is unavailable.
- Corrected customer-facing agency copy that exposed internal billing and branding configuration names.
- Replaced unsupported 90-day performance claims in How It Works with practical measures: review activity, rating trends, response rate, and feedback themes.
- Repaired the SEO audit script’s undefined loop variable so its read-only audit can complete.

The shared header, footer, typography, focus states, buttons, and colors apply throughout the marketing route group. The internal growth workspace does not receive the public theme. Existing routes, metadata, sitemap entries, structured data, authentication, and billing behavior were preserved.

## Implementation

- `src/app/(marketing)/marketing.css` and its layout, scenes, and tour stylesheets define the scoped system.
- `src/app/(marketing)/marketing-layout-*` implements the navigation and footer.
- `src/components/marketing/marketing-home/` contains server-rendered homepage sections.
- `src/components/marketing/product-tour/` contains small interactive product examples.
- `src/components/marketing/landing-hero.tsx` supports either a photograph or a product visual.
- `src/components/marketing/feature-visual-data.ts` maps feature pages to relevant scenes.
- `src/components/marketing/marketing-motion.tsx` progressively enhances marked photography.

## 21st.dev components and UI/UX refinement

Applied UI/UX Pro Max's design-system, accessibility, and Next.js guidance while preserving Zyene's established orange and typography. Adapted Motion Primitives' Animated Tabs / Animated Background and Transition Panel, both listed on 21st.dev, from the author's public MIT-licensed source. The registry itself requires authentication; source attribution and the full license are in [marketing-component-licenses.md](./marketing-component-licenses.md).

The product tour now uses a moving selection pill and short panel transitions. Desktop navigation uses the same shared highlight. Arrow keys, Home/End, focus restoration, and existing click handlers are retained. Outgoing panels become inert and hidden from assistive technology, and reduced-motion preferences remove movement. Framer Motion features load separately through LazyMotion. No new dependencies were added.

The mobile reply editor uses 16px text to avoid iOS zoom. Tabs, tones, request-channel buttons, and the preview action have 44px minimum touch heights. Narrow-screen visual inspection also caught and fixed an aspect-ratio-driven photo extending beyond its grid column.

Additional verification for this refinement: TypeScript and file-size checks passed, ESLint passed, and React Doctor returned 100/100 for all eight affected React/TypeScript files after removing full Motion imports. Desktop menu Escape restored focus correctly, Home/End tab selection worked, and reporting rendered valid August 3–9 date labels.

## Homepage testimonials

Added the three testimonials and author details supplied by the site owner, under “Loved by local business owners.” One featured card sits beside two supporting cards on desktop; the cards stack on small screens. Initials identify each author. Quote wording is preserved, with a few phrases emphasized visually.

The cards adapt Motion Primitives' MIT-licensed Tilt component listed on 21st.dev. Framer Motion provides gentle spring-driven pointer tilt and staggered entrances through the existing LazyMotion setup. Touch input does not trigger tilt, and reduced-motion mode disables transforms and keeps all quotes fully visible. Attribution is recorded in `marketing-component-licenses.md`.

For this addition, TypeScript, file-size checks, and ESLint passed; React Doctor scored 100/100 for the four affected React/TypeScript files. The source SEO audit completed with only the previously documented decorative-thumbnail finding. Browser checks confirmed all three exact quotes, no horizontal overflow at desktop and 390px, working mouse tilt, and fully visible, untransformed cards under reduced motion. This addition was checked in the local development preview; no new production build or deployment was run.

## Photography

Following the request for real photography, the generated café service scene, café owner portrait, restaurant scene, and home-services scene were replaced with photographs by Mizuno K, Mike Jones, ELEVATE, and Ksenia Chernaya from Pexels. Photographer credits, source pages, license details, and asset paths are recorded in [marketing-photography.md](./marketing-photography.md). These are contextual stock photographs, not portraits of identified Zyene customers.

New asset filenames refresh image caches, and a shared industry mapping keeps the homepage, menus, directory, and landing pages consistent. The café photos also appear in feature, resource, tools, and How It Works sections. Face-aware CSS positioning keeps portrait subjects visible in wider frames. WebP conversion preserves natural color and texture without generative edits. Next Image handles responsive delivery and lazy loading, with priority reserved for hero images. Earlier generated assets remain available in the repository but are no longer referenced by these sections.

## Verification

Checks first ran in a temporary clean install using the unchanged lockfile and synchronized source. After the temporary directory was cleared between sessions, TypeScript, file-size checks, and targeted tests passed again in the workspace. The original dependency directory is untouched. No deployment is part of this change.

- TypeScript and the file-size guard passed.
- Targeted sitemap, growth page inventory, localized industry, and growth blueprint tests: 12 passed in four files.
- ESLint passed for changed TypeScript and React files with no warnings.
- React Doctor’s final explicit changed-file scan: 100/100, with no findings after narrowing the industry hover transition. An initial scan from the temporary directory incorrectly fell back to the entire repository; its result is not the score for this change.
- Source SEO audit completed. Its only image finding was intentional empty alternative text on navigation thumbnails whose adjacent link text already names the industry.
- Browser checks: desktop and mobile homepage, working reply-tone and preview actions, request tabs, reporting, mobile navigation expansion, Escape focus restoration, and the AI replies landing page. The checked mobile homepage had no horizontal overflow and computed primary color `#ff4f00`.
- Production build passed compilation, TypeScript, generation of 263 pages, and build tracing.
- All 49 representative production routes returned 200 with one H1, one main landmark, page descriptions, Open Graph images, and Twitter cards. Coverage includes all six feature pages, eight industry pages, four comparisons, resources, tools, a case study, and a Spanish industry page.
- Final browser checks also cover loaded industry-menu thumbnails, keyboard tab selection, desktop resource covers and industry photography, mobile industry and review-collection pages, and SMS/email switching. Checked widths had no horizontal overflow.
- Source and scripts passed `git diff --check`.
- The final preview includes the contact form ordering, narrower industry hover transitions, and removal of unsupported performance claims.

The final 21st.dev refinement also passed a fresh production build, the same 12 targeted tests, and a five-route production smoke check (home, contact, How It Works, industries, and analytics). Browser verification covered moving navigation highlights, SMS/email switching, keyboard End selection, valid report dates, and reduced-motion mode with no captured console errors. At 390px the photo measured 350px, the editor font was 16px, and all three tabs measured 44px tall. No horizontal page overflow appeared at 375, 390, 768, 1024, or 1440px. The contact form appears above supporting photography on mobile. Preview screenshots are saved under the ignored `output/marketing-preview/` directory.

First-pass implementation and verification notes are preserved in `marketing-redesign-first-pass.md`.

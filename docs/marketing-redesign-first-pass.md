# Marketing redesign · September 2026

The public marketing site now shares a warm, consistent visual system, with simpler navigation and more direct paths to trials, pricing, demos, and support. Existing URLs, page metadata, and structured data remain in place. Existing blog image work was preserved.

## Research and direction

Reviewed the live [Podium](https://www.podium.com/), [Birdeye](https://birdeye.com/), and [NiceJob](https://get.nicejob.com/) websites on September 7, 2026. The useful patterns were a clear primary action, prominent business imagery, concise product storytelling, accessible paths to industry solutions, and pricing reachable from the main navigation. Their branding and claims were not copied.

Scene: a local business owner checking software on a phone at a sunlit counter between customers. The light theme uses a warm canvas and dark readable text. The dark theme respects the existing system preference with warm charcoal surfaces. Both themes retain the original Zyene orange, `#ff4f00`, inherited from the global brand tokens as requested. The existing Zyene logo and Inter family carry the brand. Photography adds warmth without competing with the message.

- Primary colors are scoped to `.marketing-site`, keeping the authenticated dashboard's theme independent.
- Responsive display text, consistent 8px buttons, 16–24px image panels, generous but bounded spacing.
- Desktop navigation has three product groups plus direct Pricing and Demo links. Mobile navigation uses native expandable groups, with Escape and focus restoration.
- Static homepage sections render on the server. Native FAQ disclosures work without hydration. Removed the eager prefetch loop and unused homepage motion components.
- Hero photography is reserved for home, product overview, industry, team, and company stories. Text-focused resources and comparison pages use a simpler introduction.

## Coverage

The shared shell, typography, colors, focus styling, buttons, and footer cover all routes under `src/app/(marketing)`, except the internal growth workspace's visual theme. Individual redesigns cover home, pricing, features and six feature pages, industries and eight industry pages, Spanish industry pages, comparison hub and competitor pages, how it works, integrations, enterprise, agencies, partners, about, contact, demo, resources, blog hub, free tools, help, case studies, and security.

Article content, legal copy, existing integrations, authentication, contact submission handlers, and billing services retain their established behavior. Button-style links across the marketing site now use the component's `asChild` composition, avoiding nested interactive elements. Comparison values include accessible Yes/No text. The pricing table distinguishes customer review draft quotas from business reply suggestions.

## Main implementation

- `src/app/(marketing)/marketing.css`: scoped marketing tokens and reusable layout styles.
- `src/components/marketing/landing-hero.tsx`: common responsive page introduction.
- `src/components/marketing/marketing-home/`: focused server-rendered homepage sections.
- `src/app/(marketing)/marketing-layout-*`: shared navigation and footer.
- `src/components/marketing/pricing-client-*`: billing choice, plans, comparison and FAQ improvements.

## Image asset

Built-in image generation was used for `public/marketing/home/local-owner-v2.webp` (140,906 bytes). The original generated PNG remains in the Codex generated-images directory. The project asset is a WebP conversion, sized to 1400px wide; Next Image supplies responsive delivery.

Prompt: “Create a premium photorealistic commercial photograph for Zyene Reviews, a warm orange-branded review management software for independent local businesses. Landscape 3:2 composition. A confident independent café owner, woman in her thirties with dark curly hair, in a rust-colored apron, standing at a sunlit neighborhood café counter, casually looking at a smartphone and smiling naturally after reading customer feedback. Real candid business moment, not posed stock photography. Detailed textured plaster wall, dark walnut counter, ceramic cups, subtle greenery, afternoon light, rich warm orange and creamy ivory palette, cinematic but believable, contemporary neighborhood business, sharp face and hands, restrained background depth of field. Waist-up, the owner placed slightly right of center with café context to the left. No text, no typography, no logos, no UI elements, no star ratings, no badges, no overlays, no watermarks. Final image is the photograph only.”

## Verification

Local dependency stalls required a clean temporary install from the unchanged lockfile to build and preview the source. No deployment is part of this change.

- `pnpm verify:fast`: passed TypeScript and the file-size guard (28 grandfathered files).
- `pnpm test`: 153 test files and 1,171 tests passed. The suite includes sitemap coverage, localized industries, and pricing tests.
- ESLint: no errors or warnings across the checked marketing files; the final navigation adjustments also passed.
- React Doctor: 89/100, with three duplicated-JSX warnings and no errors.
- `git diff --check`: passed.
- Browser interaction checks: mobile navigation expansion and Escape focus restoration; monthly/yearly pricing switching by pointer and keyboard; no horizontal page overflow at the checked home/pricing/features breakpoints.
- Final production build: passed compilation, TypeScript, page generation, and build tracing. The preview source matches the workspace source.
- Production route checks: all 49 representative URLs returned 200 with exactly one H1, one main landmark, Open Graph images, and Twitter card metadata. Coverage includes every feature/industry family, four competitor pages, Spanish pages, tools, legal pages, and representative articles.
- Final browser review: desktop and mobile home, pricing, industry, comparison, contact, tools, resources, and blog layouts; light and dark appearance; desktop click controls, outside-click dismissal, and Escape focus restoration. No browser JavaScript errors were reported. Temporary appearance and viewport overrides were restored.
- Corrected the industry Starter trial CTA to go directly to signup.

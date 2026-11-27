import type { BlogPostSource } from "@/lib/content/blog-types";
import { SIGNUP_URL } from "@/config/env";

export const howToEmbedGoogleReviewsOnWebsitePost: BlogPostSource = {
    slug: "how-to-embed-google-reviews-on-website",
    title: "How to Embed Google Reviews on Your Website (Free & Fast in 2026)",
    excerpt:
        "Display live 5-star Google reviews on WordPress, Wix, Webflow, or Shopify. Compare widgets, API scripts, and badges to boost conversion rates without hurting page speed.",
    pillar: "google-reviews",
    pillarLabel: "Google Reviews",
    publishedAt: "2026-10-19",
    dateModified: "2026-11-27",
    author: { name: "Karthik", role: "Founder" },
    metaTitle: "How to Embed Google Reviews on Your Website (2026)",
    metaDescription:
        "Learn how to embed Google reviews on WordPress, Wix, Squarespace, or HTML. Compare widgets, API embeds, and static badges to boost website conversion rates.",
    keywords: [
        "how to embed google reviews on website",
        "embed google reviews free",
        "google reviews widget for website",
        "add google reviews to wordpress",
        "google reviews badge html",
        "embed google reviews on webflow wix",
    ],
    relatedSlugs: [
        "why-google-reviews-matter-in-2026",
        "how-to-get-a-google-review-link",
        "how-to-create-a-google-review-qr-code",
        "how-to-respond-to-a-positive-review",
    ],
    internalLinks: [
        { label: "Embed Review Widgets Guide", href: "/help/integrations/embedding-review-widgets" },
        { label: "Google Review Link Guide", href: "/blog/how-to-get-a-google-review-link" },
        { label: "GBP Verification Guide", href: "/blog/google-business-profile-verification-guide" },
        { label: "Why Google Reviews Aren't Showing Up", href: "/blog/why-are-my-google-reviews-not-showing-up" },
        { label: "Review Collection Features", href: "/features/review-collection" },
        { label: "Positive review response examples", href: "/blog/how-to-respond-to-a-positive-review" },
    ],
    faqs: [
        {
            question: "Can I embed Google reviews on my website for free?",
            answer: "Yes. You can manually copy review quotes into your HTML, use the Google Places API within your Google Cloud free usage tier, or use reputation software that includes an embeddable widget. Standalone widget plugins typically charge a monthly fee or add branding on free tiers—check current pricing before installing.",
        },
        {
            question: "Does embedding Google reviews slow down website speed?",
            answer: "Heavy JavaScript plugins can hurt Core Web Vitals (INP and LCP). Modern review widgets use asynchronous script loading or lazy-loaded iframes to render testimonials without delaying your main thread.",
        },
        {
            question: "Do embedded reviews update automatically when new reviews come in?",
            answer: "Yes, when using a dynamic widget connected via Google Business Profile sync (like Zyene Reviews). Manual copy-paste HTML blocks or static screenshots never update unless edited by hand.",
        },
        {
            question: "Can I filter out negative reviews from showing on my website widget?",
            answer: "Yes. Reputation platforms allow you to set display rules, such as showing only reviews with 4 or 5 stars, while still letting customers click through to your full public Google Maps listing.",
        },
        {
            question: "Can I add Google reviews to WordPress, Webflow, and Squarespace?",
            answer: "Yes. All modern CMS platforms support embedding custom HTML or script snippets. Simply paste the embed code into an HTML block, custom embed element, or footer script section.",
        },
        {
            question: "Why does the Google Places API only show 5 reviews?",
            answer: "Google's Places API currently returns up to 5 reviews per location by default in Place Details responses, sorted by Google's relevance or newest order. If you want to display more than 5 reviews or filter across your full review history, you will need a Google Business Profile-connected widget or platform that syncs your account directly.",
        },
        {
            question: "Will embedding Google reviews give my site star ratings in Google search results?",
            answer: "Not automatically. Google's current Review Snippet structured-data guidelines restrict self-serving review rich results for LocalBusiness and Organization pages when reviews are syndicated from third-party platforms. Embedded reviews are primarily for on-page visitor trust and conversions rather than SERP star snippets.",
        },
        {
            question: "How do I embed Google reviews on a plain HTML website?",
            answer: "Open your HTML file, place the widget container element where you want reviews to appear inside the <body> tag, and paste the async <script> tag right before the closing </body> tag. Save and upload the file to your host.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "To embed Google reviews on your website: Verify your Google Business Profile and note your Place ID, choose between a dynamic widget, the Google Places API, or static HTML, and paste the embed snippet into WordPress, Wix, Squarespace, Shopify, Webflow, or plain HTML.",
        },
        {
            type: "p",
            text: "Adding live Google reviews to your homepage or service pages helps prospective customers verify your reputation without leaving your site. When visitors see real reviewer names, dates, and star ratings next to your primary call to action, they have fewer unanswered questions before booking or buying. Manual screenshots look dated quickly and cannot be read by screen readers or search engines. Here is how to embed dynamic, auto-updating Google reviews cleanly on any website."
        },
        {
            type: "h2",
            text: "3 Methods to Embed Google Reviews (Ranked)"
        },
        {
            type: "ol",
            items: [
                "**Dynamic Review Widgets (Best for most businesses):** A lightweight embed code that syncs with your Google Business Profile. It updates automatically as new reviews arrive, supports star-rating filters, and adapts to your site layout.",
                "**Google Places API (Best for custom developer builds):** Pulls raw review JSON directly from Google Cloud. Requires an API key, billing setup, server-side caching, and currently returns up to 5 reviews per location.",
                "**Manual HTML Block (Zero-JS fallback):** Hardcoding selected review quotes directly in your page markup. Great for zero-JavaScript performance, but requires manual updates whenever new reviews come in."
            ]
        },
        {
            type: "image",
            image: {
                src: "/images/blog/embed_google_reviews.jpg",
                alt: "MacBook Pro displaying a modern website with an embedded five-star Google customer review carousel widget",
                width: 1200,
                height: 675,
                caption: "Live review carousels build immediate buyer trust directly on high-conversion landing pages."
            }
        },
        {
            type: "h2",
            text: "Comparison: Review Embed Options"
        },
        {
            type: "table",
            table: {
                headers: ["Feature", "Zyene Live Widget", "Standalone Widget Plugin", "Google Places API"],
                rows: [
                    ["Setup Complexity", "Low (Paste Embed Code)", "Medium (App or Plugin Install)", "High (API Keys & Backend Code)"],
                    ["Auto-Sync New Reviews", "Yes (Connected Profile Sync)", "Yes (Periodic Sync)", "Yes (Currently 5-Review Limit)"],
                    ["Star Filter (e.g. 4+ Stars)", "Yes", "Usually Paid Tiers", "Manual Code Filter"],
                    ["Core Web Vitals Impact", "Low (Async & Lazy)", "Varies (Watch Heavy Scripts)", "Minimal (When Server-Cached)"],
                    ["Price", "Included in Zyene Plans", "Paid plugins usually charge a monthly fee; check current pricing", "Google Cloud pay-per-request (check current pricing)"]
                ]
            }
        },
        {
            type: "h2",
            text: "Prerequisites: Verified Profile and Google Place ID"
        },
        {
            type: "p",
            text: "Before any widget or API script can pull your reviews, your listing must be verified and publicly visible on Google Search and Google Maps. If your listing is still unverified or pending review, follow our [Google Business Profile verification guide](/blog/google-business-profile-verification-guide) first."
        },
        {
            type: "p",
            text: "Most embed tools and the Google Places API identify your location using your **Google Place ID**—a unique alphanumeric string tied to your business listing. You can look it up in seconds using Google's official Place ID Finder or extract it while setting up your review request URL in our [Google review link guide](/blog/how-to-get-a-google-review-link). If you run a service-area business with a hidden street address, searching by business name in a widget picker can sometimes fail; having your Place ID ready solves that."
        },
        {
            type: "h2",
            text: "How a Copy-Paste HTML Widget Embed Works"
        },
        {
            type: "p",
            text: "If you use a reputation platform or review widget builder, the workflow follows the same pattern across every website builder:"
        },
        {
            type: "ol",
            items: [
                "**Connect your location:** Authorize your Google Business Profile or enter your Place ID so the tool can fetch your public reviews.",
                "**Choose layout and filters:** Pick a carousel, grid, or compact badge, set a minimum star threshold if desired, and match your site's font and background.",
                "**Copy the two-part HTML snippet:** Most lightweight widgets give you a container element (placed where reviews should render) and an asynchronous `<script>` tag."
            ]
        },
        {
            type: "p",
            text: "For illustration only, a standard copy-paste widget embed looks like this generic example (replace with the actual snippet from your widget provider):"
        },
        {
            type: "callout",
            text: "`<div id=\"google-reviews-widget\" data-place-id=\"YOUR_PLACE_ID\"></div>`\n`<script async src=\"https://example.com/widget.js\"></script>`"
        },
        {
            type: "p",
            text: "The `async` attribute tells the browser to download the script in the background without blocking your page text or hero image from rendering."
        },
        {
            type: "h2",
            text: "Embedding via the Google Places API (For Developers)"
        },
        {
            type: "p",
            text: "If you prefer full control over markup and styling without third-party scripts, you can fetch reviews using Google's official [Places API Place Details documentation](https://developers.google.com/maps/documentation/places/web-service/place-details). Keep four practical constraints in mind before choosing the API route:"
        },
        {
            type: "ul",
            items: [
                "**API key & Google Cloud billing:** You must create a project in Google Cloud Console, enable the Places API, attach a billing account, and restrict your API key so unauthorized sites cannot consume your quota.",
                "**Current 5-review limit:** Google's Places API currently returns up to 5 reviews per Place Details request. It does not paginate through your entire review history—for that, you need an authenticated Google Business Profile API integration.",
                "**Server-side caching is essential:** Never call the Places API directly from client-side JavaScript on every visitor page load. Fetch the JSON on your server or via a scheduled job, cache it (for example, once every 12 to 24 hours), and render the cached reviews as native HTML.",
                "**Required attribution:** Google Maps Platform terms require displaying the reviewer's name and Google attribution alongside API-sourced content."
            ]
        },
        {
            type: "h2",
            text: "Step-by-Step: Embedding on Your CMS"
        },
        {
            type: "p",
            text: "Once you have your widget code or cached HTML snippet, here is where to paste it on the most common website platforms."
        },
        {
            type: "h3",
            text: "WordPress (Gutenberg, Elementor, and Classic Editor)"
        },
        {
            type: "ul",
            items: [
                "**Gutenberg (Block Editor):** Click the **+** icon where you want reviews to appear, search for **Custom HTML**, paste your embed code, and click **Preview** to confirm it renders.",
                "**Elementor:** Drag the **HTML** widget from the left panel into your section, paste the snippet into the HTML Code box, and update the page.",
                "**Classic Editor:** Switch from the **Visual** tab to the **Text** tab before pasting. Pasting `<script>` tags into Visual mode escapes the brackets and displays raw code on the page."
            ]
        },
        {
            type: "h3",
            text: "Wix"
        },
        {
            type: "p",
            text: "In the Wix Editor, click **Add Elements (+) → Embed Code → Popular Embeds → Embed HTML**. Paste your snippet into the code box and click **Apply**. Resize the HTML container generously in both desktop and mobile views so star ratings and long reviews are not clipped inside a tight scrollbar."
        },
        {
            type: "h3",
            text: "Squarespace"
        },
        {
            type: "p",
            text: "Edit the page section, click **Add Block**, and select **Code** (set the type to HTML and leave **Display Source** unchecked). Note that Squarespace restricts custom `<script>` execution on some plans; if a script-based widget does not render on your live site, check your plan's custom code support or use an iframe-compatible embed if your provider offers one."
        },
        {
            type: "h3",
            text: "Shopify, Webflow, and Plain HTML"
        },
        {
            type: "ul",
            items: [
                "**Shopify:** Go to **Online Store → Themes → Customize**, click **Add section → Custom Liquid**, and paste your embed code. For a site-wide footer badge, you can add the script to `theme.liquid`.",
                "**Webflow:** Open the **Add Elements** panel, drag a **Code Embed** component onto your canvas inside a styled container `div`, paste your snippet, and publish to your staging or custom domain (custom scripts often do not execute inside the Designer preview).",
                "**Plain HTML:** Open your `.html` file, place the widget container `<div>` inside your `<body>` where the reviews belong, and paste the `<script async ...>` tag just before the closing `</body>` tag."
            ]
        },
        {
            type: "tip",
            text: "Place your review carousel or summary badge near your primary call-to-action button (such as 'Book Now' or 'Request an Estimate') on service and landing pages so visitors see social proof right before taking action."
        },
        {
            type: "h2",
            text: "Static Badges and Screenshots: What You Trade Off"
        },
        {
            type: "p",
            text: "Some businesses take screenshots of 5-star Google reviews and upload them as PNGs or JPEGs. While quick, screenshots carry real downsides: they cannot be read by screen readers, text inside images looks blurry on high-DPI screens, search engines cannot index the review copy, and dates quickly look outdated."
        },
        {
            type: "p",
            text: "If you want zero third-party JavaScript, hand-coded HTML testimonial blocks are a better static alternative than screenshots. Just remember that you are responsible for updating them manually whenever new reviews arrive, and you should link back to your Google profile so visitors know the quotes are real."
        },
        {
            type: "h2",
            text: "Google's Rules for Displaying Reviews on Your Site"
        },
        {
            type: "p",
            text: "When displaying Google reviews outside of Google Maps, follow Google's [Maps Platform Policies](https://developers.google.com/maps/documentation/places/web-service/policies) and basic trust practices:"
        },
        {
            type: "ul",
            items: [
                "**Keep review text intact:** Do not edit, rewrite, or alter a customer's wording to change its meaning.",
                "**Show proper attribution:** Include the Google attribution/logo and the reviewer's name as provided.",
                "**Link to your public profile:** Give visitors a clear link to read your full review history on Google Maps rather than presenting a closed, unverified list."
            ]
        },
        {
            type: "h2",
            text: "Protecting Page Speed & Core Web Vitals"
        },
        {
            type: "p",
            text: "Third-party review widgets are notorious for dragging down Google PageSpeed scores when they load bulky libraries or uncompressed avatars. Zyene Reviews widgets use asynchronous scripts and CSS-contained cards that help keep your Core Web Vitals green."
        },
        {
            type: "p",
            text: "Whether you use Zyene or another provider, apply three safeguards to protect **LCP**, **INP**, and **CLS**:"
        },
        {
            type: "ul",
            items: [
                "**Reserve space with `min-height`:** Set a minimum height on your widget wrapper in CSS so surrounding page sections do not jump downward when reviews finish loading (preventing Cumulative Layout Shift).",
                "**Defer below-the-fold widgets:** If your reviews sit halfway down the page, use `async` scripts or `loading=\"lazy\"` on iframes so they never compete with your hero image or headline.",
                "**Understand SEO and structured-data rules:** Under Google's current [Review Snippet structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet), `LocalBusiness` and `Organization` pages are generally not eligible for star rich results in Google Search using self-serving or third-party syndicated reviews. Embed reviews for on-page conversion and buyer trust—not to chase SERP stars."
            ]
        },
        {
            type: "h2",
            text: "Troubleshooting Common Embed Issues"
        },
        {
            type: "ul",
            items: [
                "**Raw HTML appears on the page:** You pasted the snippet into a visual/rich-text block instead of a Custom HTML or Code block.",
                "**Blank space where the widget should be:** Check whether your CMS plan blocks custom `<script>` tags, whether an ad blocker or strict Content Security Policy (CSP) is blocking the script domain, or whether you are viewing an unpublished editor preview.",
                "**Wrong location or no reviews loading:** Double-check that you used the exact Place ID for your verified profile.",
                "**New Google reviews are missing:** Dynamic widgets sync on a schedule, so allow time for the cache to refresh. If a review is missing on Google itself, see our guide on [why Google reviews are not showing up](/blog/why-are-my-google-reviews-not-showing-up)."
            ]
        },
        {
            type: "h2",
            text: "Showcase Your 5-Star Reputation in Minutes"
        },
        {
            type: "p",
            text: "Stop leaving your hard-earned Google reviews buried on Google Maps. Zyene Reviews gives you customizable carousels, badges, and review grids that embed on your website in seconds, update automatically, and turn visitors into paying customers. When customers leave glowing feedback on your site, follow our [positive review response examples](/blog/how-to-respond-to-a-positive-review) to acknowledge their support."
        },
        {
            type: "cta",
            ctaLabel: "Create Your Free Google Review Widget →",
            ctaHref: SIGNUP_URL
        }
    ]
};

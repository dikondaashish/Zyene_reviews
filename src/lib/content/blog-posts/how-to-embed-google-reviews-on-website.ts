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
    dateModified: "2026-10-19",
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
    ],
    internalLinks: [
        { label: "Embed Review Widgets Guide", href: "/help/integrations/embedding-review-widgets" },
        { label: "Google Review Link Guide", href: "/blog/how-to-get-a-google-review-link" },
        { label: "Review Collection Features", href: "/features/review-collection" },
    ],
    faqs: [
        {
            question: "Can I embed Google reviews on my website for free?",
            answer: "Yes. You can manually copy review quotes and add schema markup, or use reputation software with an included widget. Standalone widget plugins often charge $10-$40/month or place unsightly watermarks on your site.",
        },
        {
            question: "Does embedding Google reviews slow down website speed?",
            answer: "Heavy JavaScript plugins can hurt Core Web Vitals (INP and LCP). Modern review widgets use asynchronous script loading or lazy-loaded iframes to render testimonials instantly without delaying your main thread.",
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
            answer: "Yes. All modern CMS platforms support embedding custom HTML or script snippets. Simply paste the one-line embed code into an HTML block, custom embed element, or footer script section.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "To embed Google reviews on your website in 2026: Connect your Google Business Profile to a review platform, customize a carousel or badge widget with star filters, and paste the one-line embed script into your CMS or HTML page.",
        },
        {
            type: "p",
            text: "Adding live Google reviews to your landing page or homepage can increase conversion rates by up to 34%. When potential customers see verified social proof with real names, dates, and star ratings, their purchase anxiety drops instantly. However, manual screenshots look dated and hurt credibility. Here is how to embed dynamic, auto-updating Google reviews on any website."
        },
        {
            type: "h2",
            text: "3 Methods to Embed Google Reviews (Ranked)"
        },
        {
            type: "ol",
            items: [
                "**Dynamic Review Widgets (Best):** A lightweight embed code that syncs directly with Google. It auto-updates whenever new reviews arrive, filters low-star feedback, and matches your brand colors.",
                "**Google Places API (Developer):** Pulls raw review data directly via Google Cloud. Requires developer setup, billing quotas, and is strictly capped at Google's default 5 most recent reviews.",
                "**Manual HTML Block (Zero-JS):** Hardcoding quotes with Review schema markup. Great for static site performance, but requires tedious manual editing every time you receive new reviews."
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
                    ["Setup Complexity", "1 Minute (Paste 1 Line)", "Medium (App Install)", "High (API Keys & Code)"],
                    ["Auto-Sync New Reviews", "Yes (Real-Time)", "Yes (Hourly/Daily)", "Yes (5 Review Limit)"],
                    ["Star Filter (e.g. 4+ Stars)", "Yes", "Paid Tier Only", "Manual Code Filter"],
                    ["Core Web Vitals Impact", "Zero (Async & Lazy)", "Medium (Heavy Scripts)", "None (Server-Side)"],
                    ["Price", "Included in Zyene Plans", "$15-$45/month extra", "Pay-per-API call"]
                ]
            }
        },
        {
            type: "h2",
            text: "Step-by-Step: Embedding on Your CMS"
        },
        {
            type: "p",
            text: "No matter which website builder you use, adding a responsive review widget requires just 3 steps:"
        },
        {
            type: "ol",
            items: [
                "**WordPress:** In the Gutenberg block editor or Elementor, add a **Custom HTML** block and paste your widget embed code.",
                "**Webflow:** Drag an **Embed** component onto your page, paste the code snippet, and publish your site.",
                "**Squarespace & Wix:** Add a **Code** or **HTML Embed** block, select HTML mode, and paste your code snippet.",
                "**Shopify:** Navigate to Online Store > Themes > Customize > Add Section > Custom Liquid, and paste your code."
            ]
        },
        {
            type: "tip",
            text: "Place your review carousel above the fold on sales pages and directly next to your primary call-to-action button (e.g., 'Book Now' or 'Schedule an Estimate') to maximize conversions."
        },
        {
            type: "h2",
            text: "Protecting Page Speed & Core Web Vitals"
        },
        {
            type: "p",
            text: "Third-party review widgets are notorious for dragging down Google PageSpeed scores. Avoid plugins that load bulky jQuery libraries or uncompressed image avatars. Zyene Reviews widgets use asynchronous scripts and CSS-contained cards that prevent Cumulative Layout Shift (CLS) and keep your Core Web Vitals green."
        },
        {
            type: "h2",
            text: "Showcase Your 5-Star Reputation in Minutes"
        },
        {
            type: "p",
            text: "Stop leaving your hard-earned Google reviews buried on Google Maps. Zyene Reviews gives you customizable carousels, badges, and review grids that embed on your website in seconds, update automatically, and turn visitors into paying customers."
        },
        {
            type: "cta",
            ctaLabel: "Create Your Free Google Review Widget →",
            ctaHref: SIGNUP_URL
        }
    ]
};

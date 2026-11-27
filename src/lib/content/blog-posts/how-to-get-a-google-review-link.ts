import type { BlogPostSource } from "@/lib/content/blog-types";
import { SIGNUP_URL } from "@/config/env";

export const howToGetAGoogleReviewLinkPost: BlogPostSource = {
    slug: "how-to-get-a-google-review-link",
    title: "How to Get a Google Review Link and QR Code (2026)",
    excerpt:
        "Find your business's Google review link, download a free QR code, and test it before sharing it with customers. Includes steps for agencies managing multiple locations.",
    pillar: "google-reviews",
    pillarLabel: "Google Reviews",
    publishedAt: "2026-09-08",
    dateModified: "2026-11-27",
    author: { name: "Karthik", role: "Founder" },
    metaTitle: "How to Get a Google Review Link and QR Code (2026)",
    metaDescription:
        "Find and copy your Google review link, download a free QR code, and test both before sharing. Step-by-step instructions for businesses and agencies.",
    keywords: [
        "how to get a google review link",
        "google review link for business",
        "create direct google review link",
        "google business profile review link",
        "google review qr code",
    ],
    relatedSlugs: [
        "why-google-reviews-matter-in-2026",
        "how-to-respond-to-a-positive-review",
        "can-you-delete-a-google-review",
    ],
    internalLinks: [
        { label: "Google Reviews Guide", href: "/resources/google-reviews-guide" },
        { label: "Free review link generator", href: "/tools/review-link-generator" },
        { label: "Review request templates", href: "/resources/review-request-templates" },
        { label: "Automated review request campaigns", href: "/features/review-campaigns" },
        { label: "Embeddable Google review widgets", href: "/features/review-widgets" },
        { label: "Review management for agencies", href: "/agencies" },
        { label: "Google: get more reviews and a QR code", href: "https://support.google.com/business/answer/3474122" },
        { label: "Google: prohibited review practices", href: "https://support.google.com/contributionpolicy/answer/7400114" },
    ],
    faqs: [
        {
            question: "How do I get my Google review link on mobile?",
            answer: "Open your Business Profile in Google Search or Maps while signed into a manager account. Look for Ask for reviews or Get more reviews and copy the review link. If that control is unavailable, use a computer browser. Google's built-in review QR-code download currently requires a computer browser.",
        },
        {
            question: "Why doesn't my link open straight to the review box?",
            answer: "A general Maps share link may open the business listing instead of the review form. Copy the link from Get more reviews, then test it in a private window. Customers may need to sign into Google before the review form appears.",
        },
        {
            question: "Can I create a Google review link that pre-selects 5 stars?",
            answer: "Use the official review link and let customers choose their own rating. Ask for honest feedback without incentives, pressure, or filtering invitations by satisfaction. Google currently prohibits selectively soliciting positive reviews (see https://support.google.com/contributionpolicy/answer/7400114).",
        },
        {
            question: "Do customers need a Google account to leave a review?",
            answer: "Yes. Customers currently must sign into a Google account to publish a review. They can create a Google account with an existing non-Gmail email address.",
        },
        {
            question: "Can I create a Google review QR code for free?",
            answer: "Yes. On a computer, open your Business Profile, choose Read reviews, then Get more reviews. Right-click the QR code and save the image. Scan it before printing to confirm it opens the correct business's review flow.",
        },
        {
            question: "How do I get a Google review link using a Place ID?",
            answer: "Find your business's Place ID using Google's Place ID Finder or our free review link generator (/tools/review-link-generator), then append it to https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID. Always test the final URL in a private browser window.",
        },
        {
            question: "How big should a printed Google review QR code be?",
            answer: "Print the QR code large enough for a phone camera to focus comfortably at normal reading distance—at least around 1 inch (2.5 cm) wide on countertop cards or receipts, and larger on posters or vehicle wraps—with dark contrast on a light background and a clean white border around the code.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "4-Step Quick Answer: (1) Sign into the manager account for your Google Business Profile, (2) open Read reviews → Get more reviews (or Ask for reviews), (3) copy your direct link or save the QR code on a desktop browser, and (4) test it in a private window before sharing.",
        },
        {
            type: "p",
            text: "A direct review link gives customers a clear route to your business's review form. It avoids asking them to search for your name and choose the correct location. Invite honest feedback from customers regardless of whether their experience was positive or negative."
        },
        {
            type: "callout",
            text: "Free tools: [Google review link generator](/tools/review-link-generator) and [reputation score checker](/tools/reputation-score-checker).",
        },
        { type: "h2", text: "Copy your review link from Google Business Profile" },
        {
            type: "ol",
            items: [
                "Sign into the Google account that owns or manages your Business Profile.",
                "Search for your business name on Google and confirm the name and location in the management panel.",
                "Choose Read reviews, then Get more reviews. If you see Ask for reviews, that shortcut opens the sharing panel too (see Google's official [Get more reviews guide](https://support.google.com/business/answer/3474122)).",
                "Copy the review link. Save it with the location name so your team uses the correct link in future requests.",
            ],
        },
        {
            type: "tip",
            text: "Test the copied link in a private browser window. Confirm the business name and location. A Google sign-in prompt is normal for customers who are signed out; do not submit a test review of your own business.",
        },
        { type: "h2", text: "Find your Google review link via Place ID" },
        {
            type: "p",
            text: "If you do not currently have access to the Business Profile manager panel—or if you want to generate links for multiple locations programmatically—you can build a direct review link using your **Google Place ID**."
        },
        {
            type: "ol",
            items: [
                "Look up your business in Google's official [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) or use our free [Google review link generator](/tools/review-link-generator).",
                "Copy the `ChIJ...` Place ID string for your exact storefront or service-area listing.",
                "Append it to Google's review URL format: `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`.",
                "Open the resulting URL in a private browser window to verify it lands on the correct business.",
            ],
        },
        { type: "h2", text: "Shorten and brand your review link" },
        {
            type: "p",
            text: "Raw Place ID URLs are long and look clunky in SMS messages or printed flyers. Before sharing, decide whether to use Google's built-in `g.page` short link or a branded link:"
        },
        {
            type: "ul",
            items: [
                "**Google's built-in short link:** The link copied from Get more reviews is already compact and recognizable.",
                "**Branded custom domain or slug:** Using a recognizable domain (such as your own website's `/review` redirect or Zyene Reviews' branded `collectratings.com` pages) tells customers who is asking before they tap.",
                "**Avoid generic free shorteners:** Random short URLs can trigger carrier spam filters in SMS or make cautious customers hesitate to click.",
            ],
        },
        { type: "h2", text: "Download a free Google review QR code" },
        {
            type: "p",
            text: "Google currently provides a QR code in the Get more reviews panel on computer browsers. Right-click the code and save the image. You do not need a paid QR-code service for a basic static review link. If you need your review URL first, generate it with our [Google review link generator](/tools/review-link-generator). *(TODO: A dedicated free Google Review QR Code generator tool under `/tools/` would help capture QR-code queries directly.)*"
        },
        {
            type: "ol",
            items: [
                "Open the review-sharing panel on a computer and save the QR-code image.",
                "Place it on a receipt, countertop card, or other material customers can read easily.",
                "Scan the code from the final printed size using a phone and verify the business location.",
                "Use a neutral invitation such as Share your experience on Google. Do not ask for a specific star rating.",
            ],
        },
        { type: "h2", text: "QR code print specs: size, contrast, and quiet zone" },
        {
            type: "p",
            text: "A QR code that looks crisp on a monitor can fail to scan after printing if it is too small, low-contrast, or cropped too tightly. Follow four practical print rules:"
        },
        {
            type: "ul",
            items: [
                "**Size:** Keep codes at least roughly 1 inch (2.5 cm) wide for close-up receipts and counter cards, and scale up for posters, window decals, or yard signs scanned from several feet away.",
                "**High contrast:** Print dark foreground squares (black or dark navy) on a plain white or very light background. Avoid inverted light-on-dark codes or busy photo backgrounds.",
                "**Quiet zone:** Leave a clean blank margin around all four sides of the QR code so phone cameras can detect the corner alignment squares.",
                "**Matte finish:** Glossy lamination under bright overhead lights creates glare that slows down camera focus—choose matte or satin card stock when possible.",
            ],
        },
        { type: "h2", text: "Where to place your Google review QR code and link" },
        {
            type: "ul",
            items: [
                "**Checkout counters & reception desks:** Small tent cards where customers wait briefly while paying or wrapping up.",
                "**Printed receipts, invoices, and estimates:** A short line and QR code at the bottom of the summary.",
                "**Technician leave-behinds & packaging inserts:** Useful for home-service visits, deliveries, and take-out orders.",
                "**Post-service SMS & email follow-ups:** Pair your direct link with our [free review request templates](/resources/review-request-templates).",
            ],
        },
        { type: "h2", text: "How to track QR code scans and link clicks" },
        {
            type: "p",
            text: "Google's built-in QR code from Business Profile does not include scan analytics. If you want to know whether your counter card or invoice QR code is actually getting scanned, point your QR code to a trackable intermediate URL (for example, a dedicated page on your own site with UTM parameters or a reputation platform's campaign QR code) that forwards to your Google review flow."
        },
        { type: "h2", text: "Agencies: keep a separate link for each client location" },
        {
            type: "p",
            text: "Create a simple register with the client name, location, review link, manager contact, and last test date. Get each link from the relevant profile manager. Test the destination before adding it to a campaign, especially after a move or profile merge. Never reuse one client's link for another location."
        },
        { type: "h2", text: "Troubleshoot a missing or incorrect review link" },
        {
            type: "table",
            table: {
                headers: ["Problem", "What to check"],
                rows: [
                    ["No review-sharing control", "Confirm you are signed into a manager account and have selected the correct profile. Check verification or restriction notices."],
                    ["The link opens only a map", "Copy the review link from Get more reviews rather than the general Share profile link."],
                    ["The wrong business opens", "Replace the link with one copied from the correct location and update printed QR materials."],
                    ["A customer sees a sign-in screen", "Ask them to sign into their Google account before leaving a review."],
                    ["A submitted review is missing", "Check Google's review policies and moderation guidance. A working link does not guarantee a review will be published."],
                ],
            },
        },
        { type: "h2", text: "Common mistakes to avoid (policies, incentives, and gating)" },
        {
            type: "ul",
            items: [
                "**Email or receipt:** Include a short invitation after a genuine customer interaction.",
                "**Text message:** Use the customer's appropriate messaging consent and respect their opt-out preferences.",
                "**QR card:** Make the code easy to scan and let customers choose whether and what to write.",
                "**Skipping the pre-print scan test:** Always test printed QR proofs with both iOS and Android cameras before ordering a bulk print run.",
            ],
        },
        {
            type: "quote",
            text: "Thanks for choosing [business name]. If you would like to share your experience, you can leave a Google review here: [review link]. We appreciate your honest feedback.",
        },
        {
            type: "warning",
            text: "Google currently prohibits offering incentives for reviews and selectively requesting positive reviews (see https://support.google.com/contributionpolicy/answer/7400114). Provide the same opportunity to review regardless of satisfaction. Private support can help resolve problems, but it should not replace or restrict access to the public review link.",
        },
        { type: "h2", text: "Make review requests part of your routine" },
        {
            type: "p",
            text: "Zyene Reviews helps businesses and agencies organize [review request campaigns](/features/review-campaigns) by SMS, email, and QR code, showcase feedback with [Google review widgets](/features/review-widgets), and prepare replies (drafts are reviewed before posting). Start with a tested link and a consistent, honest request process before adding automation."
        },
        { type: "cta", ctaLabel: "Explore review collection with Zyene Reviews", ctaHref: "/features/review-collection" },
        {
            type: "cta",
            ctaLabel: "Try Zyene Reviews free for 7 days — automated review requests, private feedback routing, and AI replies.",
            ctaHref: SIGNUP_URL,
            ctaTrackLocation: "how-to-get-a-google-review-link",
            ctaButtonText: "Start Free Trial",
        },
    ],
};

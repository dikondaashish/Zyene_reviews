import type { BlogPost } from "@/lib/content/blog-types";

export const post16: BlogPost = {
    slug: "how-to-get-a-google-review-link",
    title: "How to Get a Google Review Link and QR Code (2026)",
    excerpt:
        "Find your business's Google review link, download a free QR code, and test it before sharing it with customers. Includes steps for agencies managing multiple locations.",
    pillar: "google-reviews",
    pillarLabel: "Google Reviews",
    publishedAt: "2026-09-08",
    dateModified: "2026-09-29",
    readMinutes: 6,
    author: { name: "Jamie Rivera", role: "Product Marketing" },
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
            answer: "Use the official review link and let customers choose their own rating. Ask for honest feedback without incentives, pressure, or filtering invitations by satisfaction. Google prohibits selectively soliciting positive reviews.",
        },
        {
            question: "Do customers need a Google account to leave a review?",
            answer: "Yes. Customers must sign into a Google account to publish a review. They can create a Google account with an existing non-Gmail email address.",
        },
        {
            question: "Can I create a Google review QR code for free?",
            answer: "Yes. On a computer, open your Business Profile, choose Read reviews, then Get more reviews. Right-click the QR code and save the image. Scan it before printing to confirm it opens the correct business's review flow.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "To get your Google review link, open your Business Profile while signed into its manager account. Choose Read reviews, then Get more reviews, and copy the link. Some profiles also show an Ask for reviews shortcut. On a computer, you can save the QR code from the same panel.",
        },
        {
            type: "p",
            text: "A direct review link gives customers a clear route to your business's review form. It avoids asking them to search for your name and choose the correct location. Invite honest feedback from customers regardless of whether their experience was positive or negative.",
        },
        { type: "h2", text: "Copy your review link from Google Business Profile" },
        {
            type: "ol",
            items: [
                "Sign into the Google account that owns or manages your Business Profile.",
                "Search for your business name on Google and confirm the name and location in the management panel.",
                "Choose Read reviews, then Get more reviews. If you see Ask for reviews, that shortcut opens the sharing panel too.",
                "Copy the review link. Save it with the location name so your team uses the correct link in future requests.",
            ],
        },
        {
            type: "tip",
            text: "Test the copied link in a private browser window. Confirm the business name and location. A Google sign-in prompt is normal for customers who are signed out; do not submit a test review of your own business.",
        },
        { type: "h2", text: "Download a free Google review QR code" },
        {
            type: "p",
            text: "Google provides a QR code in the Get more reviews panel on computer browsers. Right-click the code and save the image. You do not need a paid QR-code service for this basic review link.",
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
        { type: "h2", text: "Agencies: keep a separate link for each client location" },
        {
            type: "p",
            text: "Create a simple register with the client name, location, review link, manager contact, and last test date. Get each link from the relevant profile manager. Test the destination before adding it to a campaign, especially after a move or profile merge. Never reuse one client's link for another location.",
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
        { type: "h2", text: "Share the link without pressuring customers" },
        {
            type: "ul",
            items: [
                "Email or receipt: Include a short invitation after a genuine customer interaction.",
                "Text message: Use the customer's appropriate messaging consent and respect their opt-out preferences.",
                "QR card: Make the code easy to scan and let customers choose whether and what to write.",
            ],
        },
        {
            type: "quote",
            text: "Thanks for choosing [business name]. If you would like to share your experience, you can leave a Google review here: [review link]. We appreciate your honest feedback.",
        },
        {
            type: "warning",
            text: "Google prohibits offering incentives for reviews and selectively requesting positive reviews. Provide the same opportunity to review regardless of satisfaction. Private support can help resolve problems, but it should not replace or restrict access to the public review link.",
        },
        { type: "h2", text: "Make review requests part of your routine" },
        {
            type: "p",
            text: "Zyene Reviews helps businesses and agencies organize review requests by SMS, email, and QR code, monitor feedback, and prepare replies. Start with a tested link and a consistent, honest request process before adding automation.",
        },
        { type: "cta", ctaLabel: "Explore review collection with Zyene Reviews", ctaHref: "/features/review-collection" },
    ],
};

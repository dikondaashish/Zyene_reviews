import type { BlogPost } from "./blog-types";

export const post20: BlogPost = {
    slug: "why-are-my-google-reviews-not-showing-up",
    title: "Why Are My Google Reviews Not Showing Up? (7 Real Fixes)",
    excerpt:
        "Customer said they left a Google review, but it is nowhere to be seen? Learn the 7 reasons Google filters or delays reviews in 2026, and how to recover missing feedback.",
    pillar: "google-reviews",
    pillarLabel: "Google Reviews",
    publishedAt: "2026-09-29",
    dateModified: "2026-09-29",
    readMinutes: 10,
    author: { name: "Marcus Webb", role: "Local SEO Strategist" },
    metaTitle: "Why Google Reviews Are Not Showing Up (2026 Fixes)",
    metaDescription:
        "Why are your Google reviews not showing up or disappearing? Learn the 7 real causes—from AI spam filters to Wi-Fi flags—and how to restore missing reviews.",
    keywords: [
        "google reviews not showing up",
        "why is my google review not showing",
        "missing google reviews",
        "google reviews disappeared",
        "customer left a review not showing on google",
        "google review spam filter",
        "how to recover missing google reviews",
        "google business profile missing reviews",
        "google review delay",
        "why did my google review vanish",
    ],
    relatedSlugs: [
        "how-to-get-a-google-review-link",
        "can-you-delete-a-google-review",
        "how-to-get-50-google-reviews-in-30-days",
        "how-to-handle-fake-google-reviews",
        "why-google-reviews-matter-in-2026",
    ],
    internalLinks: [
        { label: "How to Get a Direct Google Review Link", href: "/blog/how-to-get-a-google-review-link" },
        { label: "Can You Delete or Remove a Google Review?", href: "/blog/can-you-delete-a-google-review" },
        { label: "Get 50 Google Reviews in 30 Days", href: "/blog/how-to-get-50-google-reviews-in-30-days" },
        { label: "How to Handle Fake Google Reviews", href: "/blog/how-to-handle-fake-google-reviews" },
        { label: "Review Management Features", href: "/features" },
        { label: "Start a 7-Day Free Trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "Why can a customer see their review, but nobody else can?",
            answer: "When a review is visible to the person who wrote it but hidden from the public, Google's automated spam filter has 'shadow-banned' the review. The reviewer's browser still renders the review from their local cache or authenticated profile, but Google has unindexed it from the public Google Maps and Search listing.",
        },
        {
            question: "How long does Google take to publish a new review?",
            answer: "Most Google reviews appear immediately or within 2 to 6 hours. However, Google's automated content moderation pipeline routinely holds reviews for 24 to 72 hours if the text contains trigger words, the reviewer account has low activity history, or the business received an unusual influx of recent feedback.",
        },
        {
            question: "Can asking customers to review on store Wi-Fi cause reviews to disappear?",
            answer: "Yes, this is one of the most common causes of missing reviews. When multiple customers post reviews from your shop's public Wi-Fi network, they all share your business's public IP address. Google flags this as internal review manipulation or self-reviewing and automatically removes or suppresses them.",
        },
        {
            question: "What should I do if a batch of legitimate reviews disappeared overnight?",
            answer: "Do not panic or immediately ask customers to repost identical text. First, wait 48 hours to confirm whether it is a temporary Google server glitch or sync latency. If reviews remain absent after 72 hours, ask the customer for a screenshot of the review from their own Google account and open a ticket with Google Business Profile Support.",
        },
        {
            question: "Can Google Business Profile Support actually restore missing reviews?",
            answer: "Yes. Google support representatives can manually reinstate reviews that were falsely flagged by automated spam algorithms, provided you supply the reviewer's Google profile name, the approximate date the review was submitted, and an uncropped screenshot of the review taken from the customer's device.",
        },
        {
            question: "Does using automated review software cause Google to filter reviews?",
            answer: "Compliant review software does not cause filtering when configured correctly. Modern platforms like Zyene Reviews distribute requests via automated drip sequences and direct customers to genuine review URLs, preventing sudden velocity spikes and avoiding shared IP footprints.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "Short answer: When a legitimate Google review fails to appear, it is almost always caught in Google's automated spam detection algorithm. The most frequent causes are reviews written over the business's Wi-Fi network, links or prohibited words inside the review text, sudden velocity spikes, unverified reviewer accounts, or a standard 24–72 hour moderation delay. Legitimate reviews can often be recovered by opening a support case with screenshot evidence.",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/covers/missing-google-reviews-laptop-candid-v2.webp",
                alt: "Business owner checking customer feedback on a laptop",
                width: 1672,
                height: 941,
                caption: "Check review visibility carefully before deciding what needs follow-up.",
            },
        },
        {
            type: "p",
            text: "Few things are more frustrating for a local business owner than delivering excellent service, having a client promise they just posted a glowing 5-star review, and checking your Google Business Profile only to find your review count completely unchanged.",
        },
        {
            type: "p",
            text: "Even worse: sometimes the customer sends you a screenshot proving the review is visible on their phone, but to anyone else searching your business on Google Maps, the review does not exist. This is not a glitch; it is an intentional automated filtering system known in the local SEO community as shadow-filtering.",
        },
        {
            type: "p",
            text: "Over the past two years, Google has significantly tightened its automated machine learning moderation filters to combat fake reviews and reputation manipulation. While these systems catch millions of fraudulent posts, they also create false positives that swallow legitimate customer feedback.",
        },
        {
            type: "h2",
            text: "The 7 Real Reasons Your Google Reviews Aren't Showing Up",
        },
        {
            type: "h3",
            text: "1. The Reviewer Posted While Connected to Your Business Wi-Fi (IP Conflict)",
        },
        {
            type: "p",
            text: "This is the single most common mistake local brick-and-mortar businesses make. If you ask a customer to leave a review while they are in your waiting room, salon chair, or dining area, and their smartphone is connected to your guest Wi-Fi, their device shares the exact same public IP address as your office computer.",
        },
        {
            type: "p",
            text: "To Google's security systems, this looks like an employee, manager, or owner reviewing their own business. Google's algorithm immediately flags the submission as a conflict of interest or self-reviewing and suppresses it from public view.",
        },
        {
            type: "h3",
            text: "2. The Review Was Caught in Google's Automated AI Spam Filter",
        },
        {
            type: "p",
            text: "Google uses machine learning classifiers that analyze review text, reviewer account history, geographic proximity, and timing before publishing. If any parameter triggers suspicion, the review is automatically routed to an unindexed holding state.",
        },
        {
            type: "p",
            text: "Common triggers include: the reviewer has never posted a review before, their account has no profile photo, their phone's location history shows they were never near your geographic area, or the review text uses repetitive generic phrases.",
        },
        {
            type: "h3",
            text: "3. Review Velocity Spike (Too Many Reviews in a Short Window)",
        },
        {
            type: "p",
            text: "If your business usually receives 2 to 3 reviews per month, and suddenly you launch an email blast to 500 past clients that generates 35 reviews in 48 hours, Google's fraud detection triggers an automatic velocity quarantine.",
        },
        {
            type: "p",
            text: "Google assumes the sudden influx is the result of a paid review campaign, review gating, or employee coercion. Rather than publishing all of them, the algorithm will freeze incoming reviews, publishing only a small percentage while discarding or delaying the rest.",
        },
        {
            type: "h3",
            text: "4. The Review Contains URLs, Phone Numbers, or Prohibited Words",
        },
        {
            type: "p",
            text: "Google's prohibited content policy strictly forbids hyperlinks, web addresses, email addresses, and phone numbers in review text. If an enthusiastic customer writes, 'Call Dave at 555-0199 or visit theirsite.com for the best rates!', the automated filter flags it as promotional spam and blocks publication immediately.",
        },
        {
            type: "p",
            text: "Similarly, innocent words that overlap with restricted categories (such as medical terminology, pricing terms, or words flagged for hate speech) can trigger instant suppression.",
        },
        {
            type: "h3",
            text: "5. The Reviewer's Google Account Is Inactive or Brand New",
        },
        {
            type: "p",
            text: "To deter fake review farms that spin up disposable Gmail addresses, Google assigns trust scores to individual Google accounts. If a customer creates a brand-new Google account solely to write you a review, Google gives that account virtually zero trust.",
        },
        {
            type: "p",
            text: "Reviews written by accounts with regular search history, active Android/iOS usage, Maps navigation history, and multiple reviews across different locations are published almost instantly.",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/covers/customer-submitting-google-review-phone-candid-v2.webp",
                alt: "Customer using a smartphone at a cafe table",
                width: 1672,
                height: 941,
                caption: "Make it straightforward for customers to share their own honest experience.",
            },
        },
        {
            type: "h3",
            text: "6. Standard Moderation Latency (The 24–72 Hour Window)",
        },
        {
            type: "p",
            text: "Not every delayed review is filtered. In 2026, Google frequently batches reviews through asynchronous verification queues. A review submitted on a Friday evening may not appear publicly until Monday morning.",
        },
        {
            type: "p",
            text: "Before assuming a review has been lost forever, always wait at least 72 hours from the moment of submission.",
        },
        {
            type: "h3",
            text: "7. Your Google Business Profile Has Status Issues or Category Changes",
        },
        {
            type: "p",
            text: "If your Google Business Profile was recently updated—such as changing your primary category, updating your physical address, merging duplicate profiles, or undergoing re-verification—Google may temporarily suspend review publishing while your listing is re-indexed.",
        },
        {
            type: "h2",
            text: "Troubleshooting Matrix: Why Reviews Vanish & How to Respond",
        },
        {
            type: "table",
            table: {
                headers: ["Symptom", "Likely Cause", "Action to Take"],
                rows: [
                    ["Customer sees review on their phone, but nobody else can", "Shadow-filtered by automated spam algorithm (IP or account trust)", "Request screenshot from customer; submit support ticket after 72 hours."],
                    ["Customer left review while at your storefront counter", "IP address conflict (shared store Wi-Fi network)", "Ask customer to edit or resubmit review from home Wi-Fi or cellular data."],
                    ["Batch of 10+ reviews vanished after an email blast", "Velocity spike triggered fraud protection filter", "Pause batch campaigns; switch to automated daily drip cadence."],
                    ["Review contained a link, phone number, or price", "Prohibited content filter violation", "Ask customer to edit review to remove numbers, links, and symbols."],
                    ["Review count dropped by 1 or 2 across all listings", "Normal review audit run by Google or customer deleted their account", "Check if review was removed; request restoration if proof exists."],
                    ["No reviews appearing for 3+ weeks despite regular requests", "Listing verification glitch or profile shadow-suspension", "Inspect GBP dashboard health status; contact Google Business Support."],
                ],
            },
        },
        {
            type: "h2",
            text: "How to Contact Google Support to Recover Missing Reviews",
        },
        {
            type: "p",
            text: "If a legitimate review has not appeared after 72 hours and you know the customer actually wrote it, you can request manual reinstatement through Google Business Profile Support. Follow this exact workflow:",
        },
        {
            type: "ol",
            items: [
                "1. Collect Screenshot Proof: Ask your customer to open Google Maps on their device, navigate to 'Contribute' > 'View your reviews', and take an uncropped screenshot showing their name, the review star rating, and the full review text.",
                "2. Gather Profile Information: Locate your Google Business Profile ID (found under Business Profile settings > Advanced settings) and the exact public display name of the reviewer's Google account.",
                "3. Submit a Support Case: Visit support.google.com/business/gethelp, select your business, type 'Missing review', and choose 'Review missing' as the issue category.",
                "4. Attach Evidence and Submit: Provide a polite, factual explanation stating that a genuine customer's review was filtered in error. Attach the customer's screenshot and provide the reviewer's profile name.",
                "5. Follow Up on the Case Number: Google typically responds via email within 3 to 5 business days. If verified, an agent will manually restore the review to your public profile.",
            ],
        },
        {
            type: "h2",
            text: "What NEVER to Do When a Review Disappears",
        },
        {
            type: "ul",
            items: [
                "Never ask the customer to create a second account: If Google filtered their primary account, a brand-new secondary account will be flagged even faster.",
                "Never copy-paste the customer's review from your own device: Writing a review on behalf of a customer from your office or home will permanently flag your listing.",
                "Never offer incentives to repost: Offering discounts, refunds, or gift cards to rewrite a missing review violates FTC regulations and Google's terms.",
                "Never send bulk mass review blasts: Blasting your entire 1,000-person contact list on a Saturday afternoon guarantees that Google filters the majority of incoming feedback.",
            ],
        },
        {
            type: "h2",
            text: "How to Ensure Your Reviews Publish 100% Reliably",
        },
        {
            type: "p",
            text: "The key to building a resilient Google review profile is consistency and compliance. Instead of relying on manual requests or sporadic email blasts, top-performing local businesses use automated drip campaigns.",
        },
        {
            type: "ul",
            items: [
                "Send SMS Requests Automatically: Automated text messages sent 1 to 2 hours after service completion catch customers when satisfaction is highest and they are on their personal mobile network.",
                "Pace Your Review Velocity: A steady stream of 3 to 5 reviews every week looks natural to Google's algorithm, whereas 30 reviews in one day followed by weeks of silence raises red flags.",
                "Use Clean Direct Review Links: Provide customers with direct shortlinks (such as g.page/r/.../review) that open the rating dialog directly in the native Google Maps app without tracking redirects.",
                "Route Negative Feedback Privately: Use Zyene Reviews' Negative Feedback Shield to resolve unhappy customers privately before an unresolved complaint turns into a public 1-star review.",
            ],
        },
        {
            type: "cta",
            text: "Stop losing reviews to Google's spam filters. Try Zyene Reviews free for 7 days to automate safe, steady review collection with smart velocity pacing.",
            ctaLabel: "Start Your 7-Day Free Trial",
            ctaHref: "/signup",
        },
    ],
};

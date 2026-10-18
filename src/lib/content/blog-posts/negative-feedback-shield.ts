import type { BlogPostSource } from "@/lib/content/blog-types";
import { SIGNUP_URL } from "@/config/env";

export const negativeFeedbackShieldPost: BlogPostSource = {
    slug: "negative-feedback-shield",
    title: "Negative Feedback Shield: How It Works for Local Businesses",
    excerpt:
        "How Zyene Reviews’ Negative Feedback Shield adds an optional private channel to your review page while every customer keeps the same public review link.",
    pillar: "reputation-management",
    pillarLabel: "Reputation Management",
    publishedAt: "2026-05-24",
    dateModified: "2026-05-25",
    author: { name: "Karthik", role: "Founder" },
    metaTitle: "Negative Feedback Shield Explained",
    metaDescription:
        "Negative Feedback Shield: an optional private feedback channel next to the public review link every customer gets. How it works for service recovery.",
    keywords: [
        "negative feedback shield",
        "private customer feedback",
        "rating-based feedback workflow",
        "optional private customer feedback channel",
        "zyene reviews shield",
    ],
    relatedSlugs: [
        "how-to-respond-to-a-1-star-review",
        "true-cost-of-bad-online-reputation",
        "birdeye-pricing-breakdown-2026",
        "how-to-get-50-google-reviews-in-30-days",
    ],
    internalLinks: [
        { label: "Free review request template pack (20+ scripts)", href: "/resources/review-request-templates" },
        { label: "Review collection & Shield (product page)", href: "/features/review-collection" },
        { label: "Compare vs Birdeye (Shield included)", href: "/compare/birdeye" },
        { label: "Birdeye pricing vs Zyene Reviews", href: "/blog/birdeye-pricing-breakdown-2026" },
        { label: "Zyene Reviews pricing", href: "/pricing" },
        { label: "Start a 7-day free trial", href: SIGNUP_URL },
    ],
    faqs: [
        {
            question: "What is Negative Feedback Shield in Zyene Reviews?",
            answer:
                "It is an optional private channel on your branded review request page (collectratings.com). Every customer gets the same page and can post a public review. Customers who want to reach your team directly can also send private feedback, and your team is alerted. It is included on paid Zyene Reviews plans.",
        },
        {
            question: "Does Shield keep low-rated customers from posting publicly?",
            answer:
                "No. Every rating sees the public review option. A lower rating also shows the private feedback form, alongside a link to post on Google, so the customer chooses. Zyene does not block, hide, or steer customers away from public reviews.",
        },
        {
            question: "When does a customer see the private feedback form?",
            answer:
                "The private form appears when a customer selects a rating below the threshold you configure, and it always sits next to the link to post publicly. Higher ratings go to the assisted draft step, which also ends with the public review link. The threshold changes which helper the customer sees first, not whether they can post.",
        },
        {
            question: "What does the public-review path measure?",
            answer:
                "A completed request records the customer's handoff from Zyene Reviews to the selected public-review destination. It does not confirm that a provider published a review, and it does not guarantee any rating outcome.",
        },
        {
            question: "How do owners get notified?",
            answer:
                "When private feedback is submitted, it is stored in Zyene Reviews for follow-up alongside your review monitoring alerts. You can respond internally, resolve the issue, and optionally send a later review request after service recovery - outcomes depend on your team and the customer, not automated promises.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "Negative Feedback Shield helps local businesses capture private feedback early and respond faster when a visit did not go well. It is a configurable, rating-based service-recovery workflow.",
        },
        { type: "p", text: "This guide explains the product workflow in plain English. It is for owners comparing Shield to a basic “please review us on Google” text blast or a manual complaint inbox." },
        { type: "warning", text: "Use this workflow with real customers. Do not offer incentives tied to a rating or review text, configure timing and messaging under your business's documented review process, and keep the public review option visible for every rating." },
        { type: "h2", text: "What Negative Feedback Shield Does" },
        {
            type: "summary",
            text: "Shield sits inside review collection on Zyene Reviews. You send SMS, email, or QR requests to a branded page. Every customer can post a public review, and customers who want to reach you directly can also leave private comments.",
        },
        { type: "ul", items: [
            "Collects a self-reported star rating on your business’s review page",
            "Gives every customer the public review link, whatever rating they choose",
            "Offers an assisted draft (tags, editable AI suggestion, Google posting guidance) for higher ratings",
            "Shows an optional private feedback form next to the public link for lower ratings",
            "Records private submissions in Zyene Reviews alongside normal review monitoring alerts",
            "Works with campaigns, QR codes, an inbound webhook (for example a Zapier step), the API, and Square in early access on paid plans",
        ]},
        { type: "h2", text: "Step-by-Step Workflow" },
        {
            type: "summary",
            text: "Five steps from the customer’s tap to owner action. Thresholds are configurable in your dashboard. Every step keeps the public review option available.",
        },
        { type: "warning", text: "Workflow note: Shield is an extra way for customers to reach you, not a filter. Keep the public review link visible for every rating, and keep customer-facing copy and timing aligned with your documented process." },
        { type: "ol", items: [
            "Customer receives your review request (SMS, email, or QR) and opens your branded collectratings.com page.",
            "Customer selects a star rating for their experience after opening the campaign's branded page.",
            "If the rating meets your threshold: they can use optional tags and an editable AI suggestion, then post their own review on Google if they choose.",
            "If the rating is below your threshold: they see an optional private feedback form (comment box, optional contact fields) next to a link to post on Google. They can do either or both.",
            "You are notified through Zyene Reviews (private feedback record plus your normal review monitoring). Resolve the issue and use your normal follow-up process when appropriate.",
        ]},
        { type: "quote", text: "Workflow diagram (conceptual example)\n\nReview request sent\n    ↓\nCustomer rates their experience (1-5 stars)\n    ↓\n┌────────────────────────────┬─────────────────────────────┐\n│ Meets your threshold       │ Below your threshold        │\n│ Assisted draft + Google    │ Private form + Google link  │\n│ review link                │ (customer chooses)          │\n└────────────────────────────┴─────────────────────────────┘\n\nExample product flow only. A Google handoff does not confirm a published review." },
        { type: "h2", text: "What You See in Zyene Reviews" },
        {
            type: "summary",
            text: "The editorial photo above illustrates the human side of private feedback: listen carefully, respond quickly, and use the product workflow to keep the next step organized.",
        },
        { type: "p", text: "Private submissions are stored for your team to read and act on - similar to handling a direct complaint, tied to the same campaign where you use public review assistance." },
        { type: "h2", text: "How This Differs From Basic Review Requests" },
        {
            type: "summary",
            text: "A plain Google review link sends everyone to the same destination with no structured private channel. Shield keeps that same public link for everyone and adds an optional private channel to reach the owner.",
        },
        { type: "ul", items: [
            "Basic SMS review request: one public link; you may only hear about problems after a post goes live.",
            "Manual complaint handling: reactive - often after damage is visible on Google or social.",
            "Negative Feedback Shield: the same public link for everyone, plus an optional private form and owner alert, built for organized service recovery.",
        ]},
        { type: "h2", text: "Comparison Table" },
        {
            type: "summary",
            text: "Typical workflows for planning - not guarantees about response time, ratings, provider outcomes, or business results.",
        },
        { type: "table", table: {
            headers: ["Approach", "Who gets asked", "When experience was poor", "Owner visibility", "Typical fit"],
            rows: [
                ["Basic SMS review request", "Anyone with a link", "Usually only via public Google post", "You learn after a public post", "Simple volume plays"],
                ["Manual complaint handling", "Customers who reach out", "Email, phone, or front desk - unstructured", "Inbox or manager memory", "Very small teams"],
                ["Zyene Negative Feedback Shield", "Customers in your campaign", "Public link plus an optional private form", "Alert + private feedback queue", "Owners who want faster issue resolution"],
            ],
        }},
        { type: "h2", text: "Honest Limits (What Shield Is Not)" },
        {
            type: "summary",
            text: "Shield helps you respond sooner when customers use your branded flow - it does not delete bad Google reviews, guarantee five stars, replace fixing service issues, or substitute for public review responses you already owe customers.",
        },
        { type: "ul", items: [
            "Not a guarantee of provider approval or a published review.",
            "Not a way to predict or ensure a particular rating.",
            "Not a replacement for responding to public reviews you already have.",
            "Not a substitute for your business's documented review process.",
            "Not legal advice; consult your counsel for regulated industries (e.g., healthcare marketing rules).",
        ]},
        { type: "h2", text: "Where Shield Fits in Zyene Reviews Plans" },
        {
            type: "summary",
            text: "Shield is part of review collection on paid plans alongside SMS/email requests and QR codes. Public pricing is on /pricing; feature detail is on /features/review-collection.",
        },
        { type: "p", text: "If you are comparing enterprise tools, see /compare/birdeye and the Birdeye pricing breakdown for total cost context - list prices only, not your signed contract." },
        { type: "h2", text: "Next Steps for Local Businesses" },
        { type: "ol", items: [
            "Read /features/review-collection for campaign setup and Shield settings.",
            "Set your star threshold and branded review page copy in the dashboard.",
            "Run a 7-day trial at /signup and send a small test campaign to your team first.",
            "Train staff: private feedback is for resolution and service recovery, with clear ownership for follow-up.",
        ]},
        { type: "cta", ctaLabel: "Try review collection with Shield →", ctaHref: SIGNUP_URL },
        { type: "cta", ctaLabel: "See review collection features →", ctaHref: "/features/review-collection" },
    ],
};

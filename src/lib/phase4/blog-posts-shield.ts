/**
 * Blog post — Negative Feedback Shield deep-dive (Phase 3 asset).
 */

import type { BlogPost } from "./blog-types";

export const post13: BlogPost = {
    slug: "negative-feedback-shield",
    title: "Negative Feedback Shield: How It Works for Local Businesses",
    excerpt:
        "A plain-English walkthrough of Zyene Reviews’ Negative Feedback Shield—how ratings split between public Google reviews and private owner follow-up, with compliance notes for honest feedback.",
    pillar: "reputation-management",
    pillarLabel: "Reputation Management",
    publishedAt: "2026-05-24",
    dateModified: "2026-05-24",
    readMinutes: 11,
    author: { name: "Jamie Rivera", role: "Product Marketing" },
    metaTitle: "Negative Feedback Shield Explained",
    metaDescription:
        "How Zyene Reviews Negative Feedback Shield works: rating step, private feedback for low scores, owner alerts, and how it differs from basic SMS review requests—without review gating.",
    keywords: [
        "negative feedback shield",
        "private review feedback",
        "review gating vs private feedback",
        "route bad reviews privately",
        "zyene reviews shield",
    ],
    relatedSlugs: [
        "how-to-respond-to-a-1-star-review",
        "true-cost-of-bad-online-reputation",
        "birdeye-pricing-breakdown-2026",
        "how-to-get-50-google-reviews-in-30-days",
    ],
    internalLinks: [
        { label: "Review collection & Shield (product page)", href: "/features/review-collection" },
        { label: "Compare vs Birdeye (Shield included)", href: "/compare/birdeye" },
        { label: "Birdeye pricing vs Zyene Reviews", href: "/blog/birdeye-pricing-breakdown-2026" },
        { label: "Zyene Reviews pricing", href: "/pricing" },
        { label: "Start a 7-day free trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "What is Negative Feedback Shield in Zyene Reviews?",
            answer:
                "It is the routing layer on your branded review request page (collectratings.com): after a customer picks a star rating, scores at or above your threshold continue toward a public Google review flow; lower scores open a private feedback form for your team first. It is included on paid Zyene Reviews plans.",
        },
        {
            question: "Is Negative Feedback Shield the same as review gating?",
            answer:
                "No. Review gating usually means only asking happy customers to review or blocking unhappy customers from posting publicly. Zyene Reviews asks customers to rate their experience, then routes based on that self-reported score. Businesses should still invite honest feedback and follow platform policies—see the compliance section on this page.",
        },
        {
            question: "What star rating sends customers to private feedback?",
            answer:
                "By default, businesses often use four or five stars as the threshold for the public Google path (configurable in review page settings). One- to three-star selections typically land on the private feedback step so the owner can respond before more public damage.",
        },
        {
            question: "Can an unhappy customer still leave a public Google review?",
            answer:
                "The private path is designed for resolution first, not to hide legitimate criticism. Depending on your page settings, a link to Google may still be available on the private feedback screen. Zyene Reviews does not promise that Google will remove reviews or endorse this workflow—follow Google’s review policies for your business.",
        },
        {
            question: "How do owners get notified?",
            answer:
                "When private feedback is submitted, it is stored in Zyene Reviews for follow-up alongside your review monitoring alerts. You can respond internally, resolve the issue, and optionally send a later review request after service recovery—without inventing automated outcomes.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "Negative Feedback Shield is Zyene Reviews’ workflow for branded review requests: customers rate their visit, happy paths move toward Google, and lower scores open a private message to the business first. It helps local owners fix problems before a one-star post—not a substitute for honest reviews or platform rules.",
        },
        { type: "p", text: "This guide explains the product workflow in plain English. It is for owners comparing Shield to a basic “please review us on Google” text blast or a manual complaint inbox." },
        { type: "warning", text: "Compliance note: Ask customers honestly about their experience. Do not suppress legitimate public criticism, cherry-pick only promoters for reviews, or offer incentives tied to star ratings. Zyene Reviews routes feedback based on what the customer selects—it does not guarantee Google approval of any particular practice. Follow Google and FTC guidance for your industry." },
        { type: "h2", text: "What Negative Feedback Shield Does" },
        {
            type: "summary",
            text: "Shield sits inside review collection on Zyene Reviews. You send SMS, email, or QR requests to a branded page; the customer rates their experience; the product branches the journey instead of sending everyone straight to Google with the same link.",
        },
        { type: "ul", items: [
            "Collects a self-reported star rating on your business’s review page",
            "Routes higher ratings into your public review assistance flow (tags, AI draft, Google posting step)",
            "Routes lower ratings into a private feedback form for your team",
            "Records the outcome in Zyene Reviews so you can follow up alongside normal review alerts",
            "Works with campaigns, QR codes, and automation triggers (e.g., POS or Zapier) on paid plans",
        ]},
        { type: "h2", text: "Step-by-Step Workflow" },
        {
            type: "summary",
            text: "Five steps from the customer’s tap to owner action. Thresholds are configurable; many businesses default to four stars and above for the public path.",
        },
        { type: "ol", items: [
            "Customer receives your review request (SMS, email, or QR) and opens your branded collectratings.com page.",
            "Customer selects a star rating for their experience.",
            "If the rating meets your threshold (commonly 4–5 stars): they continue toward the public review flow—optional tags, AI-assisted draft, then guidance to post on Google.",
            "If the rating is below your threshold (commonly 1–3 stars): they see a private feedback form (apology message, comment box, optional contact fields)—not an immediate push to Google.",
            "You are notified through Zyene Reviews (private feedback record plus your normal review monitoring). You resolve the issue; you may send a follow-up request later after service recovery.",
        ]},
        { type: "quote", text: "Workflow diagram (conceptual)\n\nReview request sent\n    ↓\nCustomer rates experience (1–5 stars)\n    ↓\n┌─────────────────────┬──────────────────────────┐\n│ At/above threshold  │ Below threshold          │\n│ (often 4–5★)        │ (often 1–3★)             │\n│ Tags + AI draft     │ Private feedback form    │\n│ → Google review     │ → Owner alert & follow-up│\n└─────────────────────┴──────────────────────────┘\n\nIllustrative product flow—not a performance benchmark." },
        { type: "h2", text: "What You See in Zyene Reviews" },
        {
            type: "summary",
            text: "Marketing visuals below show alert-style UI only—they are not live customer dashboards or verified outcome metrics.",
        },
        { type: "image", image: {
            src: "/marketing/home/alert-robert-hayes.png",
            alt: "Illustrative Zyene Reviews alert for a low-rating review that needs follow-up",
            width: 640,
            height: 240,
            caption: "Illustrative alert UI when urgent feedback needs attention. Actual notifications depend on your plan and notification settings.",
        }},
        { type: "image", image: {
            src: "/marketing/home/alert-emily-carter.png",
            alt: "Illustrative Zyene Reviews alert for a positive five-star review",
            width: 640,
            height: 240,
            caption: "Illustrative alert UI for a positive public review path. Pair with review monitoring on /features/review-collection.",
        }},
        { type: "p", text: "Private submissions are stored for your team to read and act on—similar to handling a direct complaint, but tied to the same campaign that also drives public reviews." },
        { type: "h2", text: "How This Differs From Basic Review Requests" },
        {
            type: "summary",
            text: "A plain Google review link treats every customer the same. Shield adds a branch: recovery first for low scores, amplification for high scores—without replacing your obligation to run the business well.",
        },
        { type: "ul", items: [
            "Basic SMS review request: one link to Google; unhappy customers may post publicly before you hear the problem.",
            "Manual complaint handling: reactive—often after damage is visible on Google or social.",
            "Negative Feedback Shield: proactive routing at the moment of feedback, private channel for low scores, public path for promoters—inside one branded flow.",
        ]},
        { type: "h2", text: "Comparison Table" },
        {
            type: "summary",
            text: "Use this when evaluating tools. Rows describe typical workflows—not guarantees about your staff response time or rating outcomes.",
        },
        { type: "table", table: {
            headers: ["Approach", "Who gets asked", "Low-score experience", "Owner visibility", "Typical fit"],
            rows: [
                ["Basic SMS review request", "Anyone with a link", "Same Google link as promoters", "You learn after a public post", "Simple volume plays"],
                ["Manual complaint handling", "Customers who complain", "Email, phone, or front desk—unstructured", "Inbox or manager memory", "Very small teams"],
                ["Zyene Negative Feedback Shield", "Customers in your campaign", "Private form first (configurable threshold)", "Alert + private feedback queue", "Owner-operators growing Google reviews"],
            ],
        }},
        { type: "h2", text: "Honest Limits (What Shield Is Not)" },
        {
            type: "summary",
            text: "Shield reduces avoidable public one-stars when customers use your flow—it does not delete bad Google reviews, guarantee five stars, or replace fixing service issues.",
        },
        { type: "ul", items: [
            "Not a promise of Google policy approval for your business model—check current Google review policies yourself.",
            "Not a replacement for responding to public reviews you already have.",
            "Not an excuse to survey only happy customers; ethical use means inviting real customers and improving operations.",
            "Not a legal compliance package—consult your counsel for regulated industries (e.g., healthcare marketing rules).",
        ]},
        { type: "h2", text: "Where Shield Fits in Zyene Reviews Plans" },
        {
            type: "summary",
            text: "Shield is part of review collection on paid plans alongside SMS/email requests and QR codes. Public pricing is on /pricing; feature detail is on /features/review-collection.",
        },
        { type: "p", text: "If you are comparing enterprise tools that lack an equivalent private routing step, see /compare/birdeye and the Birdeye pricing breakdown for total cost context—list prices only, not your signed contract." },
        { type: "h2", text: "Next Steps for Local Businesses" },
        { type: "ol", items: [
            "Read /features/review-collection for campaign setup and Shield settings.",
            "Set your star threshold and branded review page copy in the dashboard.",
            "Run a 7-day trial at /signup and send a small test campaign to your team first.",
            "Train staff: private feedback is a save-the-relationship channel, not a way to hide criticism.",
        ]},
        { type: "cta", ctaLabel: "Try Negative Feedback Shield on Zyene Reviews →", ctaHref: "/signup" },
        { type: "cta", ctaLabel: "See review collection features →", ctaHref: "/features/review-collection" },
    ],
};

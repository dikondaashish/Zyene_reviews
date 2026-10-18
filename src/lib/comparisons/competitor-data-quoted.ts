import type { CompetitorEntry } from "@/lib/comparisons/competitor-data";

/** Birdeye and Podium sell by quote; facts and sources live in competitor-facts-quoted.ts. */
export const birdeyeComparison: CompetitorEntry = {
    slug: "birdeye",
    name: "Birdeye",
    keyAngle: "A multi-product suite sold by quote vs a review-only tool with published prices.",
    heroSub: "Birdeye bundles reviews with listings, surveys, webchat and payments under one quoted contract. Zyene Reviews does reviews only, at published prices.",
    metaTitle: "Birdeye Alternative: Zyene vs Birdeye (2026)",
    metaDescription: "Birdeye sells a quoted suite; Zyene Reviews is review-only from $29.99/mo. Compare pricing, reply automation, listings and integrations, with sources.",
    targetKeywords: ["birdeye alternative", "birdeye alternatives", "zyene vs birdeye", "alternatives to birdeye", "birdeye competitors"],
    openingSummary: "Birdeye is a suite: reviews, listings, surveys, webchat and payments on one contract, priced by quote for each location. Zyene Reviews covers the review part only, with published monthly prices from $29.99. If you mainly need review requests, a shared inbox and AI-assisted replies, compare a written Birdeye quote for the same locations against Zyene's pricing page.",
    pickCompetitorInstead: "Pick Birdeye if you want listings, surveys, webchat and payments from one vendor, and a quoted per-location contract suits your budget.",
    whoShouldUseCompetitor: [
        "Multi-location brands that want listings sync across Google, Apple, Bing, Facebook and Yelp",
        "Teams that need surveys, webchat or payments from the same vendor",
        "Buyers who need native connectors to tools like QuickBooks, Xero or Zoho CRM",
    ],
    whoShouldUseZyene: [
        "Owners who want review requests, a review inbox and replies without buying a suite",
        "Teams that want to see the price before talking to sales",
        "Businesses that can trigger requests from a webhook, the API or Square (early access)",
    ],
    visual: {
        key: "auto-reply-rules",
        title: "You decide which reviews get an automatic reply",
        caption: "Birdeye's reply agent can post on its own. In Zyene, automatic replies cover new Google reviews at or above the star rating you set; everything else waits for a person.",
    },
    switching: {
        intro: "Most of the work is rebuilding triggers, not moving reviews.",
        steps: [
            "Check your Birdeye renewal date and notice period before you cancel anything.",
            "Ask Birdeye for a customer contact export, then import the CSV into Zyene. Only import contacts who agreed to hear from you.",
            "Connect Google Business Profile, Facebook and Yelp. Reviews sync from those platforms, so you don't need to export them from Birdeye.",
            "Rebuild request triggers with a webhook (for example a Zapier step) or the REST API, and test one location first.",
            "Stop Birdeye requests before Zyene's start, so no customer gets asked twice.",
        ],
    },
    relatedPillars: ["automatic-review-replies", "local-seo", "review-monitoring"],
    guides: [
        { label: "Birdeye pricing breakdown and quote checklist", href: "/blog/birdeye-pricing-breakdown-2026" },
        { label: "Birdeye alternatives compared", href: "/blog/birdeye-alternatives-for-local-businesses" },
    ],
    faqs: [
        { question: "How much does Birdeye cost compared with Zyene Reviews?", answer: "Birdeye does not publish prices. Its pricing page asked for a business email and location count when we checked on October 17, 2026. Zyene Reviews Starter is $29.99/month for one location and Professional is $59.99/month for up to three. Ask Birdeye for a written quote with the same locations and sending volume." },
        { question: "Does Zyene Reviews manage business listings like Birdeye?", answer: "No. Birdeye lists native listings management for Google, Facebook, Apple, Yelp and Bing. Zyene Reviews does not edit listings; it shows Google Business Profile insights and the search terms customers used. If listings sync matters, Birdeye or a dedicated listings tool is the better fit." },
        { question: "Can both tools reply to reviews automatically?", answer: "Birdeye says its reply agent can post on its own or hold replies for approval. Zyene Reviews drafts replies for you to approve and can optionally publish automatic replies to new Google reviews at or above a star rating you choose. You confirm before automatic publishing starts and can turn it off anytime." },
        { question: "Does Zyene Reviews connect to the same software as Birdeye?", answer: "Probably not. Birdeye lists over 3,000 integrations. Zyene Reviews triggers requests from a webhook, such as a Zapier step, or its REST API, and Square is in early access. Test your exact trigger before you switch." },
        { question: "Do I lose my review history if I leave Birdeye?", answer: "Your public reviews belong to Google, Facebook and Yelp, not to Birdeye. After you connect those platforms, Zyene Reviews syncs reviews from them directly. Ask Birdeye what other data, such as survey results or contacts, your contract lets you export." },
    ],
    accentColor: "blue",
};

export const podiumComparison: CompetitorEntry = {
    slug: "podium",
    name: "Podium",
    keyAngle: "A texting, phones and payments platform vs a tool built only for reviews.",
    heroSub: "Podium runs customer texting, phones and payments, with reviews collected by text. Zyene Reviews is only for reviews, with prices on the website.",
    metaTitle: "Podium Alternative: Zyene vs Podium (2026)",
    metaDescription: "Podium covers texting, phones and payments; Zyene Reviews focuses on reviews from $29.99/mo. Compare pricing, AI replies and review requests, with sources.",
    targetKeywords: ["podium alternative", "podium vs birdeye", "zyene vs podium", "podium pricing", "podium cost"],
    openingSummary: "Podium is a customer communication platform: an inbox, website chat, text marketing, phones and payments, with review requests sent by text. Zyene Reviews does one job, reviews, with published prices from $29.99 a month. If you already rely on Podium for phones or payments, keep it. If reviews are the job you are paying for, compare like for like.",
    pickCompetitorInstead: "Pick Podium if your team lives in a shared texting inbox and also needs phones and payments; reviews are one part of that.",
    whoShouldUseCompetitor: [
        "Teams that want calls, texts and webchat in one inbox",
        "Businesses that collect payments by text or card reader",
        "Buyers who want an AI employee for lead follow-up",
    ],
    whoShouldUseZyene: [
        "Owners who mainly need more Google reviews and faster replies",
        "Teams that already have phones and payments and don't want to replace them",
        "Buyers who want AI replies included rather than added on",
    ],
    visual: {
        key: "sms-request",
        title: "Review requests by text, without a phone system",
        caption: "A Zyene review request: pick the customer, choose SMS, email or both, preview it and send. Customers can reply STOP to opt out.",
    },
    switching: {
        intro: "Decide first whether Zyene replaces Podium's review requests only, or runs beside it.",
        steps: [
            "List what you use Podium for today. Zyene replaces review requests and replies, not phones, webchat or payments.",
            "Export customers who agreed to hear from you and import the CSV into Zyene.",
            "Connect Google Business Profile, Facebook and Yelp so reviews arrive in one inbox.",
            "Turn off Podium's review requests before turning on Zyene's, so nobody gets two texts.",
            "Check your Podium contract terms before changing your plan.",
        ],
    },
    relatedPillars: ["review-requests", "ai-replies", "review-collection"],
    guides: [{ label: "Podium pricing vs Zyene Reviews", href: "/blog/podium-pricing-vs-zyene-reviews" }],
    faqs: [
        { question: "What does Podium cost?", answer: "Podium does not publish plan prices. Its pricing page directed buyers to the sales team when we checked on October 17, 2026, and listed the AI Employee as an add-on for any plan. Zyene Reviews Starter is $29.99/month for one location." },
        { question: "Does Zyene Reviews replace Podium's phones, payments or webchat?", answer: "No. Zyene Reviews has no phone system, payment processing or website chat. It handles review requests, a review inbox, AI-assisted replies, private feedback and competitor tracking." },
        { question: "Can Zyene Reviews send review requests by text like Podium?", answer: "Yes. Zyene sends requests by SMS, email, link or QR code. Starter includes 500 SMS and 500 email requests a month. Requests can be sent by hand, from a campaign, from a webhook or API call, or after a Square payment while that integration is in early access." },
        { question: "Are AI replies included?", answer: "On Zyene Reviews, AI reply drafts and optional automatic Google replies are included on Starter. Podium lists its AI Employee as an add-on; ask Podium what it covers for review replies." },
        { question: "Can I keep Podium and use Zyene Reviews for reviews?", answer: "Yes, as long as only one tool sends review requests. Customers asked twice are more likely to opt out." },
    ],
    accentColor: "blue",
};

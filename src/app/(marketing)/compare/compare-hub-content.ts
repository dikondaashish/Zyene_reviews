import type { FaqItem } from "@/components/seo/json-ld";

/** 50–70 word GEO opening summary for /compare hub. */
export const COMPARE_HUB_OPENING_SUMMARY =
    "Choose Zyene Reviews when you want a review-alert-driven, AI-assisted stack for local Google reputation—Shield, competitor tracking, and public pricing from $29.99/mo without an enterprise contract. Choose Birdeye, Podium, NiceJob, or GatherUp when you need broader CX, messaging and payments, social-proof marketing, or deep survey programs. This hub compares all five honestly.";

export const COMPARE_HUB_BUYER_GUIDES: { title: string; body: string; pick?: string }[] = [
    {
        title: "Solo / small local business",
        body: "You need fast review alerts, simple campaigns, and help replying—not a company-wide CX rollout. Favor tools with self-serve setup and month-to-month billing.",
        pick: "Zyene Reviews, NiceJob, or GatherUp depending on whether you want review-first ops vs marketing/survey depth.",
    },
    {
        title: "Growing multi-location business",
        body: "You need consistent monitoring across sites, but may not have enterprise IT. Compare per-location fees, contract terms, and whether AI replies and private feedback routing are included on standard tiers.",
        pick: "Zyene Reviews for review-first ops; Birdeye or Podium if you also standardize messaging or payments everywhere.",
    },
    {
        title: "Enterprise / multi-department team",
        body: "You likely need webchat, ticketing, surveys, CRM integrations, and vendor success managers—not just Google review workflows.",
        pick: "Birdeye or Podium; treat Zyene Reviews as a focused review layer unless you are standardizing on a lighter stack.",
    },
    {
        title: "Review-focused buyer",
        body: "Your KPI is Google rating, response rate, and review velocity—not inbox payments. Prioritize monitoring, AI-assisted replies, fair review requests, and optional private feedback capture.",
        pick: "Zyene Reviews; read /blog/negative-feedback-shield for Shield compliance positioning.",
    },
    {
        title: "Messaging / payment-focused buyer",
        body: "You measure success by conversations converted and payments collected. Review features are secondary to texting, webchat, and checkout flows.",
        pick: "Podium; pair with a review specialist only if your team still struggles with Google reputation.",
    },
];

export const COMPARE_HUB_RESOURCE_LINKS: { label: string; href: string }[] = [
    { label: "Zyene vs Birdeye", href: "/compare/birdeye" },
    { label: "Zyene vs Podium", href: "/compare/podium" },
    { label: "Zyene vs NiceJob", href: "/compare/nicejob" },
    { label: "Zyene vs GatherUp", href: "/compare/gatherup" },
    { label: "Birdeye pricing breakdown (2026)", href: "/blog/birdeye-pricing-breakdown-2026" },
    { label: "Negative Feedback Shield guide", href: "/blog/negative-feedback-shield" },
    { label: "Zyene Reviews pricing", href: "/pricing" },
    { label: "Start free trial", href: "/signup" },
];

export const COMPARE_HUB_FAQS: FaqItem[] = [
    {
        question: "Which Birdeye alternative is best for small businesses?",
        answer:
            "For review-first owner-operators, Zyene Reviews is built for small local businesses: alerts, AI-assisted replies, Negative Feedback Shield, and competitor tracking on paid plans with public pricing from $29.99/mo. NiceJob fits marketing-heavy SMBs; GatherUp fits survey-heavy programs. Birdeye and Podium are usually more than a one-location shop needs unless you want full CX or messaging suites.",
    },
    {
        question: "Is Zyene Reviews cheaper than Birdeye or Podium?",
        answer:
            "Zyene Reviews publishes plans from $29.99/mo month-to-month. Birdeye and Podium are commonly quoted well above that, often on annual contracts—but pricing can vary by package, contract terms, and location count; confirm with each vendor. See /blog/birdeye-pricing-breakdown-2026 for a Birdeye line-item checklist, not a guaranteed quote.",
    },
    {
        question: "Does Zyene replace Podium?",
        answer:
            "No. Podium is stronger for texting, webchat, and payments. Zyene Reviews replaces the review-management slice—monitoring, requests, AI replies, Shield, and competitor tracking—without being a full communications and payments platform.",
    },
    {
        question: "What is the simplest review management option?",
        answer:
            "For a straightforward Google-review workflow (connect GBP, send requests, get alerts, draft replies), Zyene Reviews is designed to be self-serve and review-focused. NiceJob is simpler on the marketing side; Birdeye and Podium typically need more onboarding and budget.",
    },
    {
        question: "Which tool is best if I only care about Google reviews?",
        answer:
            "Zyene Reviews centers on Google (plus Facebook and Yelp monitoring), AI-assisted replies, review campaigns, and Shield for private issue resolution. Compare feature-level detail on /compare/birdeye, /compare/podium, /compare/nicejob, and /compare/gatherup before you switch.",
    },
];

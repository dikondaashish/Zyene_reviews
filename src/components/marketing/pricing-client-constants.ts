export const PRICING_FAQS = [
    {
        question: "How does the 7-day free trial work?",
        answer:
            "Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No credit card lock-in, no annual contracts — cancel anytime from your billing settings.",
    },
    {
        question: "What happens at the end of the trial?",
        answer:
            "After 7 days your subscription starts automatically. You'll receive an email reminder 24 hours before your trial ends. Cancel anytime before that and you won't be charged anything.",
    },
    {
        question: "Can I switch plans?",
        answer:
            "Yes — upgrade or downgrade anytime from your billing settings. Upgrades take effect immediately (prorated). Downgrades take effect at the next billing cycle.",
    },
    {
        question: "What counts against my monthly review request limits?",
        answer:
            "Each email or SMS sent to a customer counts as 1 request toward your monthly quota. Shareable link views do not count — only the initial review draft generation step counts against your AI-generated review draft limit.",
    },
    {
        question: "Can I manage multiple locations?",
        answer:
            "The Starter plan covers 1 location. Professional covers up to 3 locations — each with its own independent limits (email requests, SMS, AI replies). Enterprise offers unlimited locations with custom limits.",
    },
    {
        question: "Do you offer annual billing?",
        answer:
            "Yes. Switching to annual billing saves you approximately 17% compared to monthly. Annual plans are billed once per year. You can switch from monthly to annual at any time from billing settings.",
    },
    {
        question: "Is there a free plan?",
        answer:
            "There is no ongoing free tier, but all new accounts get a 7-day full-access trial. After the trial, a paid plan is required to continue using the platform.",
    },
    {
        question: "Can I cancel anytime?",
        answer:
            "Absolutely. Cancel anytime from your billing settings — no cancellation fees, no contracts, no questions asked. Your account stays active until the end of the billing period.",
    },
] as const;

export const COMPARISON_ROWS = [
    { feature: "Starting price (monthly)", zyene: "$29.99/mo", birdeye: "$299/mo", podium: "$399/mo", nicejob: "$75/mo" },
    { feature: "Annual contract required", zyene: false, birdeye: true, podium: true, nicejob: false },
    { feature: "7-day free trial", zyene: true, birdeye: false, podium: false, nicejob: true },
    { feature: "AI reply suggestions", zyene: true, birdeye: "Add-on", podium: "Add-on", nicejob: false },
    { feature: "Auto-commenter (hands-free)", zyene: true, birdeye: false, podium: false, nicejob: false },
    { feature: "Negative Feedback Shield", zyene: true, birdeye: false, podium: false, nicejob: true },
    { feature: "SMS review requests", zyene: true, birdeye: true, podium: true, nicejob: true },
    { feature: "Competitor tracking", zyene: true, birdeye: "Premium tiers", podium: false, nicejob: false },
    { feature: "GBP SEO keyword dashboard", zyene: true, birdeye: "Enterprise", podium: false, nicejob: false },
    { feature: "Developer REST API (included)", zyene: true, birdeye: "Enterprise", podium: "Enterprise", nicejob: false },
    { feature: "Embeddable review widgets", zyene: true, birdeye: true, podium: false, nicejob: true },
] as const;

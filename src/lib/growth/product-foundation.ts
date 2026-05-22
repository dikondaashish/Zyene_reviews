// ─────────────────────────────────────────────────────────────────────────────
// Product Foundation — GROWTH_BLUEPRINT §1
// Single source of truth for pillars, ICP, plans, positioning, and comparisons.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductPillar {
    number: number;
    name: string;
    value: string;
    whyTheyPay: string;
}

export const PRODUCT_PILLARS: ProductPillar[] = [
    {
        number: 1,
        name: "Review Monitoring & Inbox",
        value: "Centralized inbox for Google, Facebook, Yelp. Real-time alerts, sentiment, themes.",
        whyTheyPay: "Never miss a review. Know what customers think before it's too late.",
    },
    {
        number: 2,
        name: "AI-Powered Response",
        value: "One-click AI drafts, auto-commenter, Q&A suggestions.",
        whyTheyPay: "Save 5+ hours/week. Sound professional every time.",
    },
    {
        number: 3,
        name: "Review Collection Engine",
        value: "Branded pages, SMS/email/link campaigns, Negative Feedback Shield, QR codes.",
        whyTheyPay: "Grow from 10 to 100+ reviews. Turn happy customers into Google reviews.",
    },
    {
        number: 4,
        name: "Competitor Intelligence",
        value: "Track competitor ratings, volume, trends, AI briefs, alerts.",
        whyTheyPay: "Know where you stand. React when competitors surge.",
    },
    {
        number: 5,
        name: "Local SEO & GBP Optimization",
        value: "GBP performance, keywords, SEO audit, AI description optimizer, AI visibility (beta).",
        whyTheyPay: "Rank higher in Maps and AI search.",
    },
    {
        number: 6,
        name: "Analytics & Reporting",
        value: "Volume, ratings, sentiment, funnel, PDF/CSV exports.",
        whyTheyPay: "Prove ROI. Show the team what's working.",
    },
    {
        number: 7,
        name: "Customer CRM",
        value: "Tags, segments, timeline, import/export, opt-outs.",
        whyTheyPay: "Target the right customers for review requests.",
    },
    {
        number: 8,
        name: "Multi-Location Management",
        value: "Switch locations, per-location limits, scoped permissions.",
        whyTheyPay: "Manage 1–3+ locations from one login.",
    },
    {
        number: 9,
        name: "Integrations & API",
        value: "Google, Facebook, Yelp, Zapier, REST API, embeddable widgets.",
        whyTheyPay: "Connect existing workflow. Automate everything.",
    },
    {
        number: 10,
        name: "Team Collaboration",
        value: "5–15+ seats, roles, notification preferences.",
        whyTheyPay: "Delegate without losing control.",
    },
];

export const NEGATIVE_FEEDBACK_SHIELD = {
    headline: "Negative Feedback Shield",
    steps: [
        "Customer visits branded review page (collectratings.com/{slug})",
        "Rates experience (emoji/stars/slider)",
        "4–5 stars → redirected to Google to post publicly",
        "1–3 stars → private form; owner gets instant alert",
    ],
    result: "More 5-star public reviews + fewer 1-star surprises.",
    marketingNote:
        "Headline on every marketing page, comparison, and sales conversation.",
} as const;

export const PLAN_COMPARISON_ROWS = [
    { label: "Locations", free: "1", starter: "1", pro: "3", enterprise: "Unlimited" },
    { label: "Email requests/mo", free: "10", starter: "500", pro: "700 × locations", enterprise: "Unlimited" },
    { label: "SMS requests/mo", free: "0", starter: "500", pro: "700 × locations", enterprise: "Unlimited" },
    { label: "Link requests/mo", free: "25", starter: "1,500", pro: "2,000 × locations", enterprise: "Unlimited" },
    { label: "AI replies/mo", free: "0", starter: "1,500", pro: "2,000 × locations", enterprise: "Unlimited" },
    { label: "Team seats", free: "1", starter: "5", pro: "15", enterprise: "Unlimited" },
    { label: "Public review pages", free: "No", starter: "Yes", pro: "Yes", enterprise: "Yes + white-label" },
    { label: "Competitor tracking", free: "No", starter: "Yes", pro: "Yes", enterprise: "Yes" },
    { label: "Developer API", free: "No", starter: "Yes", pro: "Yes", enterprise: "Managed" },
    { label: "7-day free trial", free: "—", starter: "Yes", pro: "Yes", enterprise: "Contact sales" },
] as const;

export const ICP_SEGMENTS = {
    primary: {
        title: "Owner-operators (single location)",
        industries: [
            "Restaurants, cafés, bars",
            "Dental & medical clinics",
            "Auto repair & dealerships",
            "Salons, spas, barbershops",
            "Home services (HVAC, plumbing, cleaning)",
            "Legal & accounting",
            "Fitness studios & gyms",
            "Hotels & vacation rentals",
        ],
    },
    secondary: {
        title: "Small multi-location (2–5)",
        examples: ["Regional restaurant groups", "Dental/medical groups", "Franchise owners"],
    },
    tertiary: {
        title: "Agencies (future / waitlist)",
        examples: ["Reputation agencies managing client GBP"],
    },
} as const;

export const POSITIONING = {
    oneLiner:
        "Enterprise-grade review management and local SEO intelligence for owner-operators — at 1/10th the cost of Birdeye, with no annual contract.",
    pillars: [
        "10× cheaper than enterprise tools — $29.99 vs $299+ (Birdeye) or $399+ (Podium)",
        "Negative Feedback Shield — route bad reviews to private resolution before Google",
        "Local SEO intelligence included on Starter — not locked behind enterprise tiers",
    ],
} as const;

/** Blueprint §2.2 — high-level capability matrix for marketing/compare pages */
export const MARKET_COMPARISON_CAPABILITIES = [
    { capability: "Google/Yelp/FB sync", zyene: true, birdeye: true, podium: true, nicejob: true },
    { capability: "AI reply suggestions", zyene: "Included", birdeye: "Starter+", podium: "Add-on", nicejob: "Pro only" },
    { capability: "Auto-reply bot", zyene: true, birdeye: true, podium: "Limited", nicejob: false },
    { capability: "SMS review requests", zyene: true, birdeye: true, podium: true, nicejob: true },
    { capability: "Negative Feedback Shield", zyene: true, birdeye: "Surveys only", podium: false, nicejob: false },
    { capability: "Competitor tracking", zyene: true, birdeye: "Dominate tier", podium: false, nicejob: "Pro only" },
    { capability: "GBP SEO dashboard", zyene: true, birdeye: true, podium: "Limited", nicejob: false },
    { capability: "AI visibility audit", zyene: "Beta", birdeye: false, podium: false, nicejob: false },
    { capability: "Developer API", zyene: "Included", birdeye: "Enterprise", podium: "Enterprise", nicejob: false },
    { capability: "Annual contract required", zyene: false, birdeye: true, podium: true, nicejob: false },
] as const;

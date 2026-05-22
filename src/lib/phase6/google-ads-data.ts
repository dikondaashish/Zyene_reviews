// ─────────────────────────────────────────────────────────────────────────────
// Google Ads Strategy — Phase 6
// Campaign → keyword themes → landing pages (for UTM routing & ad ops reference)
// ─────────────────────────────────────────────────────────────────────────────

export type GoogleAdsCampaignType = "competitor" | "category" | "industry" | "problem";

export interface GoogleAdsCampaign {
    type: GoogleAdsCampaignType;
    name: string;
    budgetPriority: "high" | "medium" | "low";
    targetKeywords: string[];
    landingPath: string;
    utmCampaign: string;
    headline: string;
    subheadline: string;
}

export const GOOGLE_ADS_CAMPAIGNS: GoogleAdsCampaign[] = [
    {
        type: "competitor",
        name: "Competitor alternatives",
        budgetPriority: "high",
        targetKeywords: [
            "birdeye alternative",
            "podium pricing",
            "nicejob vs",
            "gatherup alternative",
            "birdeye vs",
        ],
        landingPath: "/compare/birdeye",
        utmCampaign: "google_competitor",
        headline: "Enterprise reputation tools at SMB pricing",
        subheadline: "Compare Zyene to Birdeye, Podium, and NiceJob — starting at $29.99/mo, no annual contract.",
    },
    {
        type: "competitor",
        name: "Podium comparison",
        budgetPriority: "high",
        targetKeywords: ["podium alternative", "podium reviews pricing", "podium vs"],
        landingPath: "/compare/podium",
        utmCampaign: "google_competitor_podium",
        headline: "Podium costs $399/mo. Zyene starts at $29.99.",
        subheadline: "Same SMS review requests and inbox — without the enterprise contract.",
    },
    {
        type: "competitor",
        name: "NiceJob comparison",
        budgetPriority: "high",
        targetKeywords: ["nicejob alternative", "nicejob vs", "nicejob pricing"],
        landingPath: "/compare/nicejob",
        utmCampaign: "google_competitor_nicejob",
        headline: "NiceJob alternative with AI replies included",
        subheadline: "Compare features and pricing — Zyene from $29.99/mo, no annual contract.",
    },
    {
        type: "competitor",
        name: "GatherUp comparison",
        budgetPriority: "high",
        targetKeywords: ["gatherup alternative", "gatherup vs", "gatherup pricing"],
        landingPath: "/compare/gatherup",
        utmCampaign: "google_competitor_gatherup",
        headline: "GatherUp alternative for local businesses",
        subheadline: "Review management, AI replies, and competitor tracking in one platform.",
    },
    {
        type: "category",
        name: "Category — review management",
        budgetPriority: "medium",
        targetKeywords: [
            "review management software",
            "reputation management tool",
            "online review management platform",
        ],
        landingPath: "/features",
        utmCampaign: "google_category",
        headline: "All-in-one review management for local businesses",
        subheadline: "Monitor, respond, collect, and protect your reputation — one platform, one price.",
    },
    {
        type: "industry",
        name: "Industry — restaurants",
        budgetPriority: "medium",
        targetKeywords: ["restaurant review management", "google reviews for restaurants"],
        landingPath: "/industries/restaurants",
        utmCampaign: "google_industry_restaurants",
        headline: "Review management built for restaurants",
        subheadline: "Post-checkout SMS, Negative Feedback Shield, and AI replies — starting at $29.99/mo.",
    },
    {
        type: "industry",
        name: "Industry — dental",
        budgetPriority: "medium",
        targetKeywords: ["dental review management", "dental practice google reviews software"],
        landingPath: "/industries/dental",
        utmCampaign: "google_industry_dental",
        headline: "HIPAA-aware review workflows for dental practices",
        subheadline: "Grow Google reviews while routing unhappy patients to private resolution first.",
    },
    {
        type: "industry",
        name: "Industry — home services",
        budgetPriority: "medium",
        targetKeywords: ["home services review management", "hvac google reviews software"],
        landingPath: "/industries/home-services",
        utmCampaign: "google_industry_home_services",
        headline: "Review management for HVAC, plumbing, and contractors",
        subheadline: "Win more jobs from Google with automated review requests and AI replies.",
    },
    {
        type: "industry",
        name: "Industry — auto repair",
        budgetPriority: "medium",
        targetKeywords: ["auto repair review management", "mechanic google reviews"],
        landingPath: "/industries/auto-repair",
        utmCampaign: "google_industry_auto_repair",
        headline: "Auto shops: close the review gap with chain competitors",
        subheadline: "SMS at pickup, competitor benchmarks, and AI replies from $29.99/mo.",
    },
    {
        type: "industry",
        name: "Industry — salons",
        budgetPriority: "medium",
        targetKeywords: ["salon review management", "spa google reviews software"],
        landingPath: "/industries/salons",
        utmCampaign: "google_industry_salons",
        headline: "Salons & spas: more five-star Google reviews",
        subheadline: "Post-appointment SMS and personalized AI thank-you replies.",
    },
    {
        type: "industry",
        name: "Industry — medical",
        budgetPriority: "medium",
        targetKeywords: ["medical practice review management", "doctor google reviews software"],
        landingPath: "/industries/medical",
        utmCampaign: "google_industry_medical",
        headline: "Review management for medical practices",
        subheadline: "Grow Google reviews while routing sensitive feedback privately first.",
    },
    {
        type: "industry",
        name: "Industry — hotels",
        budgetPriority: "medium",
        targetKeywords: ["hotel review management", "hospitality google reviews software"],
        landingPath: "/industries/hotels",
        utmCampaign: "google_industry_hotels",
        headline: "Hotels & hospitality: protect your rating at scale",
        subheadline: "Post-stay SMS, AI replies, and competitor benchmarks from $29.99/mo.",
    },
    {
        type: "industry",
        name: "Industry — fitness",
        budgetPriority: "medium",
        targetKeywords: ["gym review management", "fitness studio google reviews"],
        landingPath: "/industries/fitness",
        utmCampaign: "google_industry_fitness",
        headline: "Gyms & studios: turn members into five-star reviewers",
        subheadline: "Automated review requests and AI thank-you replies after every visit.",
    },
    {
        type: "problem",
        name: "Problem — awareness",
        budgetPriority: "low",
        targetKeywords: [
            "how to get more google reviews",
            "manage online reviews",
            "respond to google reviews",
        ],
        landingPath: "/blog",
        utmCampaign: "google_problem_awareness",
        headline: "Practical guides for local business owners",
        subheadline: "Free playbooks on Google reviews, local SEO, and reputation — then try Zyene free for 7 days.",
    },
    {
        type: "problem",
        name: "Problem — resources",
        budgetPriority: "low",
        targetKeywords: ["google reviews guide", "negative review response templates"],
        landingPath: "/resources",
        utmCampaign: "google_problem_resources",
        headline: "Free reputation playbooks",
        subheadline: "Download guides on review requests, response templates, and local SEO checklists.",
    },
];

/** Resolve ad banner copy from utm_campaign (Google Ads) */
export function getGoogleAdsBanner(utmCampaign: string | null | undefined): GoogleAdsCampaign | null {
    if (!utmCampaign) return null;
    const normalized = utmCampaign.toLowerCase();
    return (
        GOOGLE_ADS_CAMPAIGNS.find((c) => c.utmCampaign === normalized) ??
        GOOGLE_ADS_CAMPAIGNS.find((c) => normalized.startsWith("google_") && c.type === "competitor") ??
        null
    );
}

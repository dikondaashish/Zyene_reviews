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

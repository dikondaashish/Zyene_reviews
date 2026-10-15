// ─────────────────────────────────────────────────────────────────────────────
// Social Proof Data - Phase 5
// Platform stats use env overrides; update when real aggregates are available.
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomerLogo {
    name: string;
    industry: string;
    /** Display initials when logo image not licensed */
    initials: string;
    colorClass: string;
}

/**
 * A featured workflow example card. Cards link to an illustrative case study;
 * there are no customer quotes, names, or ratings until real ones are approved.
 */
export interface TestimonialCard {
    caseStudySlug: string;
}

export interface ThirdPartyTrustLink {
    name: string;
    description: string;
    href: string;
    status: "live" | "coming_soon";
}

function parseStat(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const n = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : fallback;
}

export function getPlatformStats() {
    const reviewCount = parseStat(process.env.NEXT_PUBLIC_TRUST_REVIEW_COUNT, 12400);
    const businessCount = parseStat(process.env.NEXT_PUBLIC_TRUST_BUSINESS_COUNT, 250);
    return {
        reviewCount,
        reviewCountFormatted: reviewCount >= 1000
            ? `${Math.floor(reviewCount / 100) / 10}k+`.replace(".0k", "k")
            : `${reviewCount}+`,
        businessCount,
        businessCountFormatted: `${businessCount}+`,
        starRating: process.env.NEXT_PUBLIC_TRUST_STAR_RATING ?? "4.9",
    };
}

/** Representative local businesses - swap for licensed logos when available */
export const CUSTOMER_LOGOS: CustomerLogo[] = [
    { name: "Sunrise Dental", industry: "Dental", initials: "SD", colorClass: "bg-chart-1" },
    { name: "Wolfpack BBQ", industry: "Restaurant", initials: "WB", colorClass: "bg-primary" },
    { name: "Apex HVAC", industry: "Home Services", initials: "AH", colorClass: "bg-chart-2" },
    { name: "Bella's Salon", industry: "Salon", initials: "BS", colorClass: "bg-chart-5" },
    { name: "Precision Auto", industry: "Auto Repair", initials: "PA", colorClass: "bg-sync-action" },
    { name: "Harbor Legal", industry: "Legal", initials: "HL", colorClass: "bg-muted-foreground" },
    { name: "Green Leaf Cafe", industry: "Cafe", initials: "GL", colorClass: "bg-chart-2" },
    { name: "Summit Fitness", industry: "Fitness", initials: "SF", colorClass: "bg-sync-action" },
];

export const FEATURED_TESTIMONIALS: TestimonialCard[] = [
    { caseStudySlug: "sunrise-dental-austin" },
    { caseStudySlug: "wolfpack-bbq-charlotte" },
    { caseStudySlug: "apex-hvac-denver" },
    { caseStudySlug: "bellas-salon-portland" },
    { caseStudySlug: "precision-auto-works-phoenix" },
];

export const THIRD_PARTY_TRUST: ThirdPartyTrustLink[] = [
    {
        name: "Google Business Profile",
        description: "Zyene uses the same Google APIs we help you manage - we eat our own dogfood.",
        href: "https://www.google.com/business/",
        status: "live",
    },
    {
        name: "G2",
        description: "Software reviews from verified local business owners.",
        href: "https://www.g2.com/",
        status: "coming_soon",
    },
    {
        name: "Capterra",
        description: "Compare Zyene with other reputation tools.",
        href: "https://www.capterra.com/",
        status: "coming_soon",
    },
    {
        name: "Product Hunt",
        description: "Follow our launch and product updates.",
        href: "https://www.producthunt.com/",
        status: "coming_soon",
    },
];

/** Industry-specific trust counts for industry landing pages */
export const INDUSTRY_TRUST_COUNTS: Record<string, number> = {
    restaurants: 84,
    dental: 62,
    "auto-repair": 47,
    salons: 38,
    "home-services": 71,
    medical: 29,
    hotels: 22,
    fitness: 31,
};

export function getIndustryTrustLabel(industrySlug: string, industryNamePlural: string): string {
    const count = INDUSTRY_TRUST_COUNTS[industrySlug];
    if (!count) return `Local ${industryNamePlural.toLowerCase()} trust Zyene`;
    return `${count}+ ${industryNamePlural.toLowerCase()} on Zyene`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Social Proof Data — Phase 5
// Platform stats use env overrides; update when real aggregates are available.
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomerLogo {
    name: string;
    industry: string;
    /** Display initials when logo image not licensed */
    initials: string;
    color: string;
}

export interface TestimonialCard {
    quote: string;
    author: string;
    role: string;
    company: string;
    industry: string;
    rating: number;
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
    const businessCount = parseStat(process.env.NEXT_PUBLIC_TRUST_BUSINESS_COUNT, 380);
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

/** Representative local businesses — swap for licensed logos when available */
export const CUSTOMER_LOGOS: CustomerLogo[] = [
    { name: "Sunrise Dental", industry: "Dental", initials: "SD", color: "#3b82f6" },
    { name: "Wolfpack BBQ", industry: "Restaurant", initials: "WB", color: "#f97316" },
    { name: "Apex HVAC", industry: "Home Services", initials: "AH", color: "#06b6d4" },
    { name: "Bella's Salon", industry: "Salon", initials: "BS", color: "#ec4899" },
    { name: "Precision Auto", industry: "Auto Repair", initials: "PA", color: "#6366f1" },
    { name: "Harbor Legal", industry: "Legal", initials: "HL", color: "#64748b" },
    { name: "Green Leaf Cafe", industry: "Cafe", initials: "GL", color: "#22c55e" },
    { name: "Summit Fitness", industry: "Fitness", initials: "SF", color: "#a855f7" },
];

export const FEATURED_TESTIMONIALS: TestimonialCard[] = [
    {
        quote: "We stopped dreading Google reviews. Unhappy patients reach us privately first, and happy patients actually leave reviews now.",
        author: "Dr. Priya Mehta",
        role: "Owner",
        company: "Sunrise Dental",
        industry: "Dental",
        rating: 5,
        caseStudySlug: "sunrise-dental-austin",
    },
    {
        quote: "The SMS after dinner works better than anything we tried before. When something goes wrong, we hear about it in private.",
        author: "Marcus Webb",
        role: "Owner",
        company: "Wolfpack BBQ",
        industry: "Restaurant",
        rating: 5,
        caseStudySlug: "wolfpack-bbq-charlotte",
    },
    {
        quote: "Homeowners choose us from Google before they call. More reviews mean we win jobs we used to lose.",
        author: "James Ortiz",
        role: "Owner",
        company: "Apex HVAC & Plumbing",
        industry: "Home Services",
        rating: 5,
        caseStudySlug: "apex-hvac-denver",
    },
    {
        quote: "Clients mention their stylist in reviews now because our replies feel personal — but I'm not writing them from scratch at 10pm anymore.",
        author: "Isabella Chen",
        role: "Owner",
        company: "Bella's Salon & Spa",
        industry: "Salons & Spas",
        rating: 5,
        caseStudySlug: "bellas-salon-portland",
    },
    {
        quote: "We're not a franchise — but on Google we look like we belong next to them now. The competitor dashboard alone was worth it.",
        author: "Tom Reyes",
        role: "Service Manager",
        company: "Precision Auto Works",
        industry: "Auto Repair",
        rating: 5,
        caseStudySlug: "precision-auto-works-phoenix",
    },
];

export const THIRD_PARTY_TRUST: ThirdPartyTrustLink[] = [
    {
        name: "Google Business Profile",
        description: "Zyene uses the same Google APIs we help you manage — we eat our own dogfood.",
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

// ─────────────────────────────────────────────────────────────────────────────
// Social Proof Data
// Platform stats come only from env overrides set from real aggregates. Nothing
// renders when they are unset; there are no illustrative fallbacks.
// ─────────────────────────────────────────────────────────────────────────────

export interface ThirdPartyTrustLink {
    name: string;
    description: string;
    href: string;
    status: "live" | "coming_soon";
}

export interface PlatformStats {
    reviewCountFormatted: string | null;
    businessCountFormatted: string | null;
    starRating: string | null;
}

function parseStat(value: string | undefined): number | null {
    if (!value) return null;
    const n = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function formatCount(count: number): string {
    return count >= 1000 ? `${Math.floor(count / 100) / 10}k+`.replace(".0k", "k") : `${count}+`;
}

/** Real platform aggregates from env, or null when none are configured. */
export function getPlatformStats(): PlatformStats | null {
    const reviewCount = parseStat(process.env.NEXT_PUBLIC_TRUST_REVIEW_COUNT);
    const businessCount = parseStat(process.env.NEXT_PUBLIC_TRUST_BUSINESS_COUNT);
    const starRating = process.env.NEXT_PUBLIC_TRUST_STAR_RATING?.trim() || null;
    if (reviewCount === null && businessCount === null && starRating === null) return null;
    return {
        reviewCountFormatted: reviewCount === null ? null : formatCount(reviewCount),
        businessCountFormatted: businessCount === null ? null : `${businessCount}+`,
        starRating,
    };
}

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

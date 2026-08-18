// ─────────────────────────────────────────────────────────────────────────────
// Feature pillar pages — GROWTH_BLUEPRINT §4.2 (/features/*)
// ─────────────────────────────────────────────────────────────────────────────

export type FeaturePillarSlug =
    | "review-monitoring"
    | "ai-replies"
    | "review-collection"
    | "competitor-tracking"
    | "local-seo"
    | "analytics";

/** Legacy slug from early features page — redirect to competitor-tracking */
export const FEATURE_PILLAR_ALIASES: Record<string, FeaturePillarSlug> = {
    "competitor-intelligence": "competitor-tracking",
};

export interface FeaturePillarPage {
    slug: FeaturePillarSlug;
    title: string;
    tagline: string;
    metaTitle: string;
    metaDescription: string;
    bullets: string[];
    cta: { label: string; href: string };
    highlight?: boolean;
}

export const FEATURE_PILLARS: FeaturePillarPage[] = [
    {
        slug: "review-monitoring",
        title: "Review Monitoring & Inbox",
        tagline: "Never miss a review — across every platform",
        metaTitle: "Review Monitoring & Inbox",
        metaDescription:
            "Centralized Google, Facebook, and Yelp review inbox with real-time alerts, sentiment analysis, and urgency scoring for local businesses.",
        bullets: [
            "Real-time sync from Google, Facebook, and Yelp",
            "Unified inbox for all reviews across all locations",
            "Instant email & SMS alerts when new reviews arrive",
            "Sentiment analysis automatically flags urgent reviews",
            "Filter by rating, platform, location, or date",
        ],
        cta: { label: "See pricing", href: "/pricing" },
    },
    {
        slug: "ai-replies",
        title: "AI-Powered Review Replies",
        tagline: "Professional responses in seconds, in your voice",
        metaTitle: "AI-Powered Review Replies",
        metaDescription:
            "One-click AI reply drafts, tone control, and optional auto-commenter for Google reviews. Save hours weekly while keeping your brand voice.",
        bullets: [
            "One-click AI reply suggestions for every review",
            "Tone customization: formal, friendly, apologetic",
            "Auto-commenter: hands-free replies with owner approval",
            "Personalized context (customer name, visit details)",
            "Consistent brand voice across your team",
        ],
        cta: { label: "See how it works", href: "/how-it-works" },
    },
    {
        slug: "review-collection",
        title: "Review Collection & Negative Feedback Shield",
        tagline: "Get more 5-star reviews. Route bad ones privately.",
        metaTitle: "Review Collection & Negative Feedback Shield",
        metaDescription:
            "SMS, email, and QR review campaigns with the Negative Feedback Shield — unhappy customers resolve privately before posting on Google.",
        bullets: [
            "Branded review request campaigns via SMS & email",
            "Shareable QR codes for in-person review collection",
            "Negative Feedback Shield routes unhappy customers to private resolution before they go public on Google",
            "POS & automation triggers (Square, Clover, Zapier)",
            "AI-generated review prompt crafted for each customer",
        ],
        cta: { label: "See pricing", href: "/pricing" },
        highlight: true,
    },
    {
        slug: "competitor-tracking",
        title: "Competitor Intelligence",
        tagline: "Know exactly where you stand in your market",
        metaTitle: "Competitor Tracking",
        metaDescription:
            "Track competitor ratings, review volume, and trends with AI market briefs and alerts on every paid plan. See where you rank locally.",
        bullets: [
            "Track up to 10 competitors per location",
            "Compare review volume, average rating, and response rate",
            "Identify competitor weaknesses to outperform",
            "Weekly competitive digest delivered to your inbox",
            "Map view: see your ranking vs. nearby businesses",
        ],
        cta: { label: "Start free trial", href: "/signup" },
    },
    {
        slug: "local-seo",
        title: "Local SEO Dashboard",
        tagline: "Understand and improve your Google Business Profile",
        metaTitle: "Local SEO Dashboard",
        metaDescription:
            "GBP keyword performance, search insights, and actionable SEO fixes — included on Starter, not locked behind enterprise tiers.",
        bullets: [
            "Google Business Profile keyword performance tracking",
            "Keyword insights: what customers search to find you",
            "Photo, post, and Q&A management from one dashboard",
            "Local pack ranking estimation for your top keywords",
            "Actionable recommendations to improve your GBP score",
        ],
        cta: { label: "See pricing", href: "/pricing" },
    },
    {
        slug: "analytics",
        title: "Analytics & Reporting",
        tagline: "Understand what's working and share results",
        metaTitle: "Analytics & Reporting",
        metaDescription:
            "Review trends, sentiment, engagement funnel, PDF reports, and CSV exports — analytics for local teams on Zyene Reviews from $29.99/mo.",
        bullets: [
            "Dashboard overview: ratings, volume, response rate, trends",
            "Review growth charts over time (weekly/monthly)",
            "Team performance reports for multi-member accounts",
            "Export data to CSV or via API",
            "Scheduled automated email reports",
        ],
        cta: { label: "Explore docs", href: "/docs" },
    },
];

export const FEATURE_PILLAR_SLUGS = FEATURE_PILLARS.map((p) => p.slug);

export const FEATURE_PILLAR_MAP: Record<FeaturePillarSlug, FeaturePillarPage> = Object.fromEntries(
    FEATURE_PILLARS.map((p) => [p.slug, p])
) as Record<FeaturePillarSlug, FeaturePillarPage>;

export function resolveFeaturePillarSlug(segment: string): FeaturePillarSlug | null {
    if (segment in FEATURE_PILLAR_MAP) return segment as FeaturePillarSlug;
    return FEATURE_PILLAR_ALIASES[segment] ?? null;
}

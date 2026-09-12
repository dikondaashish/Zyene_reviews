// ─────────────────────────────────────────────────────────────────────────────
// Feature pillar pages - GROWTH_BLUEPRINT §4.2 (/features/*)
// ─────────────────────────────────────────────────────────────────────────────

export type FeaturePillarSlug =
    | "review-monitoring"
    | "ai-replies"
    | "review-collection"
    | "competitor-tracking"
    | "local-seo"
    | "analytics";

/** Legacy slug from early features page - redirect to competitor-tracking */
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
        tagline: "Keep connected review feedback in one working view",
        metaTitle: "Review Monitoring & Inbox",
        metaDescription:
            "Centralized Google, Facebook, and Yelp review inbox with alerts, sentiment analysis, and filters for local businesses.",
        bullets: [
            "Review sync from Google, Facebook, and Yelp",
            "A working review inbox for your active business location",
            "Email and SMS alerts when new reviews arrive",
            "Sentiment analysis to help surface urgent feedback",
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
            "Draft replies in your voice or automatically reply to new Google reviews. Choose star ratings and a Professional, Friendly, or Concise tone.",
        bullets: [
            "One-click AI reply suggestions for every review",
            "Professional, Friendly, or Concise reply tones",
            "Automatic replies to new, unanswered Google reviews",
            "Choose eligible star ratings for automatic replies",
            "Review drafts yourself or turn on automatic publishing",
        ],
        cta: { label: "See how it works", href: "/how-it-works" },
    },
    {
        slug: "review-collection",
        title: "Review Collection & Negative Feedback Shield",
        tagline: "Invite feedback fairly, follow up thoughtfully, and resolve issues sooner.",
        metaTitle: "Review Collection & Negative Feedback Shield",
        metaDescription:
            "Send branded SMS, email, link, and QR review requests with optional reminders and a private feedback path for timely follow-up.",
        bullets: [
            "Branded review requests by SMS, email, shareable link, or QR code",
            "Optional follow-up reminders for customers who have not engaged",
            "Private feedback and team alerts for timely service recovery",
            "Fair public review requests with no review gating",
            "Use the API or a secure webhook to trigger requests from your workflow",
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
            "Spot changes in nearby competitors’ review activity",
            "Use competitor context alongside your own review trends",
            "Keep local comparison in view as you plan improvements",
        ],
        cta: { label: "Start free trial", href: "/signup" },
    },
    {
        slug: "local-seo",
        title: "Local SEO Dashboard",
        tagline: "Understand and improve your Google Business Profile",
        metaTitle: "Local SEO Dashboard",
        metaDescription:
            "GBP keyword performance, search insights, and actionable SEO fixes - included on Starter, not locked behind enterprise tiers.",
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
            "Review trends, sentiment, engagement funnel, PDF reports, and CSV exports - analytics for local teams on Zyene Reviews from $29.99/mo.",
        bullets: [
            "Dashboard overview: ratings, volume, response rate, trends",
            "Review and request activity trends over time",
            "Email and SMS request funnel progression",
            "Export review and request data to CSV",
            "Use aggregate analytics through the developer API",
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

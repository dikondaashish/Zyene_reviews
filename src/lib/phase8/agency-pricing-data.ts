// ─────────────────────────────────────────────────────────────────────────────
// Agency / white-label pricing (marketing tiers — contact sales to activate)
// Phase 8.2
// ─────────────────────────────────────────────────────────────────────────────

export interface AgencyPricingTier {
    id: string;
    name: string;
    clientRange: string;
    priceLabel: string;
    highlights: string[];
    cta: string;
}

export const AGENCY_PRICING_TIERS: AgencyPricingTier[] = [
    {
        id: "agency_partner",
        name: "Agency Partner",
        clientRange: "1–4 client locations",
        priceLabel: "Per-client pricing at Professional rates −10%",
        highlights: [
            "20% referral commission on first-year revenue",
            "White-label widgets on Enterprise client accounts",
            "Partner support channel",
        ],
        cta: "Apply as agency partner",
    },
    {
        id: "agency_growth",
        name: "Agency Growth",
        clientRange: "5–15 client locations",
        priceLabel: "Bulk license from $249/mo platform fee + per-location",
        highlights: [
            "Volume discounts on SMS & email request bundles",
            "Co-branded onboarding for your clients",
            "Priority roadmap input for agency dashboard",
        ],
        cta: "Request Growth pricing",
    },
    {
        id: "agency_scale",
        name: "Agency Scale",
        clientRange: "16+ locations or white-label resale",
        priceLabel: "Custom contract — contact partnerships",
        highlights: [
            "Dedicated partner manager",
            "Custom white-label & hide branding across all clients",
            "Multi-client dashboard (beta waitlist)",
            "Revenue share or wholesale billing models",
        ],
        cta: "Talk to partnerships",
    },
];

export const WHITE_LABEL_FEATURES = [
    {
        title: "Hide Zyene branding",
        description:
            "Use hide_branding on review collection pages so end-customers see your agency or client brand only — already available on Enterprise accounts.",
    },
    {
        title: "Embeddable widgets",
        description:
            "Review carousels and rating badges on client websites, with optional PLG footer removed for white-label deployments.",
    },
    {
        title: "Custom review page branding",
        description:
            "Logo, colors, and footer links on collectratings.com/{slug} flows — position your agency as the reputation expert.",
    },
] as const;

export const AGENCY_DASHBOARD_ROADMAP = {
    title: "Multi-client agency dashboard",
    status: "In development",
    description:
        "A single login to monitor review health, request volume, and AI reply usage across all client businesses — with role-based access for your team.",
    waitlistSource: "agency_dashboard_waitlist",
} as const;

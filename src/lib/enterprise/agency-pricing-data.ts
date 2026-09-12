// ─────────────────────────────────────────────────────────────────────────────
// Agency / white-label pricing (marketing tiers - contact sales to activate)
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
        clientRange: "1-4 client locations",
        priceLabel: "Request a quote for your client locations",
        highlights: [
            "Confirm referral terms with partnerships",
            "White-label widgets on Enterprise client accounts",
            "Partner support channel",
        ],
        cta: "Apply as agency partner",
    },
    {
        id: "agency_growth",
        name: "Agency Growth",
        clientRange: "5-15 client locations",
        priceLabel: "Request volume pricing",
        highlights: [
            "Scope SMS and email allowances for each client",
            "Co-branded onboarding for your clients",
            "Priority roadmap input for agency dashboard",
        ],
        cta: "Request Growth pricing",
    },
    {
        id: "agency_scale",
        name: "Agency Scale",
        clientRange: "16+ locations or white-label resale",
        priceLabel: "Custom contract - contact partnerships",
        highlights: [
            "Discuss dedicated support requirements",
            "Custom white-label & hide branding across all clients",
            "Confirm multi-client access requirements",
            "Agree billing and resale terms in writing",
        ],
        cta: "Talk to partnerships",
    },
];

export const WHITE_LABEL_FEATURES = [
    {
        title: "Hide Zyene branding",
        description:
            "Enterprise accounts can hide Zyene branding on review collection pages. Confirm the branding scope for each client before rollout.",
    },
    {
        title: "Embeddable widgets",
        description:
            "Review carousels and rating badges on client websites, with branding options agreed for your client deployment.",
    },
    {
        title: "Custom review page branding",
        description:
            "Logo, colors, and footer links on your public review pages - position your agency as the reputation expert.",
    },
] as const;

export const AGENCY_DASHBOARD_ROADMAP = {
    title: "Multi-client agency dashboard",
    status: "In development",
    description:
        "A single login to monitor review health, request volume, and AI reply usage across all client businesses - with role-based access for your team.",
    waitlistSource: "agency_dashboard_waitlist",
} as const;

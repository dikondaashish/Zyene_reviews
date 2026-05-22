// ─────────────────────────────────────────────────────────────────────────────
// Partnership Channels — Phase 6
// ─────────────────────────────────────────────────────────────────────────────

export interface PartnershipChannel {
    id: string;
    title: string;
    partnerType: string;
    valueExchange: string;
    actions: string[];
    status: "live" | "in_progress" | "planned";
    ctaLabel?: string;
    ctaHref?: string;
    icon: "pos" | "association" | "agency" | "zapier" | "google";
}

export const PARTNERSHIP_CHANNELS: PartnershipChannel[] = [
    {
        id: "pos",
        title: "POS & payments",
        partnerType: "Square, Clover, Toast",
        valueExchange: "Integration listing in their marketplace; Zyene customers sync transactions for review timing.",
        actions: [
            "Maintain Square integration and Zapier triggers for POS events",
            "Apply to Square App Marketplace and Clover App Market when integration QA is complete",
            "Document Toast webhook pattern in partner docs",
        ],
        status: "in_progress",
        ctaLabel: "View integrations",
        ctaHref: "/integrations",
        icon: "pos",
    },
    {
        id: "associations",
        title: "Local business associations",
        partnerType: "Chambers of commerce & trade groups",
        valueExchange: "Member discount (10% off first year) + co-marketing webinars.",
        actions: [
            "Outreach kit: one-pager + demo link for chamber newsletters",
            "Offer code CHAMBER10 for member organizations",
            "Sponsor local SMB events in target metros",
        ],
        status: "planned",
        ctaLabel: "Contact partnerships",
        ctaHref: "mailto:partners@zyenereviews.com?subject=Chamber%20or%20association%20partnership",
        icon: "association",
    },
    {
        id: "agencies",
        title: "Web & marketing agencies",
        partnerType: "Agencies managing client reputations",
        valueExchange: "Referral commission (20% first-year revenue) or white-label widget branding.",
        actions: [
            "Agency onboarding call within 48 hours of application",
            "Multi-client dashboard roadmap shared with partners",
            "Co-branded case studies for agency portfolios",
        ],
        status: "live",
        ctaLabel: "Apply as agency partner",
        ctaHref: "mailto:partners@zyenereviews.com?subject=Agency%20partner%20application",
        icon: "agency",
    },
    {
        id: "zapier",
        title: "Zapier",
        partnerType: "Automation marketplace",
        valueExchange: "Public Zapier app listing drives discovery from non-POS workflows.",
        actions: [
            "Submit integration for Zapier public app review",
            "Publish 5 starter Zaps (new review → Slack, new customer → request, etc.)",
            "Link from /integrations and partner page",
        ],
        status: "in_progress",
        ctaLabel: "Zapier setup guide",
        ctaHref: "/integrations",
        icon: "zapier",
    },
    {
        id: "google-workspace",
        title: "Google Workspace Marketplace",
        partnerType: "Distribution to GBP users",
        valueExchange: "Discoverability for businesses already in Google ecosystem.",
        actions: [
            "Document OAuth scopes and Limited Use compliance for listing review",
            "Prepare marketplace assets (logo, screenshots, support URL)",
            "Target listing after core Google sync stability milestones",
        ],
        status: "planned",
        ctaLabel: "Security & compliance",
        ctaHref: "/security",
        icon: "google",
    },
];

export const AGENCY_PARTNER_PERKS = [
    "20% referral commission on first-year subscription revenue",
    "White-label review widgets (hide Zyene branding on Enterprise)",
    "Priority support channel for agency partners",
    "Early access to multi-client agency dashboard (roadmap)",
    "Co-marketing in case studies and blog features",
];

export const PARTNER_CONTACT_EMAIL = "partners@zyenereviews.com";

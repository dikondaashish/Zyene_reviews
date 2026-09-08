// ─────────────────────────────────────────────────────────────────────────────
// Enterprise motion - Phase 8.1
// ─────────────────────────────────────────────────────────────────────────────

export const ENTERPRISE_SALES_EMAIL = "sales@zyenereviews.com";

export const ENTERPRISE_VALUE_PROPS = [
    {
        title: "Unlimited scale",
        description:
            "Unlimited locations, review requests, and AI replies in a plan calibrated for multi-location organizations.",
    },
    {
        title: "White-label presentation",
        description:
            "Present review collection flows and website widgets under your brand where your Enterprise plan includes white-label options.",
    },
    {
        title: "Security & procurement",
        description:
            "Bring your security and procurement requirements to a sales conversation so you can assess the available materials and plan terms.",
    },
    {
        title: "Rollout planning",
        description:
            "Plan request campaigns, response workflows, and reporting ownership before rollout across your locations.",
    },
    {
        title: "Support planning",
        description:
            "Discuss implementation, support, and escalation expectations with sales before you choose an Enterprise plan.",
    },
    {
        title: "Workflow connections",
        description:
            "Use the developer API and secure webhooks to connect a review-request workflow to the systems your team already relies on.",
    },
] as const;

export const ENTERPRISE_SLA_BULLETS = [
    "Implementation and rollout goals discussed before launch",
    "Support and escalation expectations aligned with your plan",
    "Security and procurement requirements reviewed with sales",
    "API and secure-webhook workflow guidance for your team",
    "White-label widget requirements confirmed before rollout",
] as const;

export const ENTERPRISE_COMPARISON_ROWS = [
    { feature: "Locations", starter: "1", professional: "3", enterprise: "Unlimited" },
    { feature: "White-label widgets", starter: " - ", professional: " - ", enterprise: "Available by plan" },
    { feature: "Security review", starter: " - ", professional: " - ", enterprise: "Discuss with sales" },
    { feature: "Rollout planning", starter: "Self-serve", professional: "Self-serve", enterprise: "Discuss with sales" },
    { feature: "Support options", starter: "Standard", professional: "Priority", enterprise: "Discuss with sales" },
    { feature: "API & webhooks", starter: "Available", professional: "Available", enterprise: "Plan with sales" },
] as const;

export const SALES_DECK_PATH = "/docs/ENTERPRISE_SALES_DECK.md";

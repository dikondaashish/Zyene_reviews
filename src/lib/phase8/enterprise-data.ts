// ─────────────────────────────────────────────────────────────────────────────
// Enterprise motion — Phase 8.1
// ─────────────────────────────────────────────────────────────────────────────

export const ENTERPRISE_SALES_EMAIL = "sales@zyenereviews.com";

export const ENTERPRISE_VALUE_PROPS = [
    {
        title: "Unlimited scale",
        description:
            "Unlimited locations, review requests, and AI replies — priced for multi-location brands and franchises, not per-seat enterprise bloat.",
    },
    {
        title: "White-label & branding",
        description:
            "Hide “Powered by Zyene” on review flows and widgets. Present review collection under your brand for agencies and enterprise programs.",
    },
    {
        title: "SSO & security review",
        description:
            "SAML/OIDC single sign-on, custom DPA, and security questionnaire support for procurement teams.",
    },
    {
        title: "Dedicated account manager",
        description:
            "Named AM, onboarding playbooks for rollouts across regions, and quarterly business reviews.",
    },
    {
        title: "Uptime SLA",
        description:
            "Contractual uptime commitments, priority incident response, and proactive monitoring on sync pipelines.",
    },
    {
        title: "Custom integrations",
        description:
            "Managed API keys, webhooks, and integration engineering for POS, CRM, and internal data warehouses.",
    },
] as const;

export const ENTERPRISE_SLA_BULLETS = [
    "99.9% monthly uptime SLA (enterprise agreements)",
    "Priority support with defined response times",
    "Dedicated Slack or email escalation channel",
    "Scheduled maintenance windows with advance notice",
    "Annual security and compliance review option",
] as const;

export const ENTERPRISE_COMPARISON_ROWS = [
    { feature: "Locations", starter: "1", professional: "3", enterprise: "Unlimited" },
    { feature: "White-label widgets", starter: "—", professional: "—", enterprise: "Included" },
    { feature: "SSO (SAML/OIDC)", starter: "—", professional: "—", enterprise: "Included" },
    { feature: "Dedicated AM", starter: "—", professional: "—", enterprise: "Included" },
    { feature: "Custom SLA", starter: "—", professional: "—", enterprise: "Included" },
    { feature: "API & integrations", starter: "Standard", professional: "Standard", enterprise: "Managed" },
] as const;

export const SALES_DECK_PATH = "/docs/ENTERPRISE_SALES_DECK.md";

// ─────────────────────────────────────────────────────────
// Plan Types
// ─────────────────────────────────────────────────────────

export interface PlanLimits {
    maxLocations: number;           // -1 = unlimited
    emailRequestsPerMonth: number;  // -1 = unlimited
    smsRequestsPerMonth: number;    // -1 = unlimited
    linkRequestsPerMonth: number;   // -1 = unlimited
    smartRepliesPerMonth: number;   // -1 = unlimited
    teamMembers: number;            // -1 = unlimited
    perLocation?: boolean;          // if true, multiply limits by location count
}

export interface Plan {
    id: string;
    name: string;
    interval: "month" | "year" | null; // null = enterprise / contact sales
    price: number | null;
    originalPrice: number | null;
    stripePriceId: string | null;
    limits: PlanLimits;
    features: string[];
}

// ─────────────────────────────────────────────────────────
// Plans Array
// ─────────────────────────────────────────────────────────

const STARTER_LIMITS: PlanLimits = {
    maxLocations: 1,
    emailRequestsPerMonth: 2500,
    smsRequestsPerMonth: 2500,
    linkRequestsPerMonth: 5000,
    smartRepliesPerMonth: -1,
    teamMembers: 5,
};

const STARTER_FEATURES = [
    "1 business location on your plan",
    "Google Business Profile review sync",
    "2,500 email review requests / month",
    "2,500 SMS review requests / month",
    "5,000 review link requests / month",
    "Unlimited AI reply suggestions & usage-based smart replies",
    "Auto commenter for eligible Google reviews (paid plan)",
    "Dashboard, analytics & team alerts",
    "Up to 5 team members",
];

const PRO_LIMITS: PlanLimits = {
    maxLocations: 3,
    emailRequestsPerMonth: 3000,
    smsRequestsPerMonth: 3000,
    linkRequestsPerMonth: 6000,
    smartRepliesPerMonth: -1,
    teamMembers: 15,
    perLocation: true,
};

const PRO_FEATURES = [
    "Everything in Starter, plus:",
    "Up to 3 business locations (limits per location)",
    "3,000 email review requests / month per location",
    "3,000 SMS review requests / month per location",
    "6,000 review link requests / month per location",
    "Unlimited AI reply suggestions (plan limits apply)",
    "Priority email support",
    "Up to 15 team members",
];

const ENTERPRISE_LIMITS: PlanLimits = {
    maxLocations: -1,
    emailRequestsPerMonth: -1,
    smsRequestsPerMonth: -1,
    linkRequestsPerMonth: -1,
    smartRepliesPerMonth: -1,
    teamMembers: -1,
};

const ENTERPRISE_FEATURES = [
    "Everything in Professional, plus:",
    "Unlimited business locations",
    "Unlimited email, SMS & link requests",
    "Unlimited AI / smart replies (contract terms)",
    "Dedicated account manager",
    "Custom integrations & SSO (as agreed)",
    "Uptime SLA & security review options",
];

export const PLANS: Plan[] = [
    {
        id: "starter_monthly",
        name: "Starter",
        interval: "month",
        price: 29.99,
        originalPrice: 49.99,
        stripePriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || null,
        limits: STARTER_LIMITS,
        features: STARTER_FEATURES,
    },
    {
        id: "starter_yearly",
        name: "Starter",
        interval: "year",
        price: 299.99,
        originalPrice: 499.99,
        stripePriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || null,
        limits: STARTER_LIMITS,
        features: STARTER_FEATURES,
    },
    {
        id: "professional_monthly",
        name: "Professional",
        interval: "month",
        price: 59.99,
        originalPrice: 89.99,
        stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
        limits: PRO_LIMITS,
        features: PRO_FEATURES,
    },
    {
        id: "professional_yearly",
        name: "Professional",
        interval: "year",
        price: 599.99,
        originalPrice: 899.99,
        stripePriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || null,
        limits: PRO_LIMITS,
        features: PRO_FEATURES,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        interval: null,
        price: null,
        originalPrice: null,
        stripePriceId: null,
        limits: ENTERPRISE_LIMITS,
        features: ENTERPRISE_FEATURES,
    },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Lookup map keyed by plan id for quick access (e.g. webhook handler). */
export const PLAN_MAP: Record<string, Plan> = Object.fromEntries(
    PLANS.map((p) => [p.id, p])
);

/** Find a plan by its Stripe Price ID. */
export function getPlanByPriceId(priceId: string): Plan | null {
    return PLANS.find((p) => p.stripePriceId === priceId) || null;
}

/** Get plans filtered by interval. */
export function getPlansByInterval(interval: "month" | "year"): Plan[] {
    return PLANS.filter((p) => p.interval === interval);
}

/** Get the enterprise plan. */
export function getEnterprisePlan(): Plan {
    return PLANS.find((p) => p.id === "enterprise")!;
}

/**
 * Unsubscribed fallback limits (used when a subscription is canceled).
 * Not a selectable plan — just the defaults for downgraded orgs.
 */
export const UNSUBSCRIBED_LIMITS: PlanLimits = {
    maxLocations: 1,
    emailRequestsPerMonth: 10,
    smsRequestsPerMonth: 0,
    linkRequestsPerMonth: 25,
    smartRepliesPerMonth: 0,
    teamMembers: 1,
};

/** @deprecated Use UNSUBSCRIBED_LIMITS instead */
export const FREE_LIMITS = UNSUBSCRIBED_LIMITS;

/**
 * Auto commenter + AI suggest-reply: allowed for paid SMB tiers and agency/growth plans
 * (must stay in sync with `organizations.plan` CHECK and Stripe/webhook values).
 */
/** Same product family (monthly vs yearly cards share a tier). */
export function planProductTier(planId: string | null | undefined): "starter" | "professional" | "enterprise" | null {
    if (planId == null || planId === "") return null;
    const id = String(planId).toLowerCase();
    if (id === "enterprise") return "enterprise";
    if (id.startsWith("starter_") || id === "starter") return "starter";
    if (id.startsWith("professional_") || id === "pro") return "professional";
    return null;
}

export function planAllowsAutoCommenter(plan: string | null | undefined): boolean {
    if (plan == null || plan === "") return false;
    const p = String(plan).toLowerCase().trim();
    if (p === "free" || p === "none") return false;
    if (p === "enterprise") return true;
    if (p === "growth") return true;
    if (p === "agency_starter" || p === "agency_pro" || p === "agency_scale") return true;
    if (p === "starter" || p === "pro") return true;
    if (p.startsWith("starter_")) return true;
    if (p.startsWith("professional_")) return true;
    return false;
}

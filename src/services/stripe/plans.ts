/**
 * Stripe plan definitions, feature limits, and pricing tiers.
 * Source of truth for Starter, Professional, and Enterprise plan metadata.
 */

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
    emailRequestsPerMonth: 500,
    smsRequestsPerMonth: 500,
    linkRequestsPerMonth: 1500,
    smartRepliesPerMonth: 1500,
    teamMembers: 5,
};

const STARTER_FEATURES = [
    "1 business location on your plan",
    "Google Business Profile, Facebook, and Yelp review sync",
    "500 email review requests / month",
    "500 SMS review requests / month",
    "1,500 AI-generated review draft requests / month (public review link flow, step 3)",
    "Unlimited AI reply suggestions & Auto commenter",
    "Competitor tracking",
    "Dashboard, analytics & team alerts",
    "POS & automation triggers for review requests",
    "Developer API",
    "Up to 5 team members",
];

const PRO_LIMITS: PlanLimits = {
    maxLocations: 3,
    emailRequestsPerMonth: 700,
    smsRequestsPerMonth: 700,
    linkRequestsPerMonth: 2000,
    smartRepliesPerMonth: 2000,
    teamMembers: 15,
    perLocation: true,
};

const PRO_FEATURES = [
    "Everything in Starter, plus:",
    "3 business locations (limits per location)",
    "200 email review requests extra / month per location",
    "200 SMS review requests extra / month per location",
    "500 review link requests extra / month per location",
    "Unlimited AI reply suggestions & Auto commenter",
    "Competitor tracking",
    "Dashboard, analytics & team alerts",
    "POS & automation triggers for review requests",
    "Developer API",
    "Priority customer support",
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
    "Managed API keys and integration support",
    "Embeddable and white-label review widgets",
    "Priority sync pipelines and proactive monitoring",
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

const PAID_TIER_ORDER: Record<"starter" | "professional" | "enterprise", number> = {
    starter: 1,
    professional: 2,
    enterprise: 3,
};

/** True when moving to a higher SMB tier (e.g. Starter → Professional). Same-tier interval changes are false. */
export function isPaidPlanTierUpgrade(
    fromPlanId: string | null | undefined,
    toPlanId: string | null | undefined
): boolean {
    const from = planProductTier(fromPlanId);
    const to = planProductTier(toPlanId);
    if (!from || !to) return false;
    return PAID_TIER_ORDER[to] > PAID_TIER_ORDER[from];
}

/** True when moving to a lower SMB tier (e.g. Professional → Starter). Used for proration_behavior = none at period boundaries. */
export function isPaidPlanTierDowngrade(
    fromPlanId: string | null | undefined,
    toPlanId: string | null | undefined
): boolean {
    const from = planProductTier(fromPlanId);
    const to = planProductTier(toPlanId);
    if (!from || !to) return false;
    return PAID_TIER_ORDER[to] < PAID_TIER_ORDER[from];
}

export function planAllowsAutoCommenter(
    plan: string | null | undefined,
    planStatus?: string | null
): boolean {
    if (planStatus !== undefined && !hasActiveOrTrialingStatus(planStatus)) return false;
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

export function hasActiveOrTrialingStatus(planStatus: string | null | undefined): boolean {
    if (!planStatus) return false;
    const status = String(planStatus).toLowerCase().trim();
    return status === "active" || status === "trialing";
}

/**
 * Public embed widget (/w/...) and similar surfaces: paid SKU (same rules as auto-commenter,
 * e.g. starter_monthly, professional_yearly, enterprise, growth, agency_*) plus active/trialing status.
 * Do not use a short allowlist of display names — DB stores Stripe plan ids.
 */
export function planAllowsPublicReviewWidget(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): boolean {
    if (!hasActiveOrTrialingStatus(planStatus)) return false;
    return planAllowsAutoCommenter(plan);
}

/**
 * Strict eligibility for AI review features requested by product:
 * Starter / Professional / Enterprise + active/trialing subscription status.
 */
export function planAllowsAiReviewFeatures(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): boolean {
    const tier = planProductTier(plan);
    if (!tier) return false;
    return hasActiveOrTrialingStatus(planStatus);
}

/**
 * Team seat cap by subscription family.
 * - Starter: 5
 * - Professional: 15
 * - Enterprise: unlimited (-1)
 * Non-active/trialing subscriptions fall back to unsubscribed/free seats.
 */
export function teamMemberLimitForPlan(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): number {
    const tier = planProductTier(plan);
    if (!tier || !hasActiveOrTrialingStatus(planStatus)) {
        return FREE_LIMITS.teamMembers;
    }
    if (tier === "starter") return 5;
    if (tier === "professional") return 15;
    return -1;
}

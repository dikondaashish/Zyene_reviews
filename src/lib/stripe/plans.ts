// ─────────────────────────────────────────────────────────
// Plan Types
// ─────────────────────────────────────────────────────────

export interface PlanLimits {
    maxLocations: number;           // -1 = unlimited
    emailRequestsPerMonth: number;  // -1 = unlimited
    smsRequestsPerMonth: number;    // -1 = unlimited
    linkRequestsPerMonth: number;   // -1 = unlimited
    aiRepliesPerMonth: number;      // -1 = unlimited
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
    aiRepliesPerMonth: -1,
    teamMembers: 5,
};

const STARTER_FEATURES = [
    "Easy to use dashboard",
    "SEO optimized AI reviews",
    "1 Location",
    "2,500 email requests/month",
    "2,500 SMS requests/month",
    "5,000 review link requests/month",
    "Campaign automation",
    "Link analytics",
    "Customizable review page",
    "Private feedback capture",
    "Employee & product tracking",
    "Google, Yelp, Facebook integration",
    "AI-powered replies",
];

const PRO_LIMITS: PlanLimits = {
    maxLocations: 3,
    emailRequestsPerMonth: 3000,
    smsRequestsPerMonth: 3000,
    linkRequestsPerMonth: 6000,
    aiRepliesPerMonth: -1,
    teamMembers: 15,
    perLocation: true,
};

const PRO_FEATURES = [
    "Everything in Starter, plus:",
    "3 Locations",
    "3,000 email requests/month per location",
    "3,000 SMS requests/month per location",
    "6,000 review link requests/month per location",
    "Priority support",
];

const ENTERPRISE_LIMITS: PlanLimits = {
    maxLocations: -1,
    emailRequestsPerMonth: -1,
    smsRequestsPerMonth: -1,
    linkRequestsPerMonth: -1,
    aiRepliesPerMonth: -1,
    teamMembers: -1,
};

const ENTERPRISE_FEATURES = [
    "Everything in Professional, plus:",
    "Unlimited locations",
    "Unlimited requests",
    "Dedicated account manager",
    "Custom integrations",
    "SLA guarantee",
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
        id: "pro_monthly",
        name: "Professional",
        interval: "month",
        price: 59.99,
        originalPrice: 89.99,
        stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
        limits: PRO_LIMITS,
        features: PRO_FEATURES,
    },
    {
        id: "pro_yearly",
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
 * Free-tier fallback limits (used when a subscription is canceled).
 * Not a selectable plan — just the defaults for downgraded orgs.
 */
export const FREE_LIMITS: PlanLimits = {
    maxLocations: 1,
    emailRequestsPerMonth: 10,
    smsRequestsPerMonth: 0,
    linkRequestsPerMonth: 25,
    aiRepliesPerMonth: 0,
    teamMembers: 1,
};

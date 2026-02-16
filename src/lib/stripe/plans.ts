export interface PlanLimits {
    maxBusinesses: number;
    maxReviewRequestsPerMonth: number; // -1 = unlimited
    maxAiRepliesPerMonth: number;      // -1 = unlimited
    smsAlerts: boolean;
    emailAlerts: boolean;
    platforms: string[];
}

export interface Plan {
    name: string;
    price: number;
    stripePriceId: string | null;
    limits: PlanLimits;
}

export const PLANS: Record<string, Plan> = {
    free: {
        name: "Free",
        price: 0,
        stripePriceId: null,
        limits: {
            maxBusinesses: 1,
            maxReviewRequestsPerMonth: 10,
            maxAiRepliesPerMonth: 0,
            smsAlerts: false,
            emailAlerts: true,
            platforms: ["google"],
        },
    },
    starter: {
        name: "Starter",
        price: 39,
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || null,
        limits: {
            maxBusinesses: 1,
            maxReviewRequestsPerMonth: 100,
            maxAiRepliesPerMonth: 30,
            smsAlerts: true,
            emailAlerts: true,
            platforms: ["google", "yelp", "facebook"],
        },
    },
    growth: {
        name: "Growth",
        price: 79,
        stripePriceId: process.env.STRIPE_GROWTH_PRICE_ID || null,
        limits: {
            maxBusinesses: 3,
            maxReviewRequestsPerMonth: -1,
            maxAiRepliesPerMonth: -1,
            smsAlerts: true,
            emailAlerts: true,
            platforms: ["google", "yelp", "facebook"],
        },
    },
};

/**
 * Find a plan key by its Stripe Price ID.
 */
export function getPlanByPriceId(priceId: string): { key: string; plan: Plan } | null {
    for (const [key, plan] of Object.entries(PLANS)) {
        if (plan.stripePriceId === priceId) {
            return { key, plan };
        }
    }
    return null;
}

import type { Plan } from "@/services/stripe/plans";

export interface UsageStat {
    used: number;
    max: number;
}

export interface BillingClientProps {
    currentPlan: Plan | null;
    organizationPlanId: string;
    planStatus: string;
    hasStripeCustomer: boolean;
    /** Net-new Stripe checkout may include a 7-day trial; false for returning subscribers. */
    checkoutOffersTrial: boolean;
    /** Active Stripe subscription (active / trialing / past_due) — drives CTA copy and proration confirmation. */
    hasActiveStripeSubscription: boolean;
    canManageBilling: boolean;
    usage: {
        emailRequests: UsageStat;
        smsRequests: UsageStat;
        linkRequests: UsageStat;
        smartReplies: UsageStat;
        businesses: UsageStat;
    };
    plans: Plan[];
}

export type ProrationPreviewState = "idle" | "loading" | "fallback" | { amountFormatted: string };

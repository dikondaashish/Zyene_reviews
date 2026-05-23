import type { Plan } from "@/services/stripe/plans";
import type { BillingClientProps } from "@/components/settings/billing-client-types";

export type BillingDerivedState = {
    isEnterpriseOrg: boolean;
    hasPricedPlan: boolean;
    subscriptionHealthy: boolean;
    isPaidPlan: boolean;
    treatsAsReturningForCta: boolean;
    showFullUsage: boolean;
    displayUsage: BillingClientProps["usage"];
    displayPlans: Plan[];
    enterprisePlan: Plan | undefined;
    currentPlanDisplayName: string;
    intervalLabel: string;
    yearlySavings: number;
};

export function computeBillingDerivedState(
    props: Pick<
        BillingClientProps,
        | "currentPlan"
        | "organizationPlanId"
        | "planStatus"
        | "hasActiveStripeSubscription"
        | "usage"
        | "plans"
    >,
    interval: "month" | "year",
    noActivePlanLabel: string
): BillingDerivedState {
    const { currentPlan, organizationPlanId, planStatus, hasActiveStripeSubscription, usage, plans } = props;

    const isEnterpriseOrg = organizationPlanId === "enterprise";
    const hasPricedPlan =
        !!currentPlan &&
        currentPlan.price !== null &&
        currentPlan.price > 0 &&
        organizationPlanId !== "none" &&
        organizationPlanId !== "free";

    const subscriptionHealthy = ["active", "trialing", "past_due"].includes(planStatus);
    const isPaidPlan = (hasPricedPlan || isEnterpriseOrg) && planStatus !== "canceled";

    const treatsAsReturningForCta = hasPricedPlan || isEnterpriseOrg || hasActiveStripeSubscription;

    const showFullUsage =
        planStatus === "trialing" ||
        ((hasPricedPlan || isEnterpriseOrg) && ["active", "past_due", "canceled"].includes(planStatus));

    const displayUsage = showFullUsage
        ? usage
        : {
              emailRequests: { used: 0, max: 0 },
              smsRequests: { used: 0, max: 0 },
              linkRequests: { used: 0, max: 0 },
              smartReplies: { used: 0, max: 0 },
              businesses: { used: usage.businesses?.used || 0, max: 1 },
          };

    const displayPlans = plans.filter((p) => p.interval === interval && p.id !== "enterprise");
    const enterprisePlan = plans.find((p) => p.id === "enterprise");

    const currentPlanDisplayName = isEnterpriseOrg ? "Enterprise" : currentPlan?.name || noActivePlanLabel;

    const intervalLabel = interval === "month" ? "/mo" : "/yr";
    const monthlyStarterPrice = plans.find((p) => p.id === "starter_monthly")?.price ?? 0;
    const yearlyStarterPrice = plans.find((p) => p.id === "starter_yearly")?.price ?? 0;
    const yearlySavings =
        monthlyStarterPrice > 0 ? Math.round((1 - yearlyStarterPrice / (monthlyStarterPrice * 12)) * 100) : 0;

    return {
        isEnterpriseOrg,
        hasPricedPlan,
        subscriptionHealthy,
        isPaidPlan,
        treatsAsReturningForCta,
        showFullUsage,
        displayUsage,
        displayPlans,
        enterprisePlan,
        currentPlanDisplayName,
        intervalLabel,
        yearlySavings,
    };
}

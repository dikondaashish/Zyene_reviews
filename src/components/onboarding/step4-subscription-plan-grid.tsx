"use client";

import type { Plan } from "@/services/stripe/plans";
import { Step4SubscriptionPaidPlanCard } from "./step4-subscription-paid-plan-card";
import { Step4SubscriptionEnterpriseCard } from "./step4-subscription-enterprise-card";

interface Step4SubscriptionPlanGridProps {
    displayPlans: Plan[];
    enterprisePlan: Plan | undefined;
    intervalLabel: string;
    trialIncludedText: string;
    startTrialCta: string;
    subscribeCta: string;
    checkoutOffersTrial: boolean | null;
    trialEligibilityLoading: boolean;
    loadingPlanId: string | null;
    planBusy: boolean;
    onSubscribe: (plan: Plan) => void;
}

export function Step4SubscriptionPlanGrid(props: Step4SubscriptionPlanGridProps) {
    const {
        displayPlans,
        enterprisePlan,
        intervalLabel,
        trialIncludedText,
        startTrialCta,
        subscribeCta,
        checkoutOffersTrial,
        trialEligibilityLoading,
        loadingPlanId,
        planBusy,
        onSubscribe,
    } = props;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayPlans.map((plan) => (
                <Step4SubscriptionPaidPlanCard
                    key={plan.id}
                    plan={plan}
                    intervalLabel={intervalLabel}
                    trialIncludedText={trialIncludedText}
                    startTrialCta={startTrialCta}
                    subscribeCta={subscribeCta}
                    checkoutOffersTrial={checkoutOffersTrial}
                    trialEligibilityLoading={trialEligibilityLoading}
                    loadingPlanId={loadingPlanId}
                    planBusy={planBusy}
                    onSubscribe={onSubscribe}
                />
            ))}
            {enterprisePlan && <Step4SubscriptionEnterpriseCard enterprisePlan={enterprisePlan} />}
        </div>
    );
}

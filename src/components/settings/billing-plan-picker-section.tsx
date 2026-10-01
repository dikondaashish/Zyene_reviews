"use client";

import type { Plan } from "@/services/stripe/plans";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { BillingDerivedState } from "@/components/settings/billing-client-derived";
import { BillingPlanPickerHeader } from "@/components/settings/billing-plan-picker-header";
import { BillingPlanTierCard } from "@/components/settings/billing-plan-tier-card";
import { BillingPlanEnterpriseCard } from "@/components/settings/billing-plan-enterprise-card";

type BillingDict = Dictionary["billing"];

export function BillingPlanPickerSection(props: {
    billing: BillingDict;
    interval: "month" | "year";
    setInterval: (v: "month" | "year") => void;
    derived: BillingDerivedState;
    planStatus: string;
    checkoutOffersTrial: boolean;
    loadingPlan: string | null;
    permissionTooltip: string | undefined;
    currentPlan: Plan | null;
    onRequestPlanChange: (plan: Plan) => void;
}) {
    const {
        billing: b,
        interval,
        setInterval,
        derived,
        planStatus,
        checkoutOffersTrial,
        loadingPlan,
        permissionTooltip,
        currentPlan,
        onRequestPlanChange,
    } = props;

    const {
        displayPlans,
        enterprisePlan,
        hasPricedPlan,
        isEnterpriseOrg,
        subscriptionHealthy,
        treatsAsReturningForCta,
        intervalLabel,
        yearlySavings,
    } = derived;

    return (
        <div
            id="plan-picker"
            className="scroll-mt-6 border-t border-border pt-8"
        >

            <div className="relative z-10">
                <BillingPlanPickerHeader
                    billing={b}
                    interval={interval}
                    setInterval={setInterval}
                    hasPricedPlanOrEnterprise={hasPricedPlan || isEnterpriseOrg}
                    yearlySavings={yearlySavings}
                />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-y-0">
                    {displayPlans.map((plan) => (
                        <BillingPlanTierCard
                            key={plan.id}
                            plan={plan}
                            currentPlan={currentPlan}
                            planStatus={planStatus}
                            subscriptionHealthy={subscriptionHealthy}
                            treatsAsReturningForCta={treatsAsReturningForCta}
                            checkoutOffersTrial={checkoutOffersTrial}
                            loadingPlan={loadingPlan}
                            intervalLabel={intervalLabel}
                            billing={b}
                            permissionTooltip={permissionTooltip}
                            onRequestPlanChange={onRequestPlanChange}
                        />
                    ))}

                    {enterprisePlan && (
                        <BillingPlanEnterpriseCard
                            enterprisePlan={enterprisePlan}
                            isEnterpriseOrg={isEnterpriseOrg}
                            subscriptionHealthy={subscriptionHealthy}
                            billing={b}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

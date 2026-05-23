"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ReferralCard } from "@/components/settings/referral-card";
import type { BillingClientProps } from "@/components/settings/billing-client-types";
import { computeBillingDerivedState } from "@/components/settings/billing-client-derived";
import { useBillingInterval } from "@/components/settings/use-billing-interval";
import { useBillingSearchParamToasts } from "@/components/settings/use-billing-search-param-toasts";
import { useBillingProfessionalScrollEffect } from "@/components/settings/use-billing-professional-scroll-effect";
import { useBillingCheckout } from "@/components/settings/use-billing-checkout";
import { useBillingPortal } from "@/components/settings/use-billing-portal";
import { useBillingPlanChange } from "@/components/settings/use-billing-plan-change";
import { BillingPageTopSection } from "@/components/settings/billing-page-top-section";
import { BillingCurrentPlanCard } from "@/components/settings/billing-current-plan-card";
import { BillingPlanPickerSection } from "@/components/settings/billing-plan-picker-section";
import { BillingPlanChangeDialog } from "@/components/settings/billing-plan-change-dialog";

export function BillingClient({
    currentPlan,
    organizationPlanId,
    planStatus,
    hasStripeCustomer,
    checkoutOffersTrial,
    hasActiveStripeSubscription,
    canManageBilling,
    usage,
    plans,
}: BillingClientProps) {
    const { dict } = useLanguage();
    const b = dict.billing;
    const searchParams = useSearchParams();
    const router = useRouter();

    const { interval, setInterval } = useBillingInterval(currentPlan);
    const derived = useMemo(
        () =>
            computeBillingDerivedState(
                {
                    currentPlan,
                    organizationPlanId,
                    planStatus,
                    hasActiveStripeSubscription,
                    usage,
                    plans,
                },
                interval,
                b.no_active_plan
            ),
        [
            b.no_active_plan,
            currentPlan,
            hasActiveStripeSubscription,
            interval,
            organizationPlanId,
            planStatus,
            plans,
            usage,
        ]
    );

    const { loadingPlan, handleSubscribe } = useBillingCheckout(canManageBilling, b.no_billing_permission);
    const { loadingPortal, handleManageSubscription } = useBillingPortal(canManageBilling, b.no_billing_permission);
    const {
        confirmPlanChange,
        setConfirmPlanChange,
        prorationPreview,
        setProrationPreview,
        requestPlanChange,
    } = useBillingPlanChange({
        canManageBilling,
        billingNotConfiguredMessage: b.billing_not_configured,
        noBillingPermissionMessage: b.no_billing_permission,
        currentPlan,
        subscriptionHealthy: derived.subscriptionHealthy,
        hasActiveStripeSubscription,
        handleSubscribe,
    });

    useBillingSearchParamToasts(searchParams, router);
    useBillingProfessionalScrollEffect(searchParams, interval, plans);

    const permissionTooltip = !canManageBilling ? b.no_billing_permission : undefined;

    return (
        <div className="space-y-8">
            <BillingPageTopSection
                billing={b}
                canManageBilling={canManageBilling}
                planStatus={planStatus}
                hasStripeCustomer={hasStripeCustomer}
                loadingPortal={loadingPortal}
                onManageSubscription={() => void handleManageSubscription()}
            />
            <BillingCurrentPlanCard
                billing={b}
                currentPlan={currentPlan}
                planStatus={planStatus}
                hasStripeCustomer={hasStripeCustomer}
                checkoutOffersTrial={checkoutOffersTrial}
                loadingPortal={loadingPortal}
                onManageSubscription={() => void handleManageSubscription()}
                derived={derived}
                permissionTooltip={permissionTooltip}
            />
            <BillingPlanPickerSection
                billing={b}
                interval={interval}
                setInterval={setInterval}
                derived={derived}
                planStatus={planStatus}
                checkoutOffersTrial={checkoutOffersTrial}
                loadingPlan={loadingPlan}
                permissionTooltip={permissionTooltip}
                currentPlan={currentPlan}
                onRequestPlanChange={requestPlanChange}
            />
            <ReferralCard />
            <BillingPlanChangeDialog
                billing={b}
                planStatus={planStatus}
                currentPlan={currentPlan}
                confirmPlanChange={confirmPlanChange}
                setConfirmPlanChange={setConfirmPlanChange}
                setProrationPreview={setProrationPreview}
                prorationPreview={prorationPreview}
                onConfirmContinue={(priceId) => void handleSubscribe(priceId)}
            />
        </div>
    );
}

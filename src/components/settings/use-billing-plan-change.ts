"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Plan } from "@/services/stripe/plans";
import type { ProrationPreviewState } from "@/components/settings/billing-client-types";
import { useBillingProrationPreviewEffect } from "@/components/settings/use-billing-proration-preview-effect";

type ConfirmPlanChange = { priceId: string; plan: Plan };

export function useBillingPlanChange(options: {
    canManageBilling: boolean;
    billingNotConfiguredMessage: string;
    noBillingPermissionMessage: string;
    currentPlan: Plan | null;
    subscriptionHealthy: boolean;
    hasActiveStripeSubscription: boolean;
    handleSubscribe: (priceId: string) => void | Promise<void>;
}) {
    const {
        canManageBilling,
        billingNotConfiguredMessage,
        noBillingPermissionMessage,
        currentPlan,
        subscriptionHealthy,
        hasActiveStripeSubscription,
        handleSubscribe,
    } = options;

    const [confirmPlanChange, setConfirmPlanChange] = useState<ConfirmPlanChange | null>(null);
    const [prorationPreview, setProrationPreview] = useState<ProrationPreviewState>("idle");

    useBillingProrationPreviewEffect(confirmPlanChange, setProrationPreview);

    const requestPlanChange = useCallback(
        (plan: Plan) => {
            if (!canManageBilling) {
                toast.error(noBillingPermissionMessage);
                return;
            }
            if (!plan.stripePriceId) {
                toast.error(billingNotConfiguredMessage);
                return;
            }
            const isExactCurrent = currentPlan?.id === plan.id;
            if (isExactCurrent && subscriptionHealthy) {
                return;
            }
            const needsProrationConfirm =
                hasActiveStripeSubscription && subscriptionHealthy && !isExactCurrent;
            if (needsProrationConfirm) {
                setProrationPreview("loading");
                setConfirmPlanChange({ priceId: plan.stripePriceId, plan });
                return;
            }
            void handleSubscribe(plan.stripePriceId);
        },
        [
            billingNotConfiguredMessage,
            canManageBilling,
            currentPlan?.id,
            handleSubscribe,
            hasActiveStripeSubscription,
            noBillingPermissionMessage,
            subscriptionHealthy,
        ]
    );

    return {
        confirmPlanChange,
        setConfirmPlanChange,
        prorationPreview,
        setProrationPreview,
        requestPlanChange,
    };
}

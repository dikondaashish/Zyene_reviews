"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getCheckoutTrialEligibilityForOrganization } from "@/app/actions/billing-trial";
import { savePlanSelection } from "@/app/actions/onboarding";
import { PLANS, type Plan } from "@/services/stripe/plans";

export function useStep4SubscriptionForm(organizationId: string, externalIsLoading: boolean, onNext: () => void) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [interval, setInterval] = useState<"month" | "year">("month");
    const [checkoutOffersTrial, setCheckoutOffersTrial] = useState<boolean | null>(null);

    useEffect(() => {
        setIsLoading(externalIsLoading);
    }, [externalIsLoading]);

    useEffect(() => {
        let cancelled = false;
        void getCheckoutTrialEligibilityForOrganization(organizationId).then((r) => {
            if (!cancelled) setCheckoutOffersTrial(r.eligible);
        });
        return () => {
            cancelled = true;
        };
    }, [organizationId]);

    const displayPlans = PLANS.filter((p) => p.interval === interval && p.id !== "enterprise");
    const enterprisePlan = PLANS.find((p) => p.id === "enterprise");

    const onSubscribe = async (plan: Plan) => {
        setLoadingPlan(plan.id);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id, source: "onboarding" }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || data.success !== true) {
                const err = typeof data.error === "string" ? data.error : "Failed to start checkout";
                throw new Error(err);
            }

            const url = data.data?.url;
            if (typeof url === "string" && url.length > 0) {
                sessionStorage.setItem("zyene_payment_pending", "true");
                window.location.href = url;
                return;
            }

            throw new Error("No checkout URL returned");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
            toast.error(message);
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleSkip = async () => {
        setIsLoading(true);
        try {
            const result = await savePlanSelection(organizationId, { plan: "none" });
            if (result.success) {
                onNext();
            } else {
                toast.error(result.error || "Failed to continue");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const trialEligibilityLoading = checkoutOffersTrial === null;
    const planBusy = isLoading || loadingPlan !== null || trialEligibilityLoading;
    const busy = isLoading || loadingPlan !== null;

    return {
        interval,
        setInterval,
        displayPlans,
        enterprisePlan,
        checkoutOffersTrial,
        trialEligibilityLoading,
        planBusy,
        busy,
        loadingPlan,
        onSubscribe,
        handleSkip,
    };
}

"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { finalizeOnboardingStripeCheckout } from "@/app/actions/onboarding";

type UseOnboardingUrlEffectsArgs = {
    setCurrentStep: (step: number) => void;
    setPendingGoogleCode: (code: string | null) => void;
    setIsStepResolved: (resolved: boolean) => void;
    setShowPaymentCancelled: (show: boolean) => void;
    setCheckoutVerifying: (verifying: boolean) => void;
};

export function useOnboardingUrlEffects({
    setCurrentStep,
    setPendingGoogleCode,
    setIsStepResolved,
    setShowPaymentCancelled,
    setCheckoutVerifying,
}: UseOnboardingUrlEffectsArgs) {
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
            setPendingGoogleCode(code);
            setCurrentStep(2);
            setIsStepResolved(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [setCurrentStep, setPendingGoogleCode, setIsStepResolved]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const checkoutSuccess = params.get("checkout_success");
        const sessionId = params.get("session_id");
        const planSwitched = params.get("plan_switched");
        const canceled = params.get("checkout_canceled");

        const cleanUrl = () =>
            window.history.replaceState({}, document.title, window.location.pathname);

        if (canceled === "1") {
            setShowPaymentCancelled(true);
            setCurrentStep(4);
            setIsStepResolved(true);
            cleanUrl();
            return;
        }

        if (checkoutSuccess !== "1") return;

        if (sessionId) {
            setCheckoutVerifying(true);
            finalizeOnboardingStripeCheckout({ sessionId })
                .then((r) => {
                    if (r.success) {
                        toast.success("Subscription started!");
                        setCurrentStep(5);
                    } else {
                        toast.error(r.error || "Could not verify checkout");
                    }
                })
                .finally(() => {
                    setCheckoutVerifying(false);
                    cleanUrl();
                });
            return;
        }

        if (planSwitched === "1") {
            setCheckoutVerifying(true);
            finalizeOnboardingStripeCheckout({ planSwitchedOnly: true })
                .then((r) => {
                    if (r.success) {
                        toast.success("Plan updated!");
                        setCurrentStep(5);
                    } else {
                        toast.error(r.error || "Could not confirm your subscription");
                    }
                })
                .finally(() => {
                    setCheckoutVerifying(false);
                    cleanUrl();
                });
            return;
        }

        cleanUrl();
    }, [setCurrentStep, setIsStepResolved, setShowPaymentCancelled, setCheckoutVerifying]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const pending = sessionStorage.getItem("zyene_payment_pending");
        if (pending === "true") {
            setShowPaymentCancelled(true);
            sessionStorage.removeItem("zyene_payment_pending");
        }
    }, [setShowPaymentCancelled]);
}

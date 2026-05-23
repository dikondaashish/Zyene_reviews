"use client";

import { useState } from "react";
import { createClient } from "@/lib/db/supabase/client";
import { useOnboardingStore } from "@/lib/state/onboarding-store";
import type {
    OnboardingBusiness,
    OnboardingOrganization,
    OnboardingUser,
} from "./onboarding-types";
import { useOnboardingUrlEffects } from "./use-onboarding-url-effects";
import { useOnboardingData } from "./use-onboarding-data";

export function useOnboarding() {
    const supabase = createClient();
    const { currentStep, setCurrentStep, isLoading, reset } = useOnboardingStore();
    const [user, setUser] = useState<OnboardingUser | null>(null);
    const [organization, setOrganization] = useState<OnboardingOrganization | null>(null);
    const [business, setBusiness] = useState<OnboardingBusiness | null>(null);
    const [googleConnected, setGoogleConnected] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [pendingGoogleCode, setPendingGoogleCode] = useState<string | null>(null);
    const [showPaymentCancelled, setShowPaymentCancelled] = useState(false);
    const [isStepResolved, setIsStepResolved] = useState(false);
    const [checkoutVerifying, setCheckoutVerifying] = useState(() => {
        if (typeof window === "undefined") return false;
        const p = new URLSearchParams(window.location.search);
        if (p.get("checkout_success") !== "1") return false;
        return Boolean(p.get("session_id")) || p.get("plan_switched") === "1";
    });

    useOnboardingUrlEffects({
        setCurrentStep,
        setPendingGoogleCode,
        setIsStepResolved,
        setShowPaymentCancelled,
        setCheckoutVerifying,
    });

    useOnboardingData({
        supabase,
        setUser,
        setOrganization,
        setBusiness,
        setGoogleConnected,
        setLoadError,
        setCurrentStep,
        setIsStepResolved,
        isStepResolved,
        user,
    });

    const handleBusinessUpdate = (updated: Partial<OnboardingBusiness>) => {
        setBusiness((prev) => (prev ? { ...prev, ...updated } : prev));
    };

    const handleStep1Next = () => {
        setCurrentStep(2);
    };

    return {
        currentStep,
        setCurrentStep,
        isLoading,
        reset,
        user,
        organization,
        business,
        googleConnected,
        setGoogleConnected,
        loadError,
        pendingGoogleCode,
        setPendingGoogleCode,
        showPaymentCancelled,
        isStepResolved,
        checkoutVerifying,
        handleBusinessUpdate,
        handleStep1Next,
    };
}

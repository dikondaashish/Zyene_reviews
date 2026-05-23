"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { initializeGoogleAuth, finalizeGoogleConnection } from "@/app/actions/onboarding";
import type { OnboardingGoogleInitResult, OnboardingGoogleLocationInfo } from "@/types/components";
import type { GoogleConnectionState } from "@/components/onboarding/step2-form-types";

export function useStep2GoogleConnection({
    businessId,
    initialConnected,
    pendingGoogleCode,
    onGoogleCodeConsumed,
    mounted,
    googleState,
    setGoogleState,
    updateFormAndParent,
    setAdvancing,
}: {
    businessId: string;
    initialConnected: boolean;
    pendingGoogleCode?: string | null;
    onGoogleCodeConsumed?: () => void;
    mounted: boolean;
    googleState: GoogleConnectionState;
    setGoogleState: React.Dispatch<React.SetStateAction<GoogleConnectionState>>;
    updateFormAndParent: (info: OnboardingGoogleLocationInfo, reviews?: { reviewCount?: number; averageRating?: number }) => void;
    setAdvancing: (v: boolean) => void;
}) {
    const [availableLocations, setAvailableLocations] = useState<OnboardingGoogleLocationInfo[]>([]);
    const [pendingTokens, setPendingTokens] = useState<Parameters<typeof finalizeGoogleConnection>[2] | null>(null);

    const handleGoogleCallback = async (authCode: string) => {
        setGoogleState({ status: "connecting" });
        try {
            const redirectUri =
                typeof window !== "undefined" ? `${window.location.origin}/onboarding` : undefined;
            const result = (await initializeGoogleAuth(authCode, businessId, redirectUri)) as OnboardingGoogleInitResult;

            if (result.success) {
                if (result.multipleLocations && result.locations) {
                    setAvailableLocations(result.locations);
                    if (result.tokens) {
                        setPendingTokens(result.tokens);
                    }
                    setGoogleState({ status: "success" });
                    toast.info("Multiple businesses found. Please select one.");
                } else if (result.locationInfo) {
                    setGoogleState({
                        status: "success",
                        reviewCount: result.reviewData?.reviewCount,
                        averageRating: result.reviewData?.averageRating,
                    });
                    toast.success("Google Business Profile connected!");
                    updateFormAndParent(result.locationInfo, result.reviewData);
                }
            } else {
                setGoogleState({
                    status: "error",
                    errorMessage: result.error || "Failed to connect Google Business Profile",
                });
                toast.error(result.error || "Failed to connect");
            }
        } catch {
            setGoogleState({ status: "error", errorMessage: "An unexpected error occurred" });
            toast.error("An unexpected error occurred");
        }
    };

    const handleSelection = async (location: OnboardingGoogleLocationInfo) => {
        if (!pendingTokens) {
            toast.error("Missing session data. Please reconnect.");
            return;
        }
        setAdvancing(true);
        try {
            const result = await finalizeGoogleConnection(businessId, location, pendingTokens);

            if (result.success && result.locationInfo) {
                setGoogleState({
                    status: "success",
                    reviewCount: result.reviewData?.reviewCount,
                    averageRating: result.reviewData?.averageRating,
                });
                setAvailableLocations([]);
                setPendingTokens(null);
                toast.success("Business profile selected and connected!");
                if (result.googleSyncWarning) {
                    toast.warning(result.googleSyncWarning);
                }
                updateFormAndParent(result.locationInfo, result.reviewData);
            } else {
                toast.error(result.error || "Failed to finalize connection");
            }
        } catch {
            toast.error("Failed to select business");
        } finally {
            setAdvancing(false);
        }
    };

    useEffect(() => {
        if (!mounted || googleState.status !== "idle") return;

        if (initialConnected) {
            setGoogleState({ status: "success" });
            if (pendingGoogleCode) {
                onGoogleCodeConsumed?.();
            }
            return;
        }

        if (pendingGoogleCode) {
            void handleGoogleCallback(pendingGoogleCode);
            onGoogleCodeConsumed?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingGoogleCode, initialConnected, mounted]);

    return {
        availableLocations,
        handleSelection,
    };
}

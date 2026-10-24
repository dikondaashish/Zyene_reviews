"use client";

import { ArrowRight, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Step2LocationPicker } from "./step2-location-picker";
import { ONBOARDING_ACTION, OnboardingStepCard } from "./onboarding-step-card";
import type { OnboardingGoogleLocationInfo } from "@/types/components";
import type { GoogleConnectionState } from "@/components/onboarding/step2-form-types";
import type { UseFormReturn } from "react-hook-form";
import type { StepBusinessLocationFormData } from "@/lib/validations/onboarding";

export function Step2FormGoogleStateViews({
    googleState,
    availableLocations,
    advancing,
    handleSelection,
    onSaveAndNext,
    form,
    setGoogleState,
    onRetry,
}: {
    googleState: GoogleConnectionState;
    availableLocations: OnboardingGoogleLocationInfo[];
    advancing: boolean;
    handleSelection: (loc: OnboardingGoogleLocationInfo) => void | Promise<void>;
    onSaveAndNext: () => void | Promise<void>;
    form: UseFormReturn<StepBusinessLocationFormData>;
    setGoogleState: React.Dispatch<React.SetStateAction<GoogleConnectionState>>;
    onRetry?: () => void;
}) {
    if (googleState.status === "connecting") {
        return (
            <OnboardingStepCard title="Connecting to Google…" description="Fetching your Business Profile. This takes a few seconds.">
                <Loader2 className="mx-auto size-6 animate-spin text-primary" aria-hidden />
            </OnboardingStepCard>
        );
    }

    if (googleState.status === "success" && availableLocations.length > 0) {
        return (
            <Step2LocationPicker
                locations={availableLocations}
                advancing={advancing}
                onSelect={handleSelection}
                onNotListed={() => setGoogleState({ status: "idle" })}
            />
        );
    }

    if (googleState.status === "success" && availableLocations.length === 0) {
        return (
            <OnboardingStepCard
                title="Google is connected"
                description="We found your Business Profile and filled in your details."
                footer={
                    <Button type="button" onClick={onSaveAndNext} disabled={advancing} className={ONBOARDING_ACTION}>
                        {advancing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                        Continue{!advancing && <ArrowRight className="size-4" aria-hidden />}
                    </Button>
                }
            >
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
                    <p className="text-sm font-medium text-foreground">{form.getValues("businessName")}</p>
                </div>
            </OnboardingStepCard>
        );
    }

    if (googleState.status === "error") {
        return (
            <OnboardingStepCard
                title="We couldn't connect Google"
                description={googleState.errorMessage}
                footer={
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onRetry?.();
                            setGoogleState({ status: "idle" });
                        }}
                        className={ONBOARDING_ACTION}
                    >
                        <RefreshCw className="size-4" aria-hidden /> Try again
                    </Button>
                }
            />
        );
    }

    return null;
}

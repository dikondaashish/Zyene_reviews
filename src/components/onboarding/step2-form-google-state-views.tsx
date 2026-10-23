"use client";

import { Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Step2LocationPicker } from "./step2-location-picker";
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
            <div className="flex flex-col items-center justify-center gap-5 py-20">
                <Loader2 className="animate-spin text-primary size-10" aria-hidden="true" />
                <p className="text-sm font-semibold text-foreground">Connecting to Google…</p>
            </div>
        );
    }

    if (googleState.status === "success" && availableLocations.length > 0) {
        return <Step2LocationPicker locations={availableLocations} advancing={advancing} onSelect={handleSelection} />;
    }

    if (googleState.status === "success" && availableLocations.length === 0) {
        return (
            <div className="max-w-sm mx-auto text-center space-y-6 py-10">
                <div className="rounded-2xl bg-chart-2/10 flex items-center justify-center mx-auto ring-1 ring-chart-2/20 size-16">
                    <CheckCircle2 className="text-success size-8" />
                </div>
                <div>
                    <p className="font-bold text-success text-xl">Connected!</p>
                    <p className="text-sm text-muted-foreground mt-1">{form.getValues("businessName")}</p>
                </div>
                <Button
                    type="button"
                    onClick={onSaveAndNext}
                    className="w-full h-12 bg-chart-2 hover:bg-chart-2/90 rounded-2xl font-semibold text-sm cursor-pointer"
                    disabled={advancing}
                >
                    {advancing ? <Loader2 className="animate-spin size-4" /> : "Continue Setup →"}
                </Button>
            </div>
        );
    }

    if (googleState.status === "error") {
        return (
            <div className="max-w-sm mx-auto space-y-4 py-10">
                <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm border border-destructive/20 font-medium">
                    {googleState.errorMessage}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        onRetry?.();
                        setGoogleState({ status: "idle" });
                    }}
                    className="w-full h-12 rounded-2xl font-semibold border-2 cursor-pointer"
                >
                    <RefreshCw className="mr-2 size-4" /> Try again
                </Button>
            </div>
        );
    }

    return null;
}

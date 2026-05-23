"use client";

import { Loader2, CheckCircle2, RefreshCw, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}: {
    googleState: GoogleConnectionState;
    availableLocations: OnboardingGoogleLocationInfo[];
    advancing: boolean;
    handleSelection: (loc: OnboardingGoogleLocationInfo) => void | Promise<void>;
    onSaveAndNext: () => void | Promise<void>;
    form: UseFormReturn<StepBusinessLocationFormData>;
    setGoogleState: React.Dispatch<React.SetStateAction<GoogleConnectionState>>;
}) {
    if (googleState.status === "connecting") {
        return (
            <div className="flex flex-col items-center justify-center gap-5 py-20">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-sm font-semibold text-foreground animate-pulse">Connecting to Google…</p>
            </div>
        );
    }

    if (googleState.status === "success" && availableLocations.length > 0) {
        return (
            <div className="max-w-md mx-auto space-y-5 py-8">
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto">
                        <MapPin className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-bold text-xl text-foreground">Select your business</p>
                    <p className="text-xs text-muted-foreground">
                        We found {availableLocations.length} locations. Pick one.
                    </p>
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {availableLocations.map((loc, idx) => (
                        <button
                            key={loc.name || idx}
                            type="button"
                            onClick={() => void handleSelection(loc)}
                            disabled={advancing}
                            className="w-full text-left p-4 rounded-2xl border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/[0.03] transition-all flex items-center justify-between group"
                        >
                            <div>
                                <p className="font-bold text-sm text-foreground">{loc.businessName}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{loc.fullAddress}</p>
                            </div>
                            {advancing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (googleState.status === "success" && availableLocations.length === 0) {
        return (
            <div className="max-w-sm mx-auto text-center space-y-6 py-10">
                <div className="w-16 h-16 rounded-2xl bg-chart-2/10 flex items-center justify-center mx-auto ring-1 ring-chart-2/20">
                    <CheckCircle2 className="w-8 h-8 text-chart-2" />
                </div>
                <div>
                    <p className="font-bold text-chart-2 text-xl">Connected!</p>
                    <p className="text-sm text-muted-foreground mt-1">{form.getValues("businessName")}</p>
                </div>
                <Button
                    type="button"
                    onClick={onSaveAndNext}
                    className="w-full h-12 bg-chart-2 hover:bg-chart-2/90 rounded-2xl font-semibold text-sm cursor-pointer"
                    disabled={advancing}
                >
                    {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue Setup →"}
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
                    onClick={() => setGoogleState({ status: "idle" })}
                    className="w-full h-12 rounded-2xl font-semibold border-2 cursor-pointer"
                >
                    <RefreshCw className="h-4 w-4 mr-2" /> Try again
                </Button>
            </div>
        );
    }

    return null;
}

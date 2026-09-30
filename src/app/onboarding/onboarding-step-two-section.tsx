"use client";

import { Loader2, ArrowLeft } from "lucide-react";
import { Step2Form } from "@/components/onboarding/step2-form";
import type { OnboardingBusiness } from "./onboarding-types";
import type { GoogleOAuthAuthorization } from "@/types/components";

type OnboardingStepTwoSectionProps = {
    business: OnboardingBusiness | null;
    setCurrentStep: (step: number) => void;
    isLoading: boolean;
    googleConnected: boolean;
    setGoogleConnected: (connected: boolean) => void;
    pendingGoogleCode: GoogleOAuthAuthorization | null;
    setPendingGoogleCode: (code: GoogleOAuthAuthorization | null) => void;
    googleConnectionError: string | null;
    setGoogleConnectionError: (message: string | null) => void;
    handleBusinessUpdate: (updated: Partial<OnboardingBusiness>) => void;
};

export function OnboardingStepTwoSection({
    business,
    setCurrentStep,
    isLoading,
    googleConnected,
    setGoogleConnected,
    pendingGoogleCode,
    setPendingGoogleCode,
    googleConnectionError,
    setGoogleConnectionError,
    handleBusinessUpdate,
}: OnboardingStepTwoSectionProps) {
    if (!business) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary size-8" />
            </div>
        );
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer group"
            >
                <ArrowLeft className="group-hover:-translate-x-0.5 transition-transform size-3.5" />
                Back
            </button>
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[rgba(212,160,84,0.08)] via-transparent to-primary/5 rounded-[2rem] blur-sm" />
                <div className="relative">
                    <Step2Form
                        businessId={business.id}
                        businessName={business.name}
                        city={business.city ?? ""}
                        address={business.address_line1 ?? ""}
                        state={business.state ?? ""}
                        phone={business.phone ?? ""}
                        pendingGoogleCode={pendingGoogleCode}
                        onGoogleCodeConsumed={() => setPendingGoogleCode(null)}
                        googleConnectionError={googleConnectionError}
                        onGoogleConnectionErrorConsumed={() => setGoogleConnectionError(null)}
                        onBusinessUpdate={handleBusinessUpdate}
                        initialConnected={googleConnected}
                        onNext={async () => {
                            setGoogleConnected(true);
                            setCurrentStep(3);
                        }}
                        onSkip={async () => {
                            setCurrentStep(3);
                        }}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}

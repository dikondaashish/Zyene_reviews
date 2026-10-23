"use client";

import { Loader2 } from "lucide-react";
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
            <div className="relative">
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

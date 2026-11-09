"use client";

import { Step2Form } from "@/components/onboarding/step2-form";
import type { OnboardingBusiness } from "./onboarding-types";
import { OnboardingLoadError } from "./onboarding-loading-states";
import { WORKSPACE_MISSING_MESSAGE } from "./load-onboarding-workspace";
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
        // The page only renders once the business has loaded, so a missing one is a real
        // problem (not a pending load): say so and offer a way out instead of spinning.
        return <OnboardingLoadError message={WORKSPACE_MISSING_MESSAGE} />;
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
                        country={business.country ?? "US"}
                        phone={business.phone ?? ""}
                        pendingGoogleCode={pendingGoogleCode}
                        onGoogleCodeConsumed={() => setPendingGoogleCode(null)}
                        googleConnectionError={googleConnectionError}
                        onGoogleConnectionErrorConsumed={() => setGoogleConnectionError(null)}
                        onBusinessUpdate={handleBusinessUpdate}
                        initialConnected={googleConnected}
                        onNext={async (viaGoogle) => {
                            if (viaGoogle) setGoogleConnected(true);
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

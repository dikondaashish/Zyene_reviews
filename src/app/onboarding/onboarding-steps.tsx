"use client";

import { OnboardingStepTwoSection } from "./onboarding-step-two-section";
import { OnboardingGlassStepsSection } from "./onboarding-glass-steps-section";
import type {
    OnboardingBusiness,
    OnboardingOrganization,
    OnboardingUser,
} from "./onboarding-types";

type OnboardingStepsProps = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isLoading: boolean;
    organization: OnboardingOrganization;
    business: OnboardingBusiness | null;
    user: OnboardingUser;
    googleConnected: boolean;
    setGoogleConnected: (connected: boolean) => void;
    pendingGoogleCode: string | null;
    setPendingGoogleCode: (code: string | null) => void;
    showPaymentCancelled: boolean;
    handleBusinessUpdate: (updated: Partial<OnboardingBusiness>) => void;
    handleStep1Next: () => void;
    reset: () => void;
};

export function OnboardingSteps(props: OnboardingStepsProps) {
    const { currentStep, business } = props;

    return (
        <>
            {currentStep === 2 && (
                <OnboardingStepTwoSection
                    business={business}
                    setCurrentStep={props.setCurrentStep}
                    isLoading={props.isLoading}
                    googleConnected={props.googleConnected}
                    setGoogleConnected={props.setGoogleConnected}
                    pendingGoogleCode={props.pendingGoogleCode}
                    setPendingGoogleCode={props.setPendingGoogleCode}
                    handleBusinessUpdate={props.handleBusinessUpdate}
                />
            )}
            {currentStep !== 2 && (
                <OnboardingGlassStepsSection
                    currentStep={currentStep}
                    setCurrentStep={props.setCurrentStep}
                    isLoading={props.isLoading}
                    organization={props.organization}
                    business={business}
                    user={props.user}
                    googleConnected={props.googleConnected}
                    showPaymentCancelled={props.showPaymentCancelled}
                    handleStep1Next={props.handleStep1Next}
                    reset={props.reset}
                />
            )}
        </>
    );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OnboardingStepTwoSection } from "./onboarding-step-two-section";
import { OnboardingGlassStepsSection } from "./onboarding-glass-steps-section";
import { getOnboardingStepMotion } from "./onboarding-step-motion";
import type { OnboardingBusiness, OnboardingOrganization, OnboardingUser } from "./onboarding-types";

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
    googleConnectionError: string | null;
    setGoogleConnectionError: (message: string | null) => void;
    showPaymentCancelled: boolean;
    handleBusinessUpdate: (updated: Partial<OnboardingBusiness>) => void;
    handleStep1Next: () => void;
    reset: () => void;
};

export function OnboardingSteps(props: OnboardingStepsProps) {
    const { currentStep, business } = props;
    const reduceMotion = useReducedMotion() ?? false;
    const stepMotion = getOnboardingStepMotion(reduceMotion);

    return (
        <AnimatePresence initial={false} mode="wait">
            <motion.div
                key={currentStep}
                initial={stepMotion.initial}
                animate={stepMotion.animate}
                exit={stepMotion.exit}
                transition={stepMotion.transition}
            >
                {currentStep === 2 ? (
                    <OnboardingStepTwoSection
                        business={business}
                        setCurrentStep={props.setCurrentStep}
                        isLoading={props.isLoading}
                        googleConnected={props.googleConnected}
                        setGoogleConnected={props.setGoogleConnected}
                        pendingGoogleCode={props.pendingGoogleCode}
                        setPendingGoogleCode={props.setPendingGoogleCode}
                        googleConnectionError={props.googleConnectionError}
                        setGoogleConnectionError={props.setGoogleConnectionError}
                        handleBusinessUpdate={props.handleBusinessUpdate}
                    />
                ) : (
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
            </motion.div>
        </AnimatePresence>
    );
}

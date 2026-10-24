"use client";

import { ArrowLeft } from "lucide-react";
import { Step3Form } from "@/components/onboarding/step3-form";
import { Step4SubscriptionForm } from "@/components/onboarding/step4-subscription-form";
import { Step5Form } from "@/components/onboarding/step5-form";
import { StepResults } from "@/components/onboarding/step-results";
import { StepAutomate } from "@/components/onboarding/step-automate";
import { updateOnboardingStep } from "@/app/actions/onboarding";
import { ONBOARDING_STEP, type OnboardingBusiness, type OnboardingOrganization, type OnboardingUser } from "./onboarding-types";

type OnboardingGlassStepsSectionProps = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isLoading: boolean;
    organization: OnboardingOrganization;
    business: OnboardingBusiness | null;
    user: OnboardingUser;
    googleConnected: boolean;
    showPaymentCancelled: boolean;
};

function BackButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer group"
        >
            <ArrowLeft className="group-hover:-translate-x-0.5 transition-transform size-3.5" />
            Back
        </button>
    );
}

export function OnboardingGlassStepsSection({
    currentStep,
    setCurrentStep,
    isLoading,
    organization,
    business,
    user,
    googleConnected,
    showPaymentCancelled,
}: OnboardingGlassStepsSectionProps) {
    return (
        <div className="relative">
            <div className="relative pro-card p-5 sm:p-7">
                {currentStep === ONBOARDING_STEP.details && business && (
                    <div>
                        <BackButton onClick={() => setCurrentStep(ONBOARDING_STEP.business)} />
                        <Step3Form
                            businessId={business.id}
                            businessName={business.name}
                            city={business.city ?? ""}
                            initialCategory={business.category ?? undefined}
                            defaultSupportEmail={business.email || user?.email || ""}
                            isGoogleConnected={googleConnected}
                            // Owners with Google see their own numbers before any plan is offered.
                            onNext={async () => setCurrentStep(googleConnected ? ONBOARDING_STEP.results : ONBOARDING_STEP.plan)}
                            isLoading={isLoading}
                        />
                    </div>
                )}
                {currentStep === ONBOARDING_STEP.results && business && (
                    <div>
                        <BackButton onClick={() => setCurrentStep(ONBOARDING_STEP.details)} />
                        <StepResults
                            businessId={business.id}
                            businessName={business.name}
                            onNext={() => {
                                setCurrentStep(ONBOARDING_STEP.plan);
                                void updateOnboardingStep(business.id, ONBOARDING_STEP.plan);
                            }}
                        />
                    </div>
                )}
                {currentStep === ONBOARDING_STEP.plan && organization && (
                    <div>
                        <BackButton
                            onClick={() => setCurrentStep(googleConnected ? ONBOARDING_STEP.results : ONBOARDING_STEP.details)}
                        />
                        <Step4SubscriptionForm
                            organizationId={organization.id}
                            isGoogleConnected={googleConnected}
                            isCancelled={showPaymentCancelled}
                            onNext={() => setCurrentStep(ONBOARDING_STEP.done)}
                            isLoading={isLoading}
                        />
                    </div>
                )}
                {currentStep === ONBOARDING_STEP.automate && business && (
                    <StepAutomate
                        businessId={business.id}
                        googleConnected={googleConnected}
                        onNext={() => setCurrentStep(ONBOARDING_STEP.done)}
                    />
                )}
                {currentStep === ONBOARDING_STEP.done && business && (
                    <Step5Form businessId={business.id} businessName={business.name} />
                )}
            </div>
        </div>
    );
}

"use client";

import { OnboardingStepIndicator } from "./onboarding-step-indicator";
import { OnboardingSteps } from "./onboarding-steps";
import type { useOnboarding } from "./use-onboarding";

type OnboardingContentProps = ReturnType<typeof useOnboarding>;

export function OnboardingContent(props: OnboardingContentProps) {
    const { currentStep, organization, user } = props;

    if (!organization || !user) {
        return null;
    }

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%]"
                    style={{
                        background: `
              radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.05) 0%, transparent 40%)
            `,
                    }}
                />
            </div>

            <div
                className={`relative z-10 space-y-6 mx-auto w-full pt-1 pb-20 px-4 ${currentStep === 4 ? "max-w-5xl" : currentStep === 2 ? "max-w-4xl" : "max-w-xl"}`}
            >
                <OnboardingStepIndicator currentStep={currentStep} />
                <OnboardingSteps
                    {...props}
                    organization={organization}
                    user={user}
                />
            </div>
        </div>
    );
}

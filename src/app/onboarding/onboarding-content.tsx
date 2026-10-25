"use client";

import { OnboardingStepIndicator } from "./onboarding-step-indicator";
import { OnboardingSteps } from "./onboarding-steps";
import { ONBOARDING_STEP } from "./onboarding-types";
import type { useOnboarding } from "./use-onboarding";
import { OnboardingPreviewProvider, useOnboardingPreview } from "@/components/onboarding/onboarding-preview-context";
import { OnboardingPreviewAside, OnboardingPreviewTop } from "@/components/onboarding/onboarding-preview-panel";

type OnboardingContentProps = ReturnType<typeof useOnboarding>;

export function OnboardingContent(props: OnboardingContentProps) {
    if (!props.organization || !props.user) return null;
    return (
        <OnboardingPreviewProvider>
            <OnboardingSplit {...props} />
        </OnboardingPreviewProvider>
    );
}

/** Steps on the left; the assistant and a live preview of the owner's business on the right. */
function OnboardingSplit(props: OnboardingContentProps) {
    const { currentStep, organization, user, business, googleConnected } = props;
    const { patch } = useOnboardingPreview();
    if (!organization || !user) return null;

    // The plan grid needs the full width, so the preview sits above it instead of beside it.
    const wide = currentStep === ONBOARDING_STEP.plan;
    const firstName = (user.user_metadata?.full_name || user.email || "there").split(/[\s@]/)[0];
    const shared = { step: currentStep, firstName, business, patch, googleConnected };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <OnboardingStepIndicator currentStep={currentStep} />
            <div className={wide ? "space-y-5" : "grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"}>
                <div className="min-w-0 space-y-4">
                    <OnboardingPreviewTop {...shared} alwaysShow={wide} />
                    <OnboardingSteps {...props} organization={organization} user={user} />
                </div>
                {!wide && <OnboardingPreviewAside {...shared} />}
            </div>
        </div>
    );
}

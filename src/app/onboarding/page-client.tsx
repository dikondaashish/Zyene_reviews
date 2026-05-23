"use client";

import { useOnboarding } from "./use-onboarding";
import { OnboardingContent } from "./onboarding-content";
import {
    OnboardingCheckoutVerifying,
    OnboardingInitialLoading,
    OnboardingLoadError,
} from "./onboarding-loading-states";

export default function OnboardingPage() {
    const onboarding = useOnboarding();
    const {
        loadError,
        checkoutVerifying,
        user,
        organization,
        isStepResolved,
    } = onboarding;

    if (loadError) {
        return <OnboardingLoadError message={loadError} />;
    }

    if (checkoutVerifying) {
        return <OnboardingCheckoutVerifying />;
    }

    if (!user || !organization || !isStepResolved) {
        return <OnboardingInitialLoading />;
    }

    return <OnboardingContent {...onboarding} />;
}

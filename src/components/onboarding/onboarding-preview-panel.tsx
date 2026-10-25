"use client";

import type { OnboardingBusiness } from "@/app/onboarding/onboarding-types";
import { ONBOARDING_STEP } from "@/app/onboarding/onboarding-types";
import { cn } from "@/lib/utils";
import type { OnboardingPreviewPatch } from "./onboarding-preview-context";
import { buildOnboardingPreview, buildSetupChecklist } from "./onboarding-preview-model";
import { onboardingGuideMessage } from "./onboarding-guide-copy";
import { OnboardingGuideMessage } from "./onboarding-guide-message";
import { OnboardingBusinessPreview, OnboardingBusinessStrip } from "./onboarding-business-preview";
import { OnboardingExampleReply, OnboardingSetupChecklist } from "./onboarding-preview-extras";

type PanelProps = {
    step: number;
    firstName: string;
    business: OnboardingBusiness | null;
    patch: OnboardingPreviewPatch;
    googleConnected: boolean;
};

/** Desktop: the assistant, the business as it fills in, then the setup list (or an example reply). */
export function OnboardingPreviewAside({ step, firstName, business, patch, googleConnected }: PanelProps) {
    const preview = buildOnboardingPreview(business, patch);
    return (
        <aside aria-label="Your business preview" className="hidden space-y-4 lg:sticky lg:top-8 lg:block">
            <OnboardingGuideMessage message={onboardingGuideMessage(step, firstName, preview.name, preview.reviews)} />
            <OnboardingBusinessPreview preview={preview} />
            {step === ONBOARDING_STEP.automate
                ? <OnboardingExampleReply businessName={preview.name ?? "your business"} />
                : <OnboardingSetupChecklist items={buildSetupChecklist(step, preview, googleConnected)} />}
        </aside>
    );
}

/** Above the step: the assistant and a slim business row on phones; on the wide plan step, always. */
export function OnboardingPreviewTop({ step, firstName, business, patch, alwaysShow }: PanelProps & { alwaysShow: boolean }) {
    const preview = buildOnboardingPreview(business, patch);
    return (
        <div className={cn("space-y-3", alwaysShow ? "lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-8 lg:space-y-0" : "lg:hidden")}>
            <OnboardingGuideMessage message={onboardingGuideMessage(step, firstName, preview.name, preview.reviews)} />
            <OnboardingBusinessStrip preview={preview} />
        </div>
    );
}

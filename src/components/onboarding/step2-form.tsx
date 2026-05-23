"use client";

import type { Step2FormProps } from "@/components/onboarding/step2-form-types";
import { useStep2FormController } from "@/components/onboarding/use-step2-form-controller";
import { Step2FormGoogleStateViews } from "@/components/onboarding/step2-form-google-state-views";
import { Step2FormGoogleConnectPanel } from "@/components/onboarding/step2-form-google-connect-panel";
import { Step2FormManualEntryPanel } from "@/components/onboarding/step2-form-manual-entry-panel";

export function Step2Form(props: Step2FormProps) {
    const { isLoading } = props;
    const c = useStep2FormController(props);

    if (!c.mounted) return null;

    if (c.googleState.status !== "idle") {
        return (
            <Step2FormGoogleStateViews
                googleState={c.googleState}
                availableLocations={c.availableLocations}
                advancing={c.advancing}
                handleSelection={c.handleSelection}
                onSaveAndNext={c.onSaveAndNext}
                form={c.form}
                setGoogleState={c.setGoogleState}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-border bg-card/80 backdrop-blur-xl">
            <Step2FormGoogleConnectPanel onConnectClick={c.handleConnectClick} />
            <Step2FormManualEntryPanel
                form={c.form}
                isLoading={isLoading}
                googleState={c.googleState}
                advancing={c.advancing}
                onSaveAndNext={c.onSaveAndNext}
                onSkip={c.handleSkip}
            />
        </div>
    );
}

export type { Step2FormProps } from "@/components/onboarding/step2-form-types";

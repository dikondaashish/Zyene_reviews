"use client";

import type { Step2FormProps } from "@/components/onboarding/step2-form-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStep2FormController } from "@/components/onboarding/use-step2-form-controller";
import { Step2FormGoogleStateViews } from "@/components/onboarding/step2-form-google-state-views";
import { Step2FormGoogleConnectPanel } from "@/components/onboarding/step2-form-google-connect-panel";
import { Step2ContinueButton, Step2FormManualEntryPanel } from "@/components/onboarding/step2-form-manual-entry-panel";
import { ONBOARDING_ACTION, OnboardingStepCard } from "@/components/onboarding/onboarding-step-card";

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
                onRetry={c.onGoogleConnectionErrorConsumed}
            />
        );
    }

    const busy = c.advancing || isLoading;
    return (
        <form onSubmit={c.form.handleSubmit(c.onSaveAndNext)}>
            <OnboardingStepCard
                title="Connect your business"
                description="Tell us which business to look after. Connecting Google is fastest."
                footer={<>
                    <Button type="button" variant="ghost" onClick={() => void c.handleSkip()} disabled={busy}
                        className={cn(ONBOARDING_ACTION, "font-medium text-muted-foreground sm:mr-auto")}>
                        I&apos;ll do this later
                    </Button>
                    <Step2ContinueButton form={c.form} busy={busy} />
                </>}
            >
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-border">
                    <div className="lg:pr-6">
                        <Step2FormGoogleConnectPanel
                            onConnectClick={c.handleConnectClick}
                            pending={c.googleRedirectPending}
                            disabled={busy}
                        />
                    </div>
                    <div className="border-t border-border pt-6 lg:border-t-0 lg:pl-6 lg:pt-0">
                        <Step2FormManualEntryPanel form={c.form} disabled={isLoading || c.googleRedirectPending} />
                    </div>
                </div>
            </OnboardingStepCard>
        </form>
    );
}

export type { Step2FormProps } from "@/components/onboarding/step2-form-types";

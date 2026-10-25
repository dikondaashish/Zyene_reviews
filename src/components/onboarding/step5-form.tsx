"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStep5Form } from "./use-step5-form";
import { ONBOARDING_ACTION, OnboardingStepCard } from "./onboarding-step-card";

/** Finishes setup and opens the dashboard; the welcome there does the celebrating. */
export function Step5Form({ businessId, businessName }: { businessId: string; businessName: string }) {
    const { error, retry } = useStep5Form(businessId);

    return (
        <div role="status">
            <OnboardingStepCard
                title={error ? "Almost there" : `Opening ${businessName}…`}
                description={error ?? "Finishing your set-up. This takes a moment."}
                footer={error ? <Button type="button" onClick={retry} className={ONBOARDING_ACTION}>Try again</Button> : null}
            >
                {error ? null : <Loader2 className="mx-auto size-6 animate-spin text-primary" aria-hidden />}
            </OnboardingStepCard>
        </div>
    );
}

"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportProgress, ResultsStats, UnhappySamples } from "./step-results-parts";
import { useStepResults } from "./use-step-results";
import { useOnboardingPreview } from "./onboarding-preview-context";
import { ONBOARDING_ACTION, OnboardingStepCard } from "./onboarding-step-card";

/**
 * The first look at their own business, before any plan is offered: rating, reviews and what is
 * waiting for a reply. Counts use the same definitions as the dashboard.
 */
export function StepResults({ businessId, businessName, onNext }: { businessId: string; businessName: string; onNext: () => void }) {
    const { updatePreview } = useOnboardingPreview();
    const { results, error, waitedLong } = useStepResults(businessId, updatePreview);
    const importing = !results || results.status === "importing";

    let body: React.ReactNode;
    if (error) {
        body = <p className="text-sm text-muted-foreground">{error}</p>;
    } else if (importing) {
        body = <ImportProgress waitedLong={waitedLong} />;
    } else if (results.status === "failed") {
        body = (
            <p className="text-sm text-muted-foreground">
                We couldn&apos;t import your reviews yet. We&apos;ll keep trying, and they&apos;ll appear on your dashboard.
            </p>
        );
    } else if (results.total === 0) {
        body = (
            <p className="text-sm text-muted-foreground">
                No Google reviews yet. That&apos;s fine: Zyene will help you ask your customers for your first ones.
            </p>
        );
    } else {
        body = (
            <div className="space-y-5">
                <ResultsStats results={results} />
                <UnhappySamples results={results} />
                <p className="text-sm leading-6 text-muted-foreground">
                    {results.unanswered > 0
                        ? "Next, pick a plan and Zyene will draft replies to these for you to check and post."
                        : "Every review has a reply. Next, pick a plan and Zyene will keep it that way and help you get more."}
                </p>
            </div>
        );
    }

    return (
        <OnboardingStepCard
            title={error ? "Your results" : importing ? "Getting your reviews" : `Here's where ${businessName} stands`}
            description="Your real numbers from Google, so you can see where Zyene can help first."
            footer={
                <Button type="button" onClick={onNext} className={ONBOARDING_ACTION}>
                    Continue<ArrowRight className="size-4" aria-hidden />
                </Button>
            }
        >
            {body}
        </OnboardingStepCard>
    );
}

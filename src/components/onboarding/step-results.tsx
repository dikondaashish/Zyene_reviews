"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsStats, UnhappySamples } from "./step-results-parts";
import { useStepResults } from "./use-step-results";

/**
 * The first look at their own business, before any plan is offered: rating, reviews and what is
 * waiting for a reply. Counts use the same definitions as the dashboard.
 */
export function StepResults({ businessId, businessName, onNext }: { businessId: string; businessName: string; onNext: () => void }) {
    const { results, error, waitedLong } = useStepResults(businessId);
    const importing = !results || results.status === "importing";

    let body: React.ReactNode;
    if (error) {
        body = <p className="text-sm text-muted-foreground">{error}</p>;
    } else if (importing) {
        body = (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-4" role="status">
                <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-primary" aria-hidden />
                <div className="text-sm">
                    <p className="font-medium text-foreground">Importing your Google reviews…</p>
                    <p className="mt-0.5 text-muted-foreground">
                        {waitedLong
                            ? "This is taking longer than usual. Carry on and we'll finish in the background."
                            : "This usually takes under a minute."}
                    </p>
                </div>
            </div>
        );
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
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="ui-page-title text-foreground">
                    {importing ? "Getting your reviews" : `Here's where ${businessName} stands`}
                </h1>
                <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Your real numbers from Google, so you can see where Zyene can help first.
                </p>
            </div>
            {body}
            <Button type="button" onClick={onNext} className="cta-button h-12 w-full text-sm font-semibold">
                Continue
                <ArrowRight className="ml-2 size-5" aria-hidden />
            </Button>
        </div>
    );
}

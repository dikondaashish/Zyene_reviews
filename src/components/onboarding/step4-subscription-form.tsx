"use client";

import { useLanguage } from "@/lib/language-context";
import { Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Step4SubscriptionFormProps } from "./step4-subscription-form-types";
import { useStep4SubscriptionForm } from "./use-step4-subscription-form";
import { step4YearlySavingsPercent } from "./step4-subscription-plan-math";
import { Step4SubscriptionDecorativeShell } from "./step4-subscription-decorative-shell";
import { Step4SubscriptionIntervalToggle } from "./step4-subscription-interval-toggle";
import { Step4SubscriptionPlanGrid } from "./step4-subscription-plan-grid";
import { Step4SubscriptionFormFooter } from "./step4-subscription-form-footer";

export function Step4SubscriptionForm({
    organizationId,
    isGoogleConnected: _isGoogleConnected,
    isCancelled = false,
    onNext,
    isLoading: externalIsLoading = false,
}: Step4SubscriptionFormProps) {
    void _isGoogleConnected;
    const { dict } = useLanguage();
    const b = dict.billing;
    const s = useStep4SubscriptionForm(organizationId, externalIsLoading, onNext);
    const yearlySavings = step4YearlySavingsPercent();
    const intervalLabel = s.interval === "month" ? "/mo" : "/yr";

    return (
        <div className="space-y-6">
            <Step4SubscriptionDecorativeShell>
                {isCancelled && (
                    <Alert className="mb-6 bg-primary/10 border-primary/20">
                        <Zap className="text-primary size-4" />
                        <AlertTitle className="text-foreground">Payment not completed</AlertTitle>
                        <AlertDescription className="text-muted-foreground">
                            It looks like the checkout process wasn&apos;t finished. You can try again or choose a
                            different plan.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-left">Unlock the full power of Zyene</h3>
                        <p className="text-xs text-muted-foreground text-left mt-1">
                            Your business is set up — choose a plan to start managing reviews with AI.
                        </p>
                    </div>
                    <Step4SubscriptionIntervalToggle
                        interval={s.interval}
                        onIntervalChange={s.setInterval}
                        yearlySavings={yearlySavings}
                    />
                </div>

                <Step4SubscriptionPlanGrid
                    displayPlans={s.displayPlans}
                    enterprisePlan={s.enterprisePlan}
                    intervalLabel={intervalLabel}
                    trialIncludedText={b.trial_included}
                    startTrialCta={b.start_trial_cta}
                    subscribeCta={b.subscribe_cta}
                    checkoutOffersTrial={s.checkoutOffersTrial}
                    trialEligibilityLoading={s.trialEligibilityLoading}
                    loadingPlanId={s.loadingPlan}
                    planBusy={s.planBusy}
                    onSubscribe={s.onSubscribe}
                />
            </Step4SubscriptionDecorativeShell>

            <Step4SubscriptionFormFooter busy={s.busy} onSkip={s.handleSkip} />
        </div>
    );
}

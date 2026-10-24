"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStepAutomate } from "./use-step-automate";
import { ONBOARDING_ACTION, OnboardingStepCard } from "./onboarding-step-card";

/** Sets reply rules in one choice, then says plainly what Zyene will now do. */
export function StepAutomate({ businessId, googleConnected, onNext }: { businessId: string; googleConnected: boolean; onNext: () => void }) {
    const { plan, options, selected, setChoice, saving, save, skip, checkAgain } = useStepAutomate(businessId, onNext);

    if (!googleConnected) {
        return (
            <OnboardingStepCard
                title="Automate your replies"
                description="Connect your Google Business Profile from Integrations, then Zyene can draft and post replies for you."
                footer={
                    <Button type="button" onClick={onNext} className={ONBOARDING_ACTION}>
                        Continue<ArrowRight className="size-4" aria-hidden />
                    </Button>
                }
            />
        );
    }

    return (
        <OnboardingStepCard
            title="How should Zyene handle replies?"
            description="This applies to new Google reviews. You can change it any time in Settings, Reply rules."
            footer={plan ? (
                <>
                    <Button type="button" variant="ghost" onClick={skip} disabled={saving} className={cn(ONBOARDING_ACTION, "font-medium text-muted-foreground sm:mr-auto")}>
                        Skip for now
                    </Button>
                    <Button type="button" onClick={() => void save()} disabled={saving || !selected} className={ONBOARDING_ACTION}>
                        {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                        Turn it on<ArrowRight className="size-4" aria-hidden />
                    </Button>
                </>
            ) : null}
        >
            {!plan ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground" role="status">
                    <Loader2 className="size-4 animate-spin" aria-hidden />Checking what your plan includes…
                </div>
            ) : (
                <div className="space-y-4">
                    <div role="radiogroup" aria-label="Reply set-up" className="space-y-2">
                        {options.map((option) => {
                            const active = selected?.id === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setChoice(option.id)}
                                    className={cn(
                                        "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                                        active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                                    )}
                                >
                                    <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border", active ? "border-primary bg-primary" : "border-border")} aria-hidden>
                                        {active && <Check className="size-3 text-primary-foreground" />}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium text-foreground">{option.title}</span>
                                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {!plan.aiAllowed && (
                        <p className="text-xs text-muted-foreground">
                            Your plan is still switching on, so only this option is ready.{" "}
                            <button type="button" onClick={checkAgain} className="font-medium text-primary hover:underline">Check again</button>
                        </p>
                    )}
                    {plan.aiAllowed && !plan.autoAllowed && (
                        <p className="text-xs text-muted-foreground">Posting replies automatically comes with the Growth plan.</p>
                    )}

                    {selected && (
                        <section aria-labelledby="will-now-title" className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                            <h2 id="will-now-title" className="ui-section-title text-foreground">Zyene will now</h2>
                            <ul className="mt-2 space-y-1.5">
                                {["Keep your Google reviews in sync", ...selected.willNow].map((line) => (
                                    <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{line}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            )}
        </OnboardingStepCard>
    );
}

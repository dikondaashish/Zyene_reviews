"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStepAutomate } from "./use-step-automate";

/** Sets reply rules in one choice, then says plainly what Zyene will now do. */
export function StepAutomate({ businessId, googleConnected, onNext }: { businessId: string; googleConnected: boolean; onNext: () => void }) {
    const { plan, options, selected, setChoice, saving, save, skip, checkAgain } = useStepAutomate(businessId, onNext);

    if (!googleConnected) {
        return (
            <div className="space-y-6 text-center">
                <h1 className="ui-page-title text-foreground">Automate your replies</h1>
                <p className="text-sm text-muted-foreground">
                    Connect your Google Business Profile from Integrations, then Zyene can draft and post replies for you.
                </p>
                <Button type="button" onClick={onNext} className="cta-button h-12 w-full text-sm font-semibold">
                    Continue<ArrowRight className="ml-2 size-5" aria-hidden />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="ui-page-title text-foreground">How should Zyene handle replies?</h1>
                <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    This applies to new Google reviews. You can change it any time in Settings, Reply rules.
                </p>
            </div>

            {!plan ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground" role="status">
                    <Loader2 className="size-4 animate-spin" aria-hidden />Checking what your plan includes…
                </div>
            ) : (
                <>
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
                                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                                        active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40",
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
                        <section aria-labelledby="will-now-title" className="rounded-xl border border-border bg-background px-4 py-3">
                            <h2 id="will-now-title" className="ui-section-title">Zyene will now</h2>
                            <ul className="mt-2 space-y-1.5">
                                {["Keep your Google reviews in sync", ...selected.willNow].map((line) => (
                                    <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{line}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <Button type="button" onClick={() => void save()} disabled={saving || !selected} className="cta-button h-12 w-full text-sm font-semibold">
                        {saving ? <Loader2 className="mr-2 size-5 animate-spin" aria-hidden /> : null}
                        Turn it on<ArrowRight className="ml-2 size-5" aria-hidden />
                    </Button>
                    <button type="button" onClick={skip} disabled={saving} className="w-full text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
                        Skip for now
                    </button>
                </>
            )}
        </div>
    );
}

"use client";

import { cn } from "@/lib/utils";
import { ONBOARDING_PHASES, onboardingPhaseIndex } from "./onboarding-types";

/** Segmented progress bar: one segment per phase, labels underneath on wider screens. */
export function OnboardingStepIndicator({ currentStep }: { currentStep: number }) {
    const activeIndex = onboardingPhaseIndex(currentStep);
    const active = ONBOARDING_PHASES[activeIndex];

    return (
        <nav aria-label="Setup progress" className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground sm:hidden">
                Step {activeIndex + 1} of {ONBOARDING_PHASES.length}
                <span className="text-foreground"> · {active.label}</span>
            </p>
            <ol className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${ONBOARDING_PHASES.length}, minmax(0, 1fr))` }}>
                {ONBOARDING_PHASES.map((phase, index) => {
                    const reached = index <= activeIndex;
                    const isActive = index === activeIndex;
                    return (
                        <li key={phase.label} aria-current={isActive ? "step" : undefined} className="min-w-0">
                            <div className={cn("h-1 rounded-full transition-colors duration-300", reached ? "bg-primary" : "bg-border")} />
                            <span
                                className={cn(
                                    "mt-2 block truncate text-xs max-sm:sr-only",
                                    isActive ? "font-semibold text-foreground" : reached ? "font-medium text-muted-foreground" : "text-muted-foreground/70",
                                )}
                            >
                                {phase.label}
                            </span>
                            <span className="sr-only">{index < activeIndex ? " (done)" : isActive ? " (current)" : ""}</span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

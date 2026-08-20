"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardTourTooltipActions({
    isFirstStep,
    isLastStep,
    totalSteps,
    skipTour,
    prevStep,
    nextStep,
    completeTour,
}: {
    isFirstStep: boolean;
    isLastStep: boolean;
    totalSteps: number;
    skipTour: () => void;
    prevStep: () => void;
    nextStep: (n: number) => void;
    completeTour: () => Promise<void>;
}) {
    return (
        <div className="tour-tooltip-actions">
            {isFirstStep ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="tour-btn-skip"
                    onClick={skipTour}
                >
                    Skip
                </Button>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="tour-btn-prev"
                    onClick={prevStep}
                >
                    <ChevronLeft />
                    Prev
                </Button>
            )}
            <Button
                type="button"
                size="sm"
                className={isLastStep ? "tour-btn-finish" : "tour-btn-next"}
                onClick={() => (isLastStep ? void completeTour() : nextStep(totalSteps))}
            >
                {isLastStep ? (
                    <>
                        Got it
                        <Check />
                    </>
                ) : (
                    <>
                        Next
                        <ChevronRight />
                    </>
                )}
            </Button>
        </div>
    );
}

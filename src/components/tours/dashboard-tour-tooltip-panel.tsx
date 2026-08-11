"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TourStep } from "@/lib/tours/dashboard-tour";
import type { DashboardTourTargetRect } from "@/components/tours/dashboard-tour-types";
import { spring } from "@/lib/motion/springs";

/**
 * Scale the tooltip out of the edge that faces its target, so the spatial
 * relationship between the highlighted element and the panel stays obvious.
 * A panel placed below its target grows downward from its own top edge.
 */
const TOOLTIP_ORIGIN: Record<string, string> = {
    top: "bottom center",
    bottom: "top center",
    left: "center right",
    right: "center left",
    center: "center center",
};

export function DashboardTourTooltipPanel({
    tooltipRef,
    currentStep,
    tooltipPos,
    targetRect,
    step,
    steps,
    totalSteps,
    skipTour,
    prevStep,
    nextStep,
    completeTour,
}: {
    tooltipRef: React.RefObject<HTMLDivElement | null>;
    currentStep: number;
    tooltipPos: { top: number; left: number; actualPlacement: TourStep["placement"] | "center" };
    targetRect: DashboardTourTargetRect | null;
    step: TourStep;
    steps: TourStep[];
    totalSteps: number;
    skipTour: () => void;
    prevStep: () => void;
    nextStep: (n: number) => void;
    completeTour: () => Promise<void>;
}) {
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                ref={tooltipRef}
                key={`tooltip-${currentStep}`}
                className="tour-tooltip"
                style={{
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                    transformOrigin:
                        TOOLTIP_ORIGIN[tooltipPos.actualPlacement ?? "center"] ?? "center center",
                }}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                // Leave along the path it arrived on. Exiting to -10 sent the panel
                // out the opposite side from where it came in, which reads as a
                // different element appearing rather than this one leaving.
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={spring.snappy}
            >
                {targetRect && tooltipPos.actualPlacement !== "center" && (
                    <div className={`tour-arrow tour-arrow-${tooltipPos.actualPlacement}`} />
                )}

                <div className="tour-tooltip-card">
                    <div className="tour-tooltip-header">
                        <div className="tour-tooltip-header-content">
                            <div className="tour-tooltip-title-row">
                                <span className="tour-tooltip-icon">{step.icon}</span>
                                <h3 className="tour-tooltip-title">{step.title}</h3>
                            </div>
                            <button
                                type="button"
                                className="tour-tooltip-close"
                                onClick={skipTour}
                                aria-label="Close tour"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="tour-tooltip-body">{step.description}</div>

                    <div className="tour-tooltip-footer">
                        <div className="tour-tooltip-progress">
                            <span className="tour-tooltip-step-counter">
                                {currentStep + 1}/{totalSteps}
                            </span>
                            <div className="tour-tooltip-dots">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`tour-tooltip-dot ${
                                            i === currentStep ? "active" : i < currentStep ? "completed" : ""
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="tour-tooltip-actions">
                            {isFirstStep && (
                                <button type="button" className="tour-btn tour-btn-skip" onClick={skipTour}>
                                    Skip
                                </button>
                            )}
                            {!isFirstStep && (
                                <button type="button" className="tour-btn tour-btn-prev" onClick={prevStep}>
                                    ← Prev
                                </button>
                            )}
                            <button
                                type="button"
                                className={`tour-btn ${isLastStep ? "tour-btn-finish" : "tour-btn-next"}`}
                                onClick={() => (isLastStep ? void completeTour() : nextStep(totalSteps))}
                            >
                                {isLastStep ? "Got it! 🎉" : "Next →"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

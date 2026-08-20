"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { DashboardTourTooltipActions } from "@/components/tours/dashboard-tour-tooltip-actions";
import { TOUR_STEP_ICON_MAP } from "@/components/tours/dashboard-tour-icons";
import type { TourStep } from "@/lib/tours/dashboard-tour";
import type { DashboardTourTargetRect } from "@/components/tours/dashboard-tour-types";
import { spring } from "@/lib/motion/springs";

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
    tooltipPos: {
        top: number;
        left: number;
        actualPlacement: TourStep["placement"] | "center";
        arrowOffset: number;
    };
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
    const StepIcon = TOUR_STEP_ICON_MAP[step.icon];

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
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={spring.snappy}
            >
                {targetRect && tooltipPos.actualPlacement !== "center" && (
                    <div
                        className={`tour-arrow tour-arrow-${tooltipPos.actualPlacement}`}
                        style={
                            tooltipPos.actualPlacement === "left" ||
                            tooltipPos.actualPlacement === "right"
                                ? { top: tooltipPos.arrowOffset }
                                : { left: tooltipPos.arrowOffset }
                        }
                    />
                )}

                <div className="tour-tooltip-card">
                    <div className="tour-tooltip-header">
                        <div className="tour-tooltip-header-content">
                            <div className="tour-tooltip-title-row">
                                <span
                                    className="tour-tooltip-icon"
                                    data-tour-icon={step.icon}
                                    aria-hidden
                                >
                                    <StepIcon className="size-4" />
                                </span>
                                <h3 className="tour-tooltip-title">{step.title}</h3>
                            </div>
                            <button
                                type="button"
                                className="tour-tooltip-close"
                                onClick={skipTour}
                                aria-label="Close tour"
                            >
                                <X className="size-3.5" />
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
                                            i === currentStep
                                                ? "active"
                                                : i < currentStep
                                                  ? "completed"
                                                  : ""
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <DashboardTourTooltipActions
                            isFirstStep={isFirstStep}
                            isLastStep={isLastStep}
                            totalSteps={totalSteps}
                            skipTour={skipTour}
                            prevStep={prevStep}
                            nextStep={nextStep}
                            completeTour={completeTour}
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

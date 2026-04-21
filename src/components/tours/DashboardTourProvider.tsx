"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardTourSteps, type TourStep } from "@/lib/tours/dashboard-tour";
import { useDashboardTour } from "@/hooks/use-dashboard-tour";
import "./dashboard-tour.css";

interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const SPOTLIGHT_PADDING = 10;
const TOOLTIP_GAP = 16;

/**
 * Calculate tooltip position based on target element rect and placement
 */
function getTooltipPosition(
    rect: TargetRect,
    placement: TourStep["placement"],
    tooltipWidth: number,
    tooltipHeight: number
): { top: number; left: number; actualPlacement: TourStep["placement"] } {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top = 0;
    let left = 0;
    let actualPlacement = placement;

    switch (placement) {
        case "right":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left + rect.width + TOOLTIP_GAP + SPOTLIGHT_PADDING;
            // Fallback to bottom if out of viewport
            if (left + tooltipWidth > viewportW - 16) {
                actualPlacement = "bottom";
                top = rect.top + rect.height + TOOLTIP_GAP + SPOTLIGHT_PADDING;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
            }
            break;
        case "left":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - TOOLTIP_GAP - SPOTLIGHT_PADDING;
            if (left < 16) {
                actualPlacement = "bottom";
                top = rect.top + rect.height + TOOLTIP_GAP + SPOTLIGHT_PADDING;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
            }
            break;
        case "bottom":
            top = rect.top + rect.height + TOOLTIP_GAP + SPOTLIGHT_PADDING;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
        case "top":
            top = rect.top - tooltipHeight - TOOLTIP_GAP - SPOTLIGHT_PADDING;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            if (top < 16) {
                actualPlacement = "bottom";
                top = rect.top + rect.height + TOOLTIP_GAP + SPOTLIGHT_PADDING;
            }
            break;
        default:
            // center
            top = viewportH / 2 - tooltipHeight / 2;
            left = viewportW / 2 - tooltipWidth / 2;
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, viewportW - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportH - tooltipHeight - 16));

    return { top, left, actualPlacement };
}

/**
 * Dashboard Tour Component
 * Custom-built product tour with spotlight overlay, animated tooltips, and step navigation
 */
export function DashboardTourProvider() {
    const {
        runTour,
        currentStep,
        isLoading,
        completeTour,
        skipTour,
        nextStep,
        prevStep,
    } = useDashboardTour();

    const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
    const [tooltipSize, setTooltipSize] = useState({ width: 380, height: 280 });
    const [mounted, setMounted] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const steps = dashboardTourSteps;
    const step = steps[currentStep];
    const totalSteps = steps.length;

    // Client-side only
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update target rect when step changes
    const updateTargetRect = useCallback(() => {
        if (!step) return;
        const el = document.querySelector(`[data-tour-target="${step.target}"]`);
        if (el) {
            // Scroll into view if needed
            el.scrollIntoView({ behavior: "smooth", block: "center" });

            const rect = el.getBoundingClientRect();
            setTargetRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        } else {
            setTargetRect(null);
        }
    }, [step]);

    useEffect(() => {
        if (!runTour || !step) return;

        // Initial position
        updateTargetRect();

        // Re-calculate on scroll/resize
        const handleUpdate = () => updateTargetRect();
        window.addEventListener("scroll", handleUpdate, true);
        window.addEventListener("resize", handleUpdate);

        return () => {
            window.removeEventListener("scroll", handleUpdate, true);
            window.removeEventListener("resize", handleUpdate);
        };
    }, [runTour, step, updateTargetRect]);

    // Measure tooltip size on render
    useEffect(() => {
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            setTooltipSize({ width: rect.width, height: rect.height });
        }
    }, [currentStep, runTour]);

    // Lock body scroll during tour
    useEffect(() => {
        if (runTour) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [runTour]);

    if (!mounted || isLoading || !runTour || !step) {
        return null;
    }

    const tooltipPos = targetRect
        ? getTooltipPosition(targetRect, step.placement, tooltipSize.width, tooltipSize.height)
        : {
            top: window.innerHeight / 2 - tooltipSize.height / 2,
            left: window.innerWidth / 2 - tooltipSize.width / 2,
            actualPlacement: "center" as const,
        };

    const spotlightX = targetRect ? targetRect.left - SPOTLIGHT_PADDING : 0;
    const spotlightY = targetRect ? targetRect.top - SPOTLIGHT_PADDING : 0;
    const spotlightW = targetRect ? targetRect.width + SPOTLIGHT_PADDING * 2 : 0;
    const spotlightH = targetRect ? targetRect.height + SPOTLIGHT_PADDING * 2 : 0;

    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    const tourContent = (
        <AnimatePresence mode="wait">
            {runTour && (
                <motion.div
                    key="tour-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Dark overlay with spotlight cutout using SVG mask */}
                    <svg
                        className="tour-spotlight-svg"
                        style={{ pointerEvents: "all" }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <defs>
                            <mask id="tour-spotlight-mask">
                                <rect
                                    x="0"
                                    y="0"
                                    width="100%"
                                    height="100%"
                                    fill="white"
                                />
                                {targetRect && (
                                    <rect
                                        x={spotlightX}
                                        y={spotlightY}
                                        width={spotlightW}
                                        height={spotlightH}
                                        rx="12"
                                        ry="12"
                                        fill="black"
                                    />
                                )}
                            </mask>
                        </defs>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="var(--tour-overlay-scrim)"
                            mask="url(#tour-spotlight-mask)"
                        />
                    </svg>

                    {/* Spotlight ring */}
                    {targetRect && (
                        <motion.div
                            className="tour-spotlight-ring"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                top: spotlightY,
                                left: spotlightX,
                                width: spotlightW,
                                height: spotlightH,
                            }}
                            transition={{
                                duration: 0.4,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                        />
                    )}

                    {/* Tooltip */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            ref={tooltipRef}
                            key={`tooltip-${currentStep}`}
                            className="tour-tooltip"
                            style={{
                                top: tooltipPos.top,
                                left: tooltipPos.left,
                            }}
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.96 }}
                            transition={{
                                duration: 0.35,
                                ease: [0.4, 0, 0.2, 1],
                                delay: 0.05,
                            }}
                        >
                            {/* Arrow */}
                            {targetRect && tooltipPos.actualPlacement !== "center" && (
                                <div
                                    className={`tour-arrow tour-arrow-${tooltipPos.actualPlacement}`}
                                />
                            )}

                            <div className="tour-tooltip-card">
                                {/* Header */}
                                <div className="tour-tooltip-header">
                                    <div className="tour-tooltip-header-content">
                                        <div className="tour-tooltip-title-row">
                                            <span className="tour-tooltip-icon">
                                                {step.icon}
                                            </span>
                                            <h3 className="tour-tooltip-title">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <button
                                            className="tour-tooltip-close"
                                            onClick={skipTour}
                                            aria-label="Close tour"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="tour-tooltip-body">
                                    {step.description}
                                </div>

                                {/* Footer */}
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

                                    <div className="tour-tooltip-actions">
                                        {isFirstStep && (
                                            <button
                                                className="tour-btn tour-btn-skip"
                                                onClick={skipTour}
                                            >
                                                Skip
                                            </button>
                                        )}
                                        {!isFirstStep && (
                                            <button
                                                className="tour-btn tour-btn-prev"
                                                onClick={prevStep}
                                            >
                                                ← Prev
                                            </button>
                                        )}
                                        <button
                                            className={`tour-btn ${isLastStep ? "tour-btn-finish" : "tour-btn-next"}`}
                                            onClick={() =>
                                                isLastStep
                                                    ? completeTour()
                                                    : nextStep(totalSteps)
                                            }
                                        >
                                            {isLastStep ? "Got it! 🎉" : "Next →"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(tourContent, document.body);
}

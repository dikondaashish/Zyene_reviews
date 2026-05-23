"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import {
    completeTour as completeTourAction,
    getTourStatus,
    resetTour as resetTourAction,
} from "@/app/actions/tour";
import { dashboardTourSteps, type TourStep } from "@/lib/tours/dashboard-tour";
import "./dashboard-tour.css";

interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const SPOTLIGHT_PADDING = 10;
const TOOLTIP_GAP = 16;

export type DashboardTourContextValue = {
    runTour: boolean;
    currentStep: number;
    isLoading: boolean;
    completeTour: () => Promise<void>;
    startTour: () => Promise<void>;
    skipTour: () => void;
    nextStep: (totalSteps: number) => void;
    prevStep: () => void;
};

const DashboardTourContext = createContext<DashboardTourContextValue | null>(null);

/**
 * Shared dashboard tour controls (must be used under {@link DashboardTourProvider}).
 */
export function useDashboardTour(): DashboardTourContextValue {
    const ctx = useContext(DashboardTourContext);
    if (!ctx) {
        throw new Error("useDashboardTour must be used within DashboardTourProvider");
    }
    return ctx;
}

function useDashboardTourState(): DashboardTourContextValue {
    const [runTour, setRunTour] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        let cancelled = false;

        const checkTourStatus = async () => {
            try {
                const forceTour = searchParams.get("tour") === "true";

                if (!cancelled && forceTour) {
                    setRunTour(true);
                    setIsLoading(false);
                    return;
                }

                const hasCompleted = await getTourStatus();

                if (!cancelled && !hasCompleted) {
                    setTimeout(() => {
                        if (!cancelled) {
                            setRunTour(true);
                        }
                    }, 500);
                }
            } catch (error) {
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        checkTourStatus();
        return () => {
            cancelled = true;
        };
    }, [pathname, searchParams]);

    const completeTour = useCallback(async () => {
        setRunTour(false);
        setCurrentStep(0);
        try {
            await completeTourAction();
        } catch (error) {
        }
    }, []);

    const startTour = useCallback(async () => {
        try {
            await resetTourAction();
        } catch (error) {
        }
        setCurrentStep(0);
        setRunTour(true);
    }, []);

    const skipTour = useCallback(() => {
        void completeTour();
    }, [completeTour]);

    const nextStep = useCallback(
        (totalSteps: number) => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep((prev) => prev + 1);
            } else {
                void completeTour();
            }
        },
        [currentStep, completeTour],
    );

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    return useMemo(
        () => ({
            runTour,
            currentStep,
            isLoading,
            completeTour,
            startTour,
            skipTour,
            nextStep,
            prevStep,
        }),
        [
            runTour,
            currentStep,
            isLoading,
            completeTour,
            startTour,
            skipTour,
            nextStep,
            prevStep,
        ],
    );
}

/**
 * Calculate tooltip position based on target element rect and placement
 */
function getTooltipPosition(
    rect: TargetRect,
    placement: TourStep["placement"],
    tooltipWidth: number,
    tooltipHeight: number,
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
            top = viewportH / 2 - tooltipHeight / 2;
            left = viewportW / 2 - tooltipWidth / 2;
    }

    left = Math.max(16, Math.min(left, viewportW - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportH - tooltipHeight - 16));

    return { top, left, actualPlacement };
}

function DashboardTourPortal() {
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

    useEffect(() => {
        setMounted(true);
    }, []);

    const updateTargetRect = useCallback(() => {
        if (!step) return;
        const el = document.querySelector(`[data-tour-target="${step.target}"]`);
        if (el) {
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

        updateTargetRect();

        const handleUpdate = () => updateTargetRect();
        window.addEventListener("scroll", handleUpdate, true);
        window.addEventListener("resize", handleUpdate);

        return () => {
            window.removeEventListener("scroll", handleUpdate, true);
            window.removeEventListener("resize", handleUpdate);
        };
    }, [runTour, step, updateTargetRect]);

    useEffect(() => {
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            setTooltipSize({ width: rect.width, height: rect.height });
        }
    }, [currentStep, runTour]);

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
                    <svg
                        className="tour-spotlight-svg"
                        style={{ pointerEvents: "all" }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <defs>
                            <mask id="tour-spotlight-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
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
                            {targetRect && tooltipPos.actualPlacement !== "center" && (
                                <div
                                    className={`tour-arrow tour-arrow-${tooltipPos.actualPlacement}`}
                                />
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
                                                type="button"
                                                className="tour-btn tour-btn-skip"
                                                onClick={skipTour}
                                            >
                                                Skip
                                            </button>
                                        )}
                                        {!isFirstStep && (
                                            <button
                                                type="button"
                                                className="tour-btn tour-btn-prev"
                                                onClick={prevStep}
                                            >
                                                ← Prev
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className={`tour-btn ${isLastStep ? "tour-btn-finish" : "tour-btn-next"}`}
                                            onClick={() =>
                                                isLastStep ? void completeTour() : nextStep(totalSteps)
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

interface DashboardTourProviderProps {
    children: ReactNode;
}

/**
 * Provides a single shared tour state for the dashboard layout and portal overlay.
 */
export function DashboardTourProvider({ children }: DashboardTourProviderProps) {
    const value = useDashboardTourState();
    return (
        <DashboardTourContext.Provider value={value}>
            {children}
            <DashboardTourPortal />
        </DashboardTourContext.Provider>
    );
}

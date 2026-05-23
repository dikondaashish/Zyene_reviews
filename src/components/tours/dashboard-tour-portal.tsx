"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardTourSteps } from "@/lib/tours/dashboard-tour";
import { useDashboardTour } from "@/components/tours/dashboard-tour-context";
import { getDashboardTourTooltipPosition } from "@/components/tours/dashboard-tour-tooltip-position";
import { DASHBOARD_TOUR_SPOTLIGHT_PADDING } from "@/components/tours/dashboard-tour-constants";
import type { DashboardTourTargetRect } from "@/components/tours/dashboard-tour-types";
import { DashboardTourSpotlightRing, DashboardTourSpotlightSvg } from "@/components/tours/dashboard-tour-spotlight-layers";
import { DashboardTourTooltipPanel } from "@/components/tours/dashboard-tour-tooltip-panel";

export function DashboardTourPortal() {
    const { runTour, currentStep, isLoading, completeTour, skipTour, nextStep, prevStep } = useDashboardTour();

    const [targetRect, setTargetRect] = useState<DashboardTourTargetRect | null>(null);
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
        ? getDashboardTourTooltipPosition(targetRect, step.placement, tooltipSize.width, tooltipSize.height)
        : {
              top: window.innerHeight / 2 - tooltipSize.height / 2,
              left: window.innerWidth / 2 - tooltipSize.width / 2,
              actualPlacement: "center" as const,
          };

    const spotlightX = targetRect ? targetRect.left - DASHBOARD_TOUR_SPOTLIGHT_PADDING : 0;
    const spotlightY = targetRect ? targetRect.top - DASHBOARD_TOUR_SPOTLIGHT_PADDING : 0;
    const spotlightW = targetRect ? targetRect.width + DASHBOARD_TOUR_SPOTLIGHT_PADDING * 2 : 0;
    const spotlightH = targetRect ? targetRect.height + DASHBOARD_TOUR_SPOTLIGHT_PADDING * 2 : 0;

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
                    <DashboardTourSpotlightSvg
                        targetRect={targetRect}
                        spotlightX={spotlightX}
                        spotlightY={spotlightY}
                        spotlightW={spotlightW}
                        spotlightH={spotlightH}
                    />
                    <DashboardTourSpotlightRing
                        targetRect={targetRect}
                        spotlightX={spotlightX}
                        spotlightY={spotlightY}
                        spotlightW={spotlightW}
                        spotlightH={spotlightH}
                    />
                    <DashboardTourTooltipPanel
                        tooltipRef={tooltipRef}
                        currentStep={currentStep}
                        tooltipPos={tooltipPos}
                        targetRect={targetRect}
                        step={step}
                        steps={steps}
                        totalSteps={totalSteps}
                        skipTour={skipTour}
                        prevStep={prevStep}
                        nextStep={nextStep}
                        completeTour={completeTour}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(tourContent, document.body);
}

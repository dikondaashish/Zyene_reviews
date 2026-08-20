"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardTourSteps } from "@/lib/tours/dashboard-tour";
import { useDashboardTour } from "@/components/tours/dashboard-tour-context";
import { getDashboardTourTooltipPosition } from "@/components/tours/dashboard-tour-tooltip-position";
import {
    DASHBOARD_TOUR_SPOTLIGHT_PADDING,
    DASHBOARD_TOUR_TOOLTIP_WIDTH,
} from "@/components/tours/dashboard-tour-constants";
import { DashboardTourSpotlightRing, DashboardTourSpotlightSvg } from "@/components/tours/dashboard-tour-spotlight-layers";
import { DashboardTourTooltipPanel } from "@/components/tours/dashboard-tour-tooltip-panel";
import { useDashboardTourTarget } from "@/components/tours/use-dashboard-tour-target";

export function DashboardTourPortal() {
    const { runTour, currentStep, isLoading, completeTour, skipTour, nextStep, prevStep } =
        useDashboardTour();
    const [tooltipSize, setTooltipSize] = useState({ width: DASHBOARD_TOUR_TOOLTIP_WIDTH, height: 220 });
    const [mounted, setMounted] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const steps = dashboardTourSteps;
    const step = steps[currentStep];
    const targetRect = useDashboardTourTarget(runTour && Boolean(step), step?.target);

    useEffect(() => {
        setMounted(true);
    }, []);

    useLayoutEffect(() => {
        const node = tooltipRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        setTooltipSize({ width: rect.width, height: rect.height });
    }, [currentStep, runTour, targetRect]);

    if (!mounted || isLoading || !runTour || !step) return null;

    const tooltipPos = targetRect
        ? getDashboardTourTooltipPosition(
              targetRect,
              step.placement,
              tooltipSize.width,
              tooltipSize.height,
          )
        : {
              top: window.innerHeight / 2 - tooltipSize.height / 2,
              left: window.innerWidth / 2 - tooltipSize.width / 2,
              actualPlacement: "center" as const,
              arrowOffset: tooltipSize.width / 2,
          };

    const spotlightX = targetRect ? targetRect.left - DASHBOARD_TOUR_SPOTLIGHT_PADDING : 0;
    const spotlightY = targetRect ? targetRect.top - DASHBOARD_TOUR_SPOTLIGHT_PADDING : 0;
    const spotlightW = targetRect ? targetRect.width + DASHBOARD_TOUR_SPOTLIGHT_PADDING * 2 : 0;
    const spotlightH = targetRect ? targetRect.height + DASHBOARD_TOUR_SPOTLIGHT_PADDING * 2 : 0;

    return createPortal(
        <AnimatePresence mode="wait">
            {runTour ? (
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
                        totalSteps={steps.length}
                        skipTour={skipTour}
                        prevStep={prevStep}
                        nextStep={nextStep}
                        completeTour={completeTour}
                    />
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}

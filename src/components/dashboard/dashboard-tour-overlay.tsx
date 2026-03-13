"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardTourStep } from "./dashboard-tour-step";
import { useDashboardTour } from "@/hooks/use-dashboard-tour";

const TOUR_CONTENT = [
    {
        id: 1,
        target: "tour-stats",
        title: "Your review snapshot",
        description:
            "Total reviews, average rating, and response rate update automatically as reviews come in.",
    },
    {
        id: 2,
        target: "tour-sidebar",
        title: "Your full toolkit",
        description:
            "Navigate between Reviews, Customers, Campaigns, Analytics, and Integrations from here.",
    },
    {
        id: 3,
        target: "tour-recent-reviews",
        title: "Respond with AI",
        description:
            "Click any review to read it and generate a professional reply with one click.",
    },
    {
        id: 4,
        target: "tour-needs-attention",
        title: "Never miss urgent reviews",
        description:
            "1 and 2-star reviews appear here so you can respond before they damage your reputation.",
    },
];

export const DashboardTourOverlay = () => {
    const { currentStep, isTourVisible, isHydrated, nextStep, skipTour, isLastStep } =
        useDashboardTour();

    const targetRef = useRef<HTMLElement | null>(null);

    // Get target element by data-tour-target attribute
    useEffect(() => {
        if (!isTourVisible || currentStep === 0) {
            return;
        }

        const content = TOUR_CONTENT[currentStep - 1];
        const target = document.querySelector(`[data-tour-target="${content.target}"]`) as HTMLElement | null;
        targetRef.current = target;
    }, [currentStep, isTourVisible]);

    if (!isHydrated || !isTourVisible || currentStep === 0 || !targetRef.current) {
        return null;
    }

    const content = TOUR_CONTENT[currentStep - 1];

    return (
        <AnimatePresence>
            {isTourVisible && currentStep > 0 && targetRef.current && (
                <DashboardTourStep
                    key={`tour-step-${currentStep}`}
                    targetRef={targetRef as React.RefObject<HTMLElement>}
                    step={currentStep}
                    title={content.title}
                    description={content.description}
                    onNext={nextStep}
                    onSkip={skipTour}
                    isLast={isLastStep}
                />
            )}
        </AnimatePresence>
    );
};

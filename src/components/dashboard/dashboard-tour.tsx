"use client";

import { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardTourStep } from "./dashboard-tour-step";
import { useDashboardTour } from "@/hooks/use-dashboard-tour";

interface DashboardTourProps {
    statsRef: React.RefObject<HTMLElement>;
    sidebarRef: React.RefObject<HTMLElement>;
    recentReviewsRef: React.RefObject<HTMLElement>;
    needsAttentionRef: React.RefObject<HTMLElement>;
}

const TOUR_CONTENT = [
    {
        id: 1,
        title: "Your review snapshot",
        description:
            "Total reviews, average rating, and response rate update automatically as reviews come in.",
    },
    {
        id: 2,
        title: "Your full toolkit",
        description:
            "Navigate between Reviews, Customers, Campaigns, Analytics, and Integrations from here.",
    },
    {
        id: 3,
        title: "Respond with AI",
        description:
            "Click any review to read it and generate a professional reply with one click.",
    },
    {
        id: 4,
        title: "Never miss urgent reviews",
        description:
            "1 and 2-star reviews appear here so you can respond before they damage your reputation.",
    },
];

export const DashboardTour = (props: DashboardTourProps) => {
    const {
        statsRef,
        sidebarRef,
        recentReviewsRef,
        needsAttentionRef,
    } = props;

    const { currentStep, isTourVisible, isHydrated, nextStep, skipTour, isLastStep } =
        useDashboardTour();

    if (!isHydrated || !isTourVisible || currentStep === 0) {
        return null;
    }

    // Map steps to refs
    const stepRefs = [statsRef, sidebarRef, recentReviewsRef, needsAttentionRef];
    const targetRef = stepRefs[currentStep - 1];
    const content = TOUR_CONTENT[currentStep - 1];

    if (!targetRef?.current) {
        return null;
    }

    return (
        <AnimatePresence>
            {isTourVisible && currentStep > 0 && (
                <DashboardTourStep
                    key={`tour-step-${currentStep}`}
                    targetRef={targetRef}
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

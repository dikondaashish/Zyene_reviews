import { useEffect, useState } from "react";

const TOUR_KEY = "dashboard_tour_seen";
const TOUR_STEPS = 4;

export const useDashboardTour = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isTourVisible, setIsTourVisible] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Initialize tour on client-side only
    useEffect(() => {
        setIsHydrated(true);
        const tourSeen = localStorage.getItem(TOUR_KEY);
        if (!tourSeen) {
            setIsTourVisible(true);
            setCurrentStep(1);
        }
    }, []);

    const nextStep = () => {
        if (currentStep < TOUR_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const skipTour = () => {
        completeTour();
    };

    const completeTour = () => {
        localStorage.setItem(TOUR_KEY, "true");
        setIsTourVisible(false);
        setCurrentStep(0);
    };

    return {
        currentStep,
        isTourVisible,
        isHydrated,
        nextStep,
        skipTour,
        completeTour,
        isLastStep: currentStep === TOUR_STEPS,
    };
};

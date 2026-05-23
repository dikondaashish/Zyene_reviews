"use client";

import { createContext, useContext } from "react";

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

export function useDashboardTour(): DashboardTourContextValue {
    const ctx = useContext(DashboardTourContext);
    if (!ctx) {
        throw new Error("useDashboardTour must be used within DashboardTourProvider");
    }
    return ctx;
}

export { DashboardTourContext };

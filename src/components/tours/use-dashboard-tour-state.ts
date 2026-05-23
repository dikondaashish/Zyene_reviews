"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
    completeTour as completeTourAction,
    getTourStatus,
    resetTour as resetTourAction,
} from "@/app/actions/tour";
import type { DashboardTourContextValue } from "@/components/tours/dashboard-tour-context";

export function useDashboardTourState(): DashboardTourContextValue {
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
            } catch {
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void checkTourStatus();
        return () => {
            cancelled = true;
        };
    }, [pathname, searchParams]);

    const completeTour = useCallback(async () => {
        setRunTour(false);
        setCurrentStep(0);
        try {
            await completeTourAction();
        } catch {
        }
    }, []);

    const startTour = useCallback(async () => {
        try {
            await resetTourAction();
        } catch {
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
        [currentStep, completeTour]
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
        [runTour, currentStep, isLoading, completeTour, startTour, skipTour, nextStep, prevStep]
    );
}

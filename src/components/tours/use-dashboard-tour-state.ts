"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    completeTour as completeTourAction,
    getTourStatus,
    resetTour as resetTourAction,
} from "@/app/actions/tour";
import type { DashboardTourContextValue } from "@/components/tours/dashboard-tour-context";

const TOUR_PAGE = "/dashboard";

export function useDashboardTourState(): DashboardTourContextValue {
    const [runTour, setRunTour] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingRestart, setPendingRestart] = useState(false);
    const ignoreForceQuery = useRef(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;
        let tourDelayTimer: ReturnType<typeof setTimeout> | undefined;

        const checkTourStatus = async () => {
            try {
                if (pathname !== TOUR_PAGE) {
                    if (!cancelled) {
                        setRunTour(false);
                        setIsLoading(false);
                    }
                    return;
                }

                const forceTour = searchParams.get("tour") === "true";
                if ((forceTour && !ignoreForceQuery.current) || pendingRestart) {
                    if (!cancelled) {
                        setPendingRestart(false);
                        setCurrentStep(0);
                        setRunTour(true);
                        setIsLoading(false);
                    }
                    return;
                }

                const hasCompleted = await getTourStatus();
                if (!cancelled && !hasCompleted) {
                    tourDelayTimer = setTimeout(() => {
                        if (!cancelled) {
                            setCurrentStep(0);
                            setRunTour(true);
                        }
                    }, 500);
                }
            } catch {
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        void checkTourStatus();
        return () => {
            cancelled = true;
            if (tourDelayTimer !== undefined) clearTimeout(tourDelayTimer);
        };
    }, [pathname, searchParams, pendingRestart]);

    const completeTour = useCallback(async () => {
        ignoreForceQuery.current = true;
        setPendingRestart(false);
        setRunTour(false);
        setCurrentStep(0);
        try {
            await completeTourAction();
        } catch {
        }
        if (searchParams.get("tour") === "true") {
            router.replace(TOUR_PAGE);
        }
    }, [router, searchParams]);

    const startTour = useCallback(async () => {
        ignoreForceQuery.current = false;
        setPendingRestart(true);
        setCurrentStep(0);
        try {
            await resetTourAction();
        } catch {
        }
        if (pathname === TOUR_PAGE) setRunTour(true);
    }, [pathname]);

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
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
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
        [runTour, currentStep, isLoading, completeTour, startTour, skipTour, nextStep, prevStep],
    );
}

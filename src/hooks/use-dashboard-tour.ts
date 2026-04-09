"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { getTourStatus, completeTour as completeTourAction, resetTour as resetTourAction } from "@/app/actions/tour";

/**
 * Hook to manage dashboard tour state backed by Supabase
 * Checks user's has_completed_tour status and provides controls
 */
export const useDashboardTour = () => {
    const [runTour, setRunTour] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Fetch tour status from backend on mount or when navigation/params change
    useEffect(() => {
        let cancelled = false;

        const checkTourStatus = async () => {
            try {
                // If explicitly requested via query param, force run it
                const forceTour = searchParams.get("tour") === "true";
                
                if (!cancelled && forceTour) {
                    setRunTour(true);
                    setIsLoading(false);
                    return;
                }

                const hasCompleted = await getTourStatus();

                if (!cancelled && !hasCompleted) {
                    // Auto-start tour after short delay for DOM readiness
                    setTimeout(() => {
                        if (!cancelled) {
                            setRunTour(true);
                        }
                    }, 500);
                }
            } catch (error) {
                console.error("Failed to fetch tour status:", error);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        checkTourStatus();
        return () => { cancelled = true; };
    }, [pathname, searchParams]);

    // Mark tour as completed in database
    const completeTour = useCallback(async () => {
        setRunTour(false);
        setCurrentStep(0);
        try {
            await completeTourAction();
        } catch (error) {
            console.error("Failed to save tour completion:", error);
        }
    }, []);

    // Manually start/restart tour
    const startTour = useCallback(async () => {
        try {
            await resetTourAction();
        } catch (error) {
            console.error("Failed to reset tour:", error);
        }
        setCurrentStep(0);
        setRunTour(true);
    }, []);

    // Skip tour (same as complete)
    const skipTour = useCallback(() => {
        completeTour();
    }, [completeTour]);

    // Navigate between steps
    const nextStep = useCallback((totalSteps: number) => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            completeTour();
        }
    }, [currentStep, completeTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    return {
        runTour,
        currentStep,
        isLoading,
        completeTour,
        startTour,
        skipTour,
        nextStep,
        prevStep,
    };
};

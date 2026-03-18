"use client";

import { useEffect, useState, useCallback } from "react";
import { getTourStatus, completeTour as completeTourAction, resetTour as resetTourAction } from "@/app/actions/tour";

/**
 * Hook to manage dashboard tour state backed by Supabase
 * Checks user's has_completed_tour status and provides controls
 */
export const useDashboardTour = () => {
    const [runTour, setRunTour] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch tour status from backend on mount
    useEffect(() => {
        let cancelled = false;

        const checkTourStatus = async () => {
            try {
                const hasCompleted = await getTourStatus();
                if (!cancelled && !hasCompleted) {
                    // Auto-start tour for first-time users after short delay for DOM readiness
                    setTimeout(() => {
                        if (!cancelled) {
                            setRunTour(true);
                        }
                    }, 1000);
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
    }, []);

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

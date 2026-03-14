"use client";

import { useEffect, useState } from "react";

const TOUR_COMPLETED_KEY = "zyene_dashboard_tour_completed";
const TOUR_VERSION = "1"; // Increment this to reset tour for all users

/**
 * Hook to manage dashboard tour state with react-joyride
 * Tracks whether user has seen the tour and provides controls
 */
export const useDashboardTour = () => {
  const [runTour, setRunTour] = useState(false);
  const isFirstTime = runTour;

  // Initialize tour on client-side only
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    const completedVersion = localStorage.getItem(
      `${TOUR_COMPLETED_KEY}_version`
    );

    // If not completed or version doesn't match, show tour
    const shouldShowTour = !completed || completedVersion !== TOUR_VERSION;

    if (shouldShowTour) {
      // Auto-start tour for first-time users after a small delay
      setTimeout(() => {
        setRunTour(true);
      }, 800);
    }
  }, []);

  // Mark tour as completed
  const completeTour = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    localStorage.setItem(`${TOUR_COMPLETED_KEY}_version`, TOUR_VERSION);
    setRunTour(false);
  };

  // Manually start/restart tour
  const startTour = () => {
    setRunTour(true);
  };

  // Skip tour
  const skipTour = () => {
    completeTour();
  };

  return {
    runTour,
    setRunTour,
    isFirstTime,
    completeTour,
    startTour,
    skipTour,
  };
};

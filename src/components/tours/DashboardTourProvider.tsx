"use client";

import Joyride, {
  CallBackProps,
  STATUS,
  type Step,
} from "react-joyride";
import { dashboardTourSteps, tourStyles } from "@/lib/tours/dashboard-tour";
import { useDashboardTour } from "@/hooks/use-dashboard-tour";
import "./dashboard-tour.css";

/**
 * Dashboard Tour Component
 * Displays an interactive guided tour for first-time users
 */
export function DashboardTourProvider() {
  const { runTour, completeTour } = useDashboardTour();
  const isHydrated = typeof window !== "undefined";

  if (!isHydrated) {
    return null;
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      completeTour();
    }
  };

  return (
    <Joyride
      steps={dashboardTourSteps as Step[]}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={tourStyles}
      locale={{
        back: "← Back",
        close: "✕",
        last: "Got it! 🎉",
        next: "Next →",
        skip: "Skip",
      }}
    />
  );
}

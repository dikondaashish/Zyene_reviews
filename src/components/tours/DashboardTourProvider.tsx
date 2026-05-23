"use client";

import type { ReactNode } from "react";
import "./dashboard-tour.css";
import { DashboardTourContext } from "@/components/tours/dashboard-tour-context";
import { useDashboardTourState } from "@/components/tours/use-dashboard-tour-state";
import { DashboardTourPortal } from "@/components/tours/dashboard-tour-portal";

export { useDashboardTour } from "@/components/tours/dashboard-tour-context";
export type { DashboardTourContextValue } from "@/components/tours/dashboard-tour-context";

export function DashboardTourProvider({ children }: { children: ReactNode }) {
    const value = useDashboardTourState();
    return (
        <DashboardTourContext.Provider value={value}>
            {children}
            <DashboardTourPortal />
        </DashboardTourContext.Provider>
    );
}

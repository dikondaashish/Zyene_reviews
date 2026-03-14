"use client";

import { useRef, ReactNode } from "react";
import { DashboardTour } from "./dashboard-tour";

interface DashboardWithTourProps {
    children: (refs: {
        statsRef: React.RefObject<HTMLElement>;
        sidebarRef: React.RefObject<HTMLElement>;
        recentReviewsRef: React.RefObject<HTMLElement>;
        needsAttentionRef: React.RefObject<HTMLElement>;
    }) => ReactNode;
}

export const DashboardWithTour = ({ children }: DashboardWithTourProps) => {
    const statsRef = useRef<HTMLElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const recentReviewsRef = useRef<HTMLElement>(null);
    const needsAttentionRef = useRef<HTMLElement>(null);

    return (
        <>
            <DashboardTour
                statsRef={statsRef}
                sidebarRef={sidebarRef}
                recentReviewsRef={recentReviewsRef}
                needsAttentionRef={needsAttentionRef}
            />
            {children({
                statsRef,
                sidebarRef,
                recentReviewsRef,
                needsAttentionRef,
            })}
        </>
    );
};

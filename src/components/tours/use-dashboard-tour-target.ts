"use client";

import { useCallback, useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { isSidebarTourTarget } from "@/components/tours/dashboard-tour-constants";
import {
    findVisibleTourTarget,
    readTourTargetRect,
    scrollTourTargetIntoView,
    waitForVisibleTourTarget,
} from "@/components/tours/dashboard-tour-target";
import type { DashboardTourTargetRect } from "@/components/tours/dashboard-tour-types";

export function useDashboardTourTarget(runTour: boolean, target: string | undefined) {
    const { isMobile, setOpen, setOpenMobile } = useSidebar();
    const [targetRect, setTargetRect] = useState<DashboardTourTargetRect | null>(null);

    const measure = useCallback(() => {
        if (!target) return;
        const el = findVisibleTourTarget(target);
        if (!el) {
            setTargetRect(null);
            return;
        }
        setTargetRect(readTourTargetRect(el));
    }, [target]);

    useEffect(() => {
        if (!runTour || !target) {
            setTargetRect(null);
            return;
        }

        let cancelled = false;
        const stepTarget = target;
        const sidebarStep = isSidebarTourTarget(stepTarget);
        setTargetRect(null);

        async function prepare() {
            if (sidebarStep) {
                if (isMobile) setOpenMobile(true);
                else setOpen(true);
                await new Promise((resolve) => setTimeout(resolve, 320));
            } else if (isMobile) {
                setOpenMobile(false);
            }

            const el = await waitForVisibleTourTarget(stepTarget);
            if (cancelled || !el) {
                setTargetRect(null);
                return;
            }
            scrollTourTargetIntoView(el);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!cancelled) measure();
                });
            });
        }

        void prepare();
        window.addEventListener("scroll", measure, true);
        window.addEventListener("resize", measure);
        return () => {
            cancelled = true;
            window.removeEventListener("scroll", measure, true);
            window.removeEventListener("resize", measure);
        };
    }, [runTour, target, isMobile, setOpen, setOpenMobile, measure]);

    return targetRect;
}

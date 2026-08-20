import type { TourStep } from "@/lib/tours/dashboard-tour";
import type { DashboardTourTargetRect } from "@/components/tours/dashboard-tour-types";
import {
    DASHBOARD_TOUR_SPOTLIGHT_PADDING,
    DASHBOARD_TOUR_TOOLTIP_GAP,
    DASHBOARD_TOUR_VIEWPORT_EDGE,
} from "@/components/tours/dashboard-tour-constants";

export type TourTooltipPosition = {
    top: number;
    left: number;
    actualPlacement: TourStep["placement"];
    arrowOffset: number;
};

type Placement = TourStep["placement"];

const FALLBACKS: Record<Placement, Placement[]> = {
    right: ["right", "left", "bottom", "top", "center"],
    left: ["left", "right", "bottom", "top", "center"],
    bottom: ["bottom", "top", "right", "left", "center"],
    top: ["top", "bottom", "right", "left", "center"],
    center: ["center"],
};

function rawPosition(
    rect: DashboardTourTargetRect,
    placement: Placement,
    tooltipWidth: number,
    tooltipHeight: number,
): { top: number; left: number } {
    const gap = DASHBOARD_TOUR_TOOLTIP_GAP + DASHBOARD_TOUR_SPOTLIGHT_PADDING;
    switch (placement) {
        case "right":
            return {
                top: rect.top + rect.height / 2 - tooltipHeight / 2,
                left: rect.left + rect.width + gap,
            };
        case "left":
            return {
                top: rect.top + rect.height / 2 - tooltipHeight / 2,
                left: rect.left - tooltipWidth - gap,
            };
        case "bottom":
            return {
                top: rect.top + rect.height + gap,
                left: rect.left + rect.width / 2 - tooltipWidth / 2,
            };
        case "top":
            return {
                top: rect.top - tooltipHeight - gap,
                left: rect.left + rect.width / 2 - tooltipWidth / 2,
            };
        default:
            return {
                top: window.innerHeight / 2 - tooltipHeight / 2,
                left: window.innerWidth / 2 - tooltipWidth / 2,
            };
    }
}

function fits(top: number, left: number, tooltipWidth: number, tooltipHeight: number) {
    const edge = DASHBOARD_TOUR_VIEWPORT_EDGE;
    return (
        left >= edge &&
        top >= edge &&
        left + tooltipWidth <= window.innerWidth - edge &&
        top + tooltipHeight <= window.innerHeight - edge
    );
}

function placementFromGeometry(
    rect: DashboardTourTargetRect,
    left: number,
    top: number,
    tooltipWidth: number,
    tooltipHeight: number,
): Placement {
    const dx = left + tooltipWidth / 2 - (rect.left + rect.width / 2);
    const dy = top + tooltipHeight / 2 - (rect.top + rect.height / 2);
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return "center";
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
    return dy > 0 ? "bottom" : "top";
}

function arrowOffset(
    rect: DashboardTourTargetRect,
    left: number,
    top: number,
    tooltipWidth: number,
    tooltipHeight: number,
    placement: Placement,
): number {
    const min = 18;
    if (placement === "left" || placement === "right") {
        const raw = rect.top + rect.height / 2 - top;
        return Math.max(min, Math.min(raw, tooltipHeight - min));
    }
    const raw = rect.left + rect.width / 2 - left;
    return Math.max(min, Math.min(raw, tooltipWidth - min));
}

export function getDashboardTourTooltipPosition(
    rect: DashboardTourTargetRect,
    placement: Placement,
    tooltipWidth: number,
    tooltipHeight: number,
): TourTooltipPosition {
    const edge = DASHBOARD_TOUR_VIEWPORT_EDGE;
    let chosen = rawPosition(rect, placement, tooltipWidth, tooltipHeight);
    let actualPlacement = placement;

    for (const candidate of FALLBACKS[placement]) {
        const pos = rawPosition(rect, candidate, tooltipWidth, tooltipHeight);
        if (candidate === "center" || fits(pos.top, pos.left, tooltipWidth, tooltipHeight)) {
            chosen = pos;
            actualPlacement = candidate;
            break;
        }
    }

    const left = Math.max(edge, Math.min(chosen.left, window.innerWidth - tooltipWidth - edge));
    const top = Math.max(edge, Math.min(chosen.top, window.innerHeight - tooltipHeight - edge));
    if (actualPlacement !== "center") {
        actualPlacement = placementFromGeometry(rect, left, top, tooltipWidth, tooltipHeight);
    }

    return {
        top,
        left,
        actualPlacement,
        arrowOffset: arrowOffset(rect, left, top, tooltipWidth, tooltipHeight, actualPlacement),
    };
}

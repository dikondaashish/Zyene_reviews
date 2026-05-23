import type { TourStep } from "@/lib/tours/dashboard-tour";
import type { DashboardTourTargetRect } from "@/components/tours/dashboard-tour-types";
import { DASHBOARD_TOUR_SPOTLIGHT_PADDING, DASHBOARD_TOUR_TOOLTIP_GAP } from "@/components/tours/dashboard-tour-constants";

export function getDashboardTourTooltipPosition(
    rect: DashboardTourTargetRect,
    placement: TourStep["placement"],
    tooltipWidth: number,
    tooltipHeight: number
): { top: number; left: number; actualPlacement: TourStep["placement"] } {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top = 0;
    let left = 0;
    let actualPlacement = placement;

    switch (placement) {
        case "right":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left + rect.width + DASHBOARD_TOUR_TOOLTIP_GAP + DASHBOARD_TOUR_SPOTLIGHT_PADDING;
            if (left + tooltipWidth > viewportW - 16) {
                actualPlacement = "bottom";
                top = rect.top + rect.height + DASHBOARD_TOUR_TOOLTIP_GAP + DASHBOARD_TOUR_SPOTLIGHT_PADDING;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
            }
            break;
        case "left":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - DASHBOARD_TOUR_TOOLTIP_GAP - DASHBOARD_TOUR_SPOTLIGHT_PADDING;
            if (left < 16) {
                actualPlacement = "bottom";
                top = rect.top + rect.height + DASHBOARD_TOUR_TOOLTIP_GAP + DASHBOARD_TOUR_SPOTLIGHT_PADDING;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
            }
            break;
        case "bottom":
            top = rect.top + rect.height + DASHBOARD_TOUR_TOOLTIP_GAP + DASHBOARD_TOUR_SPOTLIGHT_PADDING;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
        case "top":
            top = rect.top - tooltipHeight - DASHBOARD_TOUR_TOOLTIP_GAP - DASHBOARD_TOUR_SPOTLIGHT_PADDING;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            if (top < 16) {
                actualPlacement = "bottom";
                top = rect.top + rect.height + DASHBOARD_TOUR_TOOLTIP_GAP + DASHBOARD_TOUR_SPOTLIGHT_PADDING;
            }
            break;
        case "center":
            top = viewportH / 2 - tooltipHeight / 2;
            left = viewportW / 2 - tooltipWidth / 2;
            break;
        default:
            top = viewportH / 2 - tooltipHeight / 2;
            left = viewportW / 2 - tooltipWidth / 2;
    }

    left = Math.max(16, Math.min(left, viewportW - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportH - tooltipHeight - 16));

    return { top, left, actualPlacement };
}

export const DASHBOARD_TOUR_SPOTLIGHT_PADDING = 10;
export const DASHBOARD_TOUR_TOOLTIP_GAP = 16;
export const DASHBOARD_TOUR_TOOLTIP_WIDTH = 360;
export const DASHBOARD_TOUR_VIEWPORT_EDGE = 16;

export const SIDEBAR_TOUR_TARGETS = new Set([
    "tour-sidebar",
    "tour-customers-nav",
    "tour-analytics-nav",
    "tour-settings-nav",
]);

export function isSidebarTourTarget(target: string): boolean {
    return SIDEBAR_TOUR_TARGETS.has(target);
}

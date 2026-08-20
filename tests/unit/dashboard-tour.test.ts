import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TOUR_STEP_ICON_MAP } from "@/components/tours/dashboard-tour-icons";
import { isSidebarTourTarget } from "@/components/tours/dashboard-tour-constants";
import { getDashboardTourTooltipPosition } from "@/components/tours/dashboard-tour-tooltip-position";
import { dashboardTourSteps, TOUR_STEP_ICONS } from "@/lib/tours/dashboard-tour";

const MARKUP_FILES = [
    "src/components/dashboard/app-sidebar.tsx",
    "src/components/dashboard/app-sidebar-settings-nav-items.tsx",
    "src/components/dashboard/use-app-sidebar-nav.ts",
    "src/app/(dashboard)/dashboard/dashboard-view-stat-cards.tsx",
    "src/app/(dashboard)/dashboard/dashboard-view-bottom-row.tsx",
];

function stubViewport(width: number, height: number) {
    const previous = globalThis.window;
    Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: { innerWidth: width, innerHeight: height },
    });
    return () => {
        if (previous === undefined) {
            Reflect.deleteProperty(globalThis, "window");
        } else {
            Object.defineProperty(globalThis, "window", {
                configurable: true,
                value: previous,
            });
        }
    };
}

describe("dashboard product tour", () => {
    it("uses Lucide icon keys that match the sidebar, not emojis", () => {
        expect(TOUR_STEP_ICONS).toEqual([
            "panel-left",
            "home",
            "message-square",
            "users",
            "bar-chart-3",
            "settings",
        ]);
        for (const step of dashboardTourSteps) {
            expect(TOUR_STEP_ICON_MAP[step.icon]).toBeDefined();
            expect(step.icon).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
        }
    });

    it("starts the in-layout tour from Settings instead of only changing the URL", () => {
        const source = fs.readFileSync(
            path.join(process.cwd(), "src/components/settings/restart-tour-section.tsx"),
            "utf8",
        );
        expect(source).toContain("startTour()");
        expect(source).toContain("/dashboard?tour=true");
        expect(source).toContain("useDashboardTour");
    });

    it("points each step at markup that exists in the dashboard", () => {
        const markup = MARKUP_FILES.map((file) =>
            fs.readFileSync(path.join(process.cwd(), file), "utf8"),
        ).join("\n");
        for (const step of dashboardTourSteps) {
            expect(markup).toContain(`"${step.target}"`);
        }
        expect(dashboardTourSteps.map((step) => step.target)).toEqual([
            "tour-sidebar",
            "tour-stats",
            "tour-recent-reviews",
            "tour-customers-nav",
            "tour-analytics-nav",
            "tour-settings-nav",
        ]);
        expect(dashboardTourSteps[2]?.title).toBe("Review Spotlight");
        expect(isSidebarTourTarget("tour-customers-nav")).toBe(true);
        expect(isSidebarTourTarget("tour-stats")).toBe(false);
    });
});

describe("dashboard tour tooltip placement", () => {
    afterEach(() => {
        Reflect.deleteProperty(globalThis, "window");
    });

    it("keeps a right-side tooltip on screen next to a left sidebar target", () => {
        const restore = stubViewport(1280, 800);
        const pos = getDashboardTourTooltipPosition(
            { top: 120, left: 0, width: 256, height: 480 },
            "right",
            360,
            220,
        );
        restore();
        expect(pos.actualPlacement).toBe("right");
        expect(pos.left).toBeGreaterThan(256);
        expect(pos.left + 360).toBeLessThanOrEqual(1280 - 16);
        expect(pos.top).toBeGreaterThanOrEqual(16);
        expect(pos.top + 220).toBeLessThanOrEqual(800 - 16);
    });

    it("flips off the bottom when a tall target has no room above it", () => {
        const restore = stubViewport(1280, 800);
        const pos = getDashboardTourTooltipPosition(
            { top: 40, left: 300, width: 640, height: 520 },
            "top",
            360,
            220,
        );
        restore();
        expect(pos.actualPlacement).not.toBe("top");
        expect(pos.top).toBeGreaterThanOrEqual(16);
        expect(pos.top + 220).toBeLessThanOrEqual(800 - 16);
    });
});

import { describe, expect, it } from "vitest";
import { TOUR_STEP_ICON_MAP } from "@/components/tours/dashboard-tour-icons";
import { dashboardTourSteps, TOUR_STEP_ICONS } from "@/lib/tours/dashboard-tour";

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
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("dashboard priority layout", () => {
    it("renders KPI stat cards and needs attention before Get Started", () => {
        const view = fs.readFileSync(
            path.join(root, "src/app/(dashboard)/dashboard/dashboard-view.tsx"),
            "utf8",
        );

        const priorityIndex = view.indexOf("<DashboardViewPriority");
        const gettingStartedIndex = view.indexOf("<GettingStartedBanner");

        expect(priorityIndex).toBeGreaterThan(-1);
        expect(gettingStartedIndex).toBeGreaterThan(-1);
        expect(priorityIndex).toBeLessThan(gettingStartedIndex);
    });

    it("keeps needs attention in the priority stack with stat cards", () => {
        const priority = fs.readFileSync(
            path.join(root, "src/app/(dashboard)/dashboard/dashboard-view-priority.tsx"),
            "utf8",
        );

        const statCardsIndex = priority.indexOf("<DashboardViewStatCards");
        const needsAttentionIndex = priority.indexOf("<DashboardViewNeedsAttention");

        expect(statCardsIndex).toBeGreaterThan(-1);
        expect(needsAttentionIndex).toBeGreaterThan(-1);
        expect(statCardsIndex).toBeLessThan(needsAttentionIndex);
    });
});

describe("animated number", () => {
    it("renders the target value immediately instead of a hardcoded zero", () => {
        const source = fs.readFileSync(
            path.join(root, "src/components/ui/animated-number.tsx"),
            "utf8",
        );

        expect(source).not.toMatch(/\{prefix\}0\{suffix\}/);
        expect(source).toContain("formatAnimatedNumber(value");
        expect(source).toContain("useMotionValue(value)");
    });
});

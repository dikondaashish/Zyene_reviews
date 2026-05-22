import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
    createGrowthDashboardToken,
    verifyGrowthDashboardToken,
} from "../../src/lib/growth/growth-dashboard-auth";

describe("growth dashboard auth", () => {
    const prev = process.env.GROWTH_DASHBOARD_SECRET;

    beforeEach(() => {
        process.env.GROWTH_DASHBOARD_SECRET = "test-growth-secret";
    });

    afterEach(() => {
        if (prev === undefined) delete process.env.GROWTH_DASHBOARD_SECRET;
        else process.env.GROWTH_DASHBOARD_SECRET = prev;
    });

    it("creates and verifies HMAC token", () => {
        const token = createGrowthDashboardToken("test-growth-secret");
        expect(verifyGrowthDashboardToken(token)).toBe(true);
        expect(verifyGrowthDashboardToken("wrong")).toBe(false);
    });
});

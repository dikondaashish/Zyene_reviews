import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
    createGrowthDashboardToken,
    getGrowthDashboardSecret,
    isAuthorizedGrowthDashboardRequest,
    isAuthorizedGrowthDashboardPassword,
    verifyGrowthDashboardToken,
} from "@/lib/growth/growth-dashboard-auth";

describe("growth dashboard auth", () => {
    const prevGrowth = process.env.GROWTH_DASHBOARD_SECRET;
    const prevCron = process.env.CRON_SECRET;

    beforeEach(() => {
        process.env.GROWTH_DASHBOARD_SECRET = "test-growth-secret";
        process.env.CRON_SECRET = "test-cron-secret";
    });

    afterEach(() => {
        if (prevGrowth === undefined) delete process.env.GROWTH_DASHBOARD_SECRET;
        else process.env.GROWTH_DASHBOARD_SECRET = prevGrowth;
        if (prevCron === undefined) delete process.env.CRON_SECRET;
        else process.env.CRON_SECRET = prevCron;
    });

    it("creates and verifies HMAC token", () => {
        const token = createGrowthDashboardToken("test-growth-secret");
        expect(verifyGrowthDashboardToken(token)).toBe(true);
        expect(verifyGrowthDashboardToken("wrong")).toBe(false);
    });

    it("uses only GROWTH_DASHBOARD_SECRET", () => {
        expect(getGrowthDashboardSecret()).toBe("test-growth-secret");
    });

    it("returns null when GROWTH_DASHBOARD_SECRET is unset", () => {
        delete process.env.GROWTH_DASHBOARD_SECRET;
        expect(getGrowthDashboardSecret()).toBeNull();
    });

    it("authorizes Bearer with GROWTH secret (case-insensitive scheme)", () => {
        const req = new Request("https://example.com", {
            headers: { Authorization: "bearer test-growth-secret" },
        });
        expect(isAuthorizedGrowthDashboardRequest(req)).toBe(true);
    });

    it("authorizes Bearer with surrounding whitespace on token", () => {
        const req = new Request("https://example.com", {
            headers: { Authorization: "Bearer  test-growth-secret  " },
        });
        expect(isAuthorizedGrowthDashboardRequest(req)).toBe(true);
    });

    it("rejects Bearer with CRON_SECRET when GROWTH is set", () => {
        const req = new Request("https://example.com", {
            headers: { Authorization: "Bearer test-cron-secret" },
        });
        expect(isAuthorizedGrowthDashboardRequest(req)).toBe(false);
    });

    it("rejects Bearer when GROWTH is unset even if CRON is set", () => {
        delete process.env.GROWTH_DASHBOARD_SECRET;
        const req = new Request("https://example.com", {
            headers: { Authorization: "Bearer test-cron-secret" },
        });
        expect(isAuthorizedGrowthDashboardRequest(req)).toBe(false);
    });

    it("authorizes Bearer with dashboard cookie token", () => {
        const token = createGrowthDashboardToken("test-growth-secret");
        const req = new Request("https://example.com", {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(isAuthorizedGrowthDashboardRequest(req)).toBe(true);
    });

    it("rejects missing or wrong Bearer", () => {
        expect(isAuthorizedGrowthDashboardRequest(new Request("https://example.com"))).toBe(
            false
        );
        const req = new Request("https://example.com", {
            headers: { Authorization: "Bearer wrong-secret" },
        });
        expect(isAuthorizedGrowthDashboardRequest(req)).toBe(false);
    });

    it("validates password with trim", () => {
        expect(isAuthorizedGrowthDashboardPassword("  test-growth-secret  ")).toBe(true);
        expect(isAuthorizedGrowthDashboardPassword("wrong")).toBe(false);
    });
});

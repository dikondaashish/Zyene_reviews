import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    createGrowthDashboardToken,
    isAuthorizedGrowthDashboardRequest,
    verifyGrowthDashboardToken,
} from "@/lib/growth/growth-dashboard-auth";

const secret = "synthetic-growth-secret";
const lifetime = 7 * 24 * 60 * 60 * 1000;
const bearer = (token: string) => new Request("https://example.test/api/internal/growth-metrics", {
    headers: { Authorization: `Bearer ${token}` },
});

beforeEach(() => {
    vi.stubEnv("GROWTH_DASHBOARD_SECRET", secret);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T12:00:00Z"));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("growth dashboard session lifetime", () => {
    it("expires for both cookie validation and bearer replay at seven days", () => {
        const token = createGrowthDashboardToken(secret);
        vi.advanceTimersByTime(lifetime - 1000);
        expect(verifyGrowthDashboardToken(token)).toBe(true);
        expect(isAuthorizedGrowthDashboardRequest(bearer(token))).toBe(true);
        vi.advanceTimersByTime(1000);
        expect(verifyGrowthDashboardToken(token)).toBe(false);
        expect(isAuthorizedGrowthDashboardRequest(bearer(token))).toBe(false);
    });

    it("issues distinct sessions even at the same timestamp", () => {
        const first = createGrowthDashboardToken(secret);
        const second = createGrowthDashboardToken(secret);
        expect(first).not.toBe(second);
        expect(verifyGrowthDashboardToken(first)).toBe(true);
        expect(verifyGrowthDashboardToken(second)).toBe(true);
    });

    it("rejects sessions issued in the future", () => {
        const token = createGrowthDashboardToken(secret);
        vi.setSystemTime(Date.now() - 1000);
        expect(verifyGrowthDashboardToken(token)).toBe(false);
    });

    it("rejects legacy tokens without an expiry", () => {
        const token = createHmac("sha256", secret).update("zyene-growth-dashboard-v1").digest("hex");
        expect(verifyGrowthDashboardToken(token)).toBe(false);
        expect(isAuthorizedGrowthDashboardRequest(bearer(token))).toBe(false);
    });

    it("rejects tampering and oversized or malformed tokens", () => {
        const token = createGrowthDashboardToken(secret);
        for (const candidate of [token.slice(1), `${token}extra`, "x".repeat(4096), "v2.bad.token"])
            expect(verifyGrowthDashboardToken(candidate)).toBe(false);
    });

    it("revokes sessions and old automation secrets when the secret rotates", () => {
        const token = createGrowthDashboardToken(secret);
        vi.stubEnv("GROWTH_DASHBOARD_SECRET", "rotated-synthetic-secret");
        expect(verifyGrowthDashboardToken(token)).toBe(false);
        expect(isAuthorizedGrowthDashboardRequest(bearer(secret))).toBe(false);
        expect(isAuthorizedGrowthDashboardRequest(bearer("rotated-synthetic-secret"))).toBe(true);
        expect(verifyGrowthDashboardToken(createGrowthDashboardToken("rotated-synthetic-secret"))).toBe(true);
    });
});

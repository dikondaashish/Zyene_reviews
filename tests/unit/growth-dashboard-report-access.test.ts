import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GET } from "@/app/api/internal/growth-metrics/route";
import { createGrowthDashboardToken } from "@/lib/growth/growth-dashboard-auth";

const mocks = vi.hoisted(() => ({ cookie: undefined as string | undefined, snapshot: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: mocks.cookie }) }) }));
vi.mock("@/lib/growth/kpi-metrics", () => ({ fetchGrowthKpiSnapshot: mocks.snapshot }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
const secret = "synthetic-growth-secret";
const request = (token?: string) => new Request("https://example.test/api/internal/growth-metrics", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
});

beforeEach(() => {
    vi.stubEnv("GROWTH_DASHBOARD_SECRET", secret);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T12:00:00Z"));
    mocks.cookie = undefined;
    mocks.snapshot.mockReset().mockResolvedValue({ synthetic: true });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

it("does not read private metrics for an expired cookie", async () => {
    mocks.cookie = createGrowthDashboardToken(secret);
    vi.setSystemTime(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect((await GET(request())).status).toBe(401);
    expect(mocks.snapshot).not.toHaveBeenCalled();
});

it("does not read private metrics for a replayed expired bearer session", async () => {
    const token = createGrowthDashboardToken(secret);
    vi.setSystemTime(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect((await GET(request(token))).status).toBe(401);
    expect(mocks.snapshot).not.toHaveBeenCalled();
});

it("does not read private metrics when a session is signed by a retired secret", async () => {
    mocks.cookie = createGrowthDashboardToken(secret);
    vi.stubEnv("GROWTH_DASHBOARD_SECRET", "rotated-secret");
    expect((await GET(request())).status).toBe(401);
    expect(mocks.snapshot).not.toHaveBeenCalled();
});

it("returns private metrics for an unexpired session", async () => {
    mocks.cookie = createGrowthDashboardToken(secret);
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ synthetic: true });
    expect(mocks.snapshot).toHaveBeenCalledWith(30);
});

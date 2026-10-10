import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/internal/growth-dashboard-auth/route";
import { verifyGrowthDashboardToken } from "@/lib/growth/growth-dashboard-auth";

const secret = "synthetic-growth-secret";
const login = (body: string) => POST(new Request("https://example.test/api/internal/growth-dashboard-auth", {
    method: "POST", headers: { "Content-Type": "application/json" }, body,
}));
beforeEach(() => { vi.stubEnv("GROWTH_DASHBOARD_SECRET", secret); });
afterEach(() => { vi.unstubAllEnvs(); });

describe("growth dashboard login input", () => {
    it.each([null, [], {}, { password: 123 }, { password: false }, { password: null },
        { password: {} }, { password: [] }, { password: "" }, { password: "x".repeat(2049) }]
        .map((body, index) => ({ body, index })))(
        "rejects malformed input case $index without issuing a session", async ({ body }) => {
            const response = await login(JSON.stringify(body));
            expect(response.status).toBe(400);
            expect(response.headers.get("set-cookie")).toBeNull();
            expect(await response.json()).toHaveProperty("error");
        },
    );

    it("rejects invalid JSON without issuing a session", async () => {
        const response = await login("{");
        expect(response.status).toBe(400);
        expect(response.headers.get("set-cookie")).toBeNull();
    });

    it("rejects a wrong password without issuing a session", async () => {
        const response = await login(JSON.stringify({ password: "incorrect" }));
        expect(response.status).toBe(401);
        expect(response.headers.get("set-cookie")).toBeNull();
    });

    it("issues an HttpOnly session after the correct trimmed password", async () => {
        const response = await login(JSON.stringify({ password: `  ${secret}  ` }));
        expect(response.status).toBe(200);
        const cookie = response.headers.get("set-cookie") ?? "";
        expect(cookie).toContain("HttpOnly");
        expect(cookie).toMatch(/SameSite=strict/i);
        expect(cookie).toContain("Max-Age=604800");
        expect(verifyGrowthDashboardToken(cookie.split(";")[0].split("=")[1])).toBe(true);
        expect(await response.json()).toEqual({ ok: true });
    });

    it("does not accept login when the dashboard is disabled", async () => {
        vi.stubEnv("GROWTH_DASHBOARD_SECRET", "");
        const response = await login(JSON.stringify({ password: secret }));
        expect(response.status).toBe(503);
        expect(response.headers.get("set-cookie")).toBeNull();
    });
});

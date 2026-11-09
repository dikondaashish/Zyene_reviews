import { beforeEach, describe, expect, it, vi } from "vitest";

type Update = { patch: Record<string, unknown>; filters: Array<[string, string, unknown]> };
const m = vi.hoisted(() => ({ updates: [] as Update[], refresh: vi.fn() }));

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("@/services/google/business-profile", () => ({
    GoogleTokenRefreshError: class extends Error {},
    isGoogleOAuthConfigured: () => true,
    refreshGoogleToken: m.refresh,
}));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({
        rpc: async (fn: string) => ({ data: fn === "decrypt_token" ? "refresh" : "enc-access", error: null }),
        from: () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: async () => ({ data: { id: "p1", refresh_token: "enc-refresh" }, error: null }),
                }),
            }),
            update: (patch: Record<string, unknown>) => {
                const record: Update = { patch, filters: [] };
                m.updates.push(record);
                const chain = {
                    eq: (col: string, val: unknown) => { record.filters.push(["eq", col, val]); return chain; },
                    neq: (col: string, val: unknown) => { record.filters.push(["neq", col, val]); return chain; },
                    then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
                };
                return chain;
            },
        }),
    }),
}));

import { forceRefreshGoogleAccessToken } from "@/services/google/sync-service/tokens";

describe("Google token refresh during a running sync", () => {
    beforeEach(() => {
        m.updates.length = 0;
        m.refresh.mockResolvedValue({ access_token: "fresh", expires_in: 3600 });
    });

    it("saves the new token without touching sync_status", async () => {
        await forceRefreshGoogleAccessToken("p1");
        const tokenWrite = m.updates.find((u) => "access_token" in u.patch);
        expect(tokenWrite?.patch).not.toHaveProperty("sync_status");
    });

    it("only clears token errors when the platform is not locked (running)", async () => {
        await forceRefreshGoogleAccessToken("p1");
        const statusWrite = m.updates.find((u) => u.patch.sync_status === "active");
        expect(statusWrite?.filters).toContainEqual(["neq", "sync_status", "running"]);
        expect(statusWrite?.filters).toContainEqual(["eq", "id", "p1"]);
    });
});

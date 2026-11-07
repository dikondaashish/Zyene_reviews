import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ fetch: vi.fn(), update: vi.fn(), rpc: vi.fn() }));

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("@/lib/http/fetch-with-timeout", () => ({ fetchWithTimeout: m.fetch }));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({
        rpc: m.rpc,
        from: () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: async () => ({
                        data: { id: "p1", refresh_token: "enc-refresh", token_expires_at: null },
                        error: null,
                    }),
                }),
            }),
            update: (patch: unknown) => {
                m.update(patch);
                return { eq: async () => ({ error: null }) };
            },
        }),
    }),
}));

import { GoogleTokenRefreshError, refreshGoogleToken } from "@/services/google/business-profile-token";
import { GoogleTokenRefreshUnavailableError } from "@/services/google/sync-service/errors";
import { forceRefreshGoogleAccessToken } from "@/services/google/sync-service/tokens";

const googleError = (status: number, body: string) =>
    new Response(body, { status, statusText: status === 500 ? "Internal Server Error" : "Bad Request" });
const googleTokens = () =>
    new Response(JSON.stringify({ access_token: "fresh", expires_in: 3600 }), { status: 200 });

describe("Google token refresh on transient Google failures", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers();
        process.env.GOOGLE_CLIENT_ID = "client";
        process.env.GOOGLE_CLIENT_SECRET = "secret";
        m.rpc.mockImplementation(async (fn: string) => ({ data: fn === "decrypt_token" ? "refresh" : "enc-access", error: null }));
    });

    it("retries a Google 500 once and returns the new token", async () => {
        m.fetch.mockResolvedValueOnce(googleError(500, '{"error":"internal_failure"}')).mockResolvedValueOnce(googleTokens());

        const pending = refreshGoogleToken("refresh");
        await vi.advanceTimersByTimeAsync(1000);

        await expect(pending).resolves.toMatchObject({ access_token: "fresh" });
        expect(m.fetch).toHaveBeenCalledTimes(2);
    });

    it("does not retry a revoked token", async () => {
        m.fetch.mockResolvedValueOnce(googleError(400, '{"error":"invalid_grant"}'));

        await expect(refreshGoogleToken("refresh")).rejects.toBeInstanceOf(GoogleTokenRefreshError);
        expect(m.fetch).toHaveBeenCalledTimes(1);
    });

    it("leaves the connection status alone when Google stays down", async () => {
        m.fetch.mockImplementation(async () => googleError(500, '{"error":"internal_failure"}'));

        const pending = forceRefreshGoogleAccessToken("p1");
        const assertion = expect(pending).rejects.toBeInstanceOf(GoogleTokenRefreshUnavailableError);
        await vi.advanceTimersByTimeAsync(1000);
        await assertion;
        expect(m.update).not.toHaveBeenCalled();
    });

    it("still marks a revoked token for reconnect", async () => {
        m.fetch.mockImplementation(async () => googleError(400, '{"error":"invalid_grant"}'));

        await expect(forceRefreshGoogleAccessToken("p1")).rejects.toThrow("Google connection expired");
        expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ sync_status: "error_token_revoked" }));
    });
});

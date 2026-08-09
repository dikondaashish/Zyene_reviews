import { describe, expect, it, vi, afterEach } from "vitest";

import { fetchGoogleGrantedScopes } from "../../src/services/google/verify-granted-scopes";

describe("fetchGoogleGrantedScopes", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the scope string Google actually reports", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ scope: "openid email https://www.googleapis.com/auth/business.manage" }),
            })
        );
        expect(await fetchGoogleGrantedScopes("tok")).toBe(
            "openid email https://www.googleapis.com/auth/business.manage"
        );
    });

    it("never throws on a non-OK response — returns null instead", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
        await expect(fetchGoogleGrantedScopes("expired-token")).resolves.toBeNull();
    });

    it("never throws when the network request itself fails", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
        await expect(fetchGoogleGrantedScopes("tok")).resolves.toBeNull();
    });

    it("treats a response with no scope field as null, not empty string", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
        );
        expect(await fetchGoogleGrantedScopes("tok")).toBeNull();
    });
});

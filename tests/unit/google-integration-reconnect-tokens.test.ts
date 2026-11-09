import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const m = vi.hoisted(() => ({ db: null as unknown as { client: object }, reattach: vi.fn(), rollups: vi.fn(), send: vi.fn(), del: vi.fn(), list: vi.fn() }));
vi.mock("@/app/actions/onboarding/google-oauth-helpers", () => ({ listGoogleBusinessLocations: m.list }));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({ ...m.db.client, rpc: async (_: string, a: { plaintext: string }) => ({ data: `enc(${a.plaintext})`, error: null }) }),
}));
vi.mock("@/services/google/sync-service", () => ({ reattachOrphanedGoogleReviews: m.reattach, refreshGoogleReviewRollupsFromDb: m.rollups }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: m.send } }));
vi.mock("@/lib/db/redis", () => ({ redis: { del: m.del } }));
vi.mock("server-only", () => ({}));

import { applyGoogleIntegrationTokens } from "@/services/google/integration-reconnect";

const BIZ = "22222222-2222-4222-8222-222222222222";
let db: FakeDb;
beforeEach(() => { vi.clearAllMocks(); db = createFakeDb({ review_platforms: [] }); m.db = db; });

describe("applyGoogleIntegrationTokens", () => {
    it("refreshes credentials but keeps the chosen location on an existing connection", async () => {
        db.tables.review_platforms.push({ id: "p1", business_id: BIZ, platform: "google", google_location_id: "loc-1",
            access_token: "old", refresh_token: "old-refresh", sync_status: "error", granted_scopes: "known" });
        m.list.mockResolvedValue([{ name: "locations/other" }, { name: "locations/loc-1" }]);
        const res = await applyGoogleIntegrationTokens("u", BIZ, { accessToken: "new", expiresIn: 3600 });
        expect(res).toEqual({ ok: true });
        expect(db.tables.review_platforms[0]).toMatchObject({
            google_location_id: "loc-1", access_token: "enc(new)", refresh_token: "old-refresh", sync_status: "active", granted_scopes: "known",
        });
        expect(m.del).toHaveBeenCalledWith("user_businesses:u");
    });

    it("creates a location-less Google row when the business had none", async () => {
        const res = await applyGoogleIntegrationTokens("u", BIZ, { accessToken: "a", refreshToken: "r", expiresIn: 3600, grantedScopes: "s" });
        expect(res).toEqual({ ok: true });
        expect(db.tables.review_platforms[0]).toMatchObject({
            business_id: BIZ, platform: "google", google_location_id: null, access_token: "enc(a)", refresh_token: "enc(r)", granted_scopes: "s",
        });
        expect(m.send).toHaveBeenCalled();
    });

    it("refuses a brand-new connection without a refresh token", async () => {
        const res = await applyGoogleIntegrationTokens("u", BIZ, { accessToken: "a", expiresIn: 3600 });
        expect(res).toEqual({ ok: false, reason: "no_refresh_token" });
        expect(db.tables.review_platforms).toHaveLength(0);
    });

    it("refuses tokens from a Google account that cannot see the connected location", async () => {
        db.tables.review_platforms.push({ id: "p1", business_id: BIZ, platform: "google", google_location_id: "accounts/9/locations/loc-1",
            access_token: "old", refresh_token: "old-refresh", sync_status: "error" });
        m.list.mockResolvedValue([{ name: "locations/someone-elses" }]);
        const res = await applyGoogleIntegrationTokens("u", BIZ, { accessToken: "other-account", refreshToken: "r2", expiresIn: 3600 });
        expect(res).toEqual({ ok: false, reason: "account_mismatch" });
        expect(m.list).toHaveBeenCalledWith("other-account");
        expect(db.tables.review_platforms[0]).toMatchObject({ access_token: "old", refresh_token: "old-refresh", sync_status: "error" });
    });

    it("does not list locations for a row that has no location yet", async () => {
        db.tables.review_platforms.push({ id: "p1", business_id: BIZ, platform: "google", google_location_id: null, access_token: "old" });
        const res = await applyGoogleIntegrationTokens("u", BIZ, { accessToken: "new", expiresIn: 3600 });
        expect(res).toEqual({ ok: true });
        expect(m.list).not.toHaveBeenCalled();
        expect(db.tables.review_platforms[0]).toMatchObject({ access_token: "enc(new)", sync_status: "active" });
    });
});

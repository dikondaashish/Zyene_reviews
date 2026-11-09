import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BUSINESS_ID = "biz-1";
let db: FakeDb;

vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () =>
        Object.assign(db.client, {
            auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
        }),
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => db.client }));
vi.mock("@/lib/auth/business-context", () => ({
    getActiveBusinessId: async () => ({
        business: { id: BUSINESS_ID, name: "Biz", slug: "biz", review_platforms: [] },
        organization: { plan: "pro", plan_status: "active" },
    }),
}));
vi.mock("@/lib/reviews/visible-review-rollups", () => ({
    fetchVisibleReviewRollupsByBusinessIds: async () => new Map(),
}));
vi.mock("@/services/api-keys/manage-api-keys", () => ({ loadActiveApiKeySummary: async () => null }));
vi.mock("@/services/clover/config", () => ({ isCloverConfigured: () => true }));
vi.mock("@/services/square/config", () => ({ isSquareConfigured: () => true }));

import { loadIntegrationsPageData } from "@/app/(dashboard)/settings/integrations/load-integrations-page-data";

function cloverRow(disconnectedAt: string | null) {
    return {
        business_id: BUSINESS_ID,
        merchant_id: "M1",
        environment: "production",
        connected_at: "2026-10-01T00:00:00.000Z",
        disconnected_at: disconnectedAt,
    };
}

describe("loadIntegrationsPageData clover connection", () => {
    beforeEach(() => {
        db = createFakeDb({ business_members: [{ business_id: BUSINESS_ID, user_id: "user-1", status: "active", role: "owner" }] });
    });

    it("treats an uninstalled (disconnected) Clover connection as not connected", async () => {
        db.tables.clover_connections = [cloverRow("2026-11-01T00:00:00.000Z")];
        const data = await loadIntegrationsPageData();
        expect(data.kind).toBe("ok");
        if (data.kind !== "ok") return;
        expect(data.cloverConnection).toBeNull();
    });

    it("still shows an active Clover connection", async () => {
        db.tables.clover_connections = [cloverRow(null)];
        const data = await loadIntegrationsPageData();
        if (data.kind !== "ok") throw new Error("expected ok");
        expect(data.cloverConnection).toEqual({
            merchantId: "M1",
            environment: "production",
            connectedAt: "2026-10-01T00:00:00.000Z",
        });
    });

    it("ignores disconnected Square rows too (parity)", async () => {
        db.tables.square_connections = [{ ...cloverRow("2026-11-01T00:00:00.000Z"), auto_send_enabled: true }];
        const data = await loadIntegrationsPageData();
        if (data.kind !== "ok") throw new Error("expected ok");
        expect(data.squareConnection).toBeNull();
    });
});

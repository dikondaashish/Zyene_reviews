import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ adminUpdate: vi.fn(), adminEq: vi.fn(), userUpdate: vi.fn(), warn: vi.fn() }));

vi.mock("@/lib/logger", () => ({ logger: { warn: mocks.warn } }));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({
        from: (table: string) => ({
            update: (patch: unknown) => {
                mocks.adminUpdate(table, patch);
                const chain = {
                    eq: (column: string, value: string) => {
                        mocks.adminEq(column, value);
                        return column === "business_id" ? Promise.resolve({ error: null }) : chain;
                    },
                };
                return chain;
            },
        }),
    }),
}));

import { persistGoogleListingSnapshot } from "@/services/google/listing-persistence";
import type { GoogleLocationFull } from "@/services/google/listing-information";

const userClient = {
    from: (table: string) => ({
        update: (patch: unknown) => {
            mocks.userUpdate(table, patch);
            return { eq: async () => ({ error: null }) };
        },
    }),
};

describe("persistGoogleListingSnapshot", () => {
    beforeEach(() => vi.clearAllMocks());

    it("writes review_platforms with the service role, scoped to the business", async () => {
        await persistGoogleListingSnapshot(userClient as never, {
            businessId: "biz-1",
            platformId: "plat-1",
            location: { websiteUri: "https://example.com" } as GoogleLocationFull,
            profileHealthScore: 82,
        });

        expect(mocks.adminUpdate).toHaveBeenCalledWith("review_platforms",
            expect.objectContaining({ google_profile_health_score: 82 }));
        expect(mocks.adminEq).toHaveBeenCalledWith("id", "plat-1");
        expect(mocks.adminEq).toHaveBeenCalledWith("business_id", "biz-1");
        expect(mocks.userUpdate).toHaveBeenCalledWith("businesses", expect.objectContaining({ website: "https://example.com" }));
        expect(mocks.userUpdate).not.toHaveBeenCalledWith("review_platforms", expect.anything());
        expect(mocks.warn).not.toHaveBeenCalled();
    });
});

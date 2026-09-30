import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { OAuthAddBusinessGbpDetails } from "@/services/auth/oauth-callback-add-business-gbp";

vi.mock("@/services/inngest/client", () => ({
    inngest: { send: vi.fn().mockResolvedValue(undefined) },
}));

import { createOAuthAddBusinessRecord } from "@/services/auth/oauth-callback-add-business-create";

describe("Google add-business ownership", () => {
    it("assigns membership to the verified Zyene user, not the Google identity", async () => {
        const upsert = vi.fn().mockResolvedValue({ error: null });
        const from = vi.fn((table: string) => {
            if (table === "businesses") {
                return {
                    insert: () => ({
                        select: () => ({
                            single: async () => ({ data: { id: "new-business" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "business_members") return { upsert };
            return { insert: vi.fn().mockResolvedValue({ error: null }) };
        });
        const admin = {
            from,
            rpc: vi.fn().mockResolvedValue({ data: null }),
        } as unknown as SupabaseClient;
        const gbp: OAuthAddBusinessGbpDetails = {
            googleAccountId: null,
            googleLocationId: null,
            externalId: null,
            googleReviewUrl: null,
            locationName: "Example Business",
            bizPhone: null,
            bizAddress: null,
            bizCity: null,
            bizState: null,
            bizZip: null,
            bizWebsite: null,
            bizCategory: "uncategorized",
        };

        await createOAuthAddBusinessRecord({
            admin,
            addBusinessOrgId: "verified-org",
            ownerUserId: "verified-user",
            user: {
                id: "different-google-user",
                email: "google@example.test",
                user_metadata: {},
            } as User,
            gbp,
            finalAccessToken: undefined,
            finalRefreshToken: undefined,
        });

        expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
            business_id: "new-business",
            user_id: "verified-user",
            role: "owner",
        }), { onConflict: "business_id,user_id" });
    });
});

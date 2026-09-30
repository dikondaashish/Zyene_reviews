import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), token: vi.fn(), reply: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/google/sync-service", () => ({ getValidGoogleToken: mocks.token }));
vi.mock("@/services/google/business-profile", () => ({ listAccounts: vi.fn(), replyToReview: mocks.reply }));

import { postGoogleReplySystem } from "@/services/reviews/post-google-reply-system";

describe("system reply platform tenant boundary", () => {
    beforeEach(() => vi.clearAllMocks());

    it("rejects a foreign platform before credential access or outbound reply", async () => {
        const query = {
            select: () => query, eq: () => query,
            single: async () => ({ data: {
                id: "review-a", business_id: "business-a", platform: "google",
                platform_id: "platform-b", external_id: "external-a",
            }, error: null }),
            maybeSingle: async () => ({ data: { id: "platform-b", business_id: "business-b" }, error: null }),
        };
        mocks.admin.mockReturnValue({ from: () => query });
        await expect(postGoogleReplySystem("review-a", "Reply")).rejects.toThrow("does not belong");
        expect(mocks.token).not.toHaveBeenCalled();
        expect(mocks.reply).not.toHaveBeenCalled();
    });
});

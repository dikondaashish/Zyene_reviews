import { beforeEach, describe, expect, it, vi } from "vitest";

import { postFacebookReviewSync } from "@/components/integrations/facebook-card-sync-api";

describe("postFacebookReviewSync", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ success: true, data: { total: 2 } }),
            }),
        );
    });

    it("posts to the facebook sync route with business id", async () => {
        const result = await postFacebookReviewSync("business-1");
        expect(fetch).toHaveBeenCalledWith("/api/sync/facebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId: "business-1" }),
        });
        expect(result).toEqual({ ok: true });
    });
});

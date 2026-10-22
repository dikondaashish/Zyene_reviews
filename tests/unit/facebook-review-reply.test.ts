import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ graphFetch: vi.fn(), platform: vi.fn() }));

vi.mock("@/services/facebook/client", () => ({ graphFetch: mocks.graphFetch }));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => {
        const query = {
            select: () => query,
            eq: () => query,
            maybeSingle: async () => ({ data: mocks.platform(), error: null }),
        };
        return {
            from: () => query,
            rpc: async () => ({ data: "page-token", error: null }),
        };
    },
}));

import {
    deleteFacebookReviewReply,
    isCommentableFacebookReviewId,
    postFacebookReviewReply,
} from "@/services/facebook/reply";

const PAGE_ID = "1128776443648026";

describe("Facebook review replies", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.platform.mockReturnValue({ external_id: PAGE_ID, access_token: "encrypted" });
    });

    it("comments on the review story with the page token", async () => {
        mocks.graphFetch.mockResolvedValueOnce({ data: [{ id: "c-other", from: { id: "someone" } }] });
        mocks.graphFetch.mockResolvedValueOnce({ id: "c-new" });

        await postFacebookReviewReply("platform-1", "1234567890", "Thank you!");

        expect(mocks.graphFetch).toHaveBeenLastCalledWith({
            path: "/1234567890/comments",
            method: "POST",
            params: { access_token: "page-token" },
            body: { message: "Thank you!" },
        });
    });

    it("updates the page's existing comment instead of adding a second reply", async () => {
        mocks.graphFetch.mockResolvedValueOnce({ data: [{ id: "c-page", from: { id: PAGE_ID } }] });
        mocks.graphFetch.mockResolvedValueOnce({ success: true });

        await postFacebookReviewReply("platform-1", "1234567890", "Updated thanks");

        expect(mocks.graphFetch).toHaveBeenLastCalledWith(expect.objectContaining({
            path: "/c-page",
            method: "POST",
            body: { message: "Updated thanks" },
        }));
    });

    it("deletes only the page's own comment", async () => {
        mocks.graphFetch.mockResolvedValueOnce({ data: [{ id: "c-page", from: { id: PAGE_ID } }] });
        mocks.graphFetch.mockResolvedValueOnce({ success: true });

        await deleteFacebookReviewReply("platform-1", "1234567890");

        expect(mocks.graphFetch).toHaveBeenLastCalledWith(expect.objectContaining({ path: "/c-page", method: "DELETE" }));
    });

    it("does nothing when there is no page reply to delete", async () => {
        mocks.graphFetch.mockResolvedValueOnce({ data: [] });
        await deleteFacebookReviewReply("platform-1", "1234567890");
        expect(mocks.graphFetch).toHaveBeenCalledTimes(1);
    });

    it("refuses reviews without a Graph story id", async () => {
        expect(isCommentableFacebookReviewId("123_456")).toBe(true);
        expect(isCommentableFacebookReviewId("99_2026-10-01T00:00:00+0000")).toBe(false);
        await expect(postFacebookReviewReply("platform-1", "99_2026-10-01T00:00:00+0000", "Hi"))
            .rejects.toThrow("can't be replied to from Zyene");
        expect(mocks.graphFetch).not.toHaveBeenCalled();
    });

    it("asks to reconnect when the page token is missing", async () => {
        mocks.platform.mockReturnValue(null);
        await expect(postFacebookReviewReply("platform-1", "1234567890", "Hi")).rejects.toThrow("Reconnect Facebook");
    });
});

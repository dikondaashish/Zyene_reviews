import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ token: vi.fn(), listAccounts: vi.fn() }));
vi.mock("@/services/google/sync-service", () => ({ getValidGoogleToken: m.token }));
vi.mock("@/services/google/business-profile", () => ({ listAccounts: m.listAccounts, replyToReview: vi.fn() }));

import { resolveGoogleReplyContext } from "@/services/reviews/reply-review-access";

describe("resolveGoogleReplyContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // A user with a personal account listed first and an org account that is NOT the linked one.
        m.listAccounts.mockResolvedValue([
            { name: "accounts/personal", type: "PERSONAL" },
            { name: "accounts/other-org", type: "ORGANIZATION" },
        ]);
    });

    it("replies under the account the location was linked with", async () => {
        m.token.mockResolvedValue({
            accessToken: "t", platform: { google_account_id: "linked-123", google_location_id: "loc-9" },
        });
        await expect(resolveGoogleReplyContext("p1"))
            .resolves.toEqual({ accessToken: "t", accountId: "linked-123", locationId: "loc-9" });
        expect(m.listAccounts).not.toHaveBeenCalled();
    });

    it("accepts a stored id with the accounts/ prefix", async () => {
        m.token.mockResolvedValue({
            accessToken: "t", platform: { google_account_id: "accounts/linked-123", google_location_id: "loc-9" },
        });
        await expect(resolveGoogleReplyContext("p1")).resolves.toMatchObject({ accountId: "linked-123" });
    });

    it("falls back to the old guess only for legacy rows without a stored account", async () => {
        m.token.mockResolvedValue({ accessToken: "t", platform: { google_account_id: null, google_location_id: "loc-9" } });
        await expect(resolveGoogleReplyContext("p1")).resolves.toMatchObject({ accountId: "other-org" });
    });
});

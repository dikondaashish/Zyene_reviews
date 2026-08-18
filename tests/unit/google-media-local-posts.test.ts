import { afterEach, describe, expect, it, vi } from "vitest";

import { listAllMedia, listMediaPage } from "../../src/services/google/media";
import { listAllLocalPosts, listLocalPostsPage } from "../../src/services/google/local-posts";

afterEach(() => {
    vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("Media API request shape", () => {
    it("addresses the v4 account/location parent and normalizes the location id", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ mediaItems: [] }));
        vi.stubGlobal("fetch", fetchMock);

        await listMediaPage("token", "42", "accounts/42/locations/987654321");

        expect(fetchMock).toHaveBeenCalledWith(
            "https://mybusiness.googleapis.com/v4/accounts/42/locations/987654321/media?pageSize=2500",
            expect.objectContaining({ headers: { Authorization: "Bearer token" } })
        );
    });

    it("raises a classified Google service error on 403", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                jsonResponse({ error: { message: "denied", status: "PERMISSION_DENIED" } }, 403)
            )
        );

        await expect(listMediaPage("token", "42", "locations/1")).rejects.toMatchObject({
            name: "GoogleServiceError",
            kind: "permission_denied",
            statusCode: 403,
        });
    });
});

describe("Media pagination", () => {
    it("follows page tokens and prefers Google's own total over the page count", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                jsonResponse({
                    mediaItems: [{ mediaFormat: "PHOTO" }],
                    totalMediaItemCount: 2,
                    nextPageToken: "page-2",
                })
            )
            .mockResolvedValueOnce(
                jsonResponse({ mediaItems: [{ mediaFormat: "PHOTO" }], totalMediaItemCount: 2 })
            );
        vi.stubGlobal("fetch", fetchMock);

        const result = await listAllMedia("token", "42", "locations/1");

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][0]).toContain("pageToken=page-2");
        expect(result.items).toHaveLength(2);
        expect(result.totalMediaItemCount).toBe(2);
        expect(result.truncated).toBe(false);
    });

    it("stops at the page cap and says so rather than implying a complete list", async () => {
        // Always returns another token: without a cap this would never terminate.
        // A fresh Response per call — a body can only be read once.
        vi.stubGlobal(
            "fetch",
            vi.fn().mockImplementation(async () =>
                jsonResponse({ mediaItems: [{ mediaFormat: "PHOTO" }], nextPageToken: "more" })
            )
        );

        const result = await listAllMedia("token", "42", "locations/1");

        expect(result.truncated).toBe(true);
        expect(result.items.length).toBeGreaterThan(0);
    });
});

describe("Local Posts API", () => {
    it("addresses the v4 account/location parent", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ localPosts: [] }));
        vi.stubGlobal("fetch", fetchMock);

        await listLocalPostsPage("token", "42", "accounts/42/locations/99");

        expect(fetchMock).toHaveBeenCalledWith(
            "https://mybusiness.googleapis.com/v4/accounts/42/locations/99/localPosts?pageSize=100",
            expect.objectContaining({ headers: { Authorization: "Bearer token" } })
        );
    });

    it("terminates on a Google response that keeps handing back page tokens", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockImplementation(async () =>
                jsonResponse({ localPosts: [{ state: "LIVE" }], nextPageToken: "more" })
            )
        );

        const posts = await listAllLocalPosts("token", "42", "locations/1");
        expect(posts.length).toBeGreaterThan(0);
    });
});

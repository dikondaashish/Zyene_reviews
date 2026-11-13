import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWithRetry = vi.fn();

vi.mock("@/services/google/business-profile-core", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/services/google/business-profile-core")>();
    return { ...actual, fetchWithRetry: (...args: unknown[]) => fetchWithRetry(...args) };
});

import { listReviews } from "@/services/google/business-profile-reviews";
import { isExpectedGoogleSyncSetupError } from "@/services/google/sync-service/expected-setup-errors";

const notFoundBody = JSON.stringify({
    error: { code: 404, message: "Requested entity was not found.", status: "NOT_FOUND" },
});

describe("listReviews 404", () => {
    beforeEach(() => fetchWithRetry.mockReset());

    it("throws an expected setup error so the sync is not reported as a fault", async () => {
        fetchWithRetry.mockResolvedValue(new Response(notFoundBody, { status: 404, statusText: "Not Found" }));

        const error = await listReviews("token", "acc", "loc").catch((e: unknown) => e);

        expect(error).toMatchObject({ code: "GOOGLE_LOCATION_NOT_FOUND", statusCode: 404 });
        expect(isExpectedGoogleSyncSetupError((error as Error).message)).toBe(true);
    });

    it("still surfaces other failures as generic errors", async () => {
        fetchWithRetry.mockResolvedValue(new Response("boom", { status: 500, statusText: "Server Error" }));

        await expect(listReviews("token", "acc", "loc")).rejects.toThrow(/Failed to list reviews: 500/);
    });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import {
    deletePlaceActionLink,
    listPlaceActionLinksPage,
    listPlaceActionTypeMetadataPage,
} from "../../src/services/google/place-actions";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("Google Place Actions location resources", () => {
    it("uses only the location id from a full account resource", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ placeActionLinks: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);

        await listPlaceActionLinksPage("token", "accounts/42/locations/987654321");

        expect(fetchMock).toHaveBeenCalledWith(
            "https://mybusinessplaceactions.googleapis.com/v1/locations/987654321/placeActionLinks?pageSize=50",
            expect.objectContaining({
                headers: { Authorization: "Bearer token" },
            })
        );
    });

    it("normalizes the location resource used by metadata filters", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ placeActionTypeMetadata: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);

        await listPlaceActionTypeMetadataPage("token", "locations/987654321");

        const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);
        expect(new URL(requestedUrl).searchParams.get("filter")).toBe(
            "location=locations/987654321"
        );
    });

    it("rejects malformed delete resource names before making a request", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(
            deletePlaceActionLink("token", "https://example.com/placeActionLinks/123")
        ).rejects.toThrow("Invalid Place Actions resource name");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

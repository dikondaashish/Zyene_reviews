import { afterEach, describe, expect, it, vi } from "vitest";

import { getGoogleLocation } from "../../src/services/google/listing-information";
import { getLodging } from "../../src/services/google/lodging";
import { listQuestionsPage } from "../../src/services/google/qanda";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("Google location-scoped API URLs", () => {
    it("normalizes full account resource names across Google services", async () => {
        const fetchMock = vi.fn().mockImplementation(() =>
            Promise.resolve(new Response("{}", {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }))
        );
        vi.stubGlobal("fetch", fetchMock);

        const fullResource = "accounts/42/locations/987654321";
        await listQuestionsPage("token", fullResource);
        await getLodging("token", fullResource);
        await getGoogleLocation("token", fullResource);

        const urls = fetchMock.mock.calls.map((call) => String(call[0]));
        expect(urls[0]).toContain("/v1/locations/987654321/questions?");
        expect(urls[1]).toContain("/v1/locations/987654321/lodging?");
        expect(urls[2]).toContain("/v1/locations/987654321?");
    });
});

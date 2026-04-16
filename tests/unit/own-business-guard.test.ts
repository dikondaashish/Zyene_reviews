import { describe, expect, it } from "vitest";
import {
    collectGoogleMapsFingerprints,
    isCompetitorOwnBusiness,
    normalizeBusinessNameForCompare,
} from "../../src/lib/competitors/own-business-guard";

describe("own-business-guard", () => {
    it("normalizes names for comparison", () => {
        expect(normalizeBusinessNameForCompare("  Wolfpack BBQ & Burgers! ")).toBe("wolfpack bbq burgers");
    });

    it("detects same name as own business", () => {
        expect(
            isCompetitorOwnBusiness(
                { businessName: "Wolfpack BBQ & Burgers", googleUrls: [] },
                "wolfpack bbq & burgers",
                null
            )
        ).toBe(true);
    });

    it("detects overlapping Google place id in URLs", () => {
        const url =
            "https://www.google.com/maps/search/?api=1&query_place_id=ChIJTest1234567890OwnBusiness";
        const own = collectGoogleMapsFingerprints(url);
        const comp = collectGoogleMapsFingerprints(
            "https://maps.google.com/?q=Restaurant&query_place_id=ChIJTest1234567890OwnBusiness"
        );
        expect(own.size).toBeGreaterThan(0);
        expect(comp.size).toBeGreaterThan(0);
        expect(
            isCompetitorOwnBusiness(
                {
                    businessName: "Other Name",
                    googleUrls: [url],
                    googleLocationId: null,
                },
                "Competitor label",
                "https://maps.google.com/?query_place_id=ChIJTest1234567890OwnBusiness"
            )
        ).toBe(true);
    });

    it("allows different business when name and URLs differ", () => {
        expect(
            isCompetitorOwnBusiness(
                {
                    businessName: "Wolfpack BBQ",
                    googleUrls: ["https://www.google.com/maps?query_place_id=ChIJAAA"],
                    googleLocationId: "loc-1",
                },
                "Arthur Bryant's Barbeque",
                "https://www.google.com/maps?query_place_id=ChIJBBB"
            )
        ).toBe(false);
    });
});

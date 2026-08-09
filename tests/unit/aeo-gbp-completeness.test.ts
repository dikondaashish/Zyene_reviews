import { describe, expect, it } from "vitest";
import { computeGbpCompleteness } from "../../src/services/aeo/technical-audit/gbp-completeness";
import type { GoogleLocationFull } from "../../src/services/google/listing-information";

const FULL: GoogleLocationFull = {
    title: "Wolfpack BBQ & Burgers",
    websiteUri: "https://wolfpackkc.com",
    phoneNumbers: { primaryPhone: "+18162552558" },
    profile: { description: "Kansas City BBQ." },
    regularHours: { periods: [{ openDay: "MONDAY", closeDay: "MONDAY" }] },
    categories: { primaryCategory: { displayName: "Barbecue restaurant" } },
    storefrontAddress: { addressLines: ["910 East 5th Street"], locality: "Kansas City", administrativeArea: "MO" },
};

describe("computeGbpCompleteness", () => {
    it("reports unable_to_verify, not a fabricated 0%, when location data could not be fetched", () => {
        const result = computeGbpCompleteness(null);
        expect(result.kind).toBe("unable_to_verify");
    });

    it("a fully complete profile scores 100 with every field present", () => {
        const result = computeGbpCompleteness(FULL);
        if (result.kind !== "ok") throw new Error("unreachable");
        expect(result.score).toBe(100);
        expect(result.presentCount).toBe(result.totalCount);
        expect(result.fields.every((f) => f.status === "present")).toBe(true);
        expect(result.fields.every((f) => f.recommendation === null)).toBe(true);
    });

    it("a missing field is reported as missing with a recommendation, never invented", () => {
        const result = computeGbpCompleteness({ ...FULL, phoneNumbers: undefined });
        if (result.kind !== "ok") throw new Error("unreachable");
        const phone = result.fields.find((f) => f.field === "phone")!;
        expect(phone.status).toBe("missing");
        expect(phone.value).toBeNull();
        expect(phone.recommendation).not.toBeNull();
    });

    it("an empty-string field counts as missing, not present", () => {
        const result = computeGbpCompleteness({ ...FULL, title: "  " });
        if (result.kind !== "ok") throw new Error("unreachable");
        expect(result.fields.find((f) => f.field === "title")!.status).toBe("missing");
    });

    it("score is proportional to fields present, equal weighting", () => {
        const result = computeGbpCompleteness({ title: "Acme", websiteUri: undefined });
        if (result.kind !== "ok") throw new Error("unreachable");
        expect(result.presentCount).toBe(1);
        expect(result.score).toBe(Math.round((1 / result.totalCount) * 100));
    });

    it("hours with zero periods counts as missing, not present", () => {
        const result = computeGbpCompleteness({ ...FULL, regularHours: { periods: [] } });
        if (result.kind !== "ok") throw new Error("unreachable");
        expect(result.fields.find((f) => f.field === "hours")!.status).toBe("missing");
    });

    it("an address with only a locality (no street line) still assembles a value", () => {
        const result = computeGbpCompleteness({
            ...FULL,
            storefrontAddress: { locality: "Kansas City", administrativeArea: "MO" },
        });
        if (result.kind !== "ok") throw new Error("unreachable");
        expect(result.fields.find((f) => f.field === "storefrontAddress")!.status).toBe("present");
    });
});

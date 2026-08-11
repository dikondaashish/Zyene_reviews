import { describe, expect, it } from "vitest";
import {
    buildLocalBusinessSchemaPatch,
    schemaPatchHasPlaceholders,
    type BusinessSchemaFacts,
} from "../../src/services/aeo/content-briefs/build-schema-patch";

const FULL_FACTS: BusinessSchemaFacts = {
    name: "Wolfpack BBQ & Burgers",
    addressLine: "910 East 5th Street",
    locality: "Kansas City",
    region: "MO",
    phone: "+18162552558",
    website: "https://wolfpackkc.com",
};

describe("buildLocalBusinessSchemaPatch", () => {
    it("uses real facts verbatim when all are known", () => {
        const patch = buildLocalBusinessSchemaPatch(FULL_FACTS) as { name: string; telephone: string; url: string };
        expect(patch.name).toBe("Wolfpack BBQ & Burgers");
        expect(patch.telephone).toBe("+18162552558");
        expect(patch.url).toBe("https://wolfpackkc.com");
    });

    it("substitutes a placeholder token for a genuinely unknown field — never invents a value", () => {
        const patch = buildLocalBusinessSchemaPatch({ ...FULL_FACTS, phone: null }) as { telephone: string };
        expect(patch.telephone).toBe("{{insert your business phone number}}");
        expect(patch.telephone).not.toMatch(/^\+?\d/); // definitely not a real-looking phone number
    });

    it("substitutes a placeholder for a completely missing address rather than fabricating one", () => {
        const patch = buildLocalBusinessSchemaPatch({
            ...FULL_FACTS,
            addressLine: null,
            locality: null,
            region: null,
        }) as { address: string };
        expect(patch.address).toBe("{{insert your business address}}");
    });

    it("fills partial address fields with real data, placeholder only for the missing piece", () => {
        const patch = buildLocalBusinessSchemaPatch({ ...FULL_FACTS, region: null }) as {
            address: { streetAddress: string; addressRegion: string };
        };
        expect(patch.address.streetAddress).toBe("910 East 5th Street");
        expect(patch.address.addressRegion).toBe("{{insert your business address}}");
    });
});

describe("schemaPatchHasPlaceholders", () => {
    it("false when every fact is real", () => {
        expect(schemaPatchHasPlaceholders(FULL_FACTS)).toBe(false);
    });

    it("true when any single fact is missing", () => {
        expect(schemaPatchHasPlaceholders({ ...FULL_FACTS, phone: null })).toBe(true);
        expect(schemaPatchHasPlaceholders({ ...FULL_FACTS, name: null })).toBe(true);
    });
});

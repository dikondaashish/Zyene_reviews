import { describe, expect, it } from "vitest";
import { parsePlacesMetaFromSnapshot } from "../../src/lib/competitors/places-snapshot-meta";

describe("places-snapshot-meta", () => {
  it("parsePlacesMetaFromSnapshot maps stored Places fields", () => {
    const parsed = parsePlacesMetaFromSnapshot({
      places_primary_type: "Barbecue restaurant",
      places_types: ["barbecue_restaurant", "restaurant"],
      places_website_uri: "https://example.com",
      places_editorial_summary: "Classic Kansas City BBQ since 1927.",
      places_price_level: "PRICE_LEVEL_MODERATE",
    });
    expect(parsed?.primaryType).toBe("Barbecue restaurant");
    expect(parsed?.typesPreview).toContain("barbecue restaurant");
    expect(parsed?.websiteUrl).toBe("https://example.com");
    expect(parsed?.summary).toContain("Kansas City");
    expect(parsed?.priceLevel).toBe("Moderate");
  });

  it("parsePlacesMetaFromSnapshot returns null only when metadata is missing", () => {
    expect(parsePlacesMetaFromSnapshot(null)).toBeNull();
    expect(parsePlacesMetaFromSnapshot(undefined)).toBeNull();
    const empty = parsePlacesMetaFromSnapshot({});
    expect(empty?.primaryType).toBeNull();
    expect(empty?.websiteUrl).toBeNull();
  });
});

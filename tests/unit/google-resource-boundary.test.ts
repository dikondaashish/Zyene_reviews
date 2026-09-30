import { describe, expect, it } from "vitest";
import { googleResourceBelongsToLocation } from "@/services/google/resource-boundary";

describe("Google provider resource boundary", () => {
    it("allows a resource within the verified platform location", () => {
        expect(googleResourceBelongsToLocation("locations/123/questions/q1", "accounts/a/locations/123", "questions")).toBe(true);
        expect(googleResourceBelongsToLocation("locations/123/placeActionLinks/l1", "123", "placeActionLinks")).toBe(true);
    });
    it.each(["locations/other/questions/q1", "locations/123/questions/../other", "locations/123/questions/%2e%2e", "locations/123/questions/q?x=1"])
        ("denies foreign or malformed resource %s", (name) => {
            expect(googleResourceBelongsToLocation(name, "123", "questions")).toBe(false);
        });
});

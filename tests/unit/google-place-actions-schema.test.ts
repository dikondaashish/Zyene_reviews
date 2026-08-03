import { describe, expect, it } from "vitest";

import { createPlaceActionSchema } from "../../src/services/google/place-actions-route-schema";

const validInput = {
    businessId: "fbf0f3ce-9727-462d-8186-0cb2683bf366",
    placeActionType: "APPOINTMENT",
    uri: "https://example.com/book",
};

describe("createPlaceActionSchema", () => {
    it("accepts HTTPS place-action links", () => {
        expect(createPlaceActionSchema.safeParse(validInput).success).toBe(true);
    });

    it.each(["javascript:alert(1)", "ftp://example.com/file"])(
        "rejects non-HTTP link %s",
        (uri) => {
            expect(createPlaceActionSchema.safeParse({ ...validInput, uri }).success).toBe(false);
        }
    );
});

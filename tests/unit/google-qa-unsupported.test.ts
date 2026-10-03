import { describe, expect, it } from "vitest";

import { createGoogleServiceError } from "@/services/google/api-error";
import { isGoogleQaUnsupported } from "@/services/google/qa-unsupported";

describe("Google Q&A unsupported detection", () => {
    it("treats My Business Q&A 404 as unsupported rather than an actionable fault path", () => {
        const error = createGoogleServiceError(
            "My Business Q&A API",
            404,
            "<!DOCTYPE html><title>Error 404</title><p>The requested URL <code>/v1/locations/123/questions</code> was not found</p>",
        );

        expect(isGoogleQaUnsupported(error)).toBe(true);
    });

    it("still treats unrelated 500s as supported (retry/report path)", () => {
        const error = createGoogleServiceError("My Business Q&A API", 500, "boom");
        expect(isGoogleQaUnsupported(error)).toBe(false);
    });
});

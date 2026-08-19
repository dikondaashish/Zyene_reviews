import { describe, expect, it } from "vitest";

import {
    GooglePlatformLookupError,
    GooglePlatformNotFoundError,
} from "@/services/google/sync-service/errors";

describe("Google platform access errors", () => {
    it("keeps a transient database failure distinct from a missing platform", () => {
        const lookupError = new GooglePlatformLookupError({
            cause: new TypeError("fetch failed"),
        });
        const missingError = new GooglePlatformNotFoundError();

        expect(lookupError.code).toBe("GOOGLE_CONNECTION_UNAVAILABLE");
        expect(lookupError.status).toBe(503);
        expect(lookupError.message).not.toMatch(/not found/i);
        expect(lookupError).toBeInstanceOf(Error);
        expect(missingError.code).toBe("GOOGLE_NOT_CONNECTED");
        expect(missingError.status).toBe(404);
    });
});

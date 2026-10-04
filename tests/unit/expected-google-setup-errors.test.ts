import { describe, expect, it } from "vitest";

import { isExpectedGoogleSyncSetupError } from "@/services/google/sync-service/expected-setup-errors";

describe("isExpectedGoogleSyncSetupError", () => {
    it("matches empty GBP account/location setup gaps", () => {
        expect(isExpectedGoogleSyncSetupError("No Locations found")).toBe(true);
        expect(isExpectedGoogleSyncSetupError("No Google Accounts found")).toBe(true);
    });

    it("does not match unrelated sync failures", () => {
        expect(isExpectedGoogleSyncSetupError("TypeError: fetch failed")).toBe(false);
        expect(isExpectedGoogleSyncSetupError("Failed to register notifications: 500")).toBe(false);
    });
});

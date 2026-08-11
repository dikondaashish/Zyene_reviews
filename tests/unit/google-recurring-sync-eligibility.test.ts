import { describe, expect, it } from "vitest";

import {
    RECURRING_SYNC_ELIGIBLE_STATUSES,
    isEligibleForRecurringSync,
} from "@/services/google/recurring-sync-eligibility";

describe("isEligibleForRecurringSync", () => {
    it("includes freshly connected platforms", () => {
        expect(isEligibleForRecurringSync("active")).toBe(true);
    });

    it("includes platforms that already completed a sync", () => {
        // The regression this guards: finalizeGoogleSync sets `idle` on SUCCESS, so a cron
        // filtered to `active` alone evicted every platform the moment it worked correctly.
        expect(isEligibleForRecurringSync("idle")).toBe(true);
    });

    it("excludes a platform whose sync is currently running", () => {
        expect(isEligibleForRecurringSync("running")).toBe(false);
    });

    it.each([
        "error_no_refresh_token",
        "error_token_revoked",
        "error_refresh_failed",
        "error",
    ])("excludes error status %s", (status) => {
        expect(isEligibleForRecurringSync(status)).toBe(false);
    });

    it("excludes unknown statuses — allowlist, not denylist", () => {
        // A denylist would let a future status silently start spending Google API quota.
        expect(isEligibleForRecurringSync("paused")).toBe(false);
        expect(isEligibleForRecurringSync("archived")).toBe(false);
    });

    it("handles null, undefined, and empty input", () => {
        expect(isEligibleForRecurringSync(null)).toBe(false);
        expect(isEligibleForRecurringSync(undefined)).toBe(false);
        expect(isEligibleForRecurringSync("")).toBe(false);
    });

    it("normalises case and surrounding whitespace", () => {
        expect(isEligibleForRecurringSync("  IDLE ")).toBe(true);
        expect(isEligibleForRecurringSync("Active")).toBe(true);
    });

    it("keeps the exported list in sync with the predicate", () => {
        for (const status of RECURRING_SYNC_ELIGIBLE_STATUSES) {
            expect(isEligibleForRecurringSync(status)).toBe(true);
        }
    });
});

import { describe, expect, it } from "vitest";
import { isLiveSyncLock } from "@/services/google/sync-lock-utils";

const NOW = Date.parse("2026-11-08T12:00:00Z");

describe("isLiveSyncLock (Force Sync guard)", () => {
    it("is live while a running worker keeps renewing the lock", () => {
        expect(isLiveSyncLock({ sync_status: "running", locked_until: new Date(NOW + 60_000).toISOString() }, NOW)).toBe(true);
    });

    it("is not live once the lock lapsed (stuck worker: force may clear it)", () => {
        expect(isLiveSyncLock({ sync_status: "running", locked_until: new Date(NOW - 1).toISOString() }, NOW)).toBe(false);
        expect(isLiveSyncLock({ sync_status: "running", locked_until: null }, NOW)).toBe(false);
    });

    it("is not live when nothing is running", () => {
        expect(isLiveSyncLock({ sync_status: "idle", locked_until: new Date(NOW + 60_000).toISOString() }, NOW)).toBe(false);
        expect(isLiveSyncLock(null, NOW)).toBe(false);
    });
});

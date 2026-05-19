import { describe, expect, it } from "vitest";
import { isStaleRunningGoogleSync } from "../../src/services/google/sync-run-state";
import { STALE_RUNNING_SYNC_MINUTES } from "../../src/services/google/constants";

const now = new Date("2026-05-19T12:00:00.000Z").getTime();

describe("isStaleRunningGoogleSync", () => {
    it("returns false when not running", () => {
        expect(
            isStaleRunningGoogleSync({ sync_status: "idle", locked_until: null }, now)
        ).toBe(false);
    });

    it("detects expired lock", () => {
        expect(
            isStaleRunningGoogleSync(
                {
                    sync_status: "running",
                    locked_until: "2026-05-19T11:00:00.000Z",
                },
                now
            )
        ).toBe(true);
    });

    it("detects bootstrap handoff with no lock after stale window", () => {
        const handoff = new Date(now - (STALE_RUNNING_SYNC_MINUTES + 1) * 60 * 1000).toISOString();
        expect(
            isStaleRunningGoogleSync(
                {
                    sync_status: "running",
                    locked_until: null,
                    sync_state: { bootstrap_handoff_at: handoff },
                },
                now
            )
        ).toBe(true);
    });

    it("does not flag fresh bootstrap handoff", () => {
        const handoff = new Date(now - 2 * 60 * 1000).toISOString();
        expect(
            isStaleRunningGoogleSync(
                {
                    sync_status: "running",
                    locked_until: null,
                    sync_state: { bootstrap_handoff_at: handoff },
                },
                now
            )
        ).toBe(false);
    });

    it("detects running with null lock and old updated_at", () => {
        const updated = new Date(now - (STALE_RUNNING_SYNC_MINUTES + 5) * 60 * 1000).toISOString();
        expect(
            isStaleRunningGoogleSync(
                {
                    sync_status: "running",
                    locked_until: null,
                    updated_at: updated,
                },
                now
            )
        ).toBe(true);
    });
});

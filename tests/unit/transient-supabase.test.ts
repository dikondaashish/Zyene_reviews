import { describe, expect, it, vi } from "vitest";

import {
    isTransientSupabaseError,
    mapWithConcurrency,
} from "@/services/google/sync-service/transient-supabase";

describe("isTransientSupabaseError", () => {
    it("detects fetch failed with EBUSY cause", () => {
        const error = Object.assign(new Error("TypeError: fetch failed"), {
            cause: new Error("getaddrinfo EBUSY snielpllhrppdqzkzjwf.supabase.co"),
        });
        expect(isTransientSupabaseError(error)).toBe(true);
    });

    it("detects Postgrest-shaped network messages", () => {
        expect(isTransientSupabaseError({ message: "TypeError: fetch failed", code: "" })).toBe(true);
        expect(isTransientSupabaseError({ message: "EMFILE: too many open files" })).toBe(true);
    });

    it("keeps real Postgres errors non-transient", () => {
        expect(
            isTransientSupabaseError({
                message: "duplicate key value violates unique constraint",
                code: "23505",
            })
        ).toBe(false);
    });
});

describe("mapWithConcurrency", () => {
    it("preserves order and respects the concurrency ceiling", async () => {
        let active = 0;
        let maxActive = 0;
        const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
            active += 1;
            maxActive = Math.max(maxActive, active);
            await new Promise((resolve) => setTimeout(resolve, 5));
            active -= 1;
            return value * 10;
        });

        expect(results).toEqual([10, 20, 30, 40, 50]);
        expect(maxActive).toBeLessThanOrEqual(2);
    });

    it("returns an empty array for empty input", async () => {
        const mapper = vi.fn();
        await expect(mapWithConcurrency([], 5, mapper)).resolves.toEqual([]);
        expect(mapper).not.toHaveBeenCalled();
    });
});

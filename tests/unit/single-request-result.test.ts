import { describe, expect, it } from "vitest";
import { singleRequestSuccessMessage } from "@/components/customers/single-request-result";

describe("single customer Send Request result", () => {
    it("treats a quiet-hours deferral as queued, not failed", () => {
        expect(singleRequestSuccessMessage({ success: true, sent: 0, queued: 1 } as never, "c1"))
            .toMatch(/queued/i);
    });

    it("confirms an immediate send", () => {
        expect(singleRequestSuccessMessage({ sent: 1, queued: 0 }, "c1")).toBe("Review request sent!");
    });

    it("surfaces the server's skip reason for that customer", () => {
        expect(() => singleRequestSuccessMessage({ sent: 0, queued: 0, skippedReasons: { c1: "Opted out" } }, "c1"))
            .toThrow("Opted out");
        expect(() => singleRequestSuccessMessage({ sent: 0, queued: 0 }, "c1")).toThrow(/not sent/);
    });
});

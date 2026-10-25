import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/stripe/client", () => ({ stripe: {} }));
import { refundStatus } from "@/services/stripe/invoice-refunds";

describe("invoice refund status", () => {
    it.each([
        [5499, 0, "none"], [5499, 2500, "partial"], [5499, 5499, "full"],
        [5499, 6000, "full"], [0, 0, "none"], [0, 100, "none"],
    ] as const)("amount paid %i with %i refunded is %s", (paid, refunded, expected) => {
        expect(refundStatus(paid, refunded)).toBe(expected);
    });
});

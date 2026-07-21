import { describe, expect, it, vi } from "vitest";
import { claimSquarePaymentSend } from "@/services/square/claim-send";

describe("claimSquarePaymentSend", () => {
    it("returns true when a row is claimed", async () => {
        const maybeSingle = vi.fn().mockResolvedValue({ data: { id: "row-1" } });
        const select = vi.fn(() => ({ maybeSingle }));
        const inFn = vi.fn(() => ({ select }));
        const is = vi.fn(() => ({ in: inFn }));
        const eq2 = vi.fn(() => ({ is }));
        const eq1 = vi.fn(() => ({ eq: eq2 }));
        const update = vi.fn(() => ({ eq: eq1 }));
        const admin = { from: vi.fn(() => ({ update })) } as never;

        await expect(claimSquarePaymentSend(admin, "m1", "p1")).resolves.toBe(true);
        expect(update).toHaveBeenCalledWith({ status: "sending" });
    });

    it("returns false when no claimable row", async () => {
        const maybeSingle = vi.fn().mockResolvedValue({ data: null });
        const select = vi.fn(() => ({ maybeSingle }));
        const inFn = vi.fn(() => ({ select }));
        const is = vi.fn(() => ({ in: inFn }));
        const eq2 = vi.fn(() => ({ is }));
        const eq1 = vi.fn(() => ({ eq: eq2 }));
        const update = vi.fn(() => ({ eq: eq1 }));
        const admin = { from: vi.fn(() => ({ update })) } as never;

        await expect(claimSquarePaymentSend(admin, "m1", "p1")).resolves.toBe(false);
    });
});

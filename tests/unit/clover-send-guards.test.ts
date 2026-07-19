import { describe, expect, it, vi, beforeEach } from "vitest";
import { shouldProcessCloverPaymentEvent } from "@/services/clover/payment-event-guard";
import {
    cloverStatusFromSendOutcome,
    sendCloverReviewRequest,
} from "@/services/clover/send-from-payment";

vi.mock("@/lib/review-requests/send-outbound", () => ({
    sendOutboundReviewRequest: vi.fn(),
}));

import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";

const contact = {
    email: "guest@example.com",
    phone: null as string | null,
    name: "Guest",
};

describe("shouldProcessCloverPaymentEvent", () => {
    it("allows CREATE (first payment)", () => {
        expect(shouldProcessCloverPaymentEvent("CREATE")).toBe(true);
    });

    it("ignores UPDATE so refunds / tip adjusts do not re-send", () => {
        expect(shouldProcessCloverPaymentEvent("UPDATE")).toBe(false);
    });

    it("ignores DELETE and unknown types", () => {
        expect(shouldProcessCloverPaymentEvent("DELETE")).toBe(false);
        expect(shouldProcessCloverPaymentEvent("")).toBe(false);
    });
});

describe("sendCloverReviewRequest production gate", () => {
    beforeEach(() => {
        vi.mocked(sendOutboundReviewRequest).mockReset();
    });

    it("skips when auto_send_enabled is false (production)", async () => {
        const outcome = await sendCloverReviewRequest({
            businessId: "b1",
            autoSendEnabled: false,
            environment: "production",
            contact,
        });
        expect(outcome).toEqual({ kind: "skipped_disabled" });
        expect(sendOutboundReviewRequest).not.toHaveBeenCalled();
    });

    it("allows production when auto_send_enabled is true", async () => {
        vi.mocked(sendOutboundReviewRequest).mockResolvedValue({
            success: true,
            requestId: "req-1",
            code: 200,
            errorMessage: "",
        } as never);

        const outcome = await sendCloverReviewRequest({
            businessId: "b1",
            autoSendEnabled: true,
            environment: "production",
            contact,
        });
        expect(outcome).toEqual({ kind: "sent", requestId: "req-1" });
        expect(sendOutboundReviewRequest).toHaveBeenCalledOnce();
    });

    it("still allows sandbox when auto_send_enabled is true", async () => {
        vi.mocked(sendOutboundReviewRequest).mockResolvedValue({
            success: true,
            requestId: "req-2",
            code: 200,
            errorMessage: "",
        } as never);

        const outcome = await sendCloverReviewRequest({
            businessId: "b1",
            autoSendEnabled: true,
            environment: "sandbox",
            contact,
        });
        expect(outcome.kind).toBe("sent");
    });
});

describe("cloverStatusFromSendOutcome", () => {
    it("maps skipped_disabled", () => {
        expect(cloverStatusFromSendOutcome({ kind: "skipped_disabled" })).toBe(
            "skipped_disabled",
        );
    });
});

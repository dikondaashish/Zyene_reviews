import { describe, expect, it, vi, beforeEach } from "vitest";
import {
    squareStatusFromSendOutcome,
    sendSquareReviewRequest,
} from "@/services/square/send-from-payment";
import { pickSquareOutboundChannel } from "@/services/square/pick-channel";

vi.mock("@/lib/review-requests/send-outbound", () => ({
    sendOutboundReviewRequest: vi.fn(),
}));

import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";

const contact = {
    email: "guest@example.com",
    phone: null as string | null,
    name: "Guest",
};

describe("pickSquareOutboundChannel", () => {
    it("prefers email", () => {
        expect(pickSquareOutboundChannel({ email: "a@b.c", phone: "+1", name: null })).toBe(
            "email",
        );
        expect(pickSquareOutboundChannel({ email: null, phone: "+1", name: null })).toBe("sms");
    });
});

describe("sendSquareReviewRequest", () => {
    beforeEach(() => {
        vi.mocked(sendOutboundReviewRequest).mockReset();
    });

    it("skips when auto_send_enabled is false", async () => {
        const outcome = await sendSquareReviewRequest({
            businessId: "b1",
            autoSendEnabled: false,
            environment: "sandbox",
            contact,
        });
        expect(outcome).toEqual({ kind: "skipped_disabled" });
        expect(sendOutboundReviewRequest).not.toHaveBeenCalled();
    });

    it("sends with pos_square when enabled", async () => {
        vi.mocked(sendOutboundReviewRequest).mockResolvedValue({
            success: true,
            requestId: "req-1",
            code: 200,
            errorMessage: "",
        } as never);

        const outcome = await sendSquareReviewRequest({
            businessId: "b1",
            autoSendEnabled: true,
            environment: "sandbox",
            contact,
        });
        expect(outcome).toEqual({ kind: "sent", requestId: "req-1" });
        expect(sendOutboundReviewRequest).toHaveBeenCalledWith(
            expect.objectContaining({ triggerSource: "pos_square", channel: "email" }),
        );
    });

    it("maps outcomes to statuses", () => {
        expect(squareStatusFromSendOutcome({ kind: "skipped_disabled" })).toBe("skipped_disabled");
        expect(squareStatusFromSendOutcome({ kind: "sent", requestId: "x" })).toBe("sent");
    });
});

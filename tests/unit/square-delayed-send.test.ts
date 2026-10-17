import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/inngest/client", () => ({ inngest: { send: vi.fn() } }));
vi.mock("@/services/square/claim-send", () => ({ claimSquarePaymentSend: vi.fn() }));
vi.mock("@/services/square/payment-event-store", () => ({
    findSquarePaymentEvent: vi.fn(),
    patchSquarePaymentEvent: vi.fn(),
}));
vi.mock("@/lib/review-requests/send-outbound", () => ({ sendOutboundReviewRequest: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/services/square/config", () => ({ getSquareEnvironment: () => "production" }));
vi.mock("@/lib/review-requests/pos-send-timing", async (orig) => ({
    ...(await orig<typeof import("@/lib/review-requests/pos-send-timing")>()),
    loadPosSendSettings: vi.fn(),
}));

import { inngest } from "@/services/inngest/client";
import { claimSquarePaymentSend } from "@/services/square/claim-send";
import {
    findSquarePaymentEvent,
    patchSquarePaymentEvent,
} from "@/services/square/payment-event-store";
import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";
import { loadPosSendSettings } from "@/lib/review-requests/pos-send-timing";
import { dispatchSquarePaymentSend } from "@/services/square/dispatch-payment-send";
import { runPosDelayedSend } from "@/services/review-requests/pos-delayed-send";

const event = { merchantId: "m1", paymentId: "p1" };
const connection = { business_id: "b1", auto_send_enabled: true, environment: "production" };
const contact = { email: "guest@example.com", phone: null, name: "Guest" };
const admin = {} as never;

function connectionAdmin(row: unknown) {
    const maybeSingle = vi.fn().mockResolvedValue({ data: row });
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.is = vi.fn(() => ({ maybeSingle }));
    return { from: vi.fn(() => chain) } as never;
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(claimSquarePaymentSend).mockResolvedValue(true);
    vi.mocked(sendOutboundReviewRequest).mockResolvedValue({
        success: true,
        requestId: "req-1",
        status: "sent",
        channel: "email",
        reviewLink: "https://x",
        errorMessage: null,
    });
});

describe("dispatchSquarePaymentSend", () => {
    it("schedules a delayed send instead of sending at payment time", async () => {
        vi.mocked(loadPosSendSettings).mockResolvedValue({ delayMinutes: 120, minAmountCents: 0 });
        const before = Date.now();

        await dispatchSquarePaymentSend({ admin, event, connection, contact, amountCents: 5000 });

        expect(sendOutboundReviewRequest).not.toHaveBeenCalled();
        expect(claimSquarePaymentSend).toHaveBeenCalledWith(admin, "m1", "p1");
        const sent = vi.mocked(inngest.send).mock.calls[0]?.[0] as {
            id: string;
            name: string;
            data: { source: string; sendAt: string };
        };
        expect(sent.name).toBe("review-request/pos.delayed-send");
        expect(sent.id).toBe("square-review-request:m1:p1");
        expect(sent.data.source).toBe("square");
        const delayMs = new Date(sent.data.sendAt).getTime() - before;
        expect(delayMs).toBeGreaterThanOrEqual(120 * 60_000 - 1000);
        expect(delayMs).toBeLessThanOrEqual(120 * 60_000 + 1000);
    });

    it("sends immediately when the delay is 0", async () => {
        vi.mocked(loadPosSendSettings).mockResolvedValue({ delayMinutes: 0, minAmountCents: 0 });

        await dispatchSquarePaymentSend({ admin, event, connection, contact, amountCents: 5000 });

        expect(inngest.send).not.toHaveBeenCalled();
        expect(sendOutboundReviewRequest).toHaveBeenCalledWith(
            expect.objectContaining({ businessId: "b1", channel: "email", triggerSource: "pos_square" }),
        );
        expect(patchSquarePaymentEvent).toHaveBeenCalledWith(admin, event, {
            status: "sent",
            review_request_id: "req-1",
        });
    });

    it("skips payments under the minimum without claiming or sending", async () => {
        vi.mocked(loadPosSendSettings).mockResolvedValue({ delayMinutes: 120, minAmountCents: 1500 });

        await dispatchSquarePaymentSend({ admin, event, connection, contact, amountCents: 999 });

        expect(claimSquarePaymentSend).not.toHaveBeenCalled();
        expect(inngest.send).not.toHaveBeenCalled();
        expect(sendOutboundReviewRequest).not.toHaveBeenCalled();
        expect(patchSquarePaymentEvent).toHaveBeenCalledWith(admin, event, {
            status: "skipped_guard",
            error_message: "Below minimum transaction amount ($15.00).",
        });
    });

    it("keeps auto-send off as skipped_disabled (no schedule)", async () => {
        vi.mocked(loadPosSendSettings).mockResolvedValue({ delayMinutes: 120, minAmountCents: 1500 });

        await dispatchSquarePaymentSend({
            admin,
            event,
            connection: { ...connection, auto_send_enabled: false },
            contact,
            amountCents: 999,
        });

        expect(inngest.send).not.toHaveBeenCalled();
        expect(patchSquarePaymentEvent).toHaveBeenCalledWith(admin, event, { status: "skipped_disabled" });
    });
});

describe("runPosDelayedSend", () => {
    const squareJob = {
        source: "square" as const,
        businessId: "b1",
        merchantId: "m1",
        paymentId: "p1",
        sendAt: "2026-10-15T14:00:00.000Z",
    };
    const pendingRow = {
        id: "row-1",
        status: "sending",
        customer_email: "guest@example.com",
        customer_phone: null,
        customer_name: "Guest",
        review_request_id: null,
    };

    it("sends through sendOutboundReviewRequest (cap + opt-out guards) once due", async () => {
        vi.mocked(findSquarePaymentEvent).mockResolvedValue(pendingRow);

        const status = await runPosDelayedSend(squareJob, connectionAdmin(connection));

        expect(status).toBe("sent");
        expect(sendOutboundReviewRequest).toHaveBeenCalledWith(
            expect.objectContaining({ customerEmail: "guest@example.com", triggerSource: "pos_square" }),
        );
    });

    it("records guard skips (e.g. 30-day cap) from the delayed send", async () => {
        vi.mocked(findSquarePaymentEvent).mockResolvedValue(pendingRow);
        vi.mocked(sendOutboundReviewRequest).mockResolvedValue({
            success: false,
            requestId: null,
            status: "failed",
            channel: "email",
            reviewLink: null,
            errorMessage: "Already sent to this contact recently. Cap is 30 days.",
            code: 400,
        });

        const status = await runPosDelayedSend(squareJob, connectionAdmin(connection));

        expect(status).toBe("skipped_guard");
        expect(patchSquarePaymentEvent).toHaveBeenCalledWith(expect.anything(), event, {
            status: "skipped_guard",
            error_message: "Already sent to this contact recently. Cap is 30 days.",
        });
    });

    it("does nothing when the row is no longer pending", async () => {
        vi.mocked(findSquarePaymentEvent).mockResolvedValue({ ...pendingRow, status: "sent" });

        await expect(runPosDelayedSend(squareJob, connectionAdmin(connection))).resolves.toBe("not_pending");
        expect(sendOutboundReviewRequest).not.toHaveBeenCalled();
    });

    it("re-checks auto-send at send time", async () => {
        vi.mocked(findSquarePaymentEvent).mockResolvedValue(pendingRow);

        const status = await runPosDelayedSend(
            squareJob,
            connectionAdmin({ ...connection, auto_send_enabled: false }),
        );

        expect(status).toBe("skipped_disabled");
        expect(sendOutboundReviewRequest).not.toHaveBeenCalled();
    });

    it("marks the row skipped when Square was disconnected during the delay", async () => {
        vi.mocked(findSquarePaymentEvent).mockResolvedValue(pendingRow);

        await expect(runPosDelayedSend(squareJob, connectionAdmin(null))).resolves.toBe("skipped_disabled");
        expect(patchSquarePaymentEvent).toHaveBeenCalledWith(expect.anything(), event, {
            status: "skipped_disabled",
            error_message: "Square was disconnected before the delayed send.",
        });
    });

    it("sends delayed Zapier requests with the zapier trigger source", async () => {
        const status = await runPosDelayedSend(
            {
                source: "zapier",
                businessId: "b1",
                channel: "sms",
                contact: { name: "Guest", email: null, phone: "+15551234567" },
                sendAt: "2026-10-15T14:00:00.000Z",
            },
            admin,
        );

        expect(status).toBe("sent");
        expect(sendOutboundReviewRequest).toHaveBeenCalledWith(
            expect.objectContaining({ channel: "sms", customerPhone: "+15551234567", triggerSource: "zapier" }),
        );
    });
});

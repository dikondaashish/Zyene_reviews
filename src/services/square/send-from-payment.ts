import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";
import { pickSquareOutboundChannel } from "@/services/square/pick-channel";
import type { SquareResolvedContact } from "@/services/square/resolve-contact";

export type SquareSendOutcome =
    | { kind: "skipped_disabled" }
    | { kind: "skipped_no_contact" }
    | { kind: "sent"; requestId: string }
    | { kind: "skipped_guard"; message: string }
    | { kind: "send_failed"; message: string };

/**
 * Phase 2: send when auto_send_enabled (sandbox or production).
 * New connections default auto_send_enabled=false — flip per business to enable.
 */
export async function sendSquareReviewRequest(args: {
    businessId: string;
    autoSendEnabled: boolean;
    environment: string;
    contact: SquareResolvedContact;
}): Promise<SquareSendOutcome> {
    const { contact } = args;

    if (!contact.email && !contact.phone) {
        return { kind: "skipped_no_contact" };
    }

    const envOk = args.environment === "sandbox" || args.environment === "production";
    if (!args.autoSendEnabled || !envOk) {
        return { kind: "skipped_disabled" };
    }

    const channel = pickSquareOutboundChannel(contact);
    if (!channel) return { kind: "skipped_no_contact" };

    const result = await sendOutboundReviewRequest({
        businessId: args.businessId,
        channel,
        customerName: contact.name,
        customerEmail: contact.email,
        customerPhone: contact.phone,
        triggerSource: "pos_square",
    });

    if (result.success) {
        return { kind: "sent", requestId: result.requestId };
    }

    if (result.code === 400 || result.code === 403) {
        return { kind: "skipped_guard", message: result.errorMessage };
    }

    return { kind: "send_failed", message: result.errorMessage };
}

export function squareStatusFromSendOutcome(outcome: SquareSendOutcome): string {
    switch (outcome.kind) {
        case "sent":
            return "sent";
        case "skipped_no_contact":
            return "skipped_no_contact";
        case "skipped_disabled":
            return "skipped_disabled";
        case "skipped_guard":
            return "skipped_guard";
        case "send_failed":
            return "send_failed";
    }
}

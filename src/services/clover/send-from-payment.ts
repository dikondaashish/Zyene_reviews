import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";
import { pickCloverOutboundChannel } from "@/services/clover/pick-channel";
import type { CloverResolvedContact } from "@/services/clover/resolve-contact";

export type CloverSendOutcome =
    | { kind: "skipped_disabled" }
    | { kind: "skipped_no_contact" }
    | { kind: "sent"; requestId: string }
    | { kind: "skipped_guard"; message: string }
    | { kind: "send_failed"; message: string };

/**
 * Phase 2: send via shared outbound path when sandbox + auto_send_enabled.
 * Opt-out / frequency caps live inside sendOutboundReviewRequest.
 */
export async function sendCloverReviewRequest(args: {
    businessId: string;
    autoSendEnabled: boolean;
    environment: string;
    contact: CloverResolvedContact;
}): Promise<CloverSendOutcome> {
    const { contact } = args;

    if (!contact.email && !contact.phone) {
        return { kind: "skipped_no_contact" };
    }

    if (!args.autoSendEnabled || args.environment !== "sandbox") {
        return { kind: "skipped_disabled" };
    }

    const channel = pickCloverOutboundChannel(contact);
    if (!channel) return { kind: "skipped_no_contact" };

    const result = await sendOutboundReviewRequest({
        businessId: args.businessId,
        channel,
        customerName: contact.name,
        customerEmail: contact.email,
        customerPhone: contact.phone,
        triggerSource: "pos_clover",
    });

    if (result.success) {
        return { kind: "sent", requestId: result.requestId };
    }

    if (result.code === 400 || result.code === 403) {
        return { kind: "skipped_guard", message: result.errorMessage };
    }

    return { kind: "send_failed", message: result.errorMessage };
}

export function cloverStatusFromSendOutcome(outcome: CloverSendOutcome): string {
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

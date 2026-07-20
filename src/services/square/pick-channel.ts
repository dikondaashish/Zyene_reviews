import type { OutboundChannel } from "@/lib/review-requests/send-outbound-types";
import type { SquareResolvedContact } from "@/services/square/resolve-contact";

/** Pilot: prefer email when both are present (same as Clover). */
export function pickSquareOutboundChannel(
    contact: SquareResolvedContact,
): OutboundChannel | null {
    if (contact.email) return "email";
    if (contact.phone) return "sms";
    return null;
}

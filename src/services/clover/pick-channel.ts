import type { OutboundChannel } from "@/lib/review-requests/send-outbound-types";
import type { CloverResolvedContact } from "@/services/clover/resolve-contact";

/**
 * Pilot: prefer email when both are present.
 * Switch to both / SMS-preferred later after email-only is proven.
 */
export function pickCloverOutboundChannel(
    contact: CloverResolvedContact,
): OutboundChannel | null {
    if (contact.email) return "email";
    if (contact.phone) return "sms";
    return null;
}

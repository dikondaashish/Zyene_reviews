/**
 * Only the first CREATE for a payment may trigger processing / a review request.
 * Later UPDATE (refund, tip adjust, void) must be ignored.
 */
export function shouldProcessCloverPaymentEvent(eventType: string): boolean {
    return eventType === "CREATE";
}

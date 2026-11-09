/** Body of POST /api/customers/bulk with action "request" for a single customer. */
export type SingleRequestResult = {
    error?: string;
    sent?: number;
    queued?: number;
    skippedReasons?: Record<string, string>;
};

/**
 * The toast text for a one-customer send. A quiet-hours deferral comes back as
 * `queued`, not `sent`: it is saved and goes out when the window opens, so it is a
 * success. Anything else throws with the server's reason for that customer.
 */
export function singleRequestSuccessMessage(result: SingleRequestResult, customerId: string): string {
    if (result.queued === 1) return "Review request queued. It will send after quiet hours.";
    if (result.sent === 1) return "Review request sent!";
    throw new Error(result.skippedReasons?.[customerId]
        || "The request was not sent. Check contact eligibility and try again.");
}

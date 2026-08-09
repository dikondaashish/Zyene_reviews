import { assignSlot } from "./sampling-slot";

/**
 * Whether a business's deterministic E-10 slot is right now.
 *
 * Pulled out of the loader as its own pure function for the same reason
 * yearly-credit-reset-eligibility.ts stayed pure: this is the one comparison
 * that decides whether a real business gets sampled today, and it should be
 * testable without a database in the loop.
 *
 * Compared on BOTH day and hour, not day alone — a once-daily cron would
 * dispatch a whole day's businesses simultaneously, exactly the thundering
 * herd DEFAULT_SLOT_HOURS spreads across 1–8 UTC to avoid. This is why the
 * scheduler route is meant to run hourly, not daily like the credit-reset one.
 */
export function isBusinessDueNow(businessId: string, now: Date): boolean {
    const slot = assignSlot(businessId);
    return slot.dayOfWeek === now.getUTCDay() && slot.hour === now.getUTCHours();
}

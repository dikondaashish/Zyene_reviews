import { assignSlot, type SamplingSlot } from "@/services/aeo/scheduler/sampling-slot";

/**
 * E-3 automation: deterministic weekly crawl slot, one per business.
 *
 * Reuses E-10's (day, hour) hash rather than inventing a second scheme, for
 * the same reasons: identical crawl timing every week (stable trend data for
 * a future F5.12 severity-over-time view), and load spread across the same
 * 1–8 UTC off-peak window sampling already uses.
 *
 * Salted with a "crawl:" prefix rather than reusing assignSlot(businessId)
 * directly — a shared salt would put every business's crawl in the exact
 * same hour as its AI-sampling run, doubling that hour's outbound HTTP load
 * for no reason. Independent salts spread the two kinds of load independently.
 *
 * Weekly, not daily: a full crawl re-fetches up to a plan's whole page cap
 * (up to 1,000 pages on Professional) against a site we do not control.
 * Daily would be needless load for content that rarely changes that often.
 */
export function assignCrawlSlot(businessId: string): SamplingSlot {
    return assignSlot(`crawl:${businessId}`);
}

/** Whether a business's weekly crawl slot is right now — same (day, hour) comparison as E-10. */
export function isCrawlDueNow(businessId: string, now: Date): boolean {
    const slot = assignCrawlSlot(businessId);
    return slot.dayOfWeek === now.getUTCDay() && slot.hour === now.getUTCHours();
}

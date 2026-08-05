/**
 * E-10, part 1: deterministic sampling slots.
 *
 * Every business is assigned a fixed (day-of-week, hour) slot derived from its
 * id. Two independent reasons this must be deterministic rather than, say,
 * "whenever the business was enrolled" or a rotating queue:
 *
 *   1. Cost. Vendor free allowances are DAILY buckets. Gemini grants 10,000
 *      grounding prompts per day; spread across a week that covers ~4,600
 *      Professional businesses free, and bunched onto one day it covers ~660.
 *      Even spreading is worth ~$3.50/business/month at scale.
 *   2. Signal quality. A business that drifts between slots is sampled at
 *      irregular intervals — six days apart one week, eight the next. That
 *      injects noise into every trend line and into the F8.8 significance gate,
 *      which cannot distinguish "visibility moved" from "we measured later".
 *
 * Same business, same slot, every week, across processes and restarts.
 */

export type SamplingSlot = {
    /** 0 = Sunday … 6 = Saturday, matching Date#getUTCDay(). */
    dayOfWeek: number;
    /** UTC hour, 0–23. */
    hour: number;
};

/**
 * Default dispatch window, UTC. Overnight for the Americas and early morning in
 * Europe — sampling is not user-facing, so it should avoid the hours when the
 * dashboard and review-sync workers are busiest.
 */
export const DEFAULT_SLOT_HOURS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

const DAYS_PER_WEEK = 7;

/**
 * FNV-1a, 32-bit. Chosen over crypto hashing because it is dependency-free,
 * synchronous, and — the property that matters here — produces identical output
 * for identical input on every machine and every Node version. Slot assignment
 * that varied by runtime would silently break requirement (2) above.
 */
function fnv1a(input: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        // hash * 16777619, kept in 32-bit range without overflowing to float.
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
}

/**
 * Day and hour are hashed from separately salted strings. Deriving both from one
 * hash by successive modulo correlates them: businesses landing on the same day
 * would cluster on the same hour, re-creating a burst inside the day we just
 * spread the load across.
 */
export function assignSlot(
    businessId: string,
    options?: { hours?: readonly number[] }
): SamplingSlot {
    const hours = options?.hours?.length ? options.hours : DEFAULT_SLOT_HOURS;
    const dayOfWeek = fnv1a(`${businessId}:day`) % DAYS_PER_WEEK;
    const hour = hours[fnv1a(`${businessId}:hour`) % hours.length];
    return { dayOfWeek, hour };
}

/**
 * Next UTC occurrence of a slot, strictly after `from`.
 *
 * Used at enrolment: a newly connected business is given a slot and waits for
 * it rather than sampling immediately. Fifty signups in one minute would
 * otherwise produce fifty simultaneous runs — the thundering herd the slot
 * system exists to prevent (QA criterion #53).
 */
export function nextRunAt(slot: SamplingSlot, from: Date): Date {
    const next = new Date(
        Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), slot.hour, 0, 0, 0)
    );
    const dayDelta = (slot.dayOfWeek - next.getUTCDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK;
    next.setUTCDate(next.getUTCDate() + dayDelta);
    if (next.getTime() <= from.getTime()) {
        next.setUTCDate(next.getUTCDate() + DAYS_PER_WEEK);
    }
    return next;
}

/**
 * Businesses per weekday for a given set of ids.
 *
 * Operational check for the rebalancing requirement: as the account base grows,
 * this shows whether the hash is still spreading evenly before a day's demand
 * quietly crosses a vendor's free allowance.
 */
export function slotLoadByDay(
    businessIds: readonly string[],
    options?: { hours?: readonly number[] }
): number[] {
    const counts = new Array<number>(DAYS_PER_WEEK).fill(0);
    for (const id of businessIds) {
        counts[assignSlot(id, options).dayOfWeek] += 1;
    }
    return counts;
}

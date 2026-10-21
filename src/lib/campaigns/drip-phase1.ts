/**
 * Campaign reminders: configurable delay between steps, optional stop-on-click, channel
 * alternate, terminate helpers. No platform-sync review matching (reviews only stop
 * reminders when confirmed on the request).
 */

/** Default gap between reminder steps when a campaign has no explicit delay (7 days). */
export const DRIP_STEP_DELAY_HOURS = 7 * 24; // 168
/** A reminder this far past its due time is not sent (e.g. after a long pause); the sequence ends. */
export const DRIP_STALE_AFTER_HOURS = 72;

export type DripChannel = "sms" | "email";
export type DripStatus = "idle" | "active" | "completed" | "terminated";
export type DripTerminatedReason =
    | "clicked"
    | "review_left"
    | "opted_out"
    | "manual_stop"
    | "exhausted"
    | "expired"
    | "unsubscribed";

/** Prefer email as "last" when both sent so Step 2 alternates to SMS. */
export function primaryChannelFromMethods(methods: DripChannel[]): DripChannel | null {
    if (methods.includes("email")) return "email";
    if (methods.includes("sms")) return "sms";
    return null;
}

/**
 * Pick a single channel for Step 2 / Step 3.
 * When alternate is on, prefer the opposite of lastChannel if that contact exists.
 */
export function pickDripChannel(args: {
    alternate: boolean;
    lastChannel: DripChannel | null;
    hasEmail: boolean;
    hasPhone: boolean;
}): DripChannel | null {
    const { alternate, lastChannel, hasEmail, hasPhone } = args;
    if (!hasEmail && !hasPhone) return null;

    const preferred: DripChannel | null =
        alternate && lastChannel
            ? lastChannel === "sms"
                ? "email"
                : "sms"
            : lastChannel;

    if (preferred === "sms" && hasPhone) return "sms";
    if (preferred === "email" && hasEmail) return "email";
    if (hasPhone) return "sms";
    if (hasEmail) return "email";
    return null;
}

export function reminderDelayHours(followUpDelayHours: number | null | undefined): number {
    return followUpDelayHours && followUpDelayHours > 0 ? followUpDelayHours : DRIP_STEP_DELAY_HOURS;
}

/** Cutoff: rows with sent_at / step2_sent_at at or before this ISO are due. */
export function dueBeforeIso(delayHours = DRIP_STEP_DELAY_HOURS, now = new Date()): string {
    return new Date(now.getTime() - delayHours * 60 * 60 * 1000).toISOString();
}

/** True when a reminder is so late that sending it now would surprise the customer. */
export function isStaleReminder(previousSentAt: string | null, delayHours: number, now = new Date()): boolean {
    if (!previousSentAt) return true;
    const dueAt = new Date(previousSentAt).getTime() + delayHours * 3_600_000;
    return now.getTime() - dueAt > DRIP_STALE_AFTER_HOURS * 3_600_000;
}

export function shouldSkipDripSend(row: {
    drip_status: string | null;
    review_left: boolean | null;
    clicked_at: string | null;
    completed_at: string | null;
    review_confirmed_at?: string | null;
}, options: { stopOnClick?: boolean } = {}): boolean {
    if (row.drip_status !== "active") return true;
    if (row.review_left || row.review_confirmed_at) return true;
    if ((options.stopOnClick ?? true) && row.clicked_at) return true;
    // Finished the review page (Google hand-off or private feedback): never remind again.
    if (row.completed_at) return true;
    return false;
}

/**
 * Phase 1 drip: fixed 7-day / 7-day reminders, channel alternate, terminate helpers.
 * No visual builder, branching, or platform-sync review matching.
 */

export const DRIP_STEP_DELAY_HOURS = 7 * 24; // 168

export type DripChannel = "sms" | "email";
export type DripStatus = "idle" | "active" | "completed" | "terminated";
export type DripTerminatedReason =
    | "clicked"
    | "review_left"
    | "opted_out"
    | "manual_stop"
    | "exhausted";

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

/** Cutoff: rows with sent_at / step2_sent_at at or before this ISO are due. */
export function dueBeforeIso(delayHours = DRIP_STEP_DELAY_HOURS): string {
    const cutoff = new Date();
    cutoff.setTime(cutoff.getTime() - delayHours * 60 * 60 * 1000);
    return cutoff.toISOString();
}

export function shouldSkipDripSend(row: {
    drip_status: string | null;
    review_left: boolean | null;
    clicked_at: string | null;
    completed_at: string | null;
}): boolean {
    if (row.drip_status !== "active") return true;
    if (row.review_left) return true;
    if (row.clicked_at) return true;
    if (row.completed_at) return true;
    return false;
}

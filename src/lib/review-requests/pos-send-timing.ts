import type { SupabaseClient } from "@supabase/supabase-js";

/** Matches the `businesses.review_request_delay_minutes` column default. */
export const DEFAULT_REVIEW_REQUEST_DELAY_MINUTES = 120;
/** Upper bound (7 days) so a typo cannot park a POS send for months. */
export const MAX_REVIEW_REQUEST_DELAY_MINUTES = 7 * 24 * 60;

export type PosSendSettings = {
    delayMinutes: number;
    /** 0 = no minimum. */
    minAmountCents: number;
};

export type PosSendDecision =
    | { kind: "skip_min_amount"; minAmountCents: number }
    | { kind: "now" }
    | { kind: "later"; sendAt: Date; delayMinutes: number };

/** Integer minutes in [0, MAX]; missing values fall back to the column default. */
export function normalizeDelayMinutes(raw: unknown): number {
    if (raw === null || raw === undefined) return DEFAULT_REVIEW_REQUEST_DELAY_MINUTES;
    if (typeof raw !== "number" || !Number.isFinite(raw)) return DEFAULT_REVIEW_REQUEST_DELAY_MINUTES;
    return Math.min(Math.max(Math.round(raw), 0), MAX_REVIEW_REQUEST_DELAY_MINUTES);
}

/** Integer cents >= 0; anything unusable means "no minimum" so we never skip silently. */
export function normalizeMinAmountCents(raw: unknown): number {
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return 0;
    return Math.round(raw);
}

/** An unknown amount never counts as "below minimum". */
export function isBelowMinimumAmount(amountCents: number | null, minAmountCents: number): boolean {
    return minAmountCents > 0 && amountCents !== null && amountCents < minAmountCents;
}

export function formatCents(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Applies the business review-request timing rules to one POS/Zapier trigger.
 * `delayOverrideMinutes` (from the caller's payload) wins over the business setting.
 */
export function decidePosSend(args: {
    settings: PosSendSettings;
    amountCents: number | null;
    delayOverrideMinutes?: number | null;
    now?: Date;
}): PosSendDecision {
    const { settings } = args;
    if (isBelowMinimumAmount(args.amountCents, settings.minAmountCents)) {
        return { kind: "skip_min_amount", minAmountCents: settings.minAmountCents };
    }
    const delayMinutes =
        args.delayOverrideMinutes === null || args.delayOverrideMinutes === undefined
            ? settings.delayMinutes
            : normalizeDelayMinutes(args.delayOverrideMinutes);
    if (delayMinutes <= 0) return { kind: "now" };
    const now = args.now ?? new Date();
    return { kind: "later", sendAt: new Date(now.getTime() + delayMinutes * 60_000), delayMinutes };
}

export async function loadPosSendSettings(
    admin: SupabaseClient,
    businessId: string,
): Promise<PosSendSettings> {
    const { data, error } = await admin
        .from("businesses")
        .select("review_request_delay_minutes, review_request_min_amount_cents")
        .eq("id", businessId)
        .maybeSingle();
    if (error) throw error;
    return {
        delayMinutes: normalizeDelayMinutes(data?.review_request_delay_minutes),
        minAmountCents: normalizeMinAmountCents(data?.review_request_min_amount_cents),
    };
}

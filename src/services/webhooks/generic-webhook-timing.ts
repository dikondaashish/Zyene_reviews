import * as z from "zod";

/** Accepts 12.5, "12.50", "$1,250.00"; blank means "not provided". */
const numberish = z.preprocess((v) => {
    if (typeof v !== "string") return v;
    const cleaned = v.replace(/[$,\s]/g, "");
    return cleaned === "" ? undefined : Number(cleaned);
}, z.number().nonnegative().optional());

const timingSchema = z.object({
    amount_cents: numberish,
    amount: numberish,
    total: numberish,
    delay_minutes: numberish,
});

export type GenericWebhookTiming = {
    /** Sale amount in cents when the caller sent one; null = unknown (no minimum check). */
    amountCents: number | null;
    /** Per-call override of the business delay; null = use Settings. */
    delayOverrideMinutes: number | null;
};

/**
 * Optional timing fields on the generic webhook body.
 * `amount_cents` (integer cents) wins over `amount` / `total` (dollars).
 */
export function parseGenericWebhookTiming(
    body: Record<string, unknown>,
): { ok: true; timing: GenericWebhookTiming } | { ok: false; error: string } {
    const parsed = timingSchema.safeParse({
        amount_cents: body.amount_cents ?? body.amountCents,
        amount: body.amount,
        total: body.total,
        delay_minutes: body.delay_minutes ?? body.delayMinutes,
    });
    if (!parsed.success) {
        const field = parsed.error.issues[0]?.path[0] ?? "amount";
        return { ok: false, error: `'${String(field)}' must be a non-negative number.` };
    }
    const t = parsed.data;
    const dollars = t.amount ?? t.total;
    const amountCents =
        t.amount_cents !== undefined
            ? Math.round(t.amount_cents)
            : dollars !== undefined
              ? Math.round(dollars * 100)
              : null;
    return {
        ok: true,
        timing: { amountCents, delayOverrideMinutes: t.delay_minutes ?? null },
    };
}

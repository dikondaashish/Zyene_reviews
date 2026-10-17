import { describe, expect, it } from "vitest";
import {
    DEFAULT_REVIEW_REQUEST_DELAY_MINUTES,
    MAX_REVIEW_REQUEST_DELAY_MINUTES,
    decidePosSend,
    isBelowMinimumAmount,
    normalizeDelayMinutes,
    normalizeMinAmountCents,
} from "@/lib/review-requests/pos-send-timing";
import { extractSquarePaymentAmountCents } from "@/services/square/payment-amount";
import { parseGenericWebhookTiming } from "@/services/webhooks/generic-webhook-timing";

const now = new Date("2026-10-15T12:00:00.000Z");

describe("normalizeDelayMinutes", () => {
    it("keeps whole minutes and allows 0 (immediate)", () => {
        expect(normalizeDelayMinutes(0)).toBe(0);
        expect(normalizeDelayMinutes(60)).toBe(60);
        expect(normalizeDelayMinutes(90.4)).toBe(90);
    });

    it("falls back to the column default when missing or not a number", () => {
        expect(normalizeDelayMinutes(null)).toBe(DEFAULT_REVIEW_REQUEST_DELAY_MINUTES);
        expect(normalizeDelayMinutes(undefined)).toBe(DEFAULT_REVIEW_REQUEST_DELAY_MINUTES);
        expect(normalizeDelayMinutes(Number.NaN)).toBe(DEFAULT_REVIEW_REQUEST_DELAY_MINUTES);
    });

    it("clamps negatives to 0 and huge values to 7 days", () => {
        expect(normalizeDelayMinutes(-5)).toBe(0);
        expect(normalizeDelayMinutes(1_000_000)).toBe(MAX_REVIEW_REQUEST_DELAY_MINUTES);
    });
});

describe("minimum transaction amount", () => {
    it("treats missing or non-positive minimums as no minimum", () => {
        expect(normalizeMinAmountCents(null)).toBe(0);
        expect(normalizeMinAmountCents(-100)).toBe(0);
        expect(normalizeMinAmountCents(1500)).toBe(1500);
    });

    it("only skips when both amount and minimum are known", () => {
        expect(isBelowMinimumAmount(1499, 1500)).toBe(true);
        expect(isBelowMinimumAmount(1500, 1500)).toBe(false);
        expect(isBelowMinimumAmount(null, 1500)).toBe(false);
        expect(isBelowMinimumAmount(100, 0)).toBe(false);
    });
});

describe("decidePosSend", () => {
    it("sends now when the delay is 0", () => {
        expect(
            decidePosSend({ settings: { delayMinutes: 0, minAmountCents: 0 }, amountCents: 5000, now }),
        ).toEqual({ kind: "now" });
    });

    it("schedules after the configured delay", () => {
        expect(
            decidePosSend({ settings: { delayMinutes: 120, minAmountCents: 1500 }, amountCents: 5000, now }),
        ).toEqual({
            kind: "later",
            sendAt: new Date("2026-10-15T14:00:00.000Z"),
            delayMinutes: 120,
        });
    });

    it("skips payments under the minimum before any delay applies", () => {
        expect(
            decidePosSend({ settings: { delayMinutes: 60, minAmountCents: 1500 }, amountCents: 999, now }),
        ).toEqual({ kind: "skip_min_amount", minAmountCents: 1500 });
    });

    it("lets a per-call delay override win (0 = immediate)", () => {
        const settings = { delayMinutes: 120, minAmountCents: 0 };
        expect(decidePosSend({ settings, amountCents: null, delayOverrideMinutes: 0, now })).toEqual({
            kind: "now",
        });
        expect(
            decidePosSend({ settings, amountCents: null, delayOverrideMinutes: 30, now }),
        ).toMatchObject({ kind: "later", delayMinutes: 30 });
    });
});

describe("extractSquarePaymentAmountCents", () => {
    it("prefers total_money and falls back to amount_money", () => {
        expect(
            extractSquarePaymentAmountCents({
                amount_money: { amount: 1000, currency: "USD" },
                total_money: { amount: 1200, currency: "USD" },
            }),
        ).toBe(1200);
        expect(extractSquarePaymentAmountCents({ amount_money: { amount: 1000 } })).toBe(1000);
    });

    it("returns null when Square sent no amount", () => {
        expect(extractSquarePaymentAmountCents({})).toBeNull();
        expect(extractSquarePaymentAmountCents(null)).toBeNull();
    });
});

describe("parseGenericWebhookTiming", () => {
    it("reads dollars, cents and delay overrides", () => {
        expect(parseGenericWebhookTiming({ amount: "$1,250.50" })).toEqual({
            ok: true,
            timing: { amountCents: 125050, delayOverrideMinutes: null },
        });
        expect(parseGenericWebhookTiming({ amount_cents: 999, amount: 50, delay_minutes: "0" })).toEqual({
            ok: true,
            timing: { amountCents: 999, delayOverrideMinutes: 0 },
        });
    });

    it("treats missing fields as unknown", () => {
        expect(parseGenericWebhookTiming({ amount: "" })).toEqual({
            ok: true,
            timing: { amountCents: null, delayOverrideMinutes: null },
        });
    });

    it("rejects non-numeric or negative values", () => {
        expect(parseGenericWebhookTiming({ amount: "abc" })).toMatchObject({ ok: false });
        expect(parseGenericWebhookTiming({ delay_minutes: -1 })).toMatchObject({ ok: false });
    });
});

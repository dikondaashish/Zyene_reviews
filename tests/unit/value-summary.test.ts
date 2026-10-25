import { describe, expect, it } from "vitest";
import { calculateValueSummary, hasZyeneWins, monthlyPlanPrice, valueTier } from "@/lib/dashboard/value-summary";
import { currentMonthPeriod } from "@/services/dashboard/load-value-summary";
import { monthlyChargeFromInvoice } from "@/services/dashboard/load-monthly-charge";

const visit = (status: string, rating_given: number | null = null) => ({ status, channel: "link", rating_given });
const sentSms = (status: string) => ({ status, channel: "sms", customer_phone: "+15555550100", sent_at: "2026-10-02T00:00:00Z" });

const base = {
    newReviews: 16,
    newReviewsLastMonth: 14,
    zyeneReplies: 3,
    privateFeedback: 0,
    plan: "starter_monthly",
    planStatus: "active",
};

describe("calculateValueSummary", () => {
    it("counts customers sent to Google from both link visits and sent requests", () => {
        const s = calculateValueSummary({
            ...base,
            requests: [visit("completed", 5), visit("completed", 5), visit("clicked"), sentSms("completed"), sentSms("delivered")],
        });
        expect(s).toMatchObject({
            sentToGoogle: 3,
            requestsSent: 2,
            linkVisits: 3,
            newReviews: 16,
            newReviewsChange: 2,
            zyeneReplies: 3,
            monthlyPrice: 29.99,
            hasActivity: true,
        });
        expect(s.costPerGoogleCustomer).toBeCloseTo(29.99 / 3);
    });

    it("estimates time saved from replies and requests at the stated rates", () => {
        const s = calculateValueSummary({ ...base, zyeneReplies: 6, requests: [sentSms("sent"), sentSms("sent")] });
        // 6 replies × 5 min + 2 requests × 3 min = 36 min.
        expect(s.hoursSaved).toBeCloseTo(0.6);
        expect(s.timeValueUsd).toBeCloseTo(15);
    });

    it("counts unhappy customers caught privately without double counting feedback", () => {
        const s = calculateValueSummary({
            ...base,
            privateFeedback: 1,
            requests: [visit("feedback_left", 2), visit("rated_negative", 1), visit("completed", 5)],
        });
        expect(s.unhappyCaught).toBe(2);
    });

    it("shows no price or cost per customer for free, unknown or canceled plans", () => {
        expect(calculateValueSummary({ ...base, plan: "none", requests: [visit("completed")] }).monthlyPrice).toBeNull();
        expect(monthlyPlanPrice("starter_monthly", "canceled")).toBeNull();
        expect(calculateValueSummary({ ...base, requests: [] }).costPerGoogleCustomer).toBeNull();
    });

    it("spreads a yearly plan over twelve months", () => {
        expect(monthlyPlanPrice("starter_yearly", "active")).toBeCloseTo(299.99 / 12);
    });

    it("reports no activity for an empty month", () => {
        const s = calculateValueSummary({ ...base, newReviews: 0, zyeneReplies: 0, requests: [] });
        expect(s.hasActivity).toBe(false);
    });
});

describe("currentMonthPeriod", () => {
    it("starts on the first of this month and of last month, across a year boundary", () => {
        const { start, previousStart } = currentMonthPeriod(new Date("2026-01-15T10:00:00Z"));
        expect(start.toISOString()).toBe("2026-01-01T00:00:00.000Z");
        expect(previousStart.toISOString()).toBe("2025-12-01T00:00:00.000Z");
    });
});

describe("actual Stripe charge", () => {
    it("uses what Stripe charges over the catalog price, and shows no cost per customer while free", () => {
        const paying = calculateValueSummary({ ...base, monthlyCharge: 39.99, requests: [visit("completed")] });
        expect(paying.monthlyPrice).toBe(39.99);
        expect(paying.costPerGoogleCustomer).toBe(39.99);
        const trial = calculateValueSummary({ ...base, monthlyCharge: 0, requests: [visit("completed")] });
        expect(trial.monthlyPrice).toBe(0);
        expect(trial.costPerGoogleCustomer).toBeNull();
    });

    it("turns an invoice total into a monthly amount", () => {
        expect(monthlyChargeFromInvoice(4999, "month")).toBe(49.99);
        expect(monthlyChargeFromInvoice(48000, "year")).toBe(40);
    });
});

describe("valueTier", () => {
    it("cheers a strong month, encourages a growing one, and nudges an empty one", () => {
        const many = Array.from({ length: 12 }, () => visit("completed", 5));
        expect(valueTier(calculateValueSummary({ ...base, requests: many }))).toBe("strong");
        expect(valueTier(calculateValueSummary({ ...base, newReviews: 2, newReviewsLastMonth: 4, requests: [visit("completed")] }))).toBe("growing");
        expect(valueTier(calculateValueSummary({ ...base, newReviews: 0, newReviewsLastMonth: 0, zyeneReplies: 0, requests: [] }))).toBe("quiet");
    });
});

describe("hasZyeneWins", () => {
    it("hides the card when Zyene did nothing this month, even with outside reviews or unanswered sends", () => {
        const idle = calculateValueSummary({ ...base, newReviews: 5, zyeneReplies: 0, requests: [sentSms("sent")] });
        expect(hasZyeneWins(idle)).toBe(false);
    });

    it("shows the card once any win lands", () => {
        expect(hasZyeneWins(calculateValueSummary({ ...base, zyeneReplies: 0, requests: [visit("clicked")] }))).toBe(true);
        expect(hasZyeneWins(calculateValueSummary({ ...base, zyeneReplies: 1, requests: [] }))).toBe(true);
    });
});

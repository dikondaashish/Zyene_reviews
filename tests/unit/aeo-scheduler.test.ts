import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
    assignSlot,
    DEFAULT_SLOT_HOURS,
    nextRunAt,
    slotLoadByDay,
} from "../../src/services/aeo/scheduler/sampling-slot";
import {
    hasDeferredWork,
    planDailyBudget,
    planEngineBudget,
    totalCostMicroUsd,
} from "../../src/services/aeo/scheduler/daily-budget";

const ids = (n: number) => Array.from({ length: n }, () => randomUUID());

describe("assignSlot — determinism (QA #50)", () => {
    it("returns the identical slot across repeated calls", () => {
        const id = randomUUID();
        const first = assignSlot(id);
        for (let i = 0; i < 10; i += 1) expect(assignSlot(id)).toEqual(first);
    });

    it("is stable for a fixed id, so slots survive restarts and deploys", () => {
        // Pinned literal: if the hash ever changes, every business is resampled at
        // a new interval and every trend line gains an artificial discontinuity.
        expect(assignSlot("11111111-2222-3333-4444-555555555555")).toEqual({
            dayOfWeek: 4,
            hour: 4,
        });
    });

    it("always lands inside the configured dispatch window", () => {
        for (const id of ids(200)) {
            const slot = assignSlot(id);
            expect(DEFAULT_SLOT_HOURS).toContain(slot.hour);
            expect(slot.dayOfWeek).toBeGreaterThanOrEqual(0);
            expect(slot.dayOfWeek).toBeLessThanOrEqual(6);
        }
    });

    it("honours a custom hour window", () => {
        for (const id of ids(50)) {
            expect([22, 23]).toContain(assignSlot(id, { hours: [22, 23] }).hour);
        }
    });
});

describe("slot spreading (QA #49)", () => {
    // Deterministic ids: a spreading assertion driven by randomUUID is a coin
    // toss, not a test. Slot assignment is deterministic, so the fixture must be.
    function seededIds(n: number, seed = 0x9e3779b9): string[] {
        let s = seed >>> 0;
        const hex = () => {
            s = (Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) >>> 0;
            return (s >>> 0).toString(16).padStart(8, "0");
        };
        return Array.from({ length: n }, () => `${hex()}-${hex()}-${hex()}-${hex()}`);
    }

    /**
     * Bound is 3σ, not an arbitrary "within 15%". For 700 ids across 7 days the
     * per-day standard deviation is ~9.26, so a 15% bound sits at 1.62σ and fails
     * roughly one run in three no matter how good the hash is. Requiring tighter
     * uniformity than hashing can deliver would mean either a flaky suite or an
     * assignment scheme where adding one business reshuffles everyone else.
     */
    it("keeps every weekday within 3 sigma of an even share for 700 businesses", () => {
        const counts = slotLoadByDay(seededIds(700));
        const mean = 700 / 7;
        const sigma = Math.sqrt(700 * (1 / 7) * (6 / 7));
        for (const c of counts) expect(c).toBeLessThanOrEqual(Math.ceil(mean + 3 * sigma));
        expect(counts.reduce((a, b) => a + b, 0)).toBe(700);
    });

    /**
     * The assertion that actually protects money. Uniformity is a means; the end
     * is never crossing a vendor's free daily allowance by accident.
     */
    it("keeps the busiest day's demand inside Gemini's free daily allowance", () => {
        const PROMPTS_PER_BUSINESS = 15; // Professional tier
        const busiestDay = Math.max(...slotLoadByDay(seededIds(700)));
        const worstDayPrompts = busiestDay * PROMPTS_PER_BUSINESS;
        const plan = planEngineBudget({ engineId: "gemini", requestedSamples: worstDayPrompts });
        expect(plan.reason).toBe("within_free_allowance");
        expect(plan.billableUnits).toBe(0);
    });

    it("would breach the allowance if every business fired on one day", () => {
        // The failure mode E-10 exists to prevent, asserted rather than assumed.
        const plan = planEngineBudget({ engineId: "gemini", requestedSamples: 700 * 15 });
        expect(plan.reason).toBe("deferred_to_protect_allowance");
    });

    it("does not correlate day with hour, so a day is not itself a burst", () => {
        // Day and hour are salted separately; if they shared one hash, the
        // businesses on a given day would collapse onto very few hours.
        const sameDay = ids(400).filter((id) => assignSlot(id).dayOfWeek === 3);
        const hours = new Set(sameDay.map((id) => assignSlot(id).hour));
        expect(hours.size).toBeGreaterThan(DEFAULT_SLOT_HOURS.length / 2);
    });
});

describe("nextRunAt — enrolment without a thundering herd (QA #53)", () => {
    it("always returns a future time", () => {
        const now = new Date("2026-08-05T22:41:00Z");
        for (const id of ids(100)) {
            expect(nextRunAt(assignSlot(id), now).getTime()).toBeGreaterThan(now.getTime());
        }
    });

    it("lands on the slot's own weekday and hour", () => {
        const now = new Date("2026-08-05T22:41:00Z");
        for (const id of ids(50)) {
            const slot = assignSlot(id);
            const at = nextRunAt(slot, now);
            expect(at.getUTCDay()).toBe(slot.dayOfWeek);
            expect(at.getUTCHours()).toBe(slot.hour);
        }
    });

    it("never dispatches immediately for a burst of signups", () => {
        const now = new Date("2026-08-05T03:00:00Z");
        const withinTheMinute = ids(50).filter(
            (id) => nextRunAt(assignSlot(id), now).getTime() - now.getTime() < 60_000
        );
        expect(withinTheMinute).toHaveLength(0);
    });

    it("rolls to next week when the slot has already passed today", () => {
        const slot = { dayOfWeek: 3, hour: 2 };
        const justAfter = new Date("2026-08-05T02:00:01Z"); // a Wednesday
        expect(justAfter.getUTCDay()).toBe(slot.dayOfWeek);
        expect(nextRunAt(slot, justAfter).toISOString()).toBe("2026-08-12T02:00:00.000Z");
    });
});

describe("daily budget guard", () => {
    it("charges nothing inside Gemini's free grounding bucket", () => {
        const o = planEngineBudget({ engineId: "gemini", requestedSamples: 10_000 });
        expect(o.reason).toBe("within_free_allowance");
        expect(o.billableUnits).toBe(0);
        expect(o.costMicroUsd).toBe(0);
        expect(o.deferred).toBe(0);
    });

    // QA #51: the excess waits; zero billable requests are fired.
    it("defers past a free allowance and bills nothing when unauthorised", () => {
        const o = planEngineBudget({ engineId: "gemini", requestedSamples: 11_000 });
        expect(o.reason).toBe("deferred_to_protect_allowance");
        expect(o.allowed).toBe(10_000);
        expect(o.deferred).toBe(1_000);
        expect(o.billableUnits).toBe(0);
        expect(o.costMicroUsd).toBe(0);
    });

    it("spends past the allowance only when explicitly authorised", () => {
        const o = planEngineBudget(
            { engineId: "gemini", requestedSamples: 11_000 },
            { overageAuthorised: true }
        );
        expect(o.reason).toBe("overage_authorised");
        expect(o.allowed).toBe(11_000);
        expect(o.deferred).toBe(0);
        expect(o.billableUnits).toBe(1_000);
        // 1,000 x $0.035 = $35.00
        expect(o.costMicroUsd).toBe(35_000_000);
    });

    it("lets no-free-tier engines through, since blocking them is E-5's call", () => {
        const o = planEngineBudget({ engineId: "chatgpt", requestedSamples: 40 });
        expect(o.reason).toBe("no_free_allowance");
        expect(o.allowed).toBe(40);
        expect(o.billableUnits).toBe(40);
        expect(o.costMicroUsd).toBe(40 * 25_000);
    });

    it("withholds an engine whose pricing is unconfirmed", () => {
        const o = planEngineBudget({ engineId: "claude", requestedSamples: 100 });
        expect(o.reason).toBe("engine_not_meterable");
        expect(o.allowed).toBe(0);
        expect(o.billableUnits).toBe(0);
    });

    it("clamps negative and fractional demand", () => {
        expect(planEngineBudget({ engineId: "gemini", requestedSamples: -5 }).requested).toBe(0);
        expect(planEngineBudget({ engineId: "gemini", requestedSamples: 3.7 }).requested).toBe(3);
    });
});

describe("planDailyBudget aggregate", () => {
    const demands = [
        { engineId: "gemini" as const, requestedSamples: 12_000 },
        { engineId: "chatgpt" as const, requestedSamples: 100 },
        { engineId: "claude" as const, requestedSamples: 50 },
    ];

    it("applies the guard per engine without cross-contamination", () => {
        const plan = planDailyBudget(demands);
        expect(plan.map((o) => o.reason)).toEqual([
            "deferred_to_protect_allowance",
            "no_free_allowance",
            "engine_not_meterable",
        ]);
    });

    it("totals only what is actually billable", () => {
        // Gemini deferred (0) + ChatGPT 100 x 25,000 + Claude withheld (0).
        expect(totalCostMicroUsd(planDailyBudget(demands))).toBe(100 * 25_000);
    });

    it("reports deferred work so the scheduler re-offers it next slot", () => {
        expect(hasDeferredWork(planDailyBudget(demands))).toBe(true);
        expect(
            hasDeferredWork(planDailyBudget([{ engineId: "gemini", requestedSamples: 10 }]))
        ).toBe(false);
    });
});

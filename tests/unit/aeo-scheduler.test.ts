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

/**
 * Deterministic id fixtures. Slot assignment is deterministic, so any assertion
 * about its distribution or cadence must be too — a randomUUID-driven spreading
 * check is a coin toss, not a test.
 */
function seededIds(n: number, seed = 0x9e3779b9): string[] {
    let s = seed >>> 0;
    const hex = () => {
        s = (Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) >>> 0;
        return (s >>> 0).toString(16).padStart(8, "0");
    };
    return Array.from({ length: n }, () => `${hex()}-${hex()}-${hex()}-${hex()}`);
}

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
    /**
     * The part of QA #49 that protects money: the BUSIEST day, not the average
     * day, has to fit inside the free allowance.
     *
     * The distinction became load-bearing when Gemini was repinned from 2.5 Pro
     * (10,000/day) to 2.5 Flash (1,500/day) — 2.5 Pro turned out to be
     * uncallable on a new project. Under the old bucket there was ~5x headroom
     * and the average-vs-busiest gap did not matter. Under 1,500/day it decides
     * the answer: dividing evenly by 7 suggests 700 businesses fit, but hash
     * assignment puts ~17% more than average on the heaviest day, so 700
     * actually breaches. Measured safe figure is 545.
     */
    const PROMPTS_PER_BUSINESS = 15; // Professional tier
    const MEASURED_CEILING = 545;

    it("keeps the busiest day inside the allowance at the measured ceiling", () => {
        // Several independent id sets, so this is a property of the assignment
        // and not of one lucky set of business ids.
        for (const seed of [0x9e37, 0x1234, 0xabcd, 0x5555, 0xf00d]) {
            const busiestDay = Math.max(...slotLoadByDay(seededIds(MEASURED_CEILING, seed)));
            const plan = planEngineBudget({
                engineId: "gemini",
                requestedSamples: busiestDay * PROMPTS_PER_BUSINESS,
            });
            expect(plan.reason).toBe("within_free_allowance");
            expect(plan.billableUnits).toBe(0);
        }
    });

    it("shows the naive average-based ceiling is too optimistic to use", () => {
        // 1,500 x 7 / 15 = 700 by arithmetic. Smoothing is real but imperfect,
        // so billing at 700 would start quietly. Asserted rather than left as a
        // comment, because this is the number someone will reach for later.
        const naive = Math.floor((1_500 * 7) / PROMPTS_PER_BUSINESS);
        expect(naive).toBe(700);

        const busiestDay = Math.max(...slotLoadByDay(seededIds(naive)));
        const plan = planEngineBudget({
            engineId: "gemini",
            requestedSamples: busiestDay * PROMPTS_PER_BUSINESS,
        });
        expect(plan.reason).toBe("deferred_to_protect_allowance");
        expect(MEASURED_CEILING).toBeLessThan(naive);
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

    /**
     * The literal requirement: same business, same weekly slot, EVERY week.
     * Determinism of assignSlot alone does not give this — nextRunAt could drift
     * by an hour across a DST boundary and still return the "right" slot. Walks a
     * full year from before US spring-forward to past fall-back.
     */
    it("recurs exactly one week apart for a year, across DST boundaries", () => {
        const WEEK_MS = 7 * 24 * 3600 * 1000;
        for (const id of seededIds(5, 0x51071)) {
            const slot = assignSlot(id);
            let t = nextRunAt(slot, new Date("2026-03-01T00:00:00Z"));
            for (let week = 0; week < 52; week += 1) {
                const next = nextRunAt(slot, t);
                expect(next.getTime() - t.getTime()).toBe(WEEK_MS);
                expect(next.getUTCDay()).toBe(slot.dayOfWeek);
                expect(next.getUTCHours()).toBe(slot.hour);
                t = next;
            }
        }
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
        const o = planEngineBudget({ engineId: "gemini", requestedSamples: 1_500 });
        expect(o.reason).toBe("within_free_allowance");
        expect(o.billableUnits).toBe(0);
        expect(o.costMicroUsd).toBe(0);
        expect(o.deferred).toBe(0);
    });

    // QA #51: the excess waits; zero billable requests are fired.
    it("defers past a free allowance and bills nothing when unauthorised", () => {
        const o = planEngineBudget({ engineId: "gemini", requestedSamples: 2_500 });
        expect(o.reason).toBe("deferred_to_protect_allowance");
        expect(o.allowed).toBe(1_500);
        expect(o.deferred).toBe(1_000);
        expect(o.billableUnits).toBe(0);
        expect(o.costMicroUsd).toBe(0);
    });

    it("spends past the allowance only when explicitly authorised", () => {
        const o = planEngineBudget(
            { engineId: "gemini", requestedSamples: 2_500 },
            { overageAuthorised: true }
        );
        expect(o.reason).toBe("overage_authorised");
        expect(o.allowed).toBe(2_500);
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

    it("meters Claude through the priced DataForSEO endpoint", () => {
        const o = planEngineBudget({ engineId: "claude", requestedSamples: 100 });
        expect(o.reason).toBe("no_free_allowance");
        expect(o.allowed).toBe(100);
        expect(o.billableUnits).toBe(100);
    });

    it("clamps negative and fractional demand", () => {
        expect(planEngineBudget({ engineId: "gemini", requestedSamples: -5 }).requested).toBe(0);
        expect(planEngineBudget({ engineId: "gemini", requestedSamples: 3.7 }).requested).toBe(3);
    });
});

/**
 * Cross-checks the guard against the written Vertex quote using constants
 * declared here, independently of engine-catalog.ts. If the catalog is ever
 * edited to a wrong rate, these fail — a test that read the catalog would not.
 */
describe("budget guard vs. the quote (real numbers)", () => {
    const FREE_PER_DAY = 1_500;
    const USD_PER_1000 = 35;
    const PROMPTS = 15; // Professional tier
    const perDay = (businesses: number) => Math.floor((businesses * PROMPTS) / 7);

    function usd(requested: number, authorised: boolean): number {
        const o = planEngineBudget(
            { engineId: "gemini", requestedSamples: requested },
            { overageAuthorised: authorised }
        );
        return o.costMicroUsd / 1_000_000;
    }

    it.each([
        [100, false, 0],
        [400, false, 0],
        [700, false, 0],
        [750, false, 0], // excess deferred, nothing billed
    ])("smoothed %i businesses, authorised=%s costs $%d", (businesses, auth, expected) => {
        expect(usd(perDay(businesses), auth)).toBeCloseTo(expected, 9);
    });

    it("bills the authorised excess at exactly $35 per 1,000", () => {
        for (const requested of [1_501, 2_000, 5_000, 10_500]) {
            const hand = ((requested - FREE_PER_DAY) / 1000) * USD_PER_1000;
            expect(usd(requested, true)).toBeCloseTo(hand, 9);
        }
    });

    /**
     * The ceiling under PERFECT smoothing — demand divided evenly by 7. Real
     * slot assignment is hash-based and lumpier, so the operational ceiling is
     * lower; that one is measured separately in the QA #49 test above. Both
     * numbers are true and they are not interchangeable.
     */
    it("puts the perfectly-smoothed ceiling at 700 businesses", () => {
        expect(perDay(700)).toBe(FREE_PER_DAY);
        expect(planEngineBudget({ engineId: "gemini", requestedSamples: perDay(700) }).reason).toBe(
            "within_free_allowance"
        );
        expect(planEngineBudget({ engineId: "gemini", requestedSamples: perDay(701) }).reason).toBe(
            "deferred_to_protect_allowance"
        );
    });

    it("prices the cost of bursting 700 businesses onto one day", () => {
        // Smoothed this is free; bunched it is $315/day, ~$9,450/month, for
        // identical work. This is the number E-10 exists to avoid paying — and
        // it is 18x worse than under the 2.5 Pro allowance this used to assume,
        // because a smaller free bucket makes bad scheduling cost more, not less.
        expect(usd(perDay(700), false)).toBe(0);
        expect(usd(700 * PROMPTS, true)).toBeCloseTo(315, 9);
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
            "no_free_allowance",
        ]);
    });

    it("totals only what is actually billable", () => {
        // Gemini deferred (0) + ChatGPT 100 x 25,000 + Claude 50 x 25,000.
        expect(totalCostMicroUsd(planDailyBudget(demands))).toBe(150 * 25_000);
    });

    it("reports deferred work so the scheduler re-offers it next slot", () => {
        expect(hasDeferredWork(planDailyBudget(demands))).toBe(true);
        expect(
            hasDeferredWork(planDailyBudget([{ engineId: "gemini", requestedSamples: 10 }]))
        ).toBe(false);
    });
});

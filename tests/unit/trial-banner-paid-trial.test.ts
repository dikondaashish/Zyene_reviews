import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TrialBanner, type TrialBannerProps } from "@/components/dashboard/trial-banner";
import {
    TRIAL_ENDED_GRACE_MS,
    TRIAL_ENDING_SOON_MS,
    getTrialBannerState,
} from "@/lib/billing/trial-banner-state";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-11-08T12:00:00.000Z");
const at = (offsetMs: number) => new Date(NOW.getTime() + offsetMs).toISOString();
const render = (props: Omit<TrialBannerProps, "canManageBilling"> & { canManageBilling?: boolean }) =>
    renderToStaticMarkup(createElement(TrialBanner, { canManageBilling: true, ...props }));

describe("getTrialBannerState", () => {
    it("shows for a paid-plan trial (what billing sync actually writes)", () => {
        expect(getTrialBannerState({ planStatus: "trialing", trialEndsAt: at(10 * DAY) }, NOW)?.phase).toBe("active");
    });

    it("flags the last days as ending soon", () => {
        expect(getTrialBannerState({ planStatus: "trialing", trialEndsAt: at(TRIAL_ENDING_SOON_MS - 1) }, NOW)?.phase)
            .toBe("ending_soon");
    });

    it("keeps a recently ended trial visible while Stripe catches up, then hides it", () => {
        expect(getTrialBannerState({ planStatus: "trialing", trialEndsAt: at(-DAY) }, NOW)?.phase).toBe("ended");
        expect(getTrialBannerState({ planStatus: "trialing", trialEndsAt: at(-TRIAL_ENDED_GRACE_MS - 1) }, NOW))
            .toBeNull();
    });

    it("never shows for non-trialing orgs, even with a stale trial_ends_at", () => {
        for (const planStatus of ["active", "past_due", "canceled", "none", null, undefined]) {
            expect(getTrialBannerState({ planStatus, trialEndsAt: at(5 * DAY) }, NOW)).toBeNull();
        }
    });

    it("hides when trial_ends_at is missing or unparseable", () => {
        expect(getTrialBannerState({ planStatus: "trialing", trialEndsAt: null }, NOW)).toBeNull();
        expect(getTrialBannerState({ planStatus: "trialing", trialEndsAt: "not-a-date" }, NOW)).toBeNull();
        expect(getTrialBannerState(null, NOW)).toBeNull();
    });
});

describe("TrialBanner", () => {
    // The component reads the real clock; pin it so these cases don't change with the date CI runs on.
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });
    afterEach(() => vi.useRealTimers());

    it("renders the countdown for a trialing paid plan with a billing link", () => {
        const html = render({ planStatus: "trialing", trialEndsAt: at(5 * DAY), planName: "Starter" });
        expect(html).toContain("Your Starter trial ends in");
        expect(html).toContain('href="/settings/billing"');
        expect(html).not.toContain("Upgrade");
    });

    it("renders ended copy for a recently ended trial", () => {
        const html = render({ planStatus: "trialing", trialEndsAt: at(-DAY) });
        expect(html).toContain("Your trial has ended");
    });

    it("renders nothing for active or free orgs", () => {
        expect(render({ planStatus: "active", trialEndsAt: null, planName: "Professional" })).toBe("");
        expect(render({ planStatus: "none", trialEndsAt: null })).toBe("");
    });

    it("does not send non-owners to the owner-only billing page", () => {
        const html = render({
            planStatus: "trialing",
            trialEndsAt: at(2 * DAY),
            planName: "Starter",
            canManageBilling: false,
        });
        expect(html).toContain("Your Starter trial ends in");
        expect(html).toContain("Your organization owner manages billing.");
        expect(html).not.toContain("/settings/billing");
        expect(html).not.toContain("Manage billing");
        expect(html).not.toContain("payment details");
    });

    it("gives non-owners informational copy once the trial has ended", () => {
        const html = render({
            planStatus: "trialing",
            trialEndsAt: at(-DAY),
            canManageBilling: false,
        });
        expect(html).toContain("Your trial has ended. Your organization owner manages billing.");
        expect(html).not.toContain("/settings/billing");
        expect(html).not.toContain("Check your billing details");
    });

    it("keeps the billing link and action copy for owners", () => {
        const html = render({ planStatus: "trialing", trialEndsAt: at(2 * DAY), canManageBilling: true });
        expect(html).toContain('href="/settings/billing"');
        expect(html).toContain("Review your plan and payment details in billing.");
    });
});

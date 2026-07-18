import { describe, expect, it } from "vitest";
import {
    pickDripChannel,
    primaryChannelFromMethods,
    shouldSkipDripSend,
} from "@/lib/campaigns/drip-phase1";

describe("drip-phase1", () => {
    it("primaryChannelFromMethods prefers email when both present", () => {
        expect(primaryChannelFromMethods(["sms", "email"])).toBe("email");
        expect(primaryChannelFromMethods(["sms"])).toBe("sms");
        expect(primaryChannelFromMethods([])).toBeNull();
    });

    it("pickDripChannel alternates when contact exists", () => {
        expect(
            pickDripChannel({
                alternate: true,
                lastChannel: "email",
                hasEmail: true,
                hasPhone: true,
            }),
        ).toBe("sms");
        expect(
            pickDripChannel({
                alternate: true,
                lastChannel: "sms",
                hasEmail: true,
                hasPhone: true,
            }),
        ).toBe("email");
    });

    it("pickDripChannel falls back when preferred contact missing", () => {
        expect(
            pickDripChannel({
                alternate: true,
                lastChannel: "email",
                hasEmail: true,
                hasPhone: false,
            }),
        ).toBe("email");
    });

    it("shouldSkipDripSend on click, review_left, or inactive", () => {
        expect(
            shouldSkipDripSend({
                drip_status: "active",
                review_left: false,
                clicked_at: null,
                completed_at: null,
            }),
        ).toBe(false);
        expect(
            shouldSkipDripSend({
                drip_status: "active",
                review_left: false,
                clicked_at: "2026-01-01",
                completed_at: null,
            }),
        ).toBe(true);
        expect(
            shouldSkipDripSend({
                drip_status: "terminated",
                review_left: false,
                clicked_at: null,
                completed_at: null,
            }),
        ).toBe(true);
    });
});

import { describe, expect, it } from "vitest";
import {
    hasSentReviewRequest,
    shouldShowGettingStartedBanner,
} from "../../src/components/dashboard/getting-started-visibility";

describe("shouldShowGettingStartedBanner", () => {
    it("hides when Google is connected and a request has been sent", () => {
        expect(
            shouldShowGettingStartedBanner({
                isGoogleConnected: true,
                hasSentReviewRequest: true,
            }),
        ).toBe(false);
    });

    it("shows when Google is connected but no request exists yet", () => {
        expect(
            shouldShowGettingStartedBanner({
                isGoogleConnected: true,
                hasSentReviewRequest: false,
            }),
        ).toBe(true);
    });

    it("shows when a request exists but Google is not connected", () => {
        expect(
            shouldShowGettingStartedBanner({
                isGoogleConnected: false,
                hasSentReviewRequest: true,
            }),
        ).toBe(true);
    });
});

describe("hasSentReviewRequest", () => {
    it("treats lifetime sent requests as done, not only this month", () => {
        expect(
            hasSentReviewRequest({
                hasEngagementData: true,
                requestsThisMonth: 0,
            }),
        ).toBe(true);
    });

    it("treats this month's sends as done", () => {
        expect(
            hasSentReviewRequest({
                hasEngagementData: false,
                requestsThisMonth: 3,
            }),
        ).toBe(true);
    });

    it("is false when nothing has been sent", () => {
        expect(
            hasSentReviewRequest({
                hasEngagementData: false,
                requestsThisMonth: 0,
            }),
        ).toBe(false);
    });
});

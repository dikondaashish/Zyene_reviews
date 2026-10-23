import { describe, expect, it } from "vitest";
import { filterDescriptionKeywords, distinctiveNameWords } from "../../src/lib/aeo/description-keywords";
import { buildCampaignFlow, campaignSendBlockers, formatWait } from "../../src/lib/campaigns/campaign-flow";
import { buildRecentAutomations } from "../../src/lib/dashboard/recent-automations";

describe("filterDescriptionKeywords", () => {
    const context = { businessName: "Wolfpack BBQ & Burgers", competitorNames: ["Joe's KC BBQ", "Arthur Bryant's Barbeque", "Gates Bar-B-Q"] };

    it("drops searches for the business itself, its address and tracked competitors", () => {
        const keywords = [
            "restaurants", "bbq near me", "best bbq in kansas city",
            "wolfpack bbq & burgers, east 5th street, kansas city, mo", "wolfpack bbq",
            "joes kc bbq", "arthur bryants", "gates bbq", "kansas city bbq",
        ];
        expect(filterDescriptionKeywords(keywords, context)).toEqual(["restaurants", "bbq near me", "best bbq in kansas city", "kansas city bbq"]);
    });

    it("ignores generic words when deciding what identifies a name", () => {
        expect(distinctiveNameWords("Joe's KC BBQ")).toEqual(["joes"]);
        expect(distinctiveNameWords("The Burger House")).toEqual([]);
    });
});

describe("buildCampaignFlow", () => {
    const base = { status: "active", channel: "email", delay_minutes: 30, follow_up_enabled: false, follow_up_delay_hours: null };

    it("shows one message when reminders are off", () => {
        expect(buildCampaignFlow(base).map((s) => s.label)).toEqual(["Customer added to the campaign", "Wait 30 min", "Send the review request"]);
    });

    it("shows two reminders spaced by the follow-up delay, defaulting to 7 days", () => {
        const labels = buildCampaignFlow({ ...base, follow_up_enabled: true }).map((s) => s.label);
        expect(labels).toEqual([
            "Customer added to the campaign", "Wait 30 min", "Send the review request",
            "Wait 7 days", "Send reminder 1", "Wait 7 days", "Send reminder 2",
        ]);
    });

    it("formats waits in plain units", () => {
        expect(formatWait(0)).toBe("Right away");
        expect(formatWait(90)).toBe("Wait 1.5 hours");
        expect(formatWait(48 * 60)).toBe("Wait 2 days");
    });
});

describe("campaignSendBlockers", () => {
    const c = { status: "active", channel: "both", delay_minutes: 0, follow_up_enabled: false, follow_up_delay_hours: null };

    it("is empty when everything can send", () => {
        expect(campaignSendBlockers(c, { smsEnabled: true, emailEnabled: true, hasReviewLink: true })).toEqual([]);
    });

    it("flags a missing review link and both channels off", () => {
        const titles = campaignSendBlockers(c, { smsEnabled: false, emailEnabled: false, hasReviewLink: false }).map((b) => b.title);
        expect(titles).toHaveLength(2);
        expect(titles[1]).toBe("Text and email sending are both off");
    });

    it("says only the other channel goes out when one is off", () => {
        expect(campaignSendBlockers(c, { smsEnabled: false, emailEnabled: true, hasReviewLink: true })[0].title)
            .toBe("Text sending is off, so only emails go out");
    });
});

describe("buildRecentAutomations", () => {
    it("merges replies and sent messages newest first and skips failures", () => {
        const items = buildRecentAutomations({
            autoReplies: [{ id: "r1", author_name: "Tyler Alderman", rating: 5, responded_at: "2026-10-20T10:00:00Z" }],
            approvedReplies: [{ id: "d1", posted_at: "2026-10-22T10:00:00Z", reviews: { author_name: "Bob Butts", rating: 2 } }],
            messages: [
                { id: "m1", step: 1, channel: "email", status: "delivered", created_at: "2026-10-21T10:00:00Z", customer_name: "Nikitha" },
                { id: "m2", step: 2, channel: "sms", status: "failed", created_at: "2026-10-23T10:00:00Z", customer_name: "Ashish" },
            ],
        });
        expect(items.map((i) => i.title)).toEqual([
            "Replied to Bob's 2★ review", "Asked Nikitha for a review", "Replied to Tyler's 5★ review",
        ]);
        expect(items[1].detail).toBe("By email · delivered");
    });
});

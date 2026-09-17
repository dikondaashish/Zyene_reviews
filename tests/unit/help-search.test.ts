import { describe, expect, it } from "vitest";

import { getHelpSearchResults, type HelpSearchItem } from "@/lib/marketing/help-search";

const items: HelpSearchItem[] = [
    { title: "Connecting Your Google Business Profile", excerpt: "Connect Google reviews.", category: "Getting Started", path: "/help/getting-started/connecting-google-business-profile" },
    { title: "Automatic Google Replies", excerpt: "Choose tone and star threshold.", category: "Reviews", path: "/help/reviews/automatic-google-replies" },
    { title: "SMS Review Requests", excerpt: "Send fair review invitations.", category: "Campaigns", path: "/help/campaigns/sms-review-requests" },
];

describe("getHelpSearchResults", () => {
    it("normalizes case and surrounding spaces", () => {
        expect(getHelpSearchResults(items, "  GOOGLE  ").map(item => item.title)).toEqual([
            "Connecting Your Google Business Profile",
            "Automatic Google Replies",
        ]);
    });

    it("matches category and excerpt content", () => {
        expect(getHelpSearchResults(items, "campaigns")[0]?.title).toBe("SMS Review Requests");
        expect(getHelpSearchResults(items, "threshold")[0]?.title).toBe("Automatic Google Replies");
    });

    it("matches natural multi-word searches even when another word appears between them", () => {
        expect(getHelpSearchResults(items, "automatic replies")[0]?.title).toBe("Automatic Google Replies");
    });

    it("returns no search results for an empty query and respects the limit", () => {
        expect(getHelpSearchResults(items, " ")).toEqual([]);
        expect(getHelpSearchResults(items, "review", 1)).toHaveLength(1);
    });
});

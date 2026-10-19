import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPageChatContext } from "@/lib/support-chat/page-context";
import { buildIndex, searchIndex, searchSiteContent, tokenize } from "@/lib/support-chat/retrieval/search-index";
import { summarizeReputation, type ReputationCheckResult } from "@/lib/support-chat/tools/reputation-check";
import { verifySlackSignature } from "@/services/support-chat/slack/slack-client";
import { escapeSlack } from "@/services/support-chat/slack/slack-relay";

describe("site retrieval", () => {
    it("tokenizes, drops stopwords and folds plurals", () => {
        expect(tokenize("How do I get more Google reviews?")).toEqual(["get", "more", "google", "review"]);
    });

    it("ranks title matches first and returns one passage per page", () => {
        const index = buildIndex([
            { id: "a#0", url: "/a", title: "Square integration", kind: "integration", text: "Connect your POS." },
            { id: "a#1", url: "/a", title: "Square integration", kind: "integration", text: "Square payments trigger requests." },
            { id: "b#0", url: "/b", title: "Pricing", kind: "feature", text: "Plans mention square footage once." },
        ]);
        expect(searchIndex(index, "connect square").map((d) => d.url)).toEqual(["/a", "/b"]);
    });

    it("finds real site content for common visitor questions", () => {
        expect(searchSiteContent("switching from Podium", 3).map((d) => d.url)).toContain("/compare/podium");
        expect(searchSiteContent("track ChatGPT mentions", 3).map((d) => d.url)).toContain("/features/ai-visibility");
    });
});

describe("summarizeReputation", () => {
    const base: ReputationCheckResult = {
        business: { name: "Juniper Coffee", rating: 4.6, reviews: 87, reviewLink: "#" },
        category: "Coffee shop",
        competitors: [{ name: "Bean There", rating: 4.5, reviews: 214 }],
    };

    it("states the gap to the most-reviewed competitor", () => {
        expect(summarizeReputation(base)).toContain("127 more than you");
    });

    it("congratulates a business that is ahead", () => {
        expect(summarizeReputation({ ...base, business: { ...base.business, reviews: 500 } })).toContain("You're ahead");
    });

    it("works with no competitors nearby", () => {
        expect(summarizeReputation({ ...base, competitors: [] })).toContain("87 Google reviews");
    });
});

describe("Slack signature verification", () => {
    const secret = "test-signing-secret";
    beforeEach(() => {
        vi.stubEnv("SLACK_BOT_TOKEN", "xoxb-test");
        vi.stubEnv("SLACK_SUPPORT_CHANNEL_ID", "C123");
        vi.stubEnv("SLACK_SIGNING_SECRET", secret);
    });
    afterEach(() => vi.unstubAllEnvs());

    const sign = (body: string, ts: string) => `v0=${createHmac("sha256", secret).update(`v0:${ts}:${body}`).digest("hex")}`;

    it("accepts a fresh, correctly signed request", () => {
        const ts = String(Math.floor(Date.now() / 1000));
        expect(verifySlackSignature("{}", ts, sign("{}", ts))).toBe(true);
    });

    it("rejects tampered bodies and replays older than five minutes", () => {
        const ts = String(Math.floor(Date.now() / 1000));
        expect(verifySlackSignature('{"a":1}', ts, sign("{}", ts))).toBe(false);
        const old = String(Math.floor(Date.now() / 1000) - 600);
        expect(verifySlackSignature("{}", old, sign("{}", old))).toBe(false);
    });

    it("escapes visitor text so it cannot ping the channel", () => {
        expect(escapeSlack("<!channel> hi & bye")).toBe("&lt;!channel&gt; hi &amp; bye");
    });
});

describe("page-aware greetings", () => {
    it("tailors the opener to comparison, pricing and other pages", () => {
        expect(getPageChatContext("/compare/podium").teaser).toContain("Switching from Podium");
        expect(getPageChatContext("/pricing").opener).toContain("Comparing plans");
        expect(getPageChatContext("/").starters).toContain("Check my rating");
    });
});

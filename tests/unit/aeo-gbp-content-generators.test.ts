import { afterEach, describe, expect, it, vi } from "vitest";

const generateContentWithFallback = vi.hoisted(() => vi.fn());
const listAllLocalPosts = vi.hoisted(() => vi.fn());

vi.mock("@/domains/ai/adapters/vertex-adapter", () => ({ generateContentWithFallback }));
vi.mock("@/services/google/local-posts", () => ({
    listAllLocalPosts,
    PUBLISHED_POST_STATES: new Set(["LIVE", "RECURRING"]),
}));

import {
    generatePostDrafts,
    generateServiceDescriptions,
} from "../../src/services/ai/gbp-content-generators";
import type { GoogleServiceItem } from "../../src/services/google/listing-information";

const CONTEXT = { businessName: "Wolfpack BBQ", category: "Barbecue restaurant", city: "Kansas City" };

function freeForm(displayName: string, description?: string): GoogleServiceItem {
    return { freeFormServiceItem: { label: { displayName, description } } };
}

afterEach(() => {
    vi.resetAllMocks();
});

describe("generateServiceDescriptions", () => {
    it("only asks about services that have no description yet", async () => {
        generateContentWithFallback.mockResolvedValue(
            JSON.stringify({ services: [{ name: "Catering", description: "x".repeat(260) }] })
        );

        await generateServiceDescriptions(
            [freeForm("Brisket plate", "Already described"), freeForm("Catering")],
            CONTEXT
        );

        const prompt = generateContentWithFallback.mock.calls[0][0] as string;
        expect(prompt).toContain("Catering");
        expect(prompt).not.toContain("Brisket plate");
    });

    it("drops a service the model invented", async () => {
        generateContentWithFallback.mockResolvedValue(
            JSON.stringify({
                services: [
                    { name: "Catering", description: "Real one." },
                    // Never sent in the prompt — must not reach the merchant.
                    { name: "Helicopter tours", description: "Invented." },
                ],
            })
        );

        const result = await generateServiceDescriptions([freeForm("Catering")], CONTEXT);

        expect(result).toEqual({ services: [{ name: "Catering", description: "Real one." }] });
    });

    it("truncates to Google's 300-character limit", async () => {
        generateContentWithFallback.mockResolvedValue(
            JSON.stringify({ services: [{ name: "Catering", description: "y".repeat(500) }] })
        );

        const result = await generateServiceDescriptions([freeForm("Catering")], CONTEXT);

        expect("services" in result && result.services[0].description).toHaveLength(300);
    });

    it("explains the two empty cases differently", async () => {
        const none = await generateServiceDescriptions([], CONTEXT);
        expect("error" in none && none.error).toContain("No services are listed");

        const allDescribed = await generateServiceDescriptions([freeForm("Catering", "done")], CONTEXT);
        expect("error" in allDescribed && allDescribed.error).toContain("already has a description");

        expect(generateContentWithFallback).not.toHaveBeenCalled();
    });

    it("reports a refusal rather than returning nothing silently", async () => {
        generateContentWithFallback.mockResolvedValue("not json at all");
        const result = await generateServiceDescriptions([freeForm("Catering")], CONTEXT);
        expect("error" in result).toBe(true);
    });
});

describe("generatePostDrafts", () => {
    const google = { accessToken: "t", accountId: "42", locationId: "99" };

    it("feeds only published posts back in as themes to avoid", async () => {
        listAllLocalPosts.mockResolvedValue([
            { state: "LIVE", summary: "Live brisket special" },
            { state: "REJECTED", summary: "Rejected post" },
            { state: "SCHEDULED", summary: "Scheduled post" },
        ]);
        generateContentWithFallback.mockResolvedValue(
            JSON.stringify({ posts: [{ topicType: "STANDARD", summary: "s", rationale: "r" }] })
        );

        await generatePostDrafts(google, CONTEXT, ["bbq"]);

        const prompt = generateContentWithFallback.mock.calls[0][0] as string;
        expect(prompt).toContain("Live brisket special");
        expect(prompt).not.toContain("Rejected post");
        expect(prompt).not.toContain("Scheduled post");
    });

    it("skips the posts lookup entirely when there is no account id", async () => {
        generateContentWithFallback.mockResolvedValue(
            JSON.stringify({ posts: [{ topicType: "STANDARD", summary: "s", rationale: "r" }] })
        );

        await generatePostDrafts({ ...google, accountId: null }, CONTEXT, []);

        expect(listAllLocalPosts).not.toHaveBeenCalled();
    });

    it("caps output at three drafts", async () => {
        listAllLocalPosts.mockResolvedValue([]);
        generateContentWithFallback.mockResolvedValue(
            JSON.stringify({
                posts: Array.from({ length: 6 }, (_, i) => ({
                    topicType: "STANDARD",
                    summary: `s${i}`,
                    rationale: "r",
                })),
            })
        );

        const result = await generatePostDrafts(google, CONTEXT, []);
        expect("posts" in result && result.posts).toHaveLength(3);
    });

    it("discards drafts missing any required field", async () => {
        listAllLocalPosts.mockResolvedValue([]);
        generateContentWithFallback.mockResolvedValue(
            JSON.stringify({
                posts: [
                    { topicType: "STANDARD", summary: "complete", rationale: "r" },
                    { topicType: "STANDARD", summary: "no rationale" },
                ],
            })
        );

        const result = await generatePostDrafts(google, CONTEXT, []);
        expect("posts" in result && result.posts).toHaveLength(1);
    });
});

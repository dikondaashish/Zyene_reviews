import { describe, expect, it } from "vitest";

import { classifyDataForSeoStatus } from "../../src/services/aeo/engines/adapters/dataforseo-client";
import {
    aiOverviewSample,
    serpSample,
} from "../../src/services/aeo/engines/adapters/dataforseo-sample";
import {
    serializeAiOverview,
    serializeSerp,
} from "../../src/services/aeo/engines/adapters/dataforseo-serialize";
import { isObservation } from "../../src/services/aeo/engines/engine-types";
import { matchKnownBrands, type BrandAlias } from "../../src/services/aeo/extraction/brand-matcher";

const CTX = { modelId: "dataforseo/google-serp", latencyMs: 5, costUnits: 1, cost: {} };

const LOCAL_PACK = {
    type: "local_pack",
    title: "Radiant Plumbing",
    rating: { value: 4.8, votes_count: 18_000 },
};

const ORGANIC = {
    type: "organic",
    title: "Best Plumbers in Austin",
    domain: "www.yelp.com",
    url: "https://www.yelp.com/austin",
    description: "A directory listing.",
};

describe("a SERP is serialised as evidence, not interpretation", () => {
    it("puts the local pack before organic, matching how Google presents them", () => {
        const { text } = serializeSerp([ORGANIC, LOCAL_PACK]);
        expect(text.indexOf("Local pack")).toBeLessThan(text.indexOf("Organic results"));
    });

    it("keeps ratings, which are part of what the SERP said", () => {
        const { text } = serializeSerp([LOCAL_PACK]);
        expect(text).toContain("Radiant Plumbing");
        expect(text).toContain("4.8★");
        expect(text).toContain("18000 reviews");
    });

    it("collects every result url as a source", () => {
        const { sources } = serializeSerp([ORGANIC, { ...ORGANIC, url: "https://angi.com/x" }]);
        expect(sources.map((s) => s.url)).toEqual(["https://www.yelp.com/austin", "https://angi.com/x"]);
    });

    it("skips entries with no title rather than emitting a blank line", () => {
        const { text } = serializeSerp([{ type: "organic", url: "https://x.test" }]);
        expect(text).toBe("");
    });
});

describe("an empty SERP is an observation, never a failure or a false absence", () => {
    it("returns no_answer when nothing ranked", () => {
        // An `ok` sample with empty text would read downstream as "the brand was
        // not found" — a negative observation manufactured from a blank page.
        const result = serpSample([], CTX);
        expect(result.status).toBe("no_answer");
        expect(isObservation(result)).toBe(false);
    });

    it("still records the unit it consumed", () => {
        expect(serpSample([], CTX).costUnits).toBe(1);
    });

    it("treats a populated SERP as a real observation with sources", () => {
        const result = serpSample([LOCAL_PACK, ORGANIC], CTX);
        expect(isObservation(result)).toBe(true);
        if (!isObservation(result)) return;
        // A SERP always exposes sources, so zero is a real zero, never
        // "this surface has no notion of sources".
        expect(result.citations.availability).toBe("present");
    });
});

describe("AI Overview", () => {
    const OVERVIEW = {
        type: "ai_overview",
        items: [{ text: "Several Austin plumbers are well rated." }],
        references: [{ url: "https://forbes.com/x", title: "Forbes" }],
    };

    it("reads text from nested items and sources from references", () => {
        const { text, sources } = serializeAiOverview(OVERVIEW);
        expect(text).toContain("Several Austin plumbers");
        expect(sources).toEqual([{ url: "https://forbes.com/x", title: "Forbes" }]);
    });

    it("does not fold page organic results into the overview's citations", () => {
        // Appearing below an overview is not the same as being cited BY it.
        // Merging them would inflate citation share.
        const result = aiOverviewSample([OVERVIEW, ORGANIC], CTX);
        if (!isObservation(result)) throw new Error("expected ok");
        expect(result.citations.items).toHaveLength(1);
        expect(result.citations.items[0].url).toBe("https://forbes.com/x");
    });

    it("reports a missing overview as no_answer, since Google does not always show one", () => {
        // A real fact about the SERP, not a failure and not our brand's absence.
        const result = aiOverviewSample([ORGANIC], CTX);
        expect(result.status).toBe("no_answer");
        if (result.status !== "no_answer") return;
        expect(result.reason).toContain("no AI Overview");
    });

    it("distinguishes an overview still being fetched from one with no text", () => {
        const pending = aiOverviewSample(
            [{ type: "ai_overview", asynchronous_ai_overview: true, items: [] }],
            CTX
        );
        expect(pending.status).toBe("no_answer");
        if (pending.status !== "no_answer") return;
        expect(pending.reason).toContain("asynchronously");
    });
});

describe("DataForSEO status codes decide retryability", () => {
    it.each([
        [40100, "auth"],
        [40200, "auth"],
        [40202, "quota_exhausted"],
        [40201, "rate_limited"],
        [50000, "upstream_unavailable"],
    ])("maps %i to %s", (code, kind) => {
        expect(classifyDataForSeoStatus(code).kind).toBe(kind);
    });

    it("treats insufficient funds as permanent, not retryable", () => {
        // Same shape as the OpenAI no-credits case: retrying an empty balance
        // burns every attempt against a wall that will not move until someone
        // tops up.
        expect(classifyDataForSeoStatus(40202).kind).toBe("quota_exhausted");
    });

    it("does not guess at an unknown code", () => {
        expect(classifyDataForSeoStatus(undefined).kind).toBe("unknown");
    });
});

describe("extraction reads a serialised SERP the same way it reads prose", () => {
    it("finds a business that ranks, and reports absence when it does not", () => {
        const result = serpSample([LOCAL_PACK, ORGANIC], CTX);
        if (!isObservation(result)) throw new Error("expected ok");

        const brands: BrandAlias[] = [
            { kind: "competitor", competitorId: "c1", label: "Radiant Plumbing", aliases: ["Radiant Plumbing"] },
            { kind: "own", competitorId: null, label: "Nowhere Plumbing", aliases: ["Nowhere Plumbing"] },
        ];
        const matches = matchKnownBrands({
            answerText: result.answerText,
            citationText: result.citations.items.map((c) => c.url),
            brands,
        });

        expect(matches.map((m) => m.label)).toEqual(["Radiant Plumbing"]);
        expect(matches.some((m) => m.kind === "own")).toBe(false);
    });
});

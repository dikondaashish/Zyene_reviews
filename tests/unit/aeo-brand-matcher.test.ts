import { describe, expect, it } from "vitest";

import {
    matchKnownBrands,
    normalizeForMatch,
    ownBrandNamed,
    ownBrandRank,
    type BrandAlias,
} from "../../src/services/aeo/extraction/brand-matcher";

const OWN: BrandAlias = {
    kind: "own",
    competitorId: null,
    label: "Blue Dragon Plumbing",
    aliases: ["Blue Dragon Plumbing", "Blue Dragon"],
};

const RIVAL: BrandAlias = {
    kind: "competitor",
    competitorId: "comp-1",
    label: "Ace Plumbing",
    aliases: ["Ace Plumbing", "Ace"],
};

function run(answerText: string, citationText: string[] = [], brands = [OWN, RIVAL]) {
    return matchKnownBrands({ answerText, citationText, brands });
}

describe("presence is decided by text, never by inference", () => {
    it("finds a brand that is actually named", () => {
        const matches = run("I recommend Blue Dragon Plumbing for emergencies.");
        expect(ownBrandNamed(matches)).toBe(true);
        expect(matches[0].matchedAlias).toBe("Blue Dragon Plumbing");
    });

    it("reports absence when the brand is simply not there", () => {
        // The failure this whole module exists to prevent: an answer that does
        // not name us must never come back as visible.
        const matches = run("Ace Plumbing is the best option in town.");
        expect(ownBrandNamed(matches)).toBe(false);
        expect(ownBrandRank(matches)).toBeNull();
    });

    it("points every match at a real span of the text", () => {
        // Auditability: a human can go and look at firstIndex and see the name.
        const text = "For emergencies, Blue Dragon Plumbing is well reviewed.";
        const matches = run(text);
        const at = matches[0].firstIndex!;
        expect(normalizeForMatch(text).slice(at, at + 20)).toContain("blue dragon plumbing");
    });
});

describe("real answer formatting does not decide visibility", () => {
    it("sees through markdown emphasis", () => {
        // Live answers come back like "**Blue Dragon Plumbing** holds…".
        expect(ownBrandNamed(run("**Blue Dragon Plumbing** holds a 4.9 rating."))).toBe(true);
    });

    it("sees through case and smart punctuation", () => {
        const own: BrandAlias = { ...OWN, label: "Bob's Plumbing", aliases: ["Bob's Plumbing"] };
        expect(ownBrandNamed(run("BOB’S PLUMBING is open late.", [], [own]))).toBe(true);
    });

    it("sees through non-breaking spaces and collapsed whitespace", () => {
        expect(ownBrandNamed(run("Blue Dragon    Plumbing is great."))).toBe(true);
    });
});

describe("false positives are the dangerous kind", () => {
    it("does not match a name inside a longer word", () => {
        // "Ace" must not fire inside "Aceituna" — that would invent a competitor
        // mention out of an unrelated word.
        const matches = run("Aceituna Cafe is next door.", [], [RIVAL]);
        expect(matches).toHaveLength(0);
    });

    it("ignores aliases too short to be evidence", () => {
        // A 2-character alias matches almost any text; letting it through would
        // manufacture visibility rather than measure it.
        const noisy: BrandAlias = { ...OWN, aliases: ["BD"] };
        expect(ownBrandNamed(run("Bad plumbing advice abounds.", [], [noisy]))).toBe(false);
    });

    it("still matches an alias that legitimately ends in punctuation", () => {
        const own: BrandAlias = { ...OWN, label: "Plumbing Co.", aliases: ["Plumbing Co."] };
        expect(ownBrandNamed(run("Try Plumbing Co. for repairs.", [], [own]))).toBe(true);
    });
});

describe("ordinal is prominence, in the order the engine named them", () => {
    it("orders by position of first mention, not by input order", () => {
        const matches = run("Ace Plumbing leads, though Blue Dragon Plumbing is close behind.");
        expect(matches.map((m) => m.label)).toEqual(["Ace Plumbing", "Blue Dragon Plumbing"]);
        expect(matches.map((m) => m.mentionOrdinal)).toEqual([1, 2]);
        expect(ownBrandRank(matches)).toBe(2);
    });

    it("uses the earliest alias hit when several aliases match", () => {
        // "Blue Dragon" appears before the full name; the ordinal must reflect
        // the earlier one or prominence is understated.
        const matches = run("Blue Dragon is popular. Blue Dragon Plumbing is the full name.");
        expect(matches[0].matchedAlias).toBe("Blue Dragon");
    });
});

describe("cited-only is real, but it is not being recommended", () => {
    it("flags a brand present only in the sources", () => {
        const matches = run("Several local plumbers are well reviewed.", [
            "https://bluedragonplumbing.test/reviews",
        ]);
        expect(matches).toHaveLength(1);
        expect(matches[0].citedOnly).toBe(true);
        expect(matches[0].firstIndex).toBeNull();
    });

    it("keeps cited-only OUT of the headline visibility number", () => {
        // A citation means a page of ours was used as a source. Counting that as
        // "the engine recommended us" is how a modest result gets sold as a good
        // one — the presentation failure this module was built to end.
        const matches = run("Several local plumbers are well reviewed.", [
            "https://bluedragonplumbing.test/reviews",
        ]);
        expect(ownBrandNamed(matches)).toBe(false);
        expect(ownBrandRank(matches)).toBeNull();
    });

    it("matches a brand spelled without spaces in a domain", () => {
        // The gap the first version of this had: a URL writes the name
        // concatenated, so a spaced alias could never match one and every
        // cited-only brand went undetected.
        const matches = run("Local plumbers vary.", ["https://blue-dragon-plumbing.test/x"]);
        expect(matches[0].citedOnly).toBe(true);
    });

    it("will not guess a short brand out of a domain", () => {
        // Compact matching has no word boundaries, so "ace" would fire inside
        // "acebook.com". A miss understates visibility; an invention is the bug
        // this module exists to prevent.
        const matches = run("Plumbers vary.", ["https://acebook.test"], [RIVAL]);
        expect(matches).toHaveLength(0);
    });

    it("prefers a prose mention over a citation for the same brand", () => {
        const matches = run("Blue Dragon Plumbing is excellent.", [
            "https://bluedragonplumbing.test",
        ]);
        expect(matches).toHaveLength(1);
        expect(matches[0].citedOnly).toBe(false);
    });

    it("sorts cited-only brands after every named brand", () => {
        const matches = run("Ace Plumbing is the top pick.", [
            "https://bluedragonplumbing.test",
        ]);
        expect(matches.map((m) => [m.label, m.mentionOrdinal, m.citedOnly])).toEqual([
            ["Ace Plumbing", 1, false],
            ["Blue Dragon Plumbing", 2, true],
        ]);
    });
});

describe("competitor identity survives extraction", () => {
    it("carries competitorId through, so mentions can be attributed", () => {
        const matches = run("Ace Plumbing is recommended.");
        expect(matches[0]).toMatchObject({ kind: "competitor", competitorId: "comp-1" });
    });

    it("never attaches a competitorId to our own brand", () => {
        const matches = run("Blue Dragon Plumbing is recommended.");
        expect(matches[0].competitorId).toBeNull();
    });
});

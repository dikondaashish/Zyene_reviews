import { describe, expect, it } from "vitest";

import {
    canonicalDomain,
    classifyDomain,
    domainFromTitle,
    isSameOrSubdomain,
    normalizeCitation,
} from "../../src/services/aeo/extraction/citation-normalizer";

const CONTEXT = {
    ownDomains: ["bluedragonplumbing.com"],
    competitorDomains: ["aceplumbing.com"],
};

const cite = (url: string, title: string | null = null) =>
    normalizeCitation({ url, title }, CONTEXT);

describe("the Gemini redirect problem", () => {
    /**
     * Gemini wraps every citation in a redirect host. Parsing the domain out of
     * the URL would file EVERY Gemini citation under Google and destroy
     * own-vs-competitor attribution — the entire point of tracking citations.
     */
    const REDIRECT = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF";

    it("recovers the real domain from the title", () => {
        const result = cite(REDIRECT, "forbes.com");
        expect(result.domain).toBe("forbes.com");
        expect(result.viaRedirect).toBe(true);
    });

    it("never records the redirector as the citing domain", () => {
        const result = cite(REDIRECT, "forbes.com");
        expect(result.domain).not.toContain("google");
    });

    it("leaves the domain empty when the title is not a domain", () => {
        // "Unknown" is honest. Recording the redirector would be a fabrication
        // that poisons every attribution built on top of it.
        const result = cite(REDIRECT, "Best Plumbers in Austin (2026)");
        expect(result.domain).toBe("");
        expect(result.classification).toBe("other");
        expect(result.viaRedirect).toBe(true);
    });

    it("still attributes our own site through a redirect", () => {
        const result = cite(REDIRECT, "bluedragonplumbing.com");
        expect(result.classification).toBe("own");
    });

    it("flags redirect-derived domains so confidence is visible", () => {
        expect(cite(REDIRECT, "forbes.com").viaRedirect).toBe(true);
        expect(cite("https://forbes.com/x", "Forbes").viaRedirect).toBe(false);
    });
});

describe("domainFromTitle refuses to guess", () => {
    it.each(["forbes.com", "www.angi.com", "sub.example.co.uk"])("accepts %s", (title) => {
        expect(domainFromTitle(title)).toBeTruthy();
    });

    it.each([
        "Best Plumbers in Austin",
        "Plumbing 101: a guide",
        "",
        "notadomain",
        "Blue Dragon Plumbing | Austin TX",
    ])("rejects %j", (title) => {
        // A wrong domain is worse than an absent one.
        expect(domainFromTitle(title)).toBeNull();
    });
});

describe("normalisation makes citations joinable", () => {
    it("strips tracking parameters", () => {
        const result = cite("https://forbes.com/plumbers?utm_source=chatgpt&id=7");
        expect(result.normalizedUrl).toContain("id=7");
        expect(result.normalizedUrl).not.toContain("utm_source");
    });

    it("drops www, fragments and trailing slashes", () => {
        expect(cite("https://www.forbes.com/plumbers/#top").normalizedUrl).toBe(
            "https://forbes.com/plumbers"
        );
    });

    it("makes two links to the same page normalise identically", () => {
        // Without this the same page counts twice and inflates citation share.
        const a = cite("https://www.forbes.com/plumbers/?utm_campaign=x");
        const b = cite("https://forbes.com/plumbers#section");
        expect(a.normalizedUrl).toBe(b.normalizedUrl);
    });

    it("keeps an unparseable url rather than dropping it", () => {
        // Dropping it would quietly shrink the citation denominator.
        const result = cite("not a url at all");
        expect(result.url).toBe("not a url at all");
        expect(result.domain).toBe("");
    });
});

describe("classification", () => {
    it.each([
        ["https://bluedragonplumbing.com/x", "own"],
        ["https://blog.bluedragonplumbing.com/x", "own"],
        ["https://aceplumbing.com/x", "competitor"],
        ["https://www.yelp.com/biz/x", "directory"],
        ["https://reddit.com/r/austin", "social"],
        ["https://sometownpaper.com/x", "other"],
    ])("classifies %s as %s", (url, expected) => {
        expect(cite(url).classification).toBe(expected);
    });

    it("does not match a domain by substring", () => {
        // "notyelp.com" is not Yelp, and "fakebluedragonplumbing.com" is not us.
        expect(cite("https://notyelp.com/x").classification).toBe("other");
        expect(cite("https://fakebluedragonplumbing.com/x").classification).toBe("other");
    });

    it("treats own before competitor when both could match", () => {
        const result = classifyDomain("bluedragonplumbing.com", {
            ownDomains: ["bluedragonplumbing.com"],
            competitorDomains: ["bluedragonplumbing.com"],
        });
        expect(result).toBe("own");
    });
});

describe("domain helpers", () => {
    it("canonicalises consistently", () => {
        expect(canonicalDomain("WWW.Forbes.COM.")).toBe("forbes.com");
    });

    it("treats subdomains as the same site but neighbours as different", () => {
        expect(isSameOrSubdomain("blog.forbes.com", "forbes.com")).toBe(true);
        expect(isSameOrSubdomain("forbes.com", "forbes.com")).toBe(true);
        expect(isSameOrSubdomain("notforbes.com", "forbes.com")).toBe(false);
    });
});

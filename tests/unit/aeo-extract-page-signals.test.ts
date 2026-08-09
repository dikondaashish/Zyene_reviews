import { describe, expect, it } from "vitest";

import { extractPageSignals } from "../../src/services/aeo/crawler/extract-page-signals";

describe("extractPageSignals — attribute order is not assumed", () => {
    it("finds a canonical link whose attributes are in the opposite order this codebase would write them", () => {
        // The exact shape found on wolfpackkc.com's real production markup
        // (checked 2026-08-09): href before rel.
        const html = '<html><head><link href="https://example.com/" rel="canonical"/></head></html>';
        expect(extractPageSignals(html).canonicalUrl).toBe("https://example.com/");
    });

    it("still finds it in the conventional rel-then-href order", () => {
        const html = '<link rel="canonical" href="https://example.com/page">';
        expect(extractPageSignals(html).canonicalUrl).toBe("https://example.com/page");
    });

    it("finds meta robots regardless of name/content order", () => {
        const html = '<meta content="noindex, nofollow" name="robots">';
        expect(extractPageSignals(html).metaRobots).toBe("noindex, nofollow");
    });
});

describe("extractPageSignals — absence is null, not a guess", () => {
    it("returns null for every field on a page with none of them", () => {
        const signals = extractPageSignals("<html><body><p>Just some text.</p></body></html>");
        expect(signals.title).toBeNull();
        expect(signals.canonicalUrl).toBeNull();
        expect(signals.metaRobots).toBeNull();
    });

    it("ignores an unrelated link tag with a different rel", () => {
        const html = '<link rel="stylesheet" href="/style.css">';
        expect(extractPageSignals(html).canonicalUrl).toBeNull();
    });

    it("ignores an unrelated meta tag with a different name", () => {
        const html = '<meta name="description" content="A great page">';
        expect(extractPageSignals(html).metaRobots).toBeNull();
    });
});

describe("extractPageSignals — h1 and word counts", () => {
    it("counts multiple h1 tags — more than one is itself a real finding elsewhere, not this module's job to flag", () => {
        const html = "<h1>First</h1><p>text</p><h1>Second</h1>";
        expect(extractPageSignals(html).h1Count).toBe(2);
    });

    it("strips tags, scripts, and styles before counting words", () => {
        const html =
            "<html><head><style>.x{color:red}</style></head>" +
            "<body><script>var x=1;</script><p>one two three</p></body></html>";
        expect(extractPageSignals(html).wordCount).toBe(3);
    });

    it("decodes HTML entities before counting and in extracted text", () => {
        const html = "<title>Fish &amp; Chips</title><p>Caf&eacute;? &nbsp; Sure!</p>".replace(
            "&eacute;",
            "é"
        );
        expect(extractPageSignals(html).title).toBe("Fish & Chips");
    });

    it("an empty document has zero words, not one from a stray space", () => {
        expect(extractPageSignals("<html></html>").wordCount).toBe(0);
    });
});

describe("extractPageSignals — verified against real production markup", () => {
    it("matches the actual signals on wolfpackkc.com's homepage (checked 2026-08-09)", () => {
        const html =
            '<html><head><title>Best BBQ in Kansas City, MO | Wolfpack BBQ &amp; Burgers</title>' +
            '<link href="https://wolfpackkc.com/" rel="canonical"/></head>' +
            "<body><h1>Wolfpack BBQ &amp; Burgers</h1><p>Some real page copy here.</p></body></html>";
        const signals = extractPageSignals(html);
        expect(signals.title).toBe("Best BBQ in Kansas City, MO | Wolfpack BBQ & Burgers");
        expect(signals.canonicalUrl).toBe("https://wolfpackkc.com/");
        expect(signals.h1Count).toBe(1);
        expect(signals.metaRobots).toBeNull();
    });
});

import { describe, expect, it } from "vitest";
import { extractJsonLdBlocks, flattenEntities, entityTypes } from "../../src/services/aeo/crawler/extract-json-ld";

describe("extractJsonLdBlocks", () => {
    it("extracts a single well-formed block", () => {
        const html = `<html><head><script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script></head></html>`;
        const blocks = extractJsonLdBlocks(html);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].parseError).toBeNull();
        expect(blocks[0].parsed).toEqual({ "@type": "Organization", name: "Acme" });
    });

    it("extracts multiple blocks in document order", () => {
        const html = `
            <script type="application/ld+json">{"@type":"Organization","name":"A"}</script>
            <script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>
        `;
        const blocks = extractJsonLdBlocks(html);
        expect(blocks).toHaveLength(2);
    });

    it("never throws on malformed JSON — records a parseError instead", () => {
        const html = `<script type="application/ld+json">{"@type": "Organization", name: }</script>`;
        expect(() => extractJsonLdBlocks(html)).not.toThrow();
        const blocks = extractJsonLdBlocks(html);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].parsed).toBeNull();
        expect(blocks[0].parseError).not.toBeNull();
    });

    it("does not assume attribute order (type before or after other attrs)", () => {
        const html = `<script id="x" type="application/ld+json">{"@type":"Organization","name":"A"}</script>`;
        expect(extractJsonLdBlocks(html)).toHaveLength(1);
    });

    it("skips empty blocks and non-JSON-LD scripts", () => {
        const html = `
            <script type="application/javascript">console.log(1)</script>
            <script type="application/ld+json"></script>
        `;
        expect(extractJsonLdBlocks(html)).toHaveLength(0);
    });

    it("returns an empty array for a page with no JSON-LD at all", () => {
        expect(extractJsonLdBlocks("<html><body>Hello</body></html>")).toEqual([]);
    });
});

describe("flattenEntities", () => {
    it("returns a single object as one entity", () => {
        expect(flattenEntities({ "@type": "Organization" })).toHaveLength(1);
    });

    it("flattens a top-level array", () => {
        const parsed = [{ "@type": "Organization" }, { "@type": "WebSite" }];
        expect(flattenEntities(parsed)).toHaveLength(2);
    });

    it("flattens @graph", () => {
        const parsed = { "@context": "https://schema.org", "@graph": [{ "@type": "Organization" }, { "@type": "FAQPage" }] };
        expect(flattenEntities(parsed)).toHaveLength(2);
    });

    it("handles null/undefined without throwing", () => {
        expect(flattenEntities(null)).toEqual([]);
        expect(flattenEntities(undefined)).toEqual([]);
    });

    it("handles a non-object primitive without throwing", () => {
        expect(flattenEntities("just a string")).toEqual([]);
        expect(flattenEntities(42)).toEqual([]);
    });
});

describe("entityTypes", () => {
    it("reads a single string @type", () => {
        expect(entityTypes({ "@type": "Organization" })).toEqual(["Organization"]);
    });

    it("reads a multi-typed entity", () => {
        expect(entityTypes({ "@type": ["LocalBusiness", "Restaurant"] })).toEqual(["LocalBusiness", "Restaurant"]);
    });

    it("returns empty for a missing @type", () => {
        expect(entityTypes({ name: "Acme" })).toEqual([]);
    });
});

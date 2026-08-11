import { describe, expect, it } from "vitest";
import { validateSchemaBlocks } from "../../src/services/aeo/crawler/schema-validator";

function withScript(json: string): string {
    return `<html><head><script type="application/ld+json">${json}</script></head></html>`;
}

describe("validateSchemaBlocks", () => {
    it("a complete, valid LocalBusiness produces zero field findings", () => {
        const html = withScript(
            JSON.stringify({
                "@type": "LocalBusiness",
                name: "Wolfpack BBQ & Burgers",
                address: "123 Main St, Kansas City, MO",
            })
        );
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([]);
        expect(result.entitiesFound).toEqual([{ type: "LocalBusiness", label: "Wolfpack BBQ & Burgers" }]);
    });

    it("flags a missing required field", () => {
        const html = withScript(JSON.stringify({ "@type": "LocalBusiness", name: "Acme" }));
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([{ entityType: "LocalBusiness", kind: "missing_field", field: "address" }]);
    });

    it("treats an empty string field as missing, not present", () => {
        const html = withScript(JSON.stringify({ "@type": "Organization", name: "Acme", url: "" }));
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toContainEqual({ entityType: "Organization", kind: "missing_field", field: "url" });
    });

    it("FAQPage requires mainEntity", () => {
        const html = withScript(JSON.stringify({ "@type": "FAQPage" }));
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([{ entityType: "FAQPage", kind: "missing_field", field: "mainEntity" }]);
    });

    it("an empty mainEntity array counts as missing (nothing to extract)", () => {
        const html = withScript(JSON.stringify({ "@type": "FAQPage", mainEntity: [] }));
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([{ entityType: "FAQPage", kind: "missing_field", field: "mainEntity" }]);
    });

    it("never throws on malformed JSON — reports a parse error instead", () => {
        const html = `<script type="application/ld+json">{not valid json</script>`;
        expect(() => validateSchemaBlocks(html)).not.toThrow();
        const result = validateSchemaBlocks(html);
        expect(result.parseErrors).toHaveLength(1);
        expect(result.entitiesFound).toEqual([]);
    });

    it("resolves @graph and validates every entity inside it", () => {
        const html = withScript(
            JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                    { "@type": "Organization", name: "Acme", url: "https://acme.example" },
                    { "@type": "FAQPage" },
                ],
            })
        );
        const result = validateSchemaBlocks(html);
        expect(result.entitiesFound).toHaveLength(2);
        expect(result.fieldFindings).toEqual([{ entityType: "FAQPage", kind: "missing_field", field: "mainEntity" }]);
    });

    it("flags two LocalBusiness entities with conflicting names as a real conflict", () => {
        const html = `<html><head>
            <script type="application/ld+json">{"@type":"LocalBusiness","name":"Acme Kansas City","address":"123 Main St"}</script>
            <script type="application/ld+json">{"@type":"LocalBusiness","name":"Acme St. Louis","address":"456 Oak Ave"}</script>
        </head></html>`;
        const result = validateSchemaBlocks(html);
        expect(result.conflictingIdentities).toEqual([
            { entityType: "LocalBusiness", labels: expect.arrayContaining(["Acme Kansas City", "Acme St. Louis"]) },
        ]);
    });

    it("does NOT flag the same LocalBusiness repeated identically across blocks", () => {
        const html = `<html><head>
            <script type="application/ld+json">{"@type":"LocalBusiness","name":"Acme","address":"123 Main St"}</script>
            <script type="application/ld+json">{"@type":"LocalBusiness","name":"Acme","address":"123 Main St"}</script>
        </head></html>`;
        const result = validateSchemaBlocks(html);
        expect(result.conflictingIdentities).toEqual([]);
    });

    it("a page with no JSON-LD at all reports zero blocks, no crash", () => {
        const result = validateSchemaBlocks("<html><body>no schema here</body></html>");
        expect(result.blocksFound).toBe(0);
        expect(result.entitiesFound).toEqual([]);
        expect(result.fieldFindings).toEqual([]);
    });

    it("an entity type we do not validate (e.g. WebSite) produces no field findings", () => {
        const html = withScript(JSON.stringify({ "@type": "WebSite", url: "https://acme.example" }));
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([]);
        expect(result.entitiesFound).toEqual([{ type: "WebSite", label: null }]);
    });

    it("recognizes a LocalBusiness SUBTYPE (Restaurant), not just the literal string — live-verified against wolfpackkc.com's real markup", () => {
        const html = withScript(
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Restaurant",
                name: "Wolfpack BBQ & Burgers",
                address: { "@type": "PostalAddress", streetAddress: "910 East 5th Street" },
            })
        );
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([]);
    });

    it("a Restaurant missing address is still flagged as incomplete, medium severity", () => {
        const html = withScript(JSON.stringify({ "@type": "Restaurant", name: "Acme Diner" }));
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([
            { entityType: "Restaurant", kind: "missing_field", field: "address" },
        ]);
    });

    it("a Restaurant and a LocalBusiness block disagreeing on name are the same identity family conflict", () => {
        const html = `<html><head>
            <script type="application/ld+json">{"@type":"Restaurant","name":"Acme KC","address":"1 Main St"}</script>
            <script type="application/ld+json">{"@type":"LocalBusiness","name":"Acme STL","address":"2 Oak Ave"}</script>
        </head></html>`;
        const result = validateSchemaBlocks(html);
        expect(result.conflictingIdentities).toEqual([
            { entityType: "LocalBusiness", labels: expect.arrayContaining(["Acme KC", "Acme STL"]) },
        ]);
    });

    it("a top-level array of entities is fully validated", () => {
        const html = withScript(
            JSON.stringify([
                { "@type": "BreadcrumbList" },
                { "@type": "Article", headline: "Post", author: "Jane", datePublished: "2026-01-01" },
            ])
        );
        const result = validateSchemaBlocks(html);
        expect(result.fieldFindings).toEqual([
            { entityType: "BreadcrumbList", kind: "missing_field", field: "itemListElement" },
        ]);
    });
});

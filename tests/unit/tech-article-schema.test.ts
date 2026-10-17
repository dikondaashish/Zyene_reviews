import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DocsPageJsonLd } from "@/components/seo/json-ld";
import { HelpArticleView } from "@/components/marketing/help-article-view";
import { HELP_ARTICLE_MAP, helpArticleNestedPath } from "@/lib/content/help-data";
import { DOC_NAV_GROUPS } from "@/lib/docs/doc-nav";
import { DOCS_PAGE_SEO, docsPageMetadata, type DocsPath } from "@/lib/seo/docs-page-seo";
import { buildTechArticleSchema } from "@/lib/seo/tech-article-schema";
import { JSON_LD_ORGANIZATION_ID } from "@/components/seo/json-ld-constants";

type Node = Record<string, unknown>;

function jsonLdNodes(markup: string): Node[] {
    const scripts = [...markup.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    return scripts.flatMap(([, body]) => {
        const parsed = JSON.parse(body) as Node;
        return Array.isArray(parsed["@graph"]) ? (parsed["@graph"] as Node[]) : [parsed];
    });
}

function renderedTitle(path: DocsPath): string {
    const title = docsPageMetadata(path).title;
    if (typeof title === "string") return `${title} | Zyene Reviews`;
    return title && typeof title === "object" && "absolute" in title ? String(title.absolute) : "";
}

describe("buildTechArticleSchema", () => {
    it("sets headline, description, and Organization publisher", () => {
        const node = buildTechArticleSchema({
            url: "https://www.zyenereviews.com/help/x/y",
            headline: "How to do X",
            description: "Steps for X.",
            readMinutes: 3,
        });
        expect(node["@type"]).toBe("TechArticle");
        expect(node.headline).toBe("How to do X");
        expect(node.description).toBe("Steps for X.");
        expect(node.timeRequired).toBe("PT3M");
        expect(node.publisher).toMatchObject({ "@type": "Organization", "@id": JSON_LD_ORGANIZATION_ID });
    });

    it("never invents dates when content has none", () => {
        const node = buildTechArticleSchema({ url: "https://x.test/a", headline: "A", description: "B" });
        expect(node).not.toHaveProperty("datePublished");
        expect(node).not.toHaveProperty("dateModified");
    });

    it("passes through real dates and defaults dateModified to datePublished", () => {
        const node = buildTechArticleSchema({
            url: "https://x.test/a",
            headline: "A",
            description: "B",
            datePublished: "2026-01-02",
        });
        expect(node).toMatchObject({ datePublished: "2026-01-02", dateModified: "2026-01-02" });
    });
});

describe("help article JSON-LD", () => {
    it.each(Object.values(HELP_ARTICLE_MAP))("$slug ships TechArticle + BreadcrumbList", (article) => {
        const markup = renderToStaticMarkup(
            createElement(HelpArticleView, { article, canonicalPath: helpArticleNestedPath(article) })
        );
        const nodes = jsonLdNodes(markup);
        const tech = nodes.find((n) => n["@type"] === "TechArticle");
        expect(tech).toMatchObject({
            headline: article.title,
            description: article.excerpt,
            url: `https://www.zyenereviews.com${helpArticleNestedPath(article)}`,
        });
        expect(tech?.publisher).toMatchObject({ "@type": "Organization", name: "Zyene Reviews" });
        expect(tech).not.toHaveProperty("datePublished");
        expect(nodes.some((n) => n["@type"] === "BreadcrumbList")).toBe(true);
    });
});

describe("docs pages SEO", () => {
    const navPaths = DOC_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));

    it("covers every docs nav route", () => {
        expect(Object.keys(DOCS_PAGE_SEO).sort()).toEqual([...navPaths].sort());
    });

    it.each(Object.keys(DOCS_PAGE_SEO) as DocsPath[])("%s has a keyword title ≤60 and description ≤160", (path) => {
        const title = renderedTitle(path);
        expect(title.length).toBeLessThanOrEqual(60);
        expect(title).not.toMatch(/^(API Reference|Cookbook|Changelog) \| Zyene Reviews$/);
        expect(DOCS_PAGE_SEO[path].description.length).toBeLessThanOrEqual(160);
        expect(docsPageMetadata(path).alternates?.canonical).toMatch(new RegExp(`${path}$`));
    });

    it.each(Object.keys(DOCS_PAGE_SEO) as DocsPath[])("%s renders TechArticle + BreadcrumbList", (path) => {
        const nodes = jsonLdNodes(renderToStaticMarkup(createElement(DocsPageJsonLd, { path })));
        const tech = nodes.find((n) => n["@type"] === "TechArticle");
        expect(tech).toMatchObject({ headline: DOCS_PAGE_SEO[path].title });
        expect(tech?.publisher).toMatchObject({ "@type": "Organization" });
        const crumbs = nodes.find((n) => n["@type"] === "BreadcrumbList");
        expect((crumbs?.itemListElement as unknown[]).length).toBe(path === "/docs" ? 2 : 3);
    });
});

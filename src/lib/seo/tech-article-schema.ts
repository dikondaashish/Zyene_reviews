import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import type { BreadcrumbItem } from "@/components/seo/json-ld-types";

export type TechArticleSchemaInput = {
    /** Absolute canonical URL of the page. */
    url: string;
    headline: string;
    description: string;
    /** Section label (help category or docs group). */
    section?: string;
    /** Absolute URL of the collection this page belongs to (Help Center, Docs). */
    isPartOf?: { name: string; url: string };
    /** Estimated reading time in minutes, emitted as ISO 8601 `timeRequired`. */
    readMinutes?: number;
    /**
     * Only pass real dates from content data. Help/docs content has none today,
     * so these stay omitted rather than invented.
     */
    datePublished?: string;
    dateModified?: string;
};

/** TechArticle node for help-center and developer-docs pages. */
export function buildTechArticleSchema(input: TechArticleSchemaInput): Record<string, unknown> {
    const organization = buildOrganizationSchema();
    return {
        "@type": "TechArticle",
        "@id": `${input.url}#article`,
        headline: input.headline.slice(0, 110),
        description: input.description,
        url: input.url,
        inLanguage: "en-US",
        mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
        author: { "@type": "Organization", "@id": organization["@id"], name: organization.name },
        publisher: organization,
        ...(input.section ? { articleSection: input.section } : {}),
        ...(input.isPartOf
            ? { isPartOf: { "@type": "WebPage", "@id": input.isPartOf.url, name: input.isPartOf.name } }
            : {}),
        ...(input.readMinutes ? { timeRequired: `PT${input.readMinutes}M` } : {}),
        ...(input.datePublished ? { datePublished: input.datePublished } : {}),
        ...(input.datePublished || input.dateModified
            ? { dateModified: input.dateModified ?? input.datePublished }
            : {}),
    };
}

/** BreadcrumbList node (no `@context`) for use inside an `@graph`. */
export function buildBreadcrumbListSchema(items: BreadcrumbItem[]): Record<string, unknown> {
    return {
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

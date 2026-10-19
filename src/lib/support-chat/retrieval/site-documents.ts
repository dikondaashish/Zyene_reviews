import { INTEGRATIONS } from "@/app/(marketing)/integrations/integrations-data";
import { BLOG_POSTS } from "@/lib/content/blog-data";
import type { ContentSection } from "@/lib/content/blog-types";
import { HELP_ARTICLES, helpArticleNestedPath } from "@/lib/content/help-data";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { COMPETITORS } from "@/lib/comparisons/competitor-data";
import { FEATURE_PILLARS } from "@/lib/growth/feature-pillars";
import { INDUSTRIES } from "@/lib/industries/industry-data";

/** One retrievable passage of public marketing content. */
export interface SiteDocument {
    id: string;
    url: string;
    title: string;
    kind: "help" | "blog" | "feature" | "compare" | "industry" | "integration" | "resource";
    text: string;
}

/** Long articles are split so retrieval returns the relevant section, not the whole post. */
const CHUNK_CHARS = 1_100;

export function flattenSections(sections: ContentSection[]): string {
    return sections
        .map((section) => {
            const parts = [section.text, ...(section.items ?? [])];
            if (section.table) {
                parts.push(section.table.headers.join(" | "), ...section.table.rows.map((row) => row.join(" | ")));
            }
            return parts.filter(Boolean).join("\n");
        })
        .filter(Boolean)
        .join("\n");
}

export function chunkText(text: string, size = CHUNK_CHARS): string[] {
    const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
    const chunks: string[] = [];
    let current = "";
    for (const paragraph of paragraphs) {
        if (current && current.length + paragraph.length > size) {
            chunks.push(current);
            current = "";
        }
        current = current ? `${current}\n${paragraph}` : paragraph;
    }
    if (current) chunks.push(current);
    return chunks;
}

function chunked(base: Omit<SiteDocument, "id" | "text">, text: string): SiteDocument[] {
    return chunkText(text).map((chunk, index) => ({ ...base, id: `${base.url}#${index}`, text: chunk }));
}

const faqText = (faqs?: Array<{ question: string; answer: string }>) =>
    (faqs ?? []).map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n");

export function buildSiteDocuments(): SiteDocument[] {
    return [
        ...HELP_ARTICLES.flatMap((article) =>
            chunked({ url: helpArticleNestedPath(article), title: article.title, kind: "help" },
                `${article.excerpt}\n${flattenSections(article.body)}`)),
        ...BLOG_POSTS.flatMap((post) =>
            chunked({ url: `/blog/${post.slug}`, title: post.title, kind: "blog" },
                `${post.excerpt}\n${flattenSections(post.body)}\n${faqText(post.faqs)}`)),
        ...FEATURE_PILLARS.flatMap((feature) =>
            chunked({ url: `/features/${feature.slug}`, title: feature.title, kind: "feature" },
                `${feature.tagline}\n${feature.metaDescription}\n${feature.bullets.join("\n")}`)),
        ...COMPETITORS.flatMap((competitor) =>
            chunked({ url: `/compare/${competitor.slug}`, title: `Zyene Reviews vs ${competitor.name}`, kind: "compare" },
                [
                    competitor.openingSummary,
                    `${competitor.name} price: ${competitor.price}. ${competitor.priceNote}`,
                    ...competitor.quickTable.map((row) => `${row.feature}: Zyene ${row.zyene}; ${competitor.name} ${row.competitor}`),
                    ...competitor.differences.map((d) => `${d.topic}: Zyene ${d.zyene}; ${competitor.name} ${d.competitor}`),
                    faqText(competitor.faqs),
                ].join("\n"))),
        ...INDUSTRIES.flatMap((industry) =>
            chunked({ url: `/industries/${industry.slug}`, title: `Zyene Reviews for ${industry.name}`, kind: "industry" },
                [
                    industry.heroSub,
                    ...industry.painPoints.map((p) => `${p.title}: ${p.description} (${p.stat})`),
                    ...industry.solutions.map((s) => `${s.title}: ${s.description}`),
                ].join("\n"))),
        ...INTEGRATIONS.flatMap((integration) =>
            chunked({ url: "/integrations", title: `${integration.name} integration`, kind: "integration" },
                `${integration.name} (${integration.status === "live" ? "available now" : "coming soon"}): ${integration.description}\n${integration.features.join("\n")}`)),
        ...RESOURCE_GUIDES.flatMap((guide) =>
            chunked({ url: `/resources/${guide.slug}`, title: guide.title, kind: "resource" },
                `${guide.excerpt}\n${flattenSections(guide.body)}`)),
    ];
}

import type { BlogPostSource, ContentSection } from "@/lib/content/blog-types";

const WORDS_PER_MINUTE = 230;

function sectionText(section: ContentSection): string {
    return [
        section.text,
        ...(section.items ?? []),
        ...(section.table?.headers ?? []),
        ...(section.table?.rows.flat() ?? []),
        section.image?.caption,
    ].filter(Boolean).join(" ");
}

export function countBlogWords(post: BlogPostSource): number {
    const text = [
        ...post.body.map(sectionText),
        ...(post.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
    ].join(" ");
    return text.split(/\s+/).filter(Boolean).length;
}

/** Reading time in whole minutes, rounded up, never below one. */
export function estimateReadMinutes(post: BlogPostSource): number {
    return Math.max(1, Math.ceil(countBlogWords(post) / WORDS_PER_MINUTE));
}

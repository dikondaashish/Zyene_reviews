import type { ContentSection } from "@/lib/content/blog-types";
import type { FaqItem } from "@/components/seo/json-ld-types";

function isQuestionHeading(text: string): boolean {
    const t = text.trim();
    if (t.endsWith("?")) return true;
    return /^(What|How|Why|Can|Do|Does|Which|When|Where|Should|Is|Are)\b/i.test(t);
}

function sectionText(section: ContentSection): string | null {
    if (section.type === "p" && section.text) return section.text;
    if ((section.type === "ul" || section.type === "ol") && section.items?.length) {
        return section.items.join(" ");
    }
    if (section.type === "tip" && section.text) return section.text;
    return null;
}

/**
 * Derive FAQ pairs from help article body (question-like h2/h3 + following answer block).
 */
export function extractFaqItemsFromHelpBody(body: ContentSection[]): FaqItem[] {
    const faqs: FaqItem[] = [];

    for (let i = 0; i < body.length; i++) {
        const section = body[i];
        if (section.type !== "h2" && section.type !== "h3") continue;
        if (!section.text || !isQuestionHeading(section.text)) continue;

        let answer: string | null = null;
        for (let j = i + 1; j < body.length; j++) {
            const next = body[j];
            if (next.type === "h2" || next.type === "h3") break;
            const text = sectionText(next);
            if (text) {
                answer = text;
                break;
            }
        }

        if (answer) {
            faqs.push({ question: section.text, answer });
        }
    }

    return faqs;
}

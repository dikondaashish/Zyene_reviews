import { serializeJsonLd } from "@/lib/seo/serialize-json-ld";

/**
 * F6.4/F6.5: FAQPage JSON-LD and paste-ready HTML, built deterministically
 * from Gemini-generated Q&A TEXT — never asking the model to emit raw JSON-LD
 * itself. A malformed JSON-LD string from a text-generation call is a real,
 * common failure mode; constructing the structure in code and only trusting
 * the model for the question/answer copy removes that failure mode entirely.
 */
export type FaqItem = { question: string; answer: string };

export function buildFaqJsonLd(items: readonly FaqItem[]): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };
}

export function buildFaqJsonLdScriptTag(items: readonly FaqItem[]): string {
    return `<script type="application/ld+json">${serializeJsonLd(buildFaqJsonLd(items))}</script>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** Paste-ready visible FAQ block — the HTML a customer actually adds to the page, separate from the JSON-LD that describes it. */
export function buildFaqHtml(items: readonly FaqItem[]): string {
    const blocks = items
        .map(
            (item) => `  <div class="faq-item">
    <h3>${escapeHtml(item.question)}</h3>
    <p>${escapeHtml(item.answer)}</p>
  </div>`
        )
        .join("\n");
    return `<div class="faq-section">\n${blocks}\n</div>`;
}

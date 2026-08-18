import { createHash } from "node:crypto";

export type RenderingDelta = {
    rawTextHash: string;
    renderedTextHash: string;
    rawWordCount: number;
    renderedWordCount: number;
    jsOnlyWordCount: number;
    jsDeltaRatio: number;
};

function textFromHtml(html: string): string {
    return html.replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&(?:nbsp|amp|quot|#39);/g, " ")
        .replace(/\s+/g, " ").trim();
}

function words(text: string): number {
    const value = text.trim();
    return value ? value.split(/\s+/).length : 0;
}

function hash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
}

export function computeRenderingDelta(rawHtml: string, renderedText: string): RenderingDelta {
    const rawText = textFromHtml(rawHtml);
    const normalizedRendered = renderedText.replace(/\s+/g, " ").trim();
    const rawWordCount = words(rawText);
    const renderedWordCount = words(normalizedRendered);
    const jsOnlyWordCount = Math.max(0, renderedWordCount - rawWordCount);
    return {
        rawTextHash: hash(rawText),
        renderedTextHash: hash(normalizedRendered),
        rawWordCount,
        renderedWordCount,
        jsOnlyWordCount,
        jsDeltaRatio: renderedWordCount ? Number((jsOnlyWordCount / renderedWordCount).toFixed(4)) : 0,
    };
}

import { logger } from "@/lib/logger";
import { Schema, Type as SchemaType } from "@google/genai";
import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";
import { parseContentBriefPayload, type ContentBriefResult } from "./content-brief-result";
import type { CitationGap } from "./analyze-citation-gap";
import type { CitedSourceStructure } from "./fetch-cited-source";

const contentBriefSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        edit_items: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    category: { type: SchemaType.STRING, description: "One of: structure, schema, content, faq." },
                    description: { type: SchemaType.STRING, description: "One concrete, specific edit instruction." },
                },
                required: ["category", "description"],
            },
            description: "3-8 ranked, concrete edits — never generic advice like 'add more content'.",
        },
        faq_items: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING },
                    answer: { type: SchemaType.STRING },
                },
                required: ["question", "answer"],
            },
            description: "0-6 FAQ pairs answering the prompt directly, only if the gap analysis calls for FAQ content.",
        },
    },
    required: ["edit_items", "faq_items"],
};

export type ContentBriefInput = {
    promptText: string;
    businessName: string;
    gap: CitationGap;
    citedSources: readonly { ok: boolean; structure?: CitedSourceStructure }[];
    ownPageExcerpt: string | null;
};

function buildPrompt(input: ContentBriefInput): string {
    const reachableSources = input.citedSources.filter(
        (s): s is { ok: true; structure: CitedSourceStructure } => s.ok
    );
    const sourceLines = reachableSources.length
        ? reachableSources.map(
              (s, i) =>
                  `${i + 1}. ${s.structure.title ?? s.structure.url} (${s.structure.wordCount} words)\n   Excerpt: ${s.structure.contentExcerpt.slice(0, 400)}`
          )
        : ["(No cited sources could be read — generate from the prompt and gap analysis alone.)"];

    return [
        "You are an AEO (answer-engine optimization) content strategist for a local business.",
        `Business: ${input.businessName}`,
        `Customer question we are losing on: "${input.promptText}"`,
        "",
        "Structural gap analysis (already computed, not your job to re-derive):",
        `- Missing a direct-answer paragraph: ${input.gap.missingDirectAnswer}`,
        `- Missing question-form headings: ${input.gap.missingQuestionHeadings}`,
        `- Missing FAQ schema: ${input.gap.missingFaqSchema}`,
        `- Missing LocalBusiness schema: ${input.gap.missingLocalBusinessSchema}`,
        "",
        "Pages that DO get cited for this question:",
        ...sourceLines,
        "",
        input.ownPageExcerpt
            ? `Our current page's existing content:\n${input.ownPageExcerpt.slice(0, 800)}`
            : "We have no existing page that owns this question yet.",
        "",
        "CRITICAL RULES:",
        "- Do NOT state specific facts about this business (prices, hours, response times, certifications, awards, staff names, guarantees) unless they appear above.",
        "- Where a specific fact would strengthen an answer but was not provided, write a placeholder like {{insert your average response time}} instead of inventing one.",
        "- Every edit item must be concrete and actionable, never generic ('add more content', 'improve SEO').",
        "- FAQ answers must be genuinely useful, self-contained answers — not teasers pointing elsewhere.",
        "- Output ONLY raw JSON matching the schema. No markdown, no code fences.",
    ].join("\n");
}

export async function generateContentBrief(input: ContentBriefInput): Promise<ContentBriefResult> {
    const prompt = buildPrompt(input);
    try {
        const raw = await generateContentWithFallback(prompt, {
            requireJson: true,
            schema: contentBriefSchema,
            maxOutputTokens: 1400,
            temperature: 0.4,
        });
        return parseContentBriefPayload(JSON.parse(raw));
    } catch (error) {
        logger.error({ err: error }, "[content-briefs] generation failed");
        throw error;
    }
}

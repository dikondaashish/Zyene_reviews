import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { SUGGEST_REPLY_PROMPT_COMPACT } from "@/domains/ai/prompts";
import { singleReplySchema } from "@/domains/ai/schemas/ResponseSchemas";

export const REPLY_TONE_INSTRUCTIONS: Record<string, string> = {
    professional: "Write in a professional, polished tone. Be courteous and business-appropriate.",
    friendly: "Write in a warm, friendly, conversational tone. Sound like a caring neighbor, not a corporation.",
    concise: "Write a short, direct reply in 2-3 sentences max. Get straight to the point.",
};

export type ReplyTone = "professional" | "friendly" | "concise";

export async function generateReplyDraftText(input: {
    businessName: string;
    businessCategory: string;
    rating: number;
    reviewText: string;
    selectedStaff: string[] | null | undefined;
    tone: ReplyTone;
    /** From organizations.plan — same as suggest-reply API */
    plan: string | null | undefined;
}): Promise<string> {
    const toneInstruction =
        REPLY_TONE_INSTRUCTIONS[input.tone] || REPLY_TONE_INSTRUCTIONS.professional;

    let servedByInfo = "";
    if (input.selectedStaff && input.selectedStaff.length > 0) {
        servedByInfo = `Context: This customer specifically noted they were served by: ${input.selectedStaff.join(", ")}.`;
    }

    const base = SUGGEST_REPLY_PROMPT_COMPACT.replace("{business_name}", input.businessName)
        .replace("{business_category}", input.businessCategory)
        .replace("{served_by_info}", servedByInfo || "(no staff names noted)")
        .replace("{rating}", String(input.rating))
        .replace("{text}", input.reviewText);

    const fixedPrompt = `${base}

TONE: ${toneInstruction}

Return JSON only: {"reply":"..."} matching the schema.`;

    const isPremium = input.plan === "growth" || String(input.plan || "").includes("agency");
    const suggestModel = process.env.GOOGLE_AI_SUGGEST_REPLY_MODEL?.trim();

    const content = await generateContentWithFallback(fixedPrompt, {
        requireJson: true,
        schema: singleReplySchema,
        isPremium,
        maxOutputTokens: 600,
        temperature: 0.55,
        ...(suggestModel ? { modelOverride: suggestModel } : {}),
    });

    let result: { reply?: string };
    try {
        result = JSON.parse(content) as { reply?: string };
    } catch {
        return content.trim();
    }
    return (result.reply || content).trim();
}

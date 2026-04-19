import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { SUGGEST_REPLY_PROMPT_COMPACT } from "@/domains/ai/prompts";
import { singleReplySchema } from "@/domains/ai/schemas/ResponseSchemas";

export const REPLY_TONE_INSTRUCTIONS: Record<string, string> = {
    professional: "Write in a professional, polished tone. Be courteous and business-appropriate.",
    friendly: "Write in a warm, friendly, conversational tone. Sound like a caring neighbor, not a corporation.",
    concise: "Write a short, direct reply in 2-3 sentences max. Get straight to the point.",
};

export type ReplyTone = "professional" | "friendly" | "concise";

function isSparseReviewText(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed) return true;
    // If the reviewer only leaves symbols/stars/emojis or very short text, avoid inferred specifics.
    const alphaNum = trimmed.replace(/[^a-zA-Z0-9]/g, "");
    return alphaNum.length < 12;
}

function genericPositiveReply(
    businessName: string,
    tone: ReplyTone
): string {
    if (tone === "concise") {
        return `Thanks for the 5-star review and for supporting ${businessName}. We appreciate it and look forward to welcoming you again soon.`;
    }
    if (tone === "friendly") {
        return `Thank you so much for the 5-star review and for supporting ${businessName}. We really appreciate your kindness and can't wait to welcome you back again soon.`;
    }
    return `Thank you for the 5-star review and for choosing ${businessName}. We truly appreciate your support and look forward to serving you again soon.`;
}

/**
 * Parse {"reply":"..."} from the model. If JSON is truncated (output token limit),
 * recover the inner string so the UI never shows raw JSON.
 */
export function extractReplyFromModelOutput(content: string): string {
    const trimmed = content.trim();
    if (!trimmed) return "";

    try {
        const parsed = JSON.parse(trimmed) as { reply?: unknown };
        if (typeof parsed.reply === "string") return parsed.reply.trim();
    } catch {
        /* fall through */
    }

    const prefix = trimmed.match(/^\s*\{\s*"reply"\s*:\s*"/);
    if (prefix) {
        let inner = trimmed.slice(prefix[0].length);
        let out = "";
        for (let i = 0; i < inner.length; i++) {
            const c = inner[i];
            if (c === "\\" && i + 1 < inner.length) {
                const n = inner[i + 1];
                if (n === "n") {
                    out += "\n";
                    i++;
                    continue;
                }
                if (n === "r") {
                    out += "\r";
                    i++;
                    continue;
                }
                if (n === "t") {
                    out += "\t";
                    i++;
                    continue;
                }
                if (n === '"' || n === "\\") {
                    out += n;
                    i++;
                    continue;
                }
                out += n;
                i++;
                continue;
            }
            if (c === '"') break;
            out += c;
        }
        if (out.trim()) return out.trim();
    }

    return trimmed;
}

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
    if (input.rating >= 4 && isSparseReviewText(input.reviewText)) {
        return genericPositiveReply(input.businessName, input.tone);
    }

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
        // d74fdb4 had no cap — a low limit truncates JSON mid-string and surfaces raw `{"reply":"...` in the UI.
        maxOutputTokens: 2048,
        temperature: 0.55,
        ...(suggestModel ? { modelOverride: suggestModel } : {}),
    });

    return extractReplyFromModelOutput(content);
}
